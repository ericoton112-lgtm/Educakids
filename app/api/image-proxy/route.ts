import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');
  const seed = searchParams.get('seed') || '1';
  const model = searchParams.get('model') || 'flux';

  if (!prompt) {
    return new NextResponse('Missing prompt', { status: 400 });
  }

  // Usamos a API gratuita do pollinations
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=380&nologo=true&seed=${seed}&model=${model}`;

  try {
    const fetchWithTimeoutAndRetry = async (url: string, retries = 1) => {
      for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds max for the single attempt
        
        // Se o cliente cancelar a requisição HTTP (ex: fechar modal, dar F5), cancelamos o fetch imediatamente
        const onAbort = () => controller.abort();
        request.signal.addEventListener('abort', onAbort);
        
        try {
          const res = await fetch(url, { 
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
          });
          clearTimeout(timeoutId);
          request.signal.removeEventListener('abort', onAbort);
          if (res.ok) return res;
          
          // Log specific HTTP errors from the target
          console.error(`Image proxy attempt ${i + 1} failed with status ${res.status}`);
          if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            // Unrecoverable client error from target (e.g., 400, 403), don't retry unless rate limited
            throw new Error(`Target returned ${res.status}`);
          }
        } catch (err: any) {
          clearTimeout(timeoutId);
          request.signal.removeEventListener('abort', onAbort);
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
