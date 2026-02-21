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
  UploadAnimeImageFromFileSchema,
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
  UploadMangaImageFromFileSchema,
  SearchGoogleBooksMangaSchema,
  SearchBooknodeMangaSchema,
  SearchMangaCollecMangaSchema,
  SearchJikanMangaSchema,
  LookupMangaByIsbnSchema,
  GetMangaVolumesSchema,
  CreateMangaVolumeSchema,
  SearchNautiljonVolumeSchema,
  ScrapeNautiljonUrlSchema,
  ImportMangaVolumeSchema,
  UpdateMangaVolumeSchema,
  DeleteMangaVolumeSchema,
  SearchVolumeCandidatesSchema,
  ImportMangaWithVolumeSchema,
  // Business schemas
  BusinessListSchema,
  CreateBusinessSchema,
  UpdateBusinessSchema,
  UpdateBusinessStatusSchema,
  GetBusinessSchema,
  DeleteBusinessSchema,
  GetAnimeStaffSchema,
  AddAnimeBusinessSchema,
  RemoveAnimeBusinessSchema,
  GetMangaStaffSchema,
  AddMangaBusinessSchema,
  RemoveMangaBusinessSchema,
  ImportBusinessImageSchema,
  // AniList import schemas
  GetAniListDataPreviewSchema,
  ImportAniListTagsSchema,
  ImportAniListStaffSchema,
  ImportAniListAllSchema,
  // Episode sync schemas
  SyncAnimeEpisodesSchema,
  GetAnimeEpisodesSchema,
  UpdateEpisodeDateSchema,
  CheckAnimeSyncReadinessSchema,
  BatchSyncEpisodesSchema,
  // Web search schema
  WebSearchSchema,
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

/**
 * Upload base64 image to the media service
 */
async function uploadBase64Image(
  base64Data: string,
  fileName: string,
  type: 'anime' | 'manga',
  relatedId: number,
  authToken?: string
) {
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Create a Blob from the buffer
  const blob = new Blob([buffer], { type: 'image/jpeg' });

  // Create FormData
  const formData = new FormData();
  formData.append('file', blob, fileName || 'upload.jpg');
  formData.append('type', type);
  formData.append('relatedId', relatedId.toString());
  formData.append('isScreenshot', 'false');

  // Prepare headers
  const headers: HeadersInit = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Upload to media service
  const response = await fetch(`${API_BASE}/api/media/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
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
      description: 'Update anime cover image from a direct image URL. Downloads the image and uploads to R2.',
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

    uploadAnimeImageFromFile: tool({
      description: 'Upload anime cover image from a base64-encoded file (used by chat interface). The image is uploaded to R2 and set as the anime cover.',
      inputSchema: UploadAnimeImageFromFileSchema,
      execute: async (params: any, options) => {
        // Upload the base64 image
        const uploadResult = await uploadBase64Image(
          params.imageBase64,
          params.fileName || 'anime-cover.jpg',
          'anime',
          params.animeId,
          authToken
        );

        // Update the anime record with the new image
        await callNestAPI(
          `/api/admin/animes/${params.animeId}`,
          'PUT',
          authToken,
          { image: uploadResult.filename }
        );

        return { success: true, data: uploadResult };
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

    importMangaWithVolume: tool({
      description: 'Create a new manga entry and optionally import its associated volume in a single operation. Use this after finding a manga via searchMangaCollecManga or searchBooknodeManga when you want to also register the volume (ISBN, release date, cover). Set importVolume=true and provide volumeNumber + volume details to also create the manga_volumes entry. Returns both the manga creation result and, if importVolume=true, the volume import result.',
      inputSchema: ImportMangaWithVolumeSchema,
      execute: async (params: any, options) => {
        const {
          importVolume,
          volumeNumber,
          volumeTitle,
          volumeIsbn,
          volumeReleaseDate,
          volumeCoverUrl,
          ...mangaData
        } = params;

        // Step 1: Create the manga
        const mangaResult = await callNestAPI('/api/admin/mangas', 'POST', authToken, mangaData);
        const mangaId = mangaResult?.id || mangaResult?.idManga;

        if (!importVolume || !mangaId || !volumeNumber) {
          return {
            success: true,
            manga: mangaResult,
            volume: null,
            message: `Manga created (ID: ${mangaId})${importVolume && !volumeNumber ? '. Skipped volume import: volumeNumber is required.' : ''}`,
          };
        }

        // Step 2: Import the volume
        const volumeResult = await callNestAPI(
          `/api/admin/mangas/${mangaId}/volumes/import`,
          'POST',
          authToken,
          {
            volumeNumber,
            title: volumeTitle,
            isbn: volumeIsbn,
            releaseDate: volumeReleaseDate,
            coverUrl: volumeCoverUrl,
          }
        );

        return {
          success: true,
          manga: mangaResult,
          volume: volumeResult,
          message: `Manga created (ID: ${mangaId}) and volume ${volumeNumber} imported.`,
        };
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
      description: 'Search Booknode.com for manga releases in a specific month and year. Use this for PAST months (before the current month) or as a fallback when MangaCollec is not suitable. Returns manga with exists/volumeExists comparison against the database.',
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

    searchMangaCollecManga: tool({
      description: 'Search MangaCollec planning for manga volume releases in a specific month and year. Use this ONLY for the CURRENT month or FUTURE months (>= current month). For past months use searchBooknodeManga instead. Returns a list of planned releases with volume number, ISBN, release date, cover image, and whether the manga/volume already exists in the database.',
      inputSchema: SearchMangaCollecMangaSchema,
      execute: async (params: any, options) => {
        // Enforce >= current month rule
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-indexed
        const isBeforeCurrentMonth =
          params.year < currentYear ||
          (params.year === currentYear && params.month < currentMonth);

        if (isBeforeCurrentMonth) {
          return {
            success: false,
            error: `MangaCollec planning only covers current and future months. Requested ${params.year}-${String(params.month).padStart(2, '0')} is in the past. Use searchBooknodeManga for past months instead.`,
            suggestion: 'searchBooknodeManga',
          };
        }

        const result = await callNestAPI(
          `/api/mangas/mangacollec/month/${params.year}/${params.month}`,
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
      description: 'Upload cover image for manga from URL. Downloads the image and uploads to R2, then sets it as manga cover.',
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
      description: 'Update manga cover image from a direct image URL. Downloads the image and uploads to R2.',
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

    uploadMangaImageFromFile: tool({
      description: 'Upload manga cover image from a base64-encoded file (used by chat interface). The image is uploaded to R2 and set as the manga cover.',
      inputSchema: UploadMangaImageFromFileSchema,
      execute: async (params: any, options) => {
        // Upload the base64 image
        const uploadResult = await uploadBase64Image(
          params.imageBase64,
          params.fileName || 'manga-cover.jpg',
          'manga',
          params.mangaId,
          authToken
        );

        // Update the manga record with the new image
        await callNestAPI(
          `/api/admin/mangas/${params.mangaId}`,
          'PUT',
          authToken,
          { image: uploadResult.filename }
        );

        return { success: true, data: uploadResult };
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

    searchNautiljonVolume: tool({
      description: 'Search Nautiljon for a specific manga volume by title and volume number. Useful for finding French edition info (ISBN, release date, cover). Example: "Cherche le volume 1 de Stage S sur Nautiljon"',
      inputSchema: SearchNautiljonVolumeSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/mangas/nautiljon/search?title=${encodeURIComponent(params.title)}&volume=${params.volumeNumber}`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    scrapeNautiljonUrl: tool({
      description: 'Scrape volume info directly from a Nautiljon URL. Provide a URL like "https://www.nautiljon.com/mangas/stage+s/volume-1,12345.html". Can optionally create a manga_volumes entry and upload the cover to R2.',
      inputSchema: ScrapeNautiljonUrlSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          '/api/admin/mangas/nautiljon/scrape-url',
          'POST',
          authToken,
          {
            url: params.url,
            volumeNumber: params.volumeNumber,
            mangaId: params.mangaId,
            createVolume: params.createVolume,
          }
        );
        return { success: true, data: result };
      },
    }),

    importMangaVolume: tool({
      description: 'Import/create a manga volume with manually provided data. Use this after searching Nautiljon or other sources to create a volume entry with the found information.',
      inputSchema: ImportMangaVolumeSchema,
      execute: async (params: any, options) => {
        const { mangaId, ...volumeData } = params;
        const result = await callNestAPI(
          `/api/admin/mangas/${mangaId}/volumes/import`,
          'POST',
          authToken,
          volumeData
        );
        return { success: true, data: result };
      },
    }),

    updateMangaVolume: tool({
      description: 'Update an existing manga volume. Use getMangaVolumes first to find the volume ID.',
      inputSchema: UpdateMangaVolumeSchema,
      execute: async (params: any, options) => {
        const { volumeId, ...updateData } = params;
        const result = await callNestAPI(
          `/api/admin/mangas/volumes/${volumeId}`,
          'PATCH',
          authToken,
          updateData
        );
        return { success: true, data: result };
      },
    }),

    deleteMangaVolume: tool({
      description: 'Delete a manga volume. Use getMangaVolumes first to find the volume ID.',
      inputSchema: DeleteMangaVolumeSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/mangas/volumes/${params.volumeId}`,
          'DELETE',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    searchVolumeCandidates: tool({
      description: 'Search for volume candidates from multiple sources (Google Books, Nautiljon) for a specific manga volume. Returns multiple options for user to choose from before importing.',
      inputSchema: SearchVolumeCandidatesSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/mangas/${params.mangaId}/volumes/${params.volumeNumber}/candidates`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    // ========================================
    // BUSINESS TOOLS (Studios, Publishers, etc.)
    // ========================================

    listBusinesses: tool({
      description: 'Search and list businesses (studios, publishers, production companies, distributors, etc.) from the database. Use filters for type and status.',
      inputSchema: BusinessListSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/admin/business', 'GET', authToken, params);
        return { success: true, data: result };
      },
    }),

    getBusiness: tool({
      description: 'Get detailed information about a specific business by ID.',
      inputSchema: GetBusinessSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(`/api/admin/business/${params.id}`, 'GET', authToken);
        return { success: true, data: result };
      },
    }),

    createBusiness: tool({
      description: 'Create a new business entry (studio, publisher, production company, etc.). Use this to add companies that are involved in anime/manga production or distribution.',
      inputSchema: CreateBusinessSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI('/api/admin/business', 'POST', authToken, params);
        return { success: true, data: result };
      },
    }),

    updateBusiness: tool({
      description: 'Update business information (name, type, country, website, etc.). Use listBusinesses first to find the correct ID if searching by name.',
      inputSchema: UpdateBusinessSchema,
      execute: async (params: any, options) => {
        const { id, ...updateData } = params;
        const result = await callNestAPI(
          `/api/admin/business/${id}`,
          'PUT',
          authToken,
          updateData
        );
        return { success: true, data: result };
      },
    }),

    updateBusinessStatus: tool({
      description: 'Update business status (0=hidden, 1=published)',
      inputSchema: UpdateBusinessStatusSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/business/${params.id}/status`,
          'PUT',
          authToken,
          { statut: params.statut }
        );
        return { success: true, data: result };
      },
    }),

    deleteBusiness: tool({
      description: 'Delete a business entry (destructive action)',
      inputSchema: DeleteBusinessSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/business/${params.id}`,
          'DELETE',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    importBusinessImage: tool({
      description: 'Import business logo/image from external URL to ImageKit. Provide the image URL and business name.',
      inputSchema: ImportBusinessImageSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          '/api/admin/business/import-image',
          'POST',
          authToken,
          params
        );
        return { success: true, data: result };
      },
    }),

    getAnimeStaff: tool({
      description: 'Get all staff/businesses associated with an anime (studios, producers, distributors, etc.). Returns complete information about each business and their role.',
      inputSchema: GetAnimeStaffSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/animes/${params.animeId}/staff`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    addAnimeBusiness: tool({
      description: 'Add a business to an anime with a specific role (studio, producteur, diffuseur, distributeur, etc.). Use listBusinesses to find the business ID first.',
      inputSchema: AddAnimeBusinessSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/animes/${params.animeId}/businesses`,
          'POST',
          authToken,
          {
            businessId: params.businessId,
            type: params.type,
            precisions: params.precisions,
          }
        );
        return { success: true, data: result };
      },
    }),

    removeAnimeBusiness: tool({
      description: 'Remove a business from an anime',
      inputSchema: RemoveAnimeBusinessSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/animes/${params.animeId}/businesses/${params.businessId}`,
          'DELETE',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    // ========================================
    // ANILIST IMPORT TOOLS
    // ========================================

    getAniListDataPreview: tool({
      description: 'Preview AniList data stored in an anime\'s commentaire field. Shows available genres, staff, and characters that can be imported. Use this before importing to see what data is available.',
      inputSchema: GetAniListDataPreviewSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/animes/${params.animeId}/anilist-data`,
          'GET',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    importAniListTags: tool({
      description: 'Import tags/genres from AniList data to an anime. Creates tags if they don\'t exist and links them to the anime. The anime must have AniList data stored in its commentaire field (typically from when it was imported from AniList).',
      inputSchema: ImportAniListTagsSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/admin/animes/${params.animeId}/import-tags`,
          'POST',
          authToken
        );
        return { success: true, data: result };
      },
    }),

    importAniListStaff: tool({
      description: 'Import staff from AniList data to an anime. Creates business entries for staff members and links them to the anime. Can optionally include Japanese voice actors and filter by specific roles (director, music, character design, etc.).',
      inputSchema: ImportAniListStaffSchema,
      execute: async (params: any, options) => {
        const { animeId, ...body } = params;
        const result = await callNestAPI(
          `/api/admin/animes/${animeId}/import-staff`,
          'POST',
          authToken,
          body
        );
        return { success: true, data: result };
      },
    }),

    importAniListAll: tool({
      description: 'Import both tags and staff from AniList data to an anime in one operation. Combines importAniListTags and importAniListStaff functionality. Use getAniListDataPreview first to see what data is available.',
      inputSchema: ImportAniListAllSchema,
      execute: async (params: any, options) => {
        const { animeId, ...body } = params;
        const result = await callNestAPI(
          `/api/admin/animes/${animeId}/import-anilist`,
          'POST',
          authToken,
          body
        );
        return { success: true, data: result };
      },
    }),

    // ========================================
    // EPISODE SYNC TOOLS
    // ========================================

    syncAnimeEpisodes: tool({
      description: 'Sync episodes for an anime from AniList (with Jikan/MAL fallback). The anime must have an AniList ID stored either in the commentaire field (JSON with anilistId) or in the sources field (URL like https://anilist.co/anime/12345). If the anime has no AniList ID, you should first use searchAniList to find it and then update the anime sources field with the AniList URL. This will also update nb_ep if it was empty.',
      inputSchema: SyncAnimeEpisodesSchema,
      execute: async (params: any, options) => {
        try {
          const url = params.force
            ? `/api/animes/${params.animeId}/episodes/sync?force=true`
            : `/api/animes/${params.animeId}/episodes/sync`;
          const result = await callNestAPI(url, 'POST', authToken);
          return {
            success: true,
            episodesAdded: result.length || 0,
            message: result.length > 0
              ? `Successfully synced ${result.length} episodes for anime ${params.animeId}`
              : 'No new episodes to sync (anime may already have episodes or no schedule data available)',
            data: result
          };
        } catch (error: any) {
          // Check if it's the AniList ID not found error
          if (error.message?.includes('AniList ID not found')) {
            return {
              success: false,
              needsAniListId: true,
              message: 'This anime does not have an AniList ID. Please search AniList to find the correct ID and update the anime sources field with the AniList URL (e.g., https://anilist.co/anime/12345).',
              error: error.message
            };
          }
          throw error;
        }
      },
    }),

    getAnimeEpisodes: tool({
      description: 'Get all episodes for an anime. Returns the list of episodes with their details (number, title, air date, etc.).',
      inputSchema: GetAnimeEpisodesSchema,
      execute: async (params: any, options) => {
        const result = await callNestAPI(
          `/api/animes/${params.animeId}/episodes`,
          'GET',
          authToken
        );
        return {
          success: true,
          episodeCount: result.length || 0,
          data: result
        };
      },
    }),

    updateEpisodeDate: tool({
      description: 'Update the diffusion/air date for a specific anime episode. Can optionally shift all subsequent episodes by the same time offset. When applyOffsetToNext is true, all following episodes will be automatically adjusted by the same number of days. The offsetDays is automatically calculated from the date change, but can be explicitly provided if needed.',
      inputSchema: UpdateEpisodeDateSchema,
      execute: async (params: any, options) => {
        const body: any = {
          dateDiffusion: params.dateDiffusion,
        };

        if (params.applyOffsetToNext !== undefined) {
          body.applyOffsetToNext = params.applyOffsetToNext;
        }

        if (params.offsetDays !== undefined) {
          body.offsetDays = params.offsetDays;
        }

        const result = await callNestAPI(
          `/api/animes/${params.animeId}/episodes/${params.episodeId}`,
          'PATCH',
          authToken,
          body
        );

        return {
          success: true,
          message: params.applyOffsetToNext && result.affectedCount > 1
            ? `Successfully updated episode ${params.episodeId} and shifted ${result.affectedCount - 1} subsequent episodes`
            : `Successfully updated episode ${params.episodeId}`,
          affectedCount: result.affectedCount || 1,
          data: result
        };
      },
    }),

    checkAnimeSyncReadiness: tool({
      description: 'Check if an anime is ready for episode sync. Returns information about whether the anime has an AniList ID (required for sync), current episode count, and nb_ep value. Use this before syncing to know if you need to add AniList ID first.',
      inputSchema: CheckAnimeSyncReadinessSchema,
      execute: async (params: any, options) => {
        // Get anime details
        const anime = await callNestAPI(
          `/api/admin/animes?search=&page=1&limit=1`,
          'GET',
          authToken
        );

        // Get specific anime by ID using list endpoint with filter
        const animeDetail = await callNestAPI(
          `/api/animes/${params.animeId}`,
          'GET',
          authToken
        );

        // Get current episode count
        const episodes = await callNestAPI(
          `/api/animes/${params.animeId}/episodes`,
          'GET',
          authToken
        );

        // Check for AniList ID in commentaire or sources
        let hasAniListId = false;
        let aniListId = null;

        if (animeDetail.commentaire) {
          try {
            if (animeDetail.commentaire.trim().startsWith('{')) {
              const data = JSON.parse(animeDetail.commentaire);
              if (data.anilistId) {
                hasAniListId = true;
                aniListId = data.anilistId;
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        }

        if (!hasAniListId && animeDetail.sources) {
          const match = animeDetail.sources.match(/anilist\.co\/anime\/(\d+)/);
          if (match && match[1]) {
            hasAniListId = true;
            aniListId = parseInt(match[1]);
          }
        }

        return {
          success: true,
          animeId: params.animeId,
          titre: animeDetail.titre,
          readyForSync: hasAniListId,
          hasAniListId,
          aniListId,
          currentEpisodeCount: episodes.length || 0,
          nbEp: animeDetail.nbEp,
          nbEpIsEmpty: !animeDetail.nbEp || animeDetail.nbEp === 0,
          sources: animeDetail.sources,
          recommendation: hasAniListId
            ? (episodes.length > 0
              ? 'Anime already has episodes. Use force=true to re-sync if needed.'
              : 'Ready for sync! Call syncAnimeEpisodes to import episodes.')
            : 'Missing AniList ID. Use searchAniList to find the anime, then updateAnime to set the sources field with the AniList URL (e.g., https://anilist.co/anime/12345).'
        };
      },
    }),

    batchSyncEpisodes: tool({
      description: 'Batch sync episodes for multiple animes. Processes each anime and returns a summary of results. Useful for syncing all animes in a season.',
      inputSchema: BatchSyncEpisodesSchema,
      execute: async (params: any, options) => {
        const results: any[] = [];
        let successCount = 0;
        let failedCount = 0;
        let totalEpisodes = 0;
        let needsAniListIdCount = 0;

        for (const animeId of params.animeIds) {
          try {
            const url = params.force
              ? `/api/animes/${animeId}/episodes/sync?force=true`
              : `/api/animes/${animeId}/episodes/sync`;
            const result = await callNestAPI(url, 'POST', authToken);
            const episodeCount = result.length || 0;
            totalEpisodes += episodeCount;
            successCount++;
            results.push({
              animeId,
              success: true,
              episodesAdded: episodeCount
            });
          } catch (error: any) {
            if (error.message?.includes('AniList ID not found')) {
              needsAniListIdCount++;
              results.push({
                animeId,
                success: false,
                needsAniListId: true,
                error: 'Missing AniList ID'
              });
            } else {
              failedCount++;
              results.push({
                animeId,
                success: false,
                error: error.message
              });
            }
          }
        }

        return {
          success: true,
          summary: {
            total: params.animeIds.length,
            successful: successCount,
            failed: failedCount,
            needsAniListId: needsAniListIdCount,
            totalEpisodesAdded: totalEpisodes
          },
          message: `Processed ${params.animeIds.length} animes: ${successCount} synced (${totalEpisodes} episodes), ${needsAniListIdCount} need AniList ID, ${failedCount} failed.`,
          results
        };
      },
    }),

    // ========================================
    // WEB SEARCH TOOL
    // ========================================

    webSearch: tool({
      description: 'Search the web using Tavily API. Use this when the user asks for external links, URLs, or information that is not in the database. Supports site-specific searches (e.g., "One Piece volume 1 site:nautiljon.com").',
      inputSchema: WebSearchSchema,
      execute: async (params: any, options) => {
        const apiKey = process.env.TAVILY_API_KEY;

        if (!apiKey) {
          return {
            success: false,
            error: 'Tavily API is not configured. Set TAVILY_API_KEY environment variable.',
          };
        }

        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: apiKey,
            query: params.query,
            max_results: params.limit || 5,
            include_answer: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const results = (data.results || []).map((item: any) => ({
          title: item.title,
          url: item.url,
          snippet: item.content,
        }));

        return {
          success: true,
          query: params.query,
          answer: data.answer || null,
          results,
        };
      },
    }),
  };
}
