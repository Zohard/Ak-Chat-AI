// app/api/chat/route.ts
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getTools } from '@/lib/tools';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/ratelimit';

const SYSTEM_PROMPT = `You are an AI assistant for managing an anime database in French.

CRITICAL: After using tools, you MUST always provide a formatted response to the user.
NEVER just return tool results without explanation.

When listing animes, format as:
"J'ai trouvé X anime(s) :

1. **[Titre]** ([Année])
   📺 [Format] • [X] épisodes
   📊 Statut : [✅ Publié / 🟡 En attente / ❌ Refusé]
   🆔 ID : [id]

Que voulez-vous faire ?"

Status: 0=🟡 En attente, 1=✅ Publié, 2=❌ Refusé
Seasons: 1=❄️ Hiver, 2=🌸 Printemps, 3=☀️ Été, 4=🍂 Automne

NEVER show raw JSON. Always format in French with emojis.`;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export const maxDuration = 30;

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-Requested-With, Accept, Origin',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const authToken = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!authToken) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const userId = req.headers.get('x-user-id') || 'anonymous';

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
            message: `Quota exceeded: ${rateLimitResult.limit} requests. Try again after ${rateLimitResult.reset.toLocaleString()}.`,
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

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response('Missing API key', { status: 500, headers: corsHeaders });
    }

    const model = google('gemini-2.5-flash');
    const tools = getTools(authToken);

    console.log('[Chat] Processing request with', messages.length, 'messages');

    // OPTION 1: Essayez d'abord toTextStreamResponse
    // C'est la méthode la plus simple et stable
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 10,
    });

    return result.toTextStreamResponse({
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders,
      },
    });

    // OPTION 2: Si toTextStreamResponse ne fonctionne pas, essayez celle-ci
    // Décommentez et commentez OPTION 1
    /*
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 10,
    });

    return result.toAIStreamResponse({
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders,
      },
    });
    */

    // OPTION 3: Si les deux au-dessus échouent, utilisez celle-ci
    // Décommentez et commentez les autres
    /*
    const result = await streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 10,
    });

    // Créez manuellement un ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...corsHeaders,
        ...rateLimitHeaders,
      },
    });
    */

  } catch (error: any) {
    console.error('[Chat Error]:', error);

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