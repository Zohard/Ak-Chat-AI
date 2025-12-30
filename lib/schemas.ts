import { z } from 'zod';

/**
 * Schema for listing/searching animes
 * Maps to GET /api/admin/animes
 */
export const AnimeListSchema = z.object({
  page: z.number().int().min(1).default(1).describe('Page number for pagination'),
  limit: z.number().int().min(1).max(100).default(20).describe('Number of results per page'),
  search: z.string().optional().describe('Search query for anime title'),
  annee: z.number().int().min(1900).max(2100).optional().describe('Filter by year'),
  ficheComplete: z.number().int().min(0).max(1).optional().describe('Filter by completion status: 0=incomplete, 1=complete'),
  statut: z.number().int().min(0).max(2).optional().describe('Filter by status: 0=blocked, 1=published, 2=pending'),
  sortBy: z.enum(['dateAjout', 'titre', 'annee']).optional().describe('Sort field'),
  sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
});

/**
 * Schema for creating a new anime entry
 * Maps to POST /api/admin/animes
 */
export const CreateAnimeSchema = z.object({
  titre: z.string().min(1, 'Titre is required').describe('Main title of the anime'),
  niceUrl: z.string().min(1).describe('URL-friendly slug for the anime'),
  titreOrig: z.string().optional().describe('Original title (usually in Japanese)'),
  titreFr: z.string().optional().describe('French title'),
  titresAlternatifs: z.string().optional().describe('Alternative titles, newline separated'),
  annee: z.number().int().min(1900).max(2100).describe('Release year'),
  nbEp: z.number().int().nonnegative().describe('Number of episodes'),
  synopsis: z.string().min(10).describe('Synopsis/description of the anime'),
  studio: z.string().optional().describe('Animation studio'),
  realisateur: z.string().optional().describe('Director name'),
  image: z.string().url().optional().describe('Cover image URL'),
  statut: z.number().int().min(0).max(2).default(0).describe('Status: 0=blocked, 1=published, 2=pending'),
  format: z.string().optional().describe('Format: Série TV, Film, OAV, etc.'),
  licence: z.number().int().optional().describe('Licensor ID'),
  ficheComplete: z.number().int().min(0).max(1).default(0).describe('Completion status: 0=incomplete, 1=complete'),
  dateDiffusion: z.string().optional().describe('Air date in DD/MM/YYYY format'),
  officialSite: z.string().url().optional().describe('Official website URL'),
});

/**
 * Schema for updating anime status
 * Maps to PUT /api/admin/animes/:id/status
 */
export const UpdateAnimeStatusSchema = z.object({
  id: z.number().int().min(1).describe('Anime ID to update'),
  statut: z.number().int().min(0).max(2).describe('New status: 0=blocked, 1=published, 2=pending'),
});

/**
 * Schema for updating anime information
 * Maps to PUT /api/admin/animes/:id
 */
export const UpdateAnimeSchema = z.object({
  id: z.number().int().min(1).describe('Anime ID to update'),
  annee: z.number().int().min(1900).max(2100).optional().describe('Release year'),
  titreOrig: z.string().optional().describe('Original title (usually Japanese)'),
  nbEp: z.number().int().min(0).optional().describe('Number of episodes'),
  synopsis: z.string().optional().describe('Synopsis/description'),
  statut: z.number().int().min(0).max(2).optional().describe('Status: 0=blocked, 1=published, 2=pending'),
  format: z.string().optional().describe('Format: Série TV, Film, OAV, Spécial, etc.'),
  titreFr: z.string().optional().describe('French title'),
  titresAlternatifs: z.string().optional().describe('Alternative titles, newline separated'),
  editeur: z.string().optional().describe('Publisher/Editor'),
  nbEpduree: z.string().optional().describe('Episode count with duration (e.g., "12", "24+")'),
  officialSite: z.string().optional().describe('Official website URL'),
  commentaire: z.string().optional().describe('Comments about the anime entry'),
  ficheComplete: z.number().int().min(0).max(1).optional().describe('Completion status: 0=incomplete, 1=complete'),
  dateDiffusion: z.string().optional().describe('Air date in YYYY-MM-DD format (convert from DD/MM/YYYY if user provides that format)'),
});

/**
 * Schema for searching AniList
 * Maps to GET /api/animes/anilist/search
 */
export const SearchAniListSchema = z.object({
  q: z.string().min(1).describe('Search query for anime title'),
  limit: z.number().int().min(1).max(50).default(10).describe('Maximum number of results'),
});

/**
 * Schema for uploading cover image from URL
 * Maps to POST /api/media/upload-from-url + PUT /api/admin/animes/:id
 */
export const UploadCoverImageSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to set cover image for'),
  imageUrl: z.string().url().describe('URL of the image to download and upload'),
});

/**
 * Schema for uploading screenshot from URL
 * Maps to POST /api/media/upload-from-url
 */
export const UploadScreenshotSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to add screenshot for'),
  imageUrl: z.string().url().describe('URL of the screenshot to download and upload'),
});

/**
 * Schema for listing all seasons
 * Maps to GET /api/seasons
 */
export const ListSeasonsSchema = z.object({});

/**
 * Schema for getting current season
 * Maps to GET /api/seasons/current
 */
export const GetCurrentSeasonSchema = z.object({});

/**
 * Schema for getting last created season
 * Maps to GET /api/seasons/last-created
 */
export const GetLastCreatedSeasonSchema = z.object({});

/**
 * Schema for creating a new season
 * Maps to POST /api/admin/seasons
 */
export const CreateSeasonSchema = z.object({
  annee: z.number().int().min(2000).max(2100).describe('Year for the season'),
  saison: z.number().int().min(1).max(4).describe('Season number: 1=hiver, 2=printemps, 3=été, 4=automne'),
  statut: z.number().int().min(0).max(1).default(1).describe('Status: 0=hidden, 1=visible'),
});

/**
 * Schema for updating season status
 * Maps to PATCH /api/admin/seasons/:id
 */
export const UpdateSeasonStatusSchema = z.object({
  id: z.number().int().min(1).describe('Season ID to update'),
  statut: z.number().int().min(0).max(1).describe('New status: 0=hidden, 1=visible'),
});

/**
 * Schema for adding anime to season
 * Maps to POST /api/admin/seasons/:id/animes
 */
export const AddAnimeToSeasonSchema = z.object({
  seasonId: z.number().int().min(1).describe('Season ID to add anime to'),
  animeId: z.number().int().min(1).describe('Anime ID to add to the season'),
});

/**
 * Schema for removing anime from season
 * Maps to DELETE /api/admin/seasons/:id/animes/:animeId
 */
export const RemoveAnimeFromSeasonSchema = z.object({
  seasonId: z.number().int().min(1).describe('Season ID to remove anime from'),
  animeId: z.number().int().min(1).describe('Anime ID to remove from the season'),
});

/**
 * Schema for searching anime by season on AniList
 * Maps to GET /api/animes/anilist/season/:season/:year
 */
export const SearchAniListBySeasonSchema = z.object({
  season: z.enum(['winter', 'spring', 'summer', 'fall']).describe('Season: winter, spring, summer, or fall'),
  year: z.number().int().min(2000).max(2100).describe('Year for the season (e.g., 2026)'),
  limit: z.number().int().min(1).max(100).default(50).describe('Maximum number of results to return'),
});

/**
 * Schema for deleting a season
 * Maps to DELETE /api/admin/seasons/:id
 */
export const DeleteSeasonSchema = z.object({
  id: z.number().int().min(1).describe('Season ID to delete'),
});

/**
 * Schema for listing animes without images
 * Maps to GET /animes/no-image
 */
export const ListAnimesNoImageSchema = z.object({
  page: z.number().int().min(1).default(1).describe('Page number'),
  limit: z.number().int().min(1).max(100).default(50).describe('Number of results per page'),
});

/**
 * Schema for batch updating images from Jikan
 * Maps to POST /animes/batch-image/jikan
 */
export const BatchUpdateImagesJikanSchema = z.object({
  animeIds: z.array(z.number().int().min(1)).optional().describe('Specific anime IDs to process. If not provided, processes animes without images'),
  limit: z.number().int().min(1).max(50).default(10).describe('Number of animes to process if no IDs provided'),
});

/**
 * Schema for auto-updating anime image
 * Maps to POST /animes/:id/auto-image
 */
export const AutoUpdateAnimeImageSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to update image for'),
});

/**
 * Schema for updating anime image from Jikan
 * Maps to POST /animes/:id/image/jikan
 */
export const UpdateAnimeImageJikanSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to update image for'),
});

/**
 * Schema for updating anime image from URL
 * Maps to POST /animes/:id/image/url
 */
export const UpdateAnimeImageUrlSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to update image for'),
  imageUrl: z.string().url().describe('URL of the image to download and upload'),
});

// ========================================
// MANGA SCHEMAS
// ========================================

/**
 * Schema for listing/searching mangas
 * Maps to GET /api/admin/mangas
 */
export const MangaListSchema = z.object({
  page: z.number().int().min(1).default(1).describe('Page number for pagination'),
  limit: z.number().int().min(1).max(100).default(20).describe('Number of results per page'),
  search: z.string().optional().describe('Search query for manga title'),
  annee: z.string().optional().describe('Filter by year'),
  ficheComplete: z.number().int().min(0).max(1).optional().describe('Filter by completion: 0=incomplete, 1=complete'),
  statut: z.number().int().min(0).max(2).optional().describe('Filter by status: 0=blocked, 1=published, 2=pending'),
  sortBy: z.enum(['dateAjout', 'titre', 'annee']).optional().describe('Sort field'),
  sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
});

/**
 * Schema for creating a new manga entry
 * Maps to POST /api/admin/mangas
 */
export const CreateMangaSchema = z.object({
  titre: z.string().min(1, 'Titre is required').describe('Main title of the manga'),
  niceUrl: z.string().optional().describe('URL-friendly slug for the manga'),
  titreOrig: z.string().optional().describe('Original title (usually in Japanese)'),
  titreFr: z.string().optional().describe('French title'),
  titresAlternatifs: z.string().optional().describe('Alternative titles, newline separated'),
  annee: z.string().optional().describe('Release year'),
  nbVolumes: z.string().optional().describe('Number of volumes'),
  synopsis: z.string().optional().describe('Synopsis/description'),
  auteur: z.string().optional().describe('Author name'),
  editeur: z.string().optional().describe('Publisher'),
  image: z.string().url().optional().describe('Cover image URL'),
  statut: z.number().int().min(0).max(2).default(0).describe('Status: 0=blocked, 1=published, 2=pending'),
  licence: z.number().int().min(0).max(1).optional().describe('Licensed in France: 0=No, 1=Yes'),
  ficheComplete: z.number().int().min(0).max(1).default(0).describe('Completion: 0=incomplete, 1=complete'),
  origine: z.string().optional().describe('Country of origin'),
  precisions: z.string().optional().describe('Public comments (BBCode allowed)'),
});

/**
 * Schema for updating manga status
 * Maps to PUT /api/admin/mangas/:id/status
 */
export const UpdateMangaStatusSchema = z.object({
  id: z.number().int().min(1).describe('Manga ID to update'),
  statut: z.number().int().min(0).max(2).describe('New status: 0=blocked, 1=published, 2=pending'),
});

/**
 * Schema for updating manga information
 * Maps to PUT /api/admin/mangas/:id
 */
export const UpdateMangaSchema = z.object({
  id: z.number().int().min(1).describe('Manga ID to update'),
  annee: z.string().optional().describe('Release year'),
  titreOrig: z.string().optional().describe('Original title'),
  nbVolumes: z.string().optional().describe('Number of volumes'),
  synopsis: z.string().optional().describe('Synopsis/description'),
  statut: z.number().int().min(0).max(2).optional().describe('Status'),
  titreFr: z.string().optional().describe('French title'),
  titresAlternatifs: z.string().optional().describe('Alternative titles'),
  editeur: z.string().optional().describe('Publisher'),
  auteur: z.string().optional().describe('Author name'),
  origine: z.string().optional().describe('Country of origin'),
  precisions: z.string().optional().describe('Public comments'),
  ficheComplete: z.number().int().min(0).max(1).optional().describe('Completion status'),
});

/**
 * Schema for searching AniList for manga
 * Maps to GET /api/mangas/anilist/search
 */
export const SearchAniListMangaSchema = z.object({
  q: z.string().min(1).describe('Search query for manga title'),
  limit: z.number().int().min(1).max(50).default(10).describe('Maximum results'),
});

/**
 * Schema for searching AniList manga by date range
 * Maps to GET /api/mangas/anilist/daterange/:startDate/:endDate
 */
export const SearchAniListMangaByDateRangeSchema = z.object({
  startDate: z.string().describe('Start date (YYYY-MM-DD)'),
  endDate: z.string().describe('End date (YYYY-MM-DD)'),
  limit: z.number().int().min(1).max(200).default(200).describe('Maximum results'),
});

/**
 * Schema for uploading manga cover image from URL
 * Maps to POST /api/media/upload-from-url + PUT /api/admin/mangas/:id
 */
export const UploadMangaCoverImageSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID to set cover for'),
  imageUrl: z.string().url().describe('URL of image to download and upload'),
});

/**
 * Schema for uploading manga screenshot from URL
 * Maps to POST /api/media/upload-from-url
 */
export const UploadMangaScreenshotSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID to add screenshot for'),
  imageUrl: z.string().url().describe('URL of screenshot to download and upload'),
});

/**
 * Schema for listing mangas without images
 * Maps to GET /api/mangas/no-image
 */
export const ListMangasNoImageSchema = z.object({
  page: z.number().int().min(1).default(1).describe('Page number'),
  limit: z.number().int().min(1).max(100).default(50).describe('Results per page'),
});

/**
 * Schema for batch updating manga images from Jikan
 * Maps to POST /api/mangas/batch-image/jikan
 */
export const BatchUpdateMangaImagesJikanSchema = z.object({
  mangaIds: z.array(z.number().int().min(1)).optional().describe('Specific manga IDs to process'),
  limit: z.number().int().min(1).max(50).default(10).describe('Number to process if no IDs provided'),
});

/**
 * Schema for auto-updating manga image
 * Maps to POST /api/mangas/:id/auto-image
 */
export const AutoUpdateMangaImageSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID to update image for'),
});

/**
 * Schema for updating manga image from Jikan
 * Maps to POST /api/mangas/:id/image/jikan
 */
export const UpdateMangaImageJikanSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID to update image for'),
});

/**
 * Schema for updating manga image from URL
 * Maps to POST /api/mangas/:id/image/url
 */
export const UpdateMangaImageUrlSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID to update image for'),
  imageUrl: z.string().url().describe('URL of image to download and upload'),
});

/**
 * Schema for searching Google Books for manga
 * Maps to GET /api/mangas/googlebooks/month/:year/:month
 */
export const SearchGoogleBooksMangaSchema = z.object({
  year: z.number().int().min(2000).max(2100).describe('Year'),
  month: z.number().int().min(1).max(12).describe('Month (1-12)'),
  maxResults: z.number().int().min(1).max(200).default(40).describe('Maximum results'),
  lang: z.enum(['fr', 'en']).default('fr').describe('Language: fr=French, en=English'),
});

/**
 * Schema for searching Booknode for manga
 * Maps to GET /api/mangas/booknode/month/:year/:month
 */
export const SearchBooknodeMangaSchema = z.object({
  year: z.number().int().min(2000).max(2100).describe('Year'),
  month: z.number().int().min(1).max(12).describe('Month (1-12)'),
});

/**
 * Schema for searching Jikan (MyAnimeList) for manga
 * Maps to GET /api/mangas/jikan/search
 */
export const SearchJikanMangaSchema = z.object({
  q: z.string().min(1).describe('Manga title to search'),
  limit: z.number().int().min(1).max(25).default(5).describe('Maximum results'),
});

/**
 * Schema for looking up manga by ISBN
 * Maps to GET /api/mangas/isbn/lookup
 */
export const LookupMangaByIsbnSchema = z.object({
  isbn: z.string().min(10).describe('ISBN barcode number'),
});

/**
 * Schema for getting manga volumes
 * Maps to GET /api/mangas/:id/volumes
 */
export const GetMangaVolumesSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID'),
});

/**
 * Schema for creating manga volume from ISBN scan
 * Maps to POST /api/mangas/:id/volumes/scan
 */
export const CreateMangaVolumeSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID'),
  isbn: z.string().min(10).describe('ISBN barcode of volume'),
});

/**
 * Type exports for TypeScript
 */
export type AnimeListParams = z.infer<typeof AnimeListSchema>;
export type CreateAnimeParams = z.infer<typeof CreateAnimeSchema>;
export type UpdateAnimeStatusParams = z.infer<typeof UpdateAnimeStatusSchema>;
export type UpdateAnimeParams = z.infer<typeof UpdateAnimeSchema>;
export type SearchAniListParams = z.infer<typeof SearchAniListSchema>;
export type UploadCoverImageParams = z.infer<typeof UploadCoverImageSchema>;
export type UploadScreenshotParams = z.infer<typeof UploadScreenshotSchema>;
export type ListSeasonsParams = z.infer<typeof ListSeasonsSchema>;
export type GetCurrentSeasonParams = z.infer<typeof GetCurrentSeasonSchema>;
export type GetLastCreatedSeasonParams = z.infer<typeof GetLastCreatedSeasonSchema>;
export type CreateSeasonParams = z.infer<typeof CreateSeasonSchema>;
export type UpdateSeasonStatusParams = z.infer<typeof UpdateSeasonStatusSchema>;
export type AddAnimeToSeasonParams = z.infer<typeof AddAnimeToSeasonSchema>;
export type RemoveAnimeFromSeasonParams = z.infer<typeof RemoveAnimeFromSeasonSchema>;
export type DeleteSeasonParams = z.infer<typeof DeleteSeasonSchema>;
export type ListAnimesNoImageParams = z.infer<typeof ListAnimesNoImageSchema>;
export type BatchUpdateImagesJikanParams = z.infer<typeof BatchUpdateImagesJikanSchema>;
export type AutoUpdateAnimeImageParams = z.infer<typeof AutoUpdateAnimeImageSchema>;
export type UpdateAnimeImageJikanParams = z.infer<typeof UpdateAnimeImageJikanSchema>;
export type UpdateAnimeImageUrlParams = z.infer<typeof UpdateAnimeImageUrlSchema>;

// Manga type exports
export type MangaListParams = z.infer<typeof MangaListSchema>;
export type CreateMangaParams = z.infer<typeof CreateMangaSchema>;
export type UpdateMangaStatusParams = z.infer<typeof UpdateMangaStatusSchema>;
export type UpdateMangaParams = z.infer<typeof UpdateMangaSchema>;
export type SearchAniListMangaParams = z.infer<typeof SearchAniListMangaSchema>;
export type SearchAniListMangaByDateRangeParams = z.infer<typeof SearchAniListMangaByDateRangeSchema>;
export type UploadMangaCoverImageParams = z.infer<typeof UploadMangaCoverImageSchema>;
export type UploadMangaScreenshotParams = z.infer<typeof UploadMangaScreenshotSchema>;
export type ListMangasNoImageParams = z.infer<typeof ListMangasNoImageSchema>;
export type BatchUpdateMangaImagesJikanParams = z.infer<typeof BatchUpdateMangaImagesJikanSchema>;
export type AutoUpdateMangaImageParams = z.infer<typeof AutoUpdateMangaImageSchema>;
export type UpdateMangaImageJikanParams = z.infer<typeof UpdateMangaImageJikanSchema>;
export type UpdateMangaImageUrlParams = z.infer<typeof UpdateMangaImageUrlSchema>;
export type SearchGoogleBooksMangaParams = z.infer<typeof SearchGoogleBooksMangaSchema>;
export type SearchBooknodeMangaParams = z.infer<typeof SearchBooknodeMangaSchema>;
export type SearchJikanMangaParams = z.infer<typeof SearchJikanMangaSchema>;
export type LookupMangaByIsbnParams = z.infer<typeof LookupMangaByIsbnSchema>;
export type GetMangaVolumesParams = z.infer<typeof GetMangaVolumesSchema>;
export type CreateMangaVolumeParams = z.infer<typeof CreateMangaVolumeSchema>;
