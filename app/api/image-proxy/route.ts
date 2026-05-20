import { NextResponse } from 'next/server';

// Fila global para serializar requisições à API externa e evitar rate-limit (402/429) por chamadas simultâneas
let globalRequestQueue = Promise.resolve();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');
  const seed = searchParams.get('seed') || '1';

  if (!prompt) {
    return new NextResponse('Missing prompt', { status: 400 });
  }

  // Usamos o modelo 'sana' que é extremamente leve, rápido e grátis
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=380&nologo=true&seed=${seed}&model=sana`;

  try {
    const fetchWithRetryAndQueue = (url: string, retries = 3): Promise<Response> => {
      return new Promise<Response>((resolve, reject) => {
        globalRequestQueue = globalRequestQueue
          .catch(() => {}) // Garante que erros anteriores não quebrem a fila de próximos pedidos
          .then(async () => {
            try {
              let res: Response | null = null;
              
              for (let i = 0; i < retries; i++) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos por tentativa
                
                try {
                  if (i > 0) {
                    // Backoff progressivo antes de tentar novamente
                    const backoff = i * 2000;
                    console.log(`[Proxy] Waiting ${backoff}ms before retry for: ${prompt}`);
                    await new Promise(r => setTimeout(r, backoff));
                  } else {
                    // Pequeno espaçamento de 1 segundo entre requisições na fila
                    await new Promise(r => setTimeout(r, 1000));
                  }

                  console.log(`[Proxy] Attempt ${i + 1}/${retries} for URL: ${url}`);
                  const fetchRes = await fetch(url, { 
                    signal: controller.signal,
                    cache: 'no-store'
                  });
                  clearTimeout(timeoutId);
                  
                  if (fetchRes.ok) {
                    console.log(`[Proxy] Attempt ${i + 1} succeeded`);
                    res = fetchRes;
                    break;
                  } else {
                    console.warn(`[Proxy] Attempt ${i + 1} returned status ${fetchRes.status}`);
                  }
                } catch (err: any) {
                  clearTimeout(timeoutId);
                  console.error(`[Proxy] Attempt ${i + 1} failed:`, err.message || err);
                }
              }

              if (res) {
                resolve(res);
              } else {
                reject(new Error(`Failed to fetch image after ${retries} attempts`));
              }
            } catch (err) {
              reject(err);
            }
          });
      });
    };

    const response = await fetchWithRetryAndQueue(url);
    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        // Cache forte no navegador para que a impressão reutilize as imagens sem fazer novos requests
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
