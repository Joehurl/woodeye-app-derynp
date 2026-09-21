import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SYSTEM_PROMPT = `You are WoodEye, an expert wood species identification system with encyclopedic knowledge of all wood types including exotic and rare species. When given an image of wood, you analyze the grain pattern, color, texture, figure, and other visual characteristics to identify the species with high accuracy.

Always respond with a valid JSON object containing these exact fields:
- species (string): Common name of the wood species
- scientificName (string): Latin/scientific name
- confidence (number): Your confidence percentage 0-100
- origin (string): Geographic origin/native region
- grain (string): Detailed grain description
- texture (string): Texture description
- color (string): Color and appearance description
- hardness (number): Janka hardness rating in lbf
- workability (string): How it works with tools
- finishing (string): Finishing characteristics
- bestUses (array of strings): Top 4-6 best uses
- costPerBoardFoot (string): Typical retail price range
- availability (string): Market availability
- sustainability (string): Environmental/sustainability notes
- funFact (string): One interesting fact about this wood

If the image does not show wood, respond with: {"error": "No wood detected in image"}`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
  if (!OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ message: 'OPENROUTER_API_KEY not configured' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  let body: { imageBase64?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  if (!body.imageBase64) {
    return new Response(JSON.stringify({ message: 'imageBase64 is required' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const imageDataUrl = body.imageBase64.startsWith('data:')
    ? body.imageBase64
    : `data:image/jpeg;base64,${body.imageBase64}`;

  try {
    const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://woodeye.app',
        'X-Title': 'WoodEye',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please identify this wood species and provide all the requested details in JSON format.' },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!orResponse.ok) {
      const errBody = await orResponse.text();
      return new Response(JSON.stringify({ message: 'AI service error', detail: errBody }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const orData = await orResponse.json();
    const rawContent: string = orData?.choices?.[0]?.message?.content ?? '{}';

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return new Response(JSON.stringify({ message: 'Failed to parse AI response' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (parsed.error) {
      return new Response(
        JSON.stringify({ message: 'No wood detected in image. Please take a clear photo of a wood surface.' }),
        { status: 422, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Identify error:', err);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
