import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');
  const seed = searchParams.get('seed') || '1';

  if (!prompt) {
    return new NextResponse('Missing prompt', { status: 400 });
  }

  // Usamos a API gratuita do pollinations
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=380&nologo=true&seed=${seed}`;

  try {
    const fetchWithTimeoutAndRetry = async (url: string, retries = 2) => {
      for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds max per attempt
        
        try {
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) return res;
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (i === retries - 1) throw err;
        }
      }
      throw new Error('All retries failed');
    };

    const response = await fetchWithTimeoutAndRetry(url);
    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        // Força cache forte no navegador para performance de impressão
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
