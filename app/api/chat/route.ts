// app/api/chat/route.ts
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getTools } from '@/lib/tools';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/ratelimit';
import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

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

    // Stream the AI response with tool support
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      temperature: 0.7,
      onFinish: async ({ text, toolResults }) => {
        // Safety check: Warn if Gemini returned empty or JSON-like text after using tools
        if (toolResults && toolResults.length > 0) {
          const hasContent = text && text.trim().length > 0;
          const looksLikeJson = text && /^\s*\{[\s\S]*"success"/.test(text);

          if (!hasContent) {
            console.warn('[AI Chat] Warning: Gemini used tools but returned empty text response');
          } else if (looksLikeJson) {
            console.warn('[AI Chat] Warning: Gemini returned raw JSON despite instructions:', text.substring(0, 100));
          } else {
            console.log('[AI Chat] ✓ Gemini provided formatted response after tool use');
          }
        }
      },
    });

    return result.toUIMessageStreamResponse({
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

    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorMessage = error.message || 'Internal server error';
    let userFriendlyMessage = 'Une erreur s\'est produite. Veuillez réessayer.';

    // Google AI API quota/rate limit errors
    if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      statusCode = 503;
      userFriendlyMessage = 'Le quota d\'API Gemini est dépassé. Veuillez contacter l\'administrateur.';
    }
    // Google AI API authentication errors
    else if (error.message?.includes('API key') || error.message?.includes('PERMISSION_DENIED')) {
      statusCode = 503;
      userFriendlyMessage = 'Erreur d\'authentification avec l\'API Gemini. Veuillez contacter l\'administrateur.';
    }
    // Token/context length errors
    else if (error.message?.includes('token') || error.message?.includes('context length') || error.message?.includes('too long')) {
      statusCode = 400;
      userFriendlyMessage = 'La conversation est trop longue. Veuillez commencer une nouvelle conversation.';
    }
    // Network/timeout errors
    else if (error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      statusCode = 503;
      userFriendlyMessage = 'Impossible de contacter le service AI. Veuillez réessayer dans quelques instants.';
    }
    // NestJS backend API errors
    else if (error.message?.includes('API Error:')) {
      statusCode = 502;
      userFriendlyMessage = 'Erreur lors de la communication avec l\'API backend. Veuillez réessayer.';
    }

    return new Response(
        JSON.stringify({
          error: 'Error',
          message: userFriendlyMessage,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        }),
        {
          status: statusCode,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
    );
  }
}