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
 * Schema for deleting a season
 * Maps to DELETE /api/admin/seasons/:id
 */
export const DeleteSeasonSchema = z.object({
  id: z.number().int().min(1).describe('Season ID to delete'),
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
