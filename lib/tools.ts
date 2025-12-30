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
  SearchAniListBySeasonSchema,
  DeleteSeasonSchema,
  ListAnimesNoImageSchema,
  BatchUpdateImagesJikanSchema,
  AutoUpdateAnimeImageSchema,
  UpdateAnimeImageJikanSchema,
  UpdateAnimeImageUrlSchema,
  // Manga schemas
  MangaListSchema,
  CreateMangaSchema,
  UpdateMangaStatusSchema,
  UpdateMangaSchema,
  SearchAniListMangaSchema,
  SearchAniListMangaByDateRangeSchema,
  UploadMangaCoverImageSchema,
  UploadMangaScreenshotSchema,
  ListMangasNoImageSchema,
  BatchUpdateMangaImagesJikanSchema,
  AutoUpdateMangaImageSchema,
  UpdateMangaImageJikanSchema,
  UpdateMangaImageUrlSchema,
  SearchGoogleBooksMangaSchema,
  SearchBooknodeMangaSchema,
  SearchJikanMangaSchema,
  LookupMangaByIsbnSchema,
  GetMangaVolumesSchema,
  CreateMangaVolumeSchema,
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

    listAnimesWithoutImage: tool({
      description: 'List animes that have no cover image. Useful for finding which animes need images added.',
      inputSchema: ListAnimesNoImageSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/animes/no-image', 'GET', authToken, params);
        return { success: true, data: result };
      },
    }),

    batchUpdateAnimeImages: tool({
      description: 'Batch update images for multiple animes from Jikan/MyAnimeList. Can process specific anime IDs or automatically process animes without images. Returns detailed results for each anime.',
      inputSchema: BatchUpdateImagesJikanSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/animes/batch-image/jikan', 'POST', authToken, params);
        return { success: true, data: result };
      },
    }),

    autoUpdateAnimeImage: tool({
      description: 'Automatically update anime cover image by fetching from Jikan/MyAnimeList. This is a simplified one-click solution.',
      inputSchema: AutoUpdateAnimeImageSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/animes/${params.animeId}/auto-image`,
          'POST',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    updateAnimeImageFromJikan: tool({
      description: 'Update anime cover image by fetching from Jikan/MyAnimeList API. Searches by anime title and uploads high-quality image.',
      inputSchema: UpdateAnimeImageJikanSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/animes/${params.animeId}/image/jikan`,
          'POST',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    updateAnimeImageFromUrl: tool({
      description: 'Update anime cover image from a direct image URL. Downloads the image and uploads to ImageKit.',
      inputSchema: UpdateAnimeImageUrlSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/animes/${params.animeId}/image/url`,
          'POST',
          authToken,
          { imageUrl: params.imageUrl }
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

    searchAniListBySeason: tool({
      description: 'Search for anime on AniList by season (e.g., Winter 2026). Returns list of anime from AniList for that season with comparison to existing database entries.',
      inputSchema: SearchAniListBySeasonSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/animes/anilist/season/${params.season}/${params.year}?limit=${params.limit || 50}`,
          'GET',
          authToken
        );
        return result;
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

    // ========================================
    // MANGA TOOLS
    // ========================================

    listMangas: tool({
      description: 'Search and list mangas from the database. Use filters for year, status, and completion. Returns paginated results.',
      inputSchema: MangaListSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/admin/mangas', 'GET', authToken, params);
        return { success: true, data: result };
      },
    }),

    createManga: tool({
      description: 'Create a new manga entry in the database. Can include title, author, publisher, volumes, year, synopsis, image, and more.',
      inputSchema: CreateMangaSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/admin/mangas', 'POST', authToken, params);
        return { success: true, data: result };
      },
    }),

    updateMangaStatus: tool({
      description: 'Update manga status (0=blocked, 1=published, 2=pending)',
      inputSchema: UpdateMangaStatusSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/mangas/${params.id}/status`,
          'PUT',
          authToken,
          { statut: params.statut }
        );
        return { success: true, data: result };
      },
    }),

    updateManga: tool({
      description: 'Update manga information (title, author, volumes, year, synopsis, etc.). Use listMangas first to find the correct ID if searching by name.',
      inputSchema: UpdateMangaSchema,
      execute: async (params: any, options) => {
        const { id, ...updateData } = params;
        const result = await callNestAPI(
          `/api/admin/mangas/${id}`,
          'PUT',
          authToken,
          updateData
        );
        return { success: true, data: result };
      },
    }),

    searchAniListManga: tool({
      description: 'Search AniList for manga information by title. Returns manga metadata from AniList including author, volumes, year, synopsis, and cover image.',
      inputSchema: SearchAniListMangaSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/mangas/anilist/search', 'GET', authToken, params);
        return { success: true, data: result };
      },
    }),

    searchAniListMangaByDateRange: tool({
      description: 'Search AniList for manga released within a date range. Useful for finding manga from a specific period.',
      inputSchema: SearchAniListMangaByDateRangeSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/anilist/daterange/${params.startDate}/${params.endDate}?limit=${params.limit || 200}`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    searchGoogleBooksManga: tool({
      description: 'Search Google Books for manga releases in a specific month and year. Returns manga found on Google Books.',
      inputSchema: SearchGoogleBooksMangaSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/googlebooks/month/${params.year}/${params.month}?maxResults=${params.maxResults || 40}&lang=${params.lang || 'fr'}`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    searchBooknodeManga: tool({
      description: 'Search Booknode.com for manga releases in a specific month and year. Returns manga found on Booknode.',
      inputSchema: SearchBooknodeMangaSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/booknode/month/${params.year}/${params.month}`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    searchJikanManga: tool({
      description: 'Search Jikan API (MyAnimeList) for manga by title. Returns manga from MyAnimeList with metadata and images.',
      inputSchema: SearchJikanMangaSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/jikan/search?q=${encodeURIComponent(params.q)}&limit=${params.limit || 5}`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    lookupMangaByIsbn: tool({
      description: 'Lookup manga information by ISBN barcode number. Returns manga details from ISBN databases.',
      inputSchema: LookupMangaByIsbnSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/isbn/lookup?isbn=${params.isbn}`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    uploadMangaCoverImage: tool({
      description: 'Upload cover image for manga from URL. Downloads the image and uploads to ImageKit, then sets it as manga cover.',
      inputSchema: UploadMangaCoverImageSchema,
      execute: async (params: any, options) => {
        const uploadResult = await callNestAPI(
          '/api/media/upload-from-url',
          'POST',
          authToken,
          {
            imageUrl: params.imageUrl,
            type: 'manga',
            relatedId: params.mangaId,
            saveAsScreenshot: false,
          }
        );

        await callNestAPI(
          `/api/admin/mangas/${params.mangaId}`,
          'PUT',
          authToken,
          { image: uploadResult.filename }
        );

        return { success: true, data: uploadResult };
      },
    }),

    uploadMangaScreenshot: tool({
      description: 'Upload screenshot for manga from URL. Downloads the image and saves it to the screenshots table.',
      inputSchema: UploadMangaScreenshotSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          '/api/media/upload-from-url',
          'POST',
          authToken,
          {
            imageUrl: params.imageUrl,
            type: 'manga',
            relatedId: params.mangaId,
            saveAsScreenshot: true,
          }
        );
        return { success: true, data: result };
      },
    }),

    listMangasWithoutImage: tool({
      description: 'List mangas that have no cover image. Useful for finding which mangas need images added.',
      inputSchema: ListMangasNoImageSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/mangas/no-image', 'GET', authToken, params);
        return { success: true, data: result };
      },
    }),

    batchUpdateMangaImages: tool({
      description: 'Batch update images for multiple mangas from Jikan/MyAnimeList. Can process specific manga IDs or automatically process mangas without images. Returns detailed results for each manga.',
      inputSchema: BatchUpdateMangaImagesJikanSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/mangas/batch-image/jikan', 'POST', authToken, params);
        return { success: true, data: result };
      },
    }),

    autoUpdateMangaImage: tool({
      description: 'Automatically update manga cover image by fetching from Jikan/MyAnimeList. This is a simplified one-click solution.',
      inputSchema: AutoUpdateMangaImageSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/${params.mangaId}/auto-image`,
          'POST',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    updateMangaImageFromJikan: tool({
      description: 'Update manga cover image by fetching from Jikan/MyAnimeList API. Searches by manga title and uploads high-quality image.',
      inputSchema: UpdateMangaImageJikanSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/${params.mangaId}/image/jikan`,
          'POST',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    updateMangaImageFromUrl: tool({
      description: 'Update manga cover image from a direct image URL. Downloads the image and uploads to ImageKit.',
      inputSchema: UpdateMangaImageUrlSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/${params.mangaId}/image/url`,
          'POST',
          authToken,
          { imageUrl: params.imageUrl }
        );
        return { success: true, data: result };
      },
    }),

    getMangaVolumes: tool({
      description: 'Get all volumes for a specific manga. Returns list of manga volumes with their details.',
      inputSchema: GetMangaVolumesSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/${params.mangaId}/volumes`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    createMangaVolume: tool({
      description: 'Create a new manga volume from ISBN barcode scan. Automatically fetches volume details from ISBN databases.',
      inputSchema: CreateMangaVolumeSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/mangas/${params.mangaId}/volumes/scan`,
          'POST',
          authToken,
          { isbn: params.isbn }
        );
        return { success: true, data: result };
      },
    }),
  };
}
