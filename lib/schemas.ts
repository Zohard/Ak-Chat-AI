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
  statut: z.number().int().min(0).max(2).optional().describe('Filter by status: 0=pending, 1=published, 2=refused'),
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
  statut: z.number().int().min(0).max(2).default(0).describe('Status: 0=pending, 1=published, 2=refused'),
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
  statut: z.number().int().min(0).max(2).describe('New status: 0=pending, 1=published, 2=refused'),
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
 * Type exports for TypeScript
 */
export type AnimeListParams = z.infer<typeof AnimeListSchema>;
export type CreateAnimeParams = z.infer<typeof CreateAnimeSchema>;
export type UpdateAnimeStatusParams = z.infer<typeof UpdateAnimeStatusSchema>;
export type SearchAniListParams = z.infer<typeof SearchAniListSchema>;
