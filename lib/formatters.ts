// lib/formatters.ts

/**
 * Emergency formatter in case Gemini ignores instructions
 * This acts as a safety net to ensure users never see raw JSON
 */

interface AnimeItem {
    idAnime: number;
    titre: string;
    titreFr?: string;
    titreOrig?: string;
    annee: number;
    nbEp: number;
    format: string;
    statut: number;
    synopsis?: string;
}

interface SeasonItem {
    id_saison: number;
    annee: number;
    saison: number;
    nom_saison: string;
    statut: number;
}

interface ApiResponse {
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    // AniList seasonal search response
    comparisons?: any[];
    season?: string;
    year?: number;
    total?: number;
}

/**
 * Format anime list response
 */
export function formatAnimeListResponse(data: ApiResponse): string {
    if (!data.success || !data.data) {
        return `❌ Aucun résultat trouvé.`;
    }

    const items: AnimeItem[] = data.data.items || data.data;
    const total = data.data.total || items.length;

    if (!items || items.length === 0) {
        return `Aucun anime trouvé dans la base de données.`;
    }

    const statusMap: Record<number, string> = {
        0: '❌ Bloquée',
        1: '✅ Affichée',
        2: '🟡 En attente',
    };

    let response = `J'ai trouvé **${total} anime(s)** :\n\n`;

    items.slice(0, 10).forEach((anime, index) => {
        const titre = anime.titreFr || anime.titre;
        const status = statusMap[anime.statut] || '❓ Inconnu';

        response += `${index + 1}. **${titre}** (${anime.annee})\n`;
        response += `   📺 Type : ${anime.format || 'N/A'}`;

        if (anime.nbEp) {
            response += ` • ${anime.nbEp} épisode${anime.nbEp > 1 ? 's' : ''}`;
        }

        response += `\n   📊 Statut : ${status}\n`;
        response += `   🆔 ID : ${anime.idAnime}\n\n`;
    });

    if (total > 10) {
        response += `\n_Affichage des 10 premiers résultats sur ${total}._\n`;
        response += `_Affinez votre recherche pour voir plus de résultats._`;
    }

    return response;
}

/**
 * Format season list response
 */
export function formatSeasonListResponse(data: ApiResponse): string {
    if (!data.success || !data.data || data.data.length === 0) {
        return `Aucune saison trouvée dans la base de données.`;
    }

    const seasons: SeasonItem[] = data.data;
    const seasonIcons: Record<number, string> = {
        1: '❄️',
        2: '🌸',
        3: '☀️',
        4: '🍂',
    };

    const seasonNames: Record<number, string> = {
        1: 'Hiver',
        2: 'Printemps',
        3: 'Été',
        4: 'Automne',
    };

    let response = `Voici les **${seasons.length} saison(s)** disponibles :\n\n`;

    seasons.forEach((season, index) => {
        const icon = seasonIcons[season.saison] || '📅';
        const name = seasonNames[season.saison] || 'Saison';
        const status = season.statut === 1 ? '✅ Visible' : '🔒 Cachée';

        response += `${index + 1}. ${icon} **${name} ${season.annee}**\n`;
        response += `   🆔 ID : ${season.id_saison} • ${status}\n\n`;
    });

    return response;
}

/**
 * Format AniList search results
 */
export function formatAniListResponse(data: ApiResponse): string {
    if (!data.success || !data.data || !data.data.animes || data.data.animes.length === 0) {
        return `Aucun résultat trouvé sur AniList pour cette recherche.`;
    }

    const animes = data.data.animes;
    let response = `J'ai trouvé **${animes.length} anime(s)** sur AniList :\n\n`;

    animes.slice(0, 5).forEach((anime: any, index: number) => {
        response += `${index + 1}. **${anime.title || anime.titre}**`;
        if (anime.titleOriginal || anime.titreOrig) {
            response += ` (${anime.titleOriginal || anime.titreOrig})`;
        }
        response += `\n`;
        if (anime.year || anime.annee) {
            response += `   📅 Année : ${anime.year || anime.annee}\n`;
        }
        if (anime.episodes || anime.nbEpisodes) {
            response += `   📺 Épisodes : ${anime.episodes || anime.nbEpisodes}\n`;
        }
        if (anime.studio || anime.studios) {
            response += `   🎬 Studio : ${anime.studio || anime.studios}\n`;
        }
        response += `\n`;
    });

    if (animes.length > 5) {
        response += `\n_Affichage des 5 premiers résultats sur ${animes.length}._`;
    }

    return response;
}

/**
 * Format AniList seasonal search results
 */
export function formatAniListSeasonalResponse(data: any): string {
    if (!data || !data.comparisons || data.comparisons.length === 0) {
        return `Aucun anime trouvé sur AniList pour cette saison.`;
    }

    const seasonNames: Record<string, string> = {
        winter: 'Hiver',
        spring: 'Printemps',
        summer: 'Été',
        fall: 'Automne',
    };

    const seasonName = seasonNames[data.season] || data.season;
    const comparisons = data.comparisons;

    let response = `📺 **${seasonName} ${data.year}** - ${data.total} anime(s) trouvés sur AniList\n\n`;

    // Group by status
    const inDb = comparisons.filter((c: any) => c.existsInDb);
    const notInDb = comparisons.filter((c: any) => !c.existsInDb);

    if (inDb.length > 0) {
        response += `✅ **Déjà dans la base (${inDb.length}):**\n`;
        inDb.slice(0, 10).forEach((item: any, index: number) => {
            const title = item.anilistData.title.romaji || item.anilistData.title.english;
            response += `${index + 1}. ${title}`;
            if (item.dbData) {
                response += ` (ID: ${item.dbData.idAnime})`;
            }
            response += `\n`;
        });
        response += `\n`;
    }

    if (notInDb.length > 0) {
        response += `➕ **Pas encore dans la base (${notInDb.length}):**\n`;
        notInDb.slice(0, 10).forEach((item: any, index: number) => {
            const aniData = item.anilistData;
            const title = aniData.title.romaji || aniData.title.english;
            response += `${index + 1}. ${title}`;
            if (aniData.format) {
                response += ` [${aniData.format}]`;
            }
            if (aniData.episodes) {
                response += ` - ${aniData.episodes} ép.`;
            }
            response += `\n`;
        });
    }

    if (comparisons.length > 20) {
        response += `\n_Affichage des 20 premiers résultats sur ${comparisons.length}._`;
    }

    return response;
}

/**
 * Format generic success message
 */
export function formatSuccessMessage(message: string, details?: Record<string, any>): string {
    let response = `✅ ${message}\n`;

    if (details) {
        Object.entries(details).forEach(([key, value]) => {
            response += `   • ${key} : ${value}\n`;
        });
    }

    return response;
}

/**
 * Format generic error message
 */
export function formatErrorMessage(error: string): string {
    return `❌ Une erreur s'est produite\n   Détails : ${error}`;
}

/**
 * Main function to detect and format raw JSON responses
 */
export function ensureUserFriendlyResponse(response: string): string {
    // Check if response looks like raw JSON
    const jsonPattern = /^\s*\{[\s\S]*"success"[\s\S]*\}/;

    if (!jsonPattern.test(response)) {
        // Not JSON, return as-is
        return response;
    }

    try {
        const data: ApiResponse = JSON.parse(response);

        // Route to appropriate formatter based on data structure
        if (data.data?.items && Array.isArray(data.data.items)) {
            // Anime list response
            return formatAnimeListResponse(data);
        } else if (Array.isArray(data.data) && data.data[0]?.saison) {
            // Season list response
            return formatSeasonListResponse(data);
        } else if (data.comparisons && Array.isArray(data.comparisons) && data.season && data.year) {
            // AniList seasonal search response
            return formatAniListSeasonalResponse(data);
        } else if (data.data?.animes) {
            // AniList search response
            return formatAniListResponse(data);
        } else if (data.success && data.message) {
            // Generic success with message
            return formatSuccessMessage(data.message, data.data);
        } else if (!data.success && data.error) {
            // Error response
            return formatErrorMessage(data.error);
        }

        // Fallback for unknown JSON structure
        return `✅ Opération réussie.\n\n_Note : Données reçues mais format non reconnu pour un affichage optimal._`;
    } catch (e) {
        // Not valid JSON or parsing failed, return original
        return response;
    }
}

/**
 * Process streaming text chunks
 * Useful if you need to format during streaming
 */
export function processStreamChunk(chunk: string): string {
    // Check if this chunk completes a JSON object
    if (chunk.includes('"success"') && chunk.includes('"data"')) {
        return ensureUserFriendlyResponse(chunk);
    }
    return chunk;
}