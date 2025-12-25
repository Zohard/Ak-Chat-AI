import { tool } from 'ai';
import {
  AnimeListSchema,
  CreateAnimeSchema,
  UpdateAnimeStatusSchema,
  SearchAniListSchema,
  UploadCoverImageSchema,
  UploadScreenshotSchema,
} from './schemas';

const API_BASE = process.env.NESTJS_API_BASE || 'http://localhost:3002';

/**
 * Helper function to make authenticated API calls to NestJS backend
 */
async function callNestAPI(
  endpoint: string,
  method: string = 'GET',
  authToken?: string,
  body?: any
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const url = method === 'GET' && body
    ? `${API_BASE}${endpoint}?${new URLSearchParams(body).toString()}`
    : `${API_BASE}${endpoint}`;

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Tool: List/Search Animes
 * Retrieves animes from the database with optional filters
 */
export const listAnimesTool = (authToken?: string) => tool({
  description: `Search and list animes from the database. Use this to:
- Find a specific anime by title (use search parameter)
- List pending animes for moderation (statut=0)
- List published animes (statut=1)
- Filter by year, completion status, etc.

Always use this tool first when the admin mentions a specific anime to get its ID.`,
  parameters: AnimeListSchema,
  execute: async (params) => {
    try {
      const result = await callNestAPI('/api/admin/animes', 'GET', authToken, params);
      return {
        success: true,
        data: result,
        message: `Found ${result.total || result.length || 0} anime(s)`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Tool: Create New Anime
 * Creates a new anime entry in the database
 */
export const createAnimeTool = (authToken?: string) => tool({
  description: `Create a new anime entry in the database.

IMPORTANT: Before calling this tool, you MUST:
1. Use searchAniList to fetch accurate data from AniList
2. Present the data to the admin for confirmation
3. Only create after admin confirms

Required fields: titre, niceUrl, annee, nbEp, synopsis`,
  parameters: CreateAnimeSchema,
  execute: async (params) => {
    try {
      const result = await callNestAPI('/api/admin/animes', 'POST', authToken, params);
      return {
        success: true,
        data: result,
        message: `Anime created successfully with ID ${result.id || result.idAnime}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Tool: Update Anime Status
 * Updates the moderation status of an anime (approve/reject)
 */
export const updateAnimeStatusTool = (authToken?: string) => tool({
  description: `Update the moderation status of an anime. Used for:
- Approving pending anime (statut=1)
- Rejecting/hiding anime (statut=2)
- Marking anime as pending/draft (statut=0)

Status codes:
0 = Pending/Draft
1 = Published/Approved
2 = Refused/Hidden

You must first use listAnimes to get the anime ID.`,
  parameters: UpdateAnimeStatusSchema,
  execute: async (params) => {
    try {
      const result = await callNestAPI(
        `/api/admin/animes/${params.id}/status`,
        'PUT',
        authToken,
        { statut: params.statut }
      );

      const statusText = params.statut === 1 ? 'approved' : params.statut === 2 ? 'refused' : 'set to pending';
      return {
        success: true,
        data: result,
        message: `Anime ID ${params.id} has been ${statusText}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Tool: Search AniList
 * Searches AniList API for anime data (external source)
 */
export const searchAniListTool = (authToken?: string) => tool({
  description: `Search the AniList database for anime information.

Use this when:
- Admin wants to add a new anime from external source
- Need accurate metadata (episodes, year, studio, etc.)
- Want to verify anime information

This returns detailed anime data including title, episodes, year, studios, synopsis, etc.`,
  parameters: SearchAniListSchema,
  execute: async (params) => {
    try {
      const result = await callNestAPI(
        '/api/animes/anilist/search',
        'GET',
        authToken,
        params
      );
      return {
        success: true,
        data: result,
        message: `Found ${result.animes?.length || 0} anime(s) on AniList`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Tool: Upload Cover Image for Anime
 * Downloads image from URL, uploads to ImageKit, and sets as anime cover
 */
export const uploadCoverImageTool = (authToken?: string) => tool({
  description: `Upload a cover image for an anime from a URL.

This tool:
1. Downloads the image from the provided URL
2. Uploads it to ImageKit (CDN) in the images/animes/ folder
3. Sets the filename as the anime's cover image

Use this when admin provides an image URL to set as the anime cover.`,
  parameters: UploadCoverImageSchema,
  execute: async (params) => {
    try {
      // Step 1: Upload image to ImageKit via media service
      const uploadResult = await callNestAPI(
        '/api/media/upload-from-url',
        'POST',
        authToken,
        {
          imageUrl: params.imageUrl,
          type: 'anime',
          relatedId: params.animeId,
          saveAsScreenshot: false, // Cover image, not screenshot
        }
      );

      if (!uploadResult.filename) {
        throw new Error('Upload succeeded but no filename returned');
      }

      // Step 2: Update anime record with the uploaded image filename
      const updateResult = await callNestAPI(
        `/api/admin/animes/${params.animeId}`,
        'PUT',
        authToken,
        {
          image: uploadResult.filename,
        }
      );

      return {
        success: true,
        data: {
          animeId: params.animeId,
          filename: uploadResult.filename,
          url: uploadResult.url,
        },
        message: `Cover image uploaded and set for anime ID ${params.animeId}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Tool: Upload Screenshot for Anime
 * Downloads screenshot from URL and uploads to ImageKit screenshots folder
 */
export const uploadScreenshotTool = (authToken?: string) => tool({
  description: `Upload a screenshot for an anime from a URL.

This tool:
1. Downloads the screenshot from the provided URL
2. Uploads it to ImageKit in images/animes/screenshots/ folder
3. Saves to ak_screenshots table with type=1 (anime) and url_screen=screenshots/{filename}

Important: Screenshots are stored separately from cover images.
Use this to add visual content/scenes from the anime.`,
  parameters: UploadScreenshotSchema,
  execute: async (params) => {
    try {
      const uploadResult = await callNestAPI(
        '/api/media/upload-from-url',
        'POST',
        authToken,
        {
          imageUrl: params.imageUrl,
          type: 'anime',
          relatedId: params.animeId,
          saveAsScreenshot: true, // Save to ak_screenshots table with type=1
        }
      );

      return {
        success: true,
        data: {
          screenshotId: uploadResult.id,
          animeId: params.animeId,
          filename: uploadResult.filename,
          url: uploadResult.url,
        },
        message: `Screenshot uploaded for anime ID ${params.animeId}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Export all tools as an object for easy access
 */
export function getTools(authToken?: string) {
  return {
    listAnimes: listAnimesTool(authToken),
    createAnime: createAnimeTool(authToken),
    updateAnimeStatus: updateAnimeStatusTool(authToken),
    searchAniList: searchAniListTool(authToken),
    uploadCoverImage: uploadCoverImageTool(authToken),
    uploadScreenshot: uploadScreenshotTool(authToken),
  };
}
