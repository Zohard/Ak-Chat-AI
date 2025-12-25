# Image & Screenshot Upload System

## Overview

The AI assistant can now upload images and screenshots for anime entries from external URLs using ImageKit CDN.

## Architecture

```
User → AI Assistant → Next.js Orchestrator → NestJS API → ImageKit CDN
                                                ↓
                                           PostgreSQL Database
```

## Two Types of Images

### 1. Cover Images (Posters)

**Purpose:** Main cover/poster image for the anime

**Database Storage:**
- Table: `ak_animes`
- Field: `image` (VARCHAR)
- Value: Just the filename (e.g., `attack-on-titan-1702345678.jpg`)

**ImageKit Storage:**
- Folder: `images/animes/`
- Full path: `images/animes/attack-on-titan-1702345678.jpg`
- Public URL: `https://ik.imagekit.io/akimages/images/animes/attack-on-titan-1702345678.jpg`

**AI Tool:** `uploadCoverImage`
```typescript
uploadCoverImage({
  animeId: 123,
  imageUrl: "https://example.com/poster.jpg"
})
```

**What it does:**
1. Downloads image from URL
2. Uploads to ImageKit: `images/animes/`
3. Updates `ak_animes.image` with filename
4. Returns ImageKit URL

### 2. Screenshots

**Purpose:** Additional visual content from the anime (scenes, characters, key moments)

**Database Storage:**
- Table: `ak_screenshots`
- Fields:
  - `id_screen` (SERIAL PRIMARY KEY)
  - `url_screen` (VARCHAR) - Format: `screenshots/{filename}.ext`
  - `id_titre` (INTEGER) - Foreign key to anime ID
  - `type` (INTEGER) - **1 = anime, 2 = manga**
  - `upload_date` (TIMESTAMP)

**ImageKit Storage:**
- Folder: `images/animes/screenshots/`
- Full path: `images/animes/screenshots/demon-slayer-scene-1702345679.jpg`
- Public URL: `https://ik.imagekit.io/akimages/images/animes/screenshots/demon-slayer-scene-1702345679.jpg`

**AI Tool:** `uploadScreenshot`
```typescript
uploadScreenshot({
  animeId: 456,
  imageUrl: "https://example.com/scene.jpg"
})
```

**What it does:**
1. Downloads image from URL
2. Uploads to ImageKit: `images/animes/screenshots/`
3. Inserts record into `ak_screenshots` with:
   - `url_screen` = `screenshots/{filename}.ext`
   - `id_titre` = anime ID
   - `type` = 1 (anime)
   - `upload_date` = NOW()
4. Returns screenshot ID and ImageKit URL

## Important Details

### Screenshot Storage Format

**CRITICAL:** The `url_screen` field in `ak_screenshots` table stores the path as:
```
screenshots/{filename}.ext
```

**Example:**
- ImageKit full path: `images/animes/screenshots/one-piece-scene-1702345680.jpg`
- Database `url_screen`: `screenshots/one-piece-scene-1702345680.jpg`

### Type Codes

- `type = 1` → Anime
- `type = 2` → Manga

When uploading screenshots for anime, **always use type=1**.

### Filename Generation

The NestJS backend automatically generates safe, SEO-friendly filenames:

1. Fetches anime title from database
2. Sanitizes title (removes special chars, accents, etc.)
3. Converts to lowercase kebab-case
4. Adds timestamp for uniqueness
5. Adds file extension

**Example:**
- Anime title: "Shingeki no Kyojin"
- Generated filename: `shingeki-no-kyojin-1702345678.jpg`

## API Endpoints

### Upload Image from URL
```
POST /api/media/upload-from-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "type": "anime",
  "relatedId": 123,
  "saveAsScreenshot": false  // true for screenshots, false for cover images
}
```

**Response:**
```json
{
  "filename": "attack-on-titan-1702345678.jpg",
  "url": "https://ik.imagekit.io/akimages/images/animes/attack-on-titan-1702345678.jpg",
  "imagekitFileId": "abc123",
  "size": 123456
}
```

For screenshots (`saveAsScreenshot: true`):
```json
{
  "id": 789,  // screenshot ID from ak_screenshots
  "filename": "attack-on-titan-1702345678.jpg",
  "url": "https://ik.imagekit.io/akimages/images/animes/screenshots/attack-on-titan-1702345678.jpg",
  "relatedId": 123,
  "imagekitFileId": "abc123"
}
```

### Update Anime Cover Image
```
PUT /api/admin/animes/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "image": "attack-on-titan-1702345678.jpg"
}
```

## Example AI Workflows

### Setting Cover Image

**User:** "Set cover image for One Piece (ID 999) from https://cdn.myanimelist.net/images/anime/1244/138851.jpg"

**AI Process:**
1. Call `uploadCoverImage({ animeId: 999, imageUrl: "..." })`
2. Backend downloads image
3. Backend uploads to `images/animes/`
4. Backend updates `ak_animes` WHERE `idAnime` = 999 SET `image` = filename
5. AI responds: "✓ Cover image uploaded and set for One Piece (ID 999)"

### Adding Screenshot

**User:** "Add screenshot for Demon Slayer (ID 456) from https://example.com/scene.jpg"

**AI Process:**
1. Call `uploadScreenshot({ animeId: 456, imageUrl: "..." })`
2. Backend downloads image
3. Backend uploads to `images/animes/screenshots/`
4. Backend inserts into `ak_screenshots`:
   - `url_screen` = `screenshots/demon-slayer-scene-1702345679.jpg`
   - `id_titre` = 456
   - `type` = 1
   - `upload_date` = NOW()
5. AI responds: "✓ Screenshot uploaded for Demon Slayer (ID 456)"

### Bulk Screenshot Upload

**User:** "Add these screenshots for Attack on Titan (ID 123):
- https://example.com/scene1.jpg
- https://example.com/scene2.jpg
- https://example.com/scene3.jpg"

**AI Process:**
1. Loop through each URL
2. Call `uploadScreenshot({ animeId: 123, imageUrl: url })` for each
3. AI responds: "✓ 3 screenshots uploaded for Attack on Titan (ID 123)"

## Image Processing

The backend automatically processes images using Sharp:

1. **Validation**
   - Checks file size (max 10MB)
   - Validates MIME type (jpeg, png, webp, gif)
   - Checks image signature

2. **Optimization**
   - Resizes if larger than constraints
   - Converts to WebP for better compression (quality: 85%)
   - Maintains aspect ratio

3. **Upload to ImageKit**
   - Deletes existing file with same name (if any)
   - Uploads to appropriate folder
   - Returns CDN URL

## Security

- JWT authentication required for all uploads
- Admin-only access via `AdminGuard`
- URL validation to prevent SSRF attacks
- File type validation
- Size limits enforced
- Automatic cleanup of orphaned files

## Error Handling

**Common Errors:**

1. **Image Download Failed**
   - URL unreachable
   - Timeout (30 seconds)
   - Invalid content type

2. **ImageKit Upload Failed**
   - Network issues
   - Invalid API credentials
   - Quota exceeded

3. **Database Save Failed**
   - Invalid anime ID (foreign key violation)
   - Orphaned ImageKit files are auto-deleted

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to download image: 404 Not Found"
}
```

## Testing

### Test Cover Image Upload

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: 1" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Set cover image for anime ID 123 from https://cdn.myanimelist.net/images/anime/1244/138851.jpg"
      }
    ]
  }'
```

### Test Screenshot Upload

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: 1" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Add screenshot for anime ID 456 from https://example.com/scene.jpg"
      }
    ]
  }'
```

## Database Schema

```sql
-- Cover image (stored in ak_animes table)
CREATE TABLE ak_animes (
  id_anime SERIAL PRIMARY KEY,
  titre VARCHAR(255),
  image VARCHAR(255),  -- Just the filename
  -- ... other fields
);

-- Screenshots (separate table)
CREATE TABLE ak_screenshots (
  id_screen SERIAL PRIMARY KEY,
  url_screen VARCHAR(255),  -- Format: screenshots/{filename}.ext
  id_titre INTEGER,         -- Foreign key to ak_animes.id_anime
  type INTEGER DEFAULT 1,   -- 1=anime, 2=manga
  upload_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_screenshots_id_titre ON ak_screenshots(id_titre);
CREATE INDEX idx_screenshots_id_titre_type ON ak_screenshots(id_titre, type);
```

## Troubleshooting

### "Image URL is required"
Make sure the URL is provided and is a valid HTTP(S) URL.

### "Failed to download image"
- Check if URL is accessible
- Verify content type is image/*
- Check image size (<10MB)

### "Database save failed"
- Verify anime ID exists in `ak_animes` table
- Check if you have admin permissions
- Ensure database connection is active

### "ImageKit upload failed"
- Check `IMAGEKIT_PRIVATE_KEY` in `.env`
- Verify ImageKit quota not exceeded
- Check network connectivity

## Future Enhancements

- [ ] Bulk screenshot upload (multiple URLs at once)
- [ ] Screenshot captions/descriptions
- [ ] Screenshot ordering/sorting
- [ ] Cover image cropping/editing
- [ ] Duplicate image detection
- [ ] Automatic image optimization settings
- [ ] Support for manga screenshots (type=2)
