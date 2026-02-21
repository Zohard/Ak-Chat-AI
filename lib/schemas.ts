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
  synopsis: z.string().optional().describe('Synopsis/description of the anime'),
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

/**
 * Schema for uploading anime image from base64 (chat upload)
 * Maps to POST /api/media/upload
 */
export const UploadAnimeImageFromFileSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to upload image for'),
  imageBase64: z.string().min(1).describe('Base64 encoded image data (without data:image prefix)'),
  fileName: z.string().optional().describe('Original filename'),
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
 * Schema for uploading manga image from base64 (chat upload)
 * Maps to POST /api/media/upload
 */
export const UploadMangaImageFromFileSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID to upload image for'),
  imageBase64: z.string().min(1).describe('Base64 encoded image data (without data:image prefix)'),
  fileName: z.string().optional().describe('Original filename'),
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
 * Use this for past months (before current month) or as fallback.
 */
export const SearchBooknodeMangaSchema = z.object({
  year: z.number().int().min(2000).max(2100).describe('Year'),
  month: z.number().int().min(1).max(12).describe('Month (1-12)'),
});

/**
 * Schema for searching MangaCollec planning for manga releases by month.
 * Maps to GET /api/mangas/mangacollec/month/:year/:month
 * Only valid for current month or future months.
 */
export const SearchMangaCollecMangaSchema = z.object({
  year: z.number().int().min(2000).max(2100).describe('Year'),
  month: z.number().int().min(1).max(12).describe('Month (1-12). Must be >= current month.'),
});

/**
 * Schema for importing a manga and optionally its corresponding volume in one step.
 * Creates the manga entry, then optionally imports the volume using MangaCollec/Booknode data.
 */
export const ImportMangaWithVolumeSchema = z.object({
  // Manga creation fields
  titre: z.string().min(1).describe('Main title of the manga'),
  niceUrl: z.string().optional().describe('URL-friendly slug (auto-generated from titre if omitted)'),
  titreOrig: z.string().optional().describe('Original title (usually Japanese)'),
  titreFr: z.string().optional().describe('French title'),
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
  // Volume import option
  importVolume: z.boolean().default(false).describe('If true, also creates a manga_volumes entry for the associated volume'),
  volumeNumber: z.number().int().min(1).optional().describe('Volume number to import (required when importVolume=true)'),
  volumeTitle: z.string().optional().describe('Volume-specific title'),
  volumeIsbn: z.string().optional().describe('ISBN-13 of the volume'),
  volumeReleaseDate: z.string().optional().describe('French release date of the volume (YYYY-MM-DD)'),
  volumeCoverUrl: z.string().url().optional().describe('Cover image URL of the volume'),
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
 * Schema for searching Nautiljon for a specific volume
 * Maps to GET /api/admin/mangas/nautiljon/search
 */
export const SearchNautiljonVolumeSchema = z.object({
  title: z.string().min(1).describe('Manga title to search (e.g., "Bleach", "Stage S")'),
  volumeNumber: z.number().int().min(1).describe('Volume number to find'),
});

/**
 * Schema for scraping a Nautiljon URL directly
 * Maps to POST /api/admin/mangas/nautiljon/scrape-url
 */
export const ScrapeNautiljonUrlSchema = z.object({
  url: z.string().min(1).describe('Nautiljon volume page URL (e.g., https://www.nautiljon.com/mangas/bleach/volume-1,12345.html)'),
  volumeNumber: z.number().int().min(0).optional().describe('Expected volume number (optional, will be extracted from page if not provided)'),
  mangaId: z.number().int().min(1).optional().describe('Manga ID to attach the cover image to (optional, uploads to R2 if provided)'),
  createVolume: z.boolean().default(false).describe('Create/update manga_volumes entry with scraped data'),
});

/**
 * Schema for importing/creating a manga volume with manual data
 * Maps to POST /api/admin/mangas/:id/volumes/import
 */
export const ImportMangaVolumeSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID'),
  volumeNumber: z.number().int().min(1).describe('Volume number'),
  title: z.string().optional().describe('Volume title (e.g., "Tome 1 - Le commencement")'),
  isbn: z.string().optional().describe('ISBN-13 code'),
  releaseDate: z.string().optional().describe('French release date (YYYY-MM-DD format)'),
  coverUrl: z.string().url().optional().describe('Cover image URL to upload'),
  description: z.string().optional().describe('Volume description'),
});

/**
 * Schema for updating an existing manga volume
 * Maps to PATCH /api/admin/mangas/volumes/:volumeId
 */
export const UpdateMangaVolumeSchema = z.object({
  volumeId: z.number().int().min(1).describe('Volume ID to update'),
  title: z.string().optional().describe('New volume title'),
  isbn: z.string().optional().describe('New ISBN'),
  releaseDate: z.string().optional().describe('New release date (YYYY-MM-DD)'),
  coverUrl: z.string().url().optional().describe('New cover image URL'),
  description: z.string().optional().describe('New description'),
});

/**
 * Schema for deleting a manga volume
 * Maps to DELETE /api/admin/mangas/volumes/:volumeId
 */
export const DeleteMangaVolumeSchema = z.object({
  volumeId: z.number().int().min(1).describe('Volume ID to delete'),
});

/**
 * Schema for searching volume candidates from multiple sources
 * Maps to GET /api/admin/mangas/:id/volumes/:volumeNumber/candidates
 */
export const SearchVolumeCandidatesSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID'),
  volumeNumber: z.number().int().min(1).describe('Volume number to search for'),
});

// ========================================
// BUSINESS SCHEMAS (Studios, Publishers, etc.)
// ========================================

/**
 * Schema for listing/searching businesses (studios, publishers, etc.)
 * Maps to GET /api/admin/business
 */
export const BusinessListSchema = z.object({
  page: z.number().int().min(1).default(1).describe('Page number for pagination'),
  statut: z.number().int().min(0).max(1).optional().describe('Filter by status: 0=hidden, 1=published'),
  search: z.string().optional().describe('Search query for business name'),
  type: z.string().optional().describe('Filter by type (e.g., "studio", "éditeur", "diffuseur")'),
});

/**
 * Schema for creating a new business entry
 * Maps to POST /api/admin/business
 */
export const CreateBusinessSchema = z.object({
  denomination: z.string().min(1, 'Denomination is required').describe('Business name (e.g., Studio Ghibli, Toei Animation)'),
  niceUrl: z.string().optional().describe('URL-friendly slug'),
  type: z.string().optional().describe('Type: studio, éditeur, diffuseur, producteur, etc.'),
  autresDenominations: z.string().optional().describe('Alternative names, comma separated'),
  image: z.string().optional().describe('Logo/image filename'),
  date: z.string().optional().describe('Founding date (free text)'),
  origine: z.string().optional().describe('Country of origin (e.g., Japon, France, USA)'),
  siteOfficiel: z.string().url().optional().describe('Official website URL'),
  notes: z.string().optional().describe('Additional notes'),
  statut: z.number().int().min(0).max(1).default(1).describe('Status: 0=hidden, 1=published'),
});

/**
 * Schema for updating business information
 * Maps to PUT /api/admin/business/:id
 */
export const UpdateBusinessSchema = z.object({
  id: z.number().int().min(1).describe('Business ID to update'),
  denomination: z.string().optional().describe('Business name'),
  niceUrl: z.string().optional().describe('URL-friendly slug'),
  type: z.string().optional().describe('Type'),
  autresDenominations: z.string().optional().describe('Alternative names'),
  image: z.string().optional().describe('Logo/image filename'),
  date: z.string().optional().describe('Founding date'),
  origine: z.string().optional().describe('Country of origin'),
  siteOfficiel: z.string().optional().describe('Official website URL'),
  notes: z.string().optional().describe('Additional notes'),
  statut: z.number().int().min(0).max(1).optional().describe('Status'),
});

/**
 * Schema for updating business status
 * Maps to PUT /api/admin/business/:id/status
 */
export const UpdateBusinessStatusSchema = z.object({
  id: z.number().int().min(1).describe('Business ID to update'),
  statut: z.number().int().min(0).max(1).describe('New status: 0=hidden, 1=published'),
});

/**
 * Schema for getting business details
 * Maps to GET /api/admin/business/:id
 */
export const GetBusinessSchema = z.object({
  id: z.number().int().min(1).describe('Business ID'),
});

/**
 * Schema for deleting a business
 * Maps to DELETE /api/admin/business/:id
 */
export const DeleteBusinessSchema = z.object({
  id: z.number().int().min(1).describe('Business ID to delete'),
});

/**
 * Schema for getting anime staff/businesses
 * Maps to GET /api/animes/:id/staff
 */
export const GetAnimeStaffSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID'),
});

/**
 * Schema for adding business to anime
 * Maps to POST /api/animes/:id/businesses
 */
export const AddAnimeBusinessSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID'),
  businessId: z.number().int().min(1).describe('Business ID to associate'),
  type: z.string().min(1).describe('Relation type: studio, producteur, diffuseur, distributeur, etc.'),
  precisions: z.string().optional().describe('Additional details about the relationship'),
});

/**
 * Schema for removing business from anime
 * Maps to DELETE /api/animes/:id/businesses/:businessId
 */
export const RemoveAnimeBusinessSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID'),
  businessId: z.number().int().min(1).describe('Business ID to remove'),
});

/**
 * Schema for getting manga staff/businesses
 * Maps to GET /api/mangas/:id/staff (if available)
 */
export const GetMangaStaffSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID'),
});

/**
 * Schema for adding business to manga
 * Maps to POST /api/mangas/:id/businesses (if available)
 */
export const AddMangaBusinessSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID'),
  businessId: z.number().int().min(1).describe('Business ID to associate'),
  type: z.string().min(1).describe('Relation type: éditeur, distributeur, etc.'),
  precisions: z.string().optional().describe('Additional details about the relationship'),
});

/**
 * Schema for removing business from manga
 * Maps to DELETE /api/mangas/:id/businesses/:businessId (if available)
 */
export const RemoveMangaBusinessSchema = z.object({
  mangaId: z.number().int().min(1).describe('Manga ID'),
  businessId: z.number().int().min(1).describe('Business ID to remove'),
});

/**
 * Schema for importing business image
 * Maps to POST /api/admin/business/import-image
 */
export const ImportBusinessImageSchema = z.object({
  imageUrl: z.string().url().describe('URL of the image to import'),
  businessName: z.string().min(1).describe('Name of the business for filename generation'),
});

// ========================================
// EPISODE SYNC SCHEMAS
// ========================================

/**
 * Schema for syncing anime episodes from AniList
 * Maps to POST /api/animes/:id/episodes/sync
 */
export const SyncAnimeEpisodesSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to sync episodes for'),
  force: z.boolean().default(false).describe('Force sync even if episodes already exist'),
});

/**
 * Schema for getting anime episodes
 * Maps to GET /api/animes/:id/episodes
 */
export const GetAnimeEpisodesSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to get episodes for'),
});

/**
 * Schema for updating an episode's diffusion date
 * Maps to PATCH /api/animes/:animeId/episodes/:episodeId
 */
export const UpdateEpisodeDateSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID the episode belongs to'),
  episodeId: z.number().int().min(1).describe('Episode ID to update'),
  dateDiffusion: z.string().nullable().optional().describe('New diffusion date in YYYY-MM-DD format, or null to remove the date'),
  applyOffsetToNext: z.boolean().default(false).describe('If true, applies the same date offset to all subsequent episodes'),
  offsetDays: z.number().int().optional().describe('Number of days to offset (automatically calculated from date change, but can be explicitly provided)'),
});

/**
 * Schema for checking anime sync readiness
 * Returns info about whether anime has AniList ID and nb_ep
 */
export const CheckAnimeSyncReadinessSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to check'),
});

/**
 * Schema for batch syncing episodes for multiple animes
 */
export const BatchSyncEpisodesSchema = z.object({
  animeIds: z.array(z.number().int().min(1)).describe('Array of anime IDs to sync'),
  force: z.boolean().default(false).describe('Force sync even if episodes already exist'),
});

// ========================================
// ANILIST IMPORT SCHEMAS
// ========================================

/**
 * Schema for previewing AniList data stored in commentaire field
 * Maps to GET /api/admin/animes/:id/anilist-data
 */
export const GetAniListDataPreviewSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to preview AniList data for'),
});

/**
 * Schema for importing tags from AniList data
 * Maps to POST /api/admin/animes/:id/import-tags
 */
export const ImportAniListTagsSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to import tags for'),
});

/**
 * Schema for importing staff from AniList data
 * Maps to POST /api/admin/animes/:id/import-staff
 */
export const ImportAniListStaffSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to import staff for'),
  includeVoiceActors: z.boolean().default(false).describe('Include Japanese voice actors in import'),
  roles: z.array(z.string()).optional().describe('Filter by specific roles (e.g., ["director", "music", "character design"])'),
});

/**
 * Schema for importing both tags and staff from AniList data
 * Maps to POST /api/admin/animes/:id/import-anilist
 */
export const ImportAniListAllSchema = z.object({
  animeId: z.number().int().min(1).describe('Anime ID to import AniList data for'),
  includeVoiceActors: z.boolean().default(false).describe('Include Japanese voice actors in staff import'),
  staffRoles: z.array(z.string()).optional().describe('Filter staff by specific roles'),
});

// ========================================
// WEB SEARCH SCHEMA
// ========================================

/**
 * Schema for web search using Google Custom Search API
 */
export const WebSearchSchema = z.object({
  query: z.string().min(1).describe('Search query to send to Google'),
  limit: z.number().int().min(1).max(10).default(5).describe('Number of results (max 10)'),
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
export type UploadAnimeImageFromFileParams = z.infer<typeof UploadAnimeImageFromFileSchema>;

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
export type UploadMangaImageFromFileParams = z.infer<typeof UploadMangaImageFromFileSchema>;
export type SearchGoogleBooksMangaParams = z.infer<typeof SearchGoogleBooksMangaSchema>;
export type SearchBooknodeMangaParams = z.infer<typeof SearchBooknodeMangaSchema>;
export type SearchMangaCollecMangaParams = z.infer<typeof SearchMangaCollecMangaSchema>;
export type ImportMangaWithVolumeParams = z.infer<typeof ImportMangaWithVolumeSchema>;
export type SearchJikanMangaParams = z.infer<typeof SearchJikanMangaSchema>;
export type LookupMangaByIsbnParams = z.infer<typeof LookupMangaByIsbnSchema>;
export type GetMangaVolumesParams = z.infer<typeof GetMangaVolumesSchema>;
export type CreateMangaVolumeParams = z.infer<typeof CreateMangaVolumeSchema>;
export type SearchNautiljonVolumeParams = z.infer<typeof SearchNautiljonVolumeSchema>;
export type ScrapeNautiljonUrlParams = z.infer<typeof ScrapeNautiljonUrlSchema>;
export type ImportMangaVolumeParams = z.infer<typeof ImportMangaVolumeSchema>;
export type UpdateMangaVolumeParams = z.infer<typeof UpdateMangaVolumeSchema>;
export type DeleteMangaVolumeParams = z.infer<typeof DeleteMangaVolumeSchema>;
export type SearchVolumeCandidatesParams = z.infer<typeof SearchVolumeCandidatesSchema>;

// Business type exports
export type BusinessListParams = z.infer<typeof BusinessListSchema>;
export type CreateBusinessParams = z.infer<typeof CreateBusinessSchema>;
export type UpdateBusinessParams = z.infer<typeof UpdateBusinessSchema>;
export type UpdateBusinessStatusParams = z.infer<typeof UpdateBusinessStatusSchema>;
export type GetBusinessParams = z.infer<typeof GetBusinessSchema>;
export type DeleteBusinessParams = z.infer<typeof DeleteBusinessSchema>;
export type GetAnimeStaffParams = z.infer<typeof GetAnimeStaffSchema>;
export type AddAnimeBusinessParams = z.infer<typeof AddAnimeBusinessSchema>;
export type RemoveAnimeBusinessParams = z.infer<typeof RemoveAnimeBusinessSchema>;
export type GetMangaStaffParams = z.infer<typeof GetMangaStaffSchema>;
export type AddMangaBusinessParams = z.infer<typeof AddMangaBusinessSchema>;
export type RemoveMangaBusinessParams = z.infer<typeof RemoveMangaBusinessSchema>;
export type ImportBusinessImageParams = z.infer<typeof ImportBusinessImageSchema>;

// AniList import type exports
export type GetAniListDataPreviewParams = z.infer<typeof GetAniListDataPreviewSchema>;
export type ImportAniListTagsParams = z.infer<typeof ImportAniListTagsSchema>;
export type ImportAniListStaffParams = z.infer<typeof ImportAniListStaffSchema>;
export type ImportAniListAllParams = z.infer<typeof ImportAniListAllSchema>;

// Episode sync type exports
export type SyncAnimeEpisodesParams = z.infer<typeof SyncAnimeEpisodesSchema>;
export type GetAnimeEpisodesParams = z.infer<typeof GetAnimeEpisodesSchema>;
export type UpdateEpisodeDateParams = z.infer<typeof UpdateEpisodeDateSchema>;
export type CheckAnimeSyncReadinessParams = z.infer<typeof CheckAnimeSyncReadinessSchema>;
export type BatchSyncEpisodesParams = z.infer<typeof BatchSyncEpisodesSchema>;

// Web search type export
export type WebSearchParams = z.infer<typeof WebSearchSchema>;
