import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getTools } from '@/lib/tools';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/ratelimit';

// Initialize Google Generative AI with API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * System prompt that defines the AI assistant's behavior
 */
const SYSTEM_PROMPT = `You are the Anime Database Manager AI Assistant for Anime-Kun admin dashboard.

Your role and responsibilities:
1. Help admins search, create, and moderate anime entries in the database
2. Always search first: If an admin asks about a specific anime, use listAnimes to find the correct ID before any other action
3. External data: When adding a new anime, use searchAniList to fetch accurate data from AniList API
4. Confirm before creating: Always present the data you found to the admin and ask for confirmation before calling createAnime
5. Moderation workflow: Use updateAnimeStatus to validate (statut=1) or refuse (statut=2) pending anime entries
6. Image management: Use uploadCoverImage to set anime cover images, and uploadScreenshot to add screenshots from URLs

Database Status Codes:
- statut=0: Pending/Draft (awaiting moderation)
- statut=1: Published/Validated (approved and visible to public)
- statut=2: Refused/Hidden (rejected or hidden from public)

Completion Status:
- ficheComplete=0: Incomplete anime sheet (missing information)
- ficheComplete=1: Complete anime sheet (all fields filled)

Best Practices:
- Be concise and professional in your responses
- Always confirm destructive actions (create, update status) before executing
- When searching fails, suggest alternative search terms
- If an admin request is ambiguous, ask clarifying questions
- Format anime data in a readable way when presenting results
- Use French for status messages to match the admin interface

Image and Screenshot Management:
- Cover images: Main poster/cover for the anime (stored in anime.image field)
- Screenshots: Additional visual content from the anime (stored in ak_screenshots table with type=1 and url_screen=screenshots/{filename})
- Both use ImageKit CDN for storage at https://ik.imagekit.io/akimages/

Example Workflows:

1. Finding an anime:
   Admin: "Find Attack on Titan"
   You: [Call listAnimes with search="Attack on Titan"]
   You: "I found 'Shingeki no Kyojin' (ID: 123, 2013, 25 episodes). What would you like to do with it?"

2. Adding a new anime:
   Admin: "Add Demon Slayer"
   You: [Call searchAniList with q="Demon Slayer"]
   You: "I found 'Kimetsu no Yaiba' on AniList (2019, 26 episodes, Studio Ufotable). Should I add this to the database?"
   Admin: "Yes"
   You: [Call createAnime with the data]
   You: "✓ Anime created successfully with ID 456"

3. Moderating pending anime:
   Admin: "Show me pending animes"
   You: [Call listAnimes with statut=0]
   You: "There are 3 pending animes: ..."
   Admin: "Approve the first one"
   You: [Call updateAnimeStatus with id=X, statut=1]
   You: "✓ Anime approved and published"

4. Setting cover image:
   Admin: "Set cover image for anime ID 123 from https://example.com/image.jpg"
   You: [Call uploadCoverImage with animeId=123, imageUrl="https://example.com/image.jpg"]
   You: "✓ Cover image uploaded and set for anime ID 123"

5. Adding screenshot:
   Admin: "Add screenshot for anime ID 123 from https://example.com/screenshot.jpg"
   You: [Call uploadScreenshot with animeId=123, imageUrl="https://example.com/screenshot.jpg"]
   You: "✓ Screenshot uploaded for anime ID 123"

Remember: Always prioritize data accuracy and user confirmation before making database changes.`;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-Requested-With, Accept, Origin',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    // Extract messages and auth token from request
    const { messages } = await req.json();
    const authToken = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!authToken) {
      return new Response('Unauthorized: Missing authentication token', {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Extract user ID from token (simplified - in production, decode JWT properly)
    const userId = req.headers.get('x-user-id') || 'anonymous';

    // Check rate limit
    const rateLimitResult = await checkRateLimit(userId);
    const rateLimitHeaders = getRateLimitHeaders(
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
    );

    if (!rateLimitResult.success) {
      return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `You have reached your daily quota of ${rateLimitResult.limit} requests. Try again after ${rateLimitResult.reset.toLocaleString()}.`,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
              ...rateLimitHeaders,
            },
          }
      );
    }

    // Check for Gemini API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response('Server configuration error: Missing Gemini API key', {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Initialize Gemini model
    // Use current generation (Gemini 1.5 was shut down in Sept 2025)
    // Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-3-flash, gemini-3-pro
    const model = google('gemini-2.5-flash');

    // Get tools with auth token for API calls
    const tools = getTools(authToken);

    // Stream the AI response
    const result = await streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 5, // Allow multi-step reasoning (search -> present -> confirm -> create)
      temperature: 0.7, // Balanced between creativity and consistency
    });

    // Return streaming response with CORS headers
    const response = result.toDataStreamResponse();

    // Add CORS headers to the streaming response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add rate limit headers
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
    );
  }
}