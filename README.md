# Anime-Kun AI Orchestrator

AI-powered chatbot for managing the Anime-Kun database using Gemini 2.5 Flash.

## Features

- 🤖 **AI Assistant**: Powered by Google Gemini 2.5 Flash
- 🔍 **Smart Search**: Find animes in your database with natural language
- ➕ **Auto-Create**: Fetch data from AniList and create animes with AI assistance
- ✅ **Moderation**: Approve or reject pending anime entries
- 🛡️ **Rate Limiting**: 500 requests/day per user (configurable)
- 🔐 **Secure**: JWT authentication and CORS protection

## Architecture

```
User (Nuxt) → Next.js AI Orchestrator → NestJS Backend
                    ↓
              Google Gemini API
                    ↓
              Vercel KV (Redis)
```

## Setup

### 1. Install Dependencies

```bash
cd ai-orchestrator
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.local.example .env.local.local
```

Edit `.env.local`:

```env
# Required: Get from Google AI Studio (https://makersuite.google.com/app/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Required: Your NestJS backend URL
NESTJS_API_BASE=https://ak-api-production.up.railway.app

# Required: Your Nuxt frontend URL (for CORS)
NUXT_ORIGIN=http://localhost:3000

# Optional: Vercel KV for rate limiting (create in Vercel Dashboard)
# KV_REST_API_URL=your_kv_url
# KV_REST_API_TOKEN=your_kv_token

# Optional: Rate limit (default: 500 requests/day/user)
RATE_LIMIT_MAX=500
```

### 3. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001/api/chat`.

### 4. Update Nuxt Configuration

In your Nuxt project (`frontendv2/nuxt.config.ts`), add:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      aiChatEndpoint: process.env.AI_CHAT_ENDPOINT || 'http://localhost:3001/api/chat'
    }
  }
})
```

### 5. Install Nuxt Dependencies

```bash
cd ../frontendv2
npm install @ai-sdk/vue marked
```

## Usage

### In Nuxt Admin Pages

```vue
<template>
  <div class="admin-page">
    <h1>Anime Management</h1>
    <AdminAIChat />
  </div>
</template>
```

### Example Prompts

**Search for an anime:**
```
Find anime Attack on Titan
```

**Add a new anime:**
```
Add Demon Slayer from AniList
```

**Moderate pending animes:**
```
Show me all pending animes
Approve anime ID 123
```

**Filter by year:**
```
Show me animes from 2023
```

**Set cover image:**
```
Set cover image for anime ID 123 from https://example.com/poster.jpg
```

**Add screenshot:**
```
Add screenshot for anime ID 456 from https://example.com/scene.jpg
```

## API Tools

The AI has access to these tools:

| Tool | Description | Endpoint |
|------|-------------|----------|
| `listAnimes` | Search/filter animes | `GET /api/admin/animes` |
| `createAnime` | Create new anime | `POST /api/admin/animes` |
| `updateAnimeStatus` | Approve/reject anime | `PUT /api/admin/animes/:id/status` |
| `searchAniList` | Fetch from AniList | `GET /api/animes/anilist/search` |
| `uploadCoverImage` | Upload cover image from URL | `POST /api/media/upload-from-url` + `PUT /api/admin/animes/:id` |
| `uploadScreenshot` | Upload screenshot from URL | `POST /api/media/upload-from-url` |

## Rate Limiting

### Without Vercel KV (Default)

Rate limiting is disabled. All requests are allowed.

### With Vercel KV (Recommended for Production)

1. Create a Vercel KV database in your [Vercel Dashboard](https://vercel.com/dashboard)
2. Copy `KV_REST_API_URL` and `KV_REST_API_TOKEN` to `.env.local`
3. Restart the server

**Quota:** 500 requests/day/user (configurable via `RATE_LIMIT_MAX`)

When exceeded, users will receive:
- HTTP 429 status
- Error message with reset time
- `X-RateLimit-*` headers

## Deployment

### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

- Auto-deploys on push to `main`
- Built-in KV Redis
- Free tier: 100GB bandwidth

### Option B: Self-Hosted

```bash
npm run build
npm run start
```

Configure Nginx:

```nginx
location /api/chat {
  proxy_pass http://localhost:3001/api/chat;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}
```

## Image & Screenshot Management

### Cover Images vs Screenshots

**Cover Images:**
- Main poster/cover for the anime
- Stored in `anime.image` field (just the filename)
- Uploaded to ImageKit: `images/animes/{filename}`
- One per anime
- Example: `attack-on-titan-1702345678.jpg`

**Screenshots:**
- Additional visual content from the anime (scenes, characters, etc.)
- Stored in `ak_screenshots` table with:
  - `type = 1` (anime) or `type = 2` (manga)
  - `url_screen = screenshots/{filename}.ext`
  - `id_titre` = anime ID
- Uploaded to ImageKit: `images/animes/screenshots/{filename}`
- Multiple per anime
- Example: `screenshots/demon-slayer-scene-1702345679.jpg`

### How It Works

1. **Admin provides image URL** to the AI assistant
2. **AI calls uploadCoverImage or uploadScreenshot** with anime ID and URL
3. **NestJS backend**:
   - Downloads image from URL
   - Uploads to ImageKit CDN
   - Generates safe filename (e.g., `anime-title-timestamp.jpg`)
   - Saves to database
4. **Images served via ImageKit** at `https://ik.imagekit.io/akimages/`

### Example AI Prompts

```
Set cover image for One Piece from https://cdn.myanimelist.net/images/anime/1244/138851.jpg
```

```
Add screenshots for Demon Slayer ID 456 from these URLs:
- https://example.com/scene1.jpg
- https://example.com/scene2.jpg
```

## Troubleshooting

### "Unauthorized: Missing authentication token"

Ensure your Nuxt app sends the JWT token:

```typescript
headers: {
  Authorization: `Bearer ${auth.token}`,
  'X-User-Id': String(auth.user?.idUtilisateur),
}
```

### "CORS Error"

Check that `NUXT_ORIGIN` in `.env.local` matches your Nuxt app URL.

### "Rate limit exceeded"

Wait 24 hours or increase `RATE_LIMIT_MAX` in `.env.local`.

### AI not using tools

Check the system prompt in `app/api/chat/route.ts`. Ensure Gemini has access to all tools.

## Development

### Project Structure

```
ai-orchestrator/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts       # Main AI endpoint
├── lib/
│   ├── schemas.ts             # Zod validation schemas
│   ├── tools.ts               # AI tool definitions
│   └── ratelimit.ts           # Rate limiting logic
├── middleware.ts              # CORS handling
├── .env.example               # Environment template
├── .env.local                 # Your config (gitignored)
└── package.json
```

### Adding New Tools

1. Define schema in `lib/schemas.ts`
2. Create tool in `lib/tools.ts`
3. Add to `getTools()` export
4. Update system prompt in `route.ts`

Example:

```typescript
// lib/schemas.ts
export const DeleteAnimeSchema = z.object({
  id: z.number().positive(),
});

// lib/tools.ts
export const deleteAnimeTool = (authToken?: string) => tool({
  description: 'Delete an anime from database',
  parameters: DeleteAnimeSchema,
  execute: async (params) => {
    return await callNestAPI(`/api/admin/animes/${params.id}`, 'DELETE', authToken);
  },
});

// In getTools():
return {
  // ... existing tools
  deleteAnime: deleteAnimeTool(authToken),
};
```

## Security

- ✅ JWT authentication required for all requests
- ✅ CORS restricted to allowed origins
- ✅ Rate limiting per user
- ✅ Input validation with Zod
- ✅ Safe Gemini settings (BLOCK_NONE for admin context)

## License

Private - Anime-Kun Internal Tool

## Support

For issues or questions, contact the development team.
