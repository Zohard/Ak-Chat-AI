import { tool } from 'ai'; // ← AJOUTEZ CETTE LIGNE SI MANQUANTE
import {
  AnimeListSchema,
  CreateAnimeSchema,
  UpdateAnimeStatusSchema,
  SearchAniListSchema,
  UploadCoverImageSchema,
  UploadScreenshotSchema,
  ListSeasonsSchema,
  GetCurrentSeasonSchema,
  GetLastCreatedSeasonSchema,
  CreateSeasonSchema,
  UpdateSeasonStatusSchema,
  AddAnimeToSeasonSchema,
  RemoveAnimeFromSeasonSchema,
  DeleteSeasonSchema,
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
  description: `Search and list animes from the database.

⚠️ CRITICAL FORMATTING: When you receive results, format them as:
"J'ai trouvé X anime(s) :

1. **[Titre français]** ([Année])
   📺 Type : [Format] • [X] épisodes
   📊 Statut : [🟡 En attente / ✅ Publié / ❌ Refusé]
   🆔 ID : [idAnime]"

NEVER show raw JSON like {"success": true, "data": {...}}

Use this to:
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

After creation, respond with:
"✅ Anime créé avec succès !
   • ID : [idAnime]
   • Titre : [titre]
   • Statut : 🟡 En attente de modération"

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

⚠️ CRITICAL: Format results as:
"J'ai trouvé sur AniList :

**[Titre]** ([Titre original])
📅 Année : [annee]
📺 Épisodes : [nbEpisodes]
🎬 Studio : [studio]

Voulez-vous que je l'ajoute à la base de données ?"

Use this when:
- Admin wants to add a new anime from external source
- Need accurate metadata (episodes, year, studio, etc.)
- Want to verify anime information`,
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
      const uploadResult = await callNestAPI(
          '/api/media/upload-from-url',
          'POST',
          authToken,
          {
            imageUrl: params.imageUrl,
            type: 'anime',
            relatedId: params.animeId,
            saveAsScreenshot: false,
          }
      );

      if (!uploadResult.filename) {
        throw new Error('Upload succeeded but no filename returned');
      }

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
 */
export const uploadScreenshotTool = (authToken?: string) => tool({
  description: `Upload a screenshot for an anime from a URL.`,
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
            saveAsScreenshot: true,
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
 * Tool: List All Seasons
 */
export const listSeasonsTool = (authToken?: string) => tool({
  description: `List all anime seasons from the database.

⚠️ Format as:
"Voici les X saison(s) :

1. ❄️ **Hiver 2025**
   🆔 ID : [id] • [✅ Visible / 🔒 Cachée]"

Season emojis: 1=❄️, 2=🌸, 3=☀️, 4=🍂`,
  parameters: ListSeasonsSchema,
  execute: async () => {
    try {
      const result = await callNestAPI('/api/seasons', 'GET', authToken);
      return {
        success: true,
        data: result,
        message: `Found ${result.length || 0} season(s)`,
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
 * Tool: Get Current Season
 */
export const getCurrentSeasonTool = (authToken?: string) => tool({
  description: `Get the current active anime season.`,
  parameters: GetCurrentSeasonSchema,
  execute: async () => {
    try {
      const result = await callNestAPI('/api/seasons/current', 'GET', authToken);
      return {
        success: true,
        data: result,
        message: result ? `Current season: ${result.nom_saison} ${result.annee}` : 'No current season set',
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
 * Tool: Get Last Created Season
 */
export const getLastCreatedSeasonTool = (authToken?: string) => tool({
  description: `Get the last created anime season.`,
  parameters: GetLastCreatedSeasonSchema,
  execute: async () => {
    try {
      const result = await callNestAPI('/api/seasons/last-created', 'GET', authToken);
      return {
        success: true,
        data: result,
        message: result ? `Last created: ${result.nom_saison} ${result.annee}` : 'No seasons found',
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
 * Tool: Create New Season
 */
export const createSeasonTool = (authToken?: string) => tool({
  description: `Create a new anime season.

IMPORTANT: Check if season exists first using listSeasons.
Do NOT create duplicate seasons (same year + season number).`,
  parameters: CreateSeasonSchema,
  execute: async (params) => {
    try {
      const allSeasons = await callNestAPI('/api/seasons', 'GET', authToken);
      const existingSeason = allSeasons.find(
          (s: any) => s.annee === params.annee && s.saison === params.saison
      );

      if (existingSeason) {
        const seasonNames = { 1: 'hiver', 2: 'printemps', 3: 'été', 4: 'automne' };
        return {
          success: false,
          error: `Season already exists: ${seasonNames[params.saison as 1|2|3|4]} ${params.annee}`,
          data: existingSeason,
        };
      }

      const result = await callNestAPI('/api/admin/seasons', 'POST', authToken, params);
      const seasonNames = { 1: 'hiver', 2: 'printemps', 3: 'été', 4: 'automne' };
      return {
        success: true,
        data: result,
        message: `Season ${seasonNames[params.saison as 1|2|3|4]} ${params.annee} created`,
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
 * Tool: Update Season Status
 */
export const updateSeasonStatusTool = (authToken?: string) => tool({
  description: `Update the visibility status of a season (0=hidden, 1=visible).`,
  parameters: UpdateSeasonStatusSchema,
  execute: async (params) => {
    try {
      const result = await callNestAPI(
          `/api/admin/seasons/${params.id}`,
          'PATCH',
          authToken,
          { statut: params.statut }
      );
      const statusText = params.statut === 1 ? 'visible' : 'hidden';
      return {
        success: true,
        data: result,
        message: `Season ID ${params.id} is now ${statusText}`,
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
 * Tool: Add Anime to Season
 */
export const addAnimeToSeasonTool = (authToken?: string) => tool({
  description: `Add an anime to a specific season.`,
  parameters: AddAnimeToSeasonSchema,
  execute: async (params) => {
    try {
      const result = await callNestAPI(
          `/api/admin/seasons/${params.seasonId}/animes`,
          'POST',
          authToken,
          { animeId: params.animeId }
      );
      return {
        success: true,
        data: result,
        message: `Anime ID ${params.animeId} added to season ID ${params.seasonId}`,
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
 * Tool: Remove Anime from Season
 */
export const removeAnimeFromSeasonTool = (authToken?: string) => tool({
  description: `Remove an anime from a specific season.`,
  parameters: RemoveAnimeFromSeasonSchema,
  execute: async (params) => {
    try {
      const result = await callNestAPI(
          `/api/admin/seasons/${params.seasonId}/animes/${params.animeId}`,
          'DELETE',
          authToken
      );
      return {
        success: true,
        data: result,
        message: `Anime ID ${params.animeId} removed from season ID ${params.seasonId}`,
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
 * Tool: Delete Season
 */
export const deleteSeasonTool = (authToken?: string) => tool({
  description: `Delete a season from the database. WARNING: Destructive action.`,
  parameters: DeleteSeasonSchema,
  execute: async (params) => {
    try {
      const result = await callNestAPI(
          `/api/admin/seasons/${params.id}`,
          'DELETE',
          authToken
      );
      return {
        success: true,
        data: result,
        message: `Season ID ${params.id} deleted successfully`,
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
 * Export all tools as an array for AI SDK (RECOMMENDED)
 */
export function getToolsArray(authToken?: string) {
  return [
    listAnimesTool(authToken),
    createAnimeTool(authToken),
    updateAnimeStatusTool(authToken),
    searchAniListTool(authToken),
    uploadCoverImageTool(authToken),
    uploadScreenshotTool(authToken),
    listSeasonsTool(authToken),
    getCurrentSeasonTool(authToken),
    getLastCreatedSeasonTool(authToken),
    createSeasonTool(authToken),
    updateSeasonStatusTool(authToken),
    addAnimeToSeasonTool(authToken),
    removeAnimeFromSeasonTool(authToken),
    deleteSeasonTool(authToken),
  ];
}

/**
 * Export all tools as an object (LEGACY - for backwards compatibility)
 */
export function getTools(authToken?: string) {
  return {
    listAnimes: listAnimesTool(authToken),
    createAnime: createAnimeTool(authToken),
    updateAnimeStatus: updateAnimeStatusTool(authToken),
    searchAniList: searchAniListTool(authToken),
    uploadCoverImage: uploadCoverImageTool(authToken),
    uploadScreenshot: uploadScreenshotTool(authToken),
    listSeasons: listSeasonsTool(authToken),
    getCurrentSeason: getCurrentSeasonTool(authToken),
    getLastCreatedSeason: getLastCreatedSeasonTool(authToken),
    createSeason: createSeasonTool(authToken),
    updateSeasonStatus: updateSeasonStatusTool(authToken),
    addAnimeToSeason: addAnimeToSeasonTool(authToken),
    removeAnimeFromSeason: removeAnimeFromSeasonTool(authToken),
    deleteSeason: deleteSeasonTool(authToken),
  };
}