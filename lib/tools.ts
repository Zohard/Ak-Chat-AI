import { tool } from 'ai';
import {
  AnimeListSchema,
  CreateAnimeSchema,
  UpdateAnimeStatusSchema,
  UpdateAnimeSchema,
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

export function getTools(authToken?: string) {
  return {
    listAnimes: tool({
      description: 'Search and list animes from the database',
      inputSchema: AnimeListSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/admin/animes', 'GET', authToken, params);
        return { success: true, data: result };
      },
    }),

    createAnime: tool({
      description: 'Create a new anime entry',
      inputSchema: CreateAnimeSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/admin/animes', 'POST', authToken, params);
        return { success: true, data: result };
      },
    }),

    updateAnimeStatus: tool({
      description: 'Update anime status (0=blocked, 1=published, 2=pending)',
      inputSchema: UpdateAnimeStatusSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/animes/${params.id}/status`,
          'PUT',
          authToken,
          { statut: params.statut }
        );
        return { success: true, data: result };
      },
    }),

    updateAnime: tool({
      description: 'Update anime information (title, episodes, air date, synopsis, etc.). Use listAnimes first to find the correct ID if searching by name.',
      inputSchema: UpdateAnimeSchema,
      execute: async (params: any, options) => {
        const { id, ...updateData } = params;
        const result = await callNestAPI(
          `/api/admin/animes/${id}`,
          'PUT',
          authToken,
          updateData
        );
        return { success: true, data: result };
      },
    }),

    searchAniList: tool({
      description: 'Search AniList for anime information',
      inputSchema: SearchAniListSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/animes/anilist/search', 'GET', authToken, params);
        return { success: true, data: result };
      },
    }),

    uploadCoverImage: tool({
      description: 'Upload cover image for anime from URL',
      inputSchema: UploadCoverImageSchema,
      execute: async (params: any, options) => {
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

        await callNestAPI(
          `/api/admin/animes/${params.animeId}`,
          'PUT',
          authToken,
          { image: uploadResult.filename }
        );

        return { success: true, data: uploadResult };
      },
    }),

    uploadScreenshot: tool({
      description: 'Upload screenshot for anime from URL',
      inputSchema: UploadScreenshotSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
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
        return { success: true, data: result };
      },
    }),

    listSeasons: tool({
      description: 'List all anime seasons',
      inputSchema: ListSeasonsSchema,
      execute: async (params, options) => {
        const result = await callNestAPI('/api/seasons', 'GET', authToken);
        return { success: true, data: result };
      },
    }),

    getCurrentSeason: tool({
      description: 'Get current active season (last created with statut=1)',
      inputSchema: GetCurrentSeasonSchema,
      execute: async (params, options) => {
        const result = await callNestAPI('/api/seasons/current', 'GET', authToken);
        return { success: true, data: result };
      },
    }),

    getLastCreatedSeason: tool({
      description: 'Get last created season regardless of status',
      inputSchema: GetLastCreatedSeasonSchema,
      execute: async (params, options) => {
        const result = await callNestAPI('/api/seasons/last-created', 'GET', authToken);
        return { success: true, data: result };
      },
    }),

    createSeason: tool({
      description: 'Create new season (1=hiver, 2=printemps, 3=été, 4=automne). IMPORTANT: Check for duplicates first!',
      inputSchema: CreateSeasonSchema,
      execute: async (params: any, options) => {
        // Check for existing season
        const allSeasons = await callNestAPI('/api/seasons', 'GET', authToken);
        const exists = allSeasons.find(
          (s: any) => s.annee === params.annee && s.saison === params.saison
        );

        if (exists) {
          throw new Error(`Season already exists: ${exists.nom_saison} ${exists.annee} (ID: ${exists.id_saison})`);
        }

        const result = await callNestAPI('/api/admin/seasons', 'POST', authToken, params);
        return { success: true, data: result };
      },
    }),

    updateSeasonStatus: tool({
      description: 'Update season visibility (0=hidden, 1=visible)',
      inputSchema: UpdateSeasonStatusSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/seasons/${params.id}`,
          'PATCH',
          authToken,
          { statut: params.statut }
        );
        return { success: true, data: result };
      },
    }),

    addAnimeToSeason: tool({
      description: 'Add anime to season',
      inputSchema: AddAnimeToSeasonSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/seasons/${params.seasonId}/animes`,
          'POST',
          authToken,
          { animeId: params.animeId }
        );
        return { success: true, data: result };
      },
    }),

    removeAnimeFromSeason: tool({
      description: 'Remove anime from season',
      inputSchema: RemoveAnimeFromSeasonSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/seasons/${params.seasonId}/animes/${params.animeId}`,
          'DELETE',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    deleteSeason: tool({
      description: 'Delete season (destructive action)',
      inputSchema: DeleteSeasonSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/seasons/${params.id}`,
          'DELETE',
          authToken
        );
        return { success: true, data: result };
      },
    }),
  };
}
