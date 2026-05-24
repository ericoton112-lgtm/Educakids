'use client';

import React, { createContext, useContext, useState, useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Activity {
  title: string;
  ageRange: string;
  duration: string;
  type: string;
  description: string;
  materials: string[];
  steps: { title: string; content: string }[];
  studentQuestions?: string[];
  illustrationPrompts?: string[];
}

interface PrintContextType {
  isPrinting: boolean;
  printProgress: string;
  printError: string | null;
  startPrintJob: (activity: Activity) => Promise<void>;
  cancelPrintJob: () => void;
}

const PrintContext = createContext<PrintContextType | undefined>(undefined);

export function usePrint() {
  const context = useContext(PrintContext);
  if (!context) {
    throw new Error('usePrint must be used within a PrintProvider');
  }
  return context;
}

export function PrintProvider({ children }: { children: React.ReactNode }) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState('');
  const [printError, setPrintError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const printDivRef = useRef<HTMLDivElement | null>(null);

  const cancelPrintJob = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (printDivRef.current && document.body.contains(printDivRef.current)) {
      document.body.removeChild(printDivRef.current);
    }
    printDivRef.current = null;
    setIsPrinting(false);
    setPrintProgress('');
    setPrintError(null);
  };

  const startPrintJob = async (activity: Activity) => {
    // Remove qualquer contêiner de impressão anterior existente
    try {
      const existing = document.body.querySelector('.print-only');
      if (existing && document.body.contains(existing)) {
        document.body.removeChild(existing);
      }
    } catch (e) { /* ignore */ }

    setIsPrinting(true);
    setPrintProgress('Iniciando geração...');
    setPrintError(null);
    abortControllerRef.current = new AbortController();

    try {
      const isDrawingQ = (q: string) => /desenhe|pinte|colorir|colore|ilustre/i.test(q);

      const getPromptText = (question: string, index: number) => {
        if (activity.illustrationPrompts && activity.illustrationPrompts[index]) {
          return `simple cute black and white coloring page for children, ${activity.illustrationPrompts[index]}, thick bold outlines, no shading, cartoon style, printable worksheet`;
        }

        const cleanSubject = question
          .replace(/^\d+[\.\)\s]*/,'')
          .replace(/desenhe|pinte|colorir|colore|ilustre|no espaço abaixo|abaixo[:\s]*/gi, '')
          .replace(/[:\/\?\\#]/g, ' ')
          .replace(/\s+/g,' ').trim().substring(0, 60);

        const cleanTitle = activity.title
          .replace(/[:\/\?\\#]/g, ' ')
          .replace(/\s+/g,' ').trim();

        return `black and white coloring page, simple drawing of ${cleanSubject}, ${cleanTitle}, cartoon style, thick outlines, isolated on white background`;
      };

      const getProxyUrl = (prompt: string, seed: number, model: string = 'flux') => {
        return `/api/image-proxy?prompt=${encodeURIComponent(prompt)}&seed=${seed}&model=${model}`;
      };

      const questions = activity.studentQuestions || [];
      const validImageUrls = new Map<string, string>();
      const drawingQuestions = questions.map((q, i) => ({ q, index: i })).filter(item => isDrawingQ(item.q));

      if (drawingQuestions.length > 0) {
        for (let k = 0; k < drawingQuestions.length; k++) {
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Cancelado pelo usuário');
          }

          const item = drawingQuestions[k];
          const prompt = getPromptText(item.q, item.index);
          const url = getProxyUrl(prompt, item.index + 1, 'flux');

          let success = false;
          let attempts = 3;

          while (attempts > 0 && !success) {
            if (abortControllerRef.current?.signal.aborted) {
              throw new Error('Cancelado pelo usuário');
            }

            setPrintProgress(`Gerando imagem ${k + 1} de ${drawingQuestions.length}...${attempts < 3 ? ` (Tentativa ${4 - attempts}/3)` : ''}`);

            success = await new Promise<boolean>(async (resolve) => {
              try {
                const res = await fetch(url, { signal: abortControllerRef.current?.signal });
                if (res.ok) {
                  await res.blob(); // Prefetch image bytes to cache
                  resolve(true);
                } else {
                  resolve(false);
                }
              } catch (err) {
                resolve(false);
              }
            });

            if (!success) {
              attempts--;
              if (attempts > 0 && !abortControllerRef.current?.signal.aborted) {
                setPrintProgress(`Servidor ocupado. Reabastecendo em 3s...`);
                await new Promise((resolve) => setTimeout(resolve, 3000));
              }
            }
          }

          if (success) {
            validImageUrls.set(item.q, url);
          } else {
            throw new Error("O servidor de ilustrações da IA está muito congestionado. Por favor, aguarde alguns segundos e clique em Imprimir novamente.");
          }

          if (k < drawingQuestions.length - 1 && !abortControllerRef.current?.signal.aborted) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Cancelado pelo usuário');
      }

      setPrintProgress('Formatando folha para impressão...');

      const fixQuestionText = (q: string, idx: number) => {
        const hasImg = !!activity.illustrationPrompts?.[idx];
        if (hasImg && /desenhe/i.test(q)) {
          return q.replace(/^(\d+[\.\)\s]*)(Desenhe|desenhe)/, '$1Pinte');
        }
        return q;
      };

      const questionsHtml = questions.map((q, i) => {
        const isDrawing = isDrawingQ(q);
        const imgUrl = validImageUrls.get(q);
        const displayText = fixQuestionText(q, i);
        
        return `
          <div class="question-block">
            <div class="question-text">${displayText}</div>
            ${isDrawing
              ? (imgUrl 
                  ? `<img src="${imgUrl}" class="drawing-img" alt="Ilustracao da atividade" />`
                  : `<div class="drawing-box"></div>`)
              : `<div class="answer-line"></div><div class="answer-line"></div>`
            }
          </div>`;
      }).join('');

      // Cria o contêiner de impressão no DOM principal
      const printDiv = document.createElement('div');
      printDiv.className = 'print-only';
      printDiv.innerHTML = `
        <div class="student-header">
          <div class="student-row">
            <span style="flex:1;"><strong>NOME:</strong> _______________________________________________</span>
          </div>
          <div class="student-row">
            <span style="width:50%;"><strong>TURMA:</strong> _________________</span>
            <span style="width:50%;"><strong>DATA:</strong> ____ / ____ / ________</span>
          </div>
        </div>
        <div class="header-title">
          <h1>${activity.title}</h1>
          <div class="meta">Atividade ${activity.type} de Artes e Descoberta</div>
        </div>
        <div class="questions">${questionsHtml}</div>
        <div class="footer">Folha de Atividade · Gerada por IA · Educakids</div>
      `;
      printDivRef.current = printDiv;
      document.body.appendChild(printDiv);

      const imgs = Array.from(printDiv.querySelectorAll('.drawing-img')) as HTMLImageElement[];

      const cleanup = () => {
        // Redefine apenas o estado do React para habilitar o botão novamente
        // NÃO removemos o contêiner DOM aqui para evitar o bug de página em branco no celular
        setIsPrinting(false);
        setPrintProgress('');
        window.removeEventListener('afterprint', cleanup);
      };

      const doPrint = () => {
        setTimeout(() => {
          if (abortControllerRef.current?.signal.aborted) return;
          window.addEventListener('afterprint', cleanup);
          window.print();

          // Redefine o estado após 2 segundos caso o afterprint não seja disparado
          setTimeout(() => {
            setIsPrinting(false);
            setPrintProgress('');
          }, 2000);

          // Remove o elemento do DOM de forma segura após 30 segundos, tempo suficiente para a renderização do PDF
          setTimeout(() => {
            if (printDiv && document.body.contains(printDiv)) {
              document.body.removeChild(printDiv);
            }
            if (printDivRef.current === printDiv) {
              printDivRef.current = null;
            }
          }, 30000);
        }, 500);
      };

      if (imgs.length === 0) {
        doPrint();
      } else {
        let done = 0;
        const check = () => {
          done++;
          if (done >= imgs.length) {
            doPrint();
          }
        };
        imgs.forEach((img) => {
          if (img.complete) {
            check();
          } else {
            img.onload = check;
            img.onerror = check;
          }
        });
        setTimeout(() => {
          if (done < imgs.length) {
            doPrint();
          }
        }, 15000);
      }
    } catch (err: any) {
      if (err.message !== 'Cancelado pelo usuário') {
        setPrintError(err.message || 'Erro ao gerar PDF');
      }
      if (printDivRef.current && document.body.contains(printDivRef.current)) {
        document.body.removeChild(printDivRef.current);
      }
      printDivRef.current = null;
      setIsPrinting(false);
      setPrintProgress('');
    }
  };

  return (
    <PrintContext.Provider value={{ isPrinting, printProgress, printError, startPrintJob, cancelPrintJob }}>
      {children}
      
      {/* Floating Global Progress Badge */}
      <AnimatePresence>
        {isPrinting && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-5 md:right-10 z-[9999] bg-surface border border-outline-variant/50 shadow-2xl p-4 rounded-2xl flex items-center gap-3.5 max-w-xs animate-in slide-in-from-bottom-5"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Printer size={20} className="animate-pulse" />
            </div>
            
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs font-bold text-on-surface">Gerando PDF...</p>
              <p className="text-[10px] text-on-surface-variant truncate font-medium mt-0.5">{printProgress || 'Processando...'}</p>
            </div>

            <button
              onClick={cancelPrintJob}
              className="text-on-surface-variant hover:text-error p-1 rounded-lg hover:bg-error/10 transition-colors shrink-0"
              title="Cancelar geração"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Global Error Toast */}
      <AnimatePresence>
        {printError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-5 md:right-10 z-[9999] bg-error-container border border-error/20 text-on-error-container shadow-2xl p-4 rounded-2xl flex items-center gap-3 max-w-xs"
          >
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs font-bold">Falha na Impressão</p>
              <p className="text-[10px] opacity-90 mt-0.5 line-clamp-2">{printError}</p>
            </div>
            <button
              onClick={() => setPrintError(null)}
              className="text-on-error-container hover:bg-on-error-container/10 p-1 rounded-lg transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PrintContext.Provider>
  );
}
