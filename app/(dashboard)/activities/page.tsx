'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Palette, BookOpen, Brain, Footprints, Bolt, Check, Layers, Clock, AlertCircle, Printer, Trash2, History } from 'lucide-react';

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

interface HistoryItem {
  id: string;
  timestamp: string;
  formData: {
    ageGroup: string;
    theme: string;
    difficulty: string;
    activityType: string[];
  };
  activity: Activity;
}

export default function ActivitiesPage() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    ageGroup: 'Crianças Pequenas (4 anos a 5 anos e 11 meses)',
    theme: '',
    difficulty: 'Média',
    activityType: ['Pintura'],
  });
  const [error, setError] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const historyJson = localStorage.getItem('educakids_activity_history');
      if (historyJson) {
        try {
          return JSON.parse(historyJson);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setActivity(null);
    try {
      const previousTitlesAndThemes = historyList.map(item => `${item.activity.title} (${item.formData.theme})`);

      const res = await fetch('/api/genai/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          previousTitlesAndThemes
        }),
      });
      if (!res.ok) {
        throw new Error('Erro na requisição');
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setActivity(data);

      // Save to local storage history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString('pt-BR'),
        formData: { ...formData },
        activity: data
      };
      const updatedHistory = [newItem, ...historyList].slice(0, 20); // Keep up to 20 items
      setHistoryList(updatedHistory);
      localStorage.setItem('educakids_activity_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      console.error(err);
      setError("Ops! Não foi possível gerar a atividade agora. Verifique sua conexão ou tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid loading the activity when clicking delete
    const updated = historyList.filter(item => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem('educakids_activity_history', JSON.stringify(updated));
  };

  const activityTypes = [
    { id: 'Pintura', label: 'Pintura', icon: Palette },
    { id: 'Alfabetização', label: 'Alfabetização', icon: BookOpen },
    { id: 'Cognitiva', label: 'Cognitiva', icon: Brain },
    { id: 'Motora', label: 'Motora', icon: Footprints },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <section>
        <h1 className="font-sans font-bold text-3xl text-on-surface">Gerador de Atividades</h1>
        <p className="text-on-surface-variant mt-1">Crie atividades lúdicas estruturadas e alinhadas aos objetivos da BNCC em segundos.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form and preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 space-y-6">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Sparkles size={20} className="fill-current" />
            <h2 className="font-sans font-bold text-xl text-on-surface">Configuração</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface-variant ml-2">Faixa Etária</label>
              <select 
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                className="w-full h-12 px-4 rounded-full border-none bg-surface-container-highest text-on-surface focus:ring-2 focus:ring-primary appearance-none text-sm font-medium"
              >
                <option>Bebês (0-1 ano e 6 meses)</option>
                <option>Crianças Bem Pequenas (1 ano e 7 meses a 3 anos e 11 meses)</option>
                <option>Crianças Pequenas (4 anos a 5 anos e 11 meses)</option>
                <option>Crianças Maiores (6 anos a 8 anos)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface-variant ml-2">Tema ou Tópico</label>
              <input 
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="ex: Pássaros do Jardim, Exploração Espacial..."
                className="w-full h-12 px-4 rounded-full border-none bg-surface-container-highest text-on-surface focus:ring-2 focus:ring-primary placeholder:text-outline text-sm"
              />
            </div>


            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface-variant ml-2">Dificuldade Cognitiva</label>
              <div className="grid grid-cols-3 bg-surface-container-highest p-1 rounded-full">
                {['Baixa', 'Média', 'Alta'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFormData({ ...formData, difficulty: lvl })}
                    className={`py-2 px-4 rounded-full text-xs font-bold transition-all ${
                      formData.difficulty === lvl 
                        ? 'bg-secondary text-on-secondary shadow-md' 
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary-container/20 p-6 rounded-3xl border border-primary-container/40">
          <h3 className="text-sm font-bold text-on-primary-container mb-4">Tipo de Atividade</h3>
          <div className="grid grid-cols-2 gap-3">
            {activityTypes.map((type) => {
              const isSelected = formData.activityType.includes(type.id);
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      activityType: isSelected
                        ? prev.activityType.filter(id => id !== type.id)
                        : [...prev.activityType, type.id]
                    }));
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 group ${
                    isSelected
                      ? 'bg-surface-container-lowest border-primary shadow-sm'
                      : 'bg-surface-container-lowest/50 border-outline-variant hover:border-primary'
                  }`}
                >
                  <type.icon size={24} className={isSelected ? 'text-primary' : 'text-on-surface-variant'} />
                  <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-5 bg-primary text-on-primary rounded-full font-sans font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-70 transition-all text-lg"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Bolt size={24} className="fill-current" />
          )}
          {loading ? 'Processando...' : 'Gerar com IA'}
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error-container text-on-error-container p-4 rounded-2xl border border-error/20 flex items-start gap-3 mt-6"
          >
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="font-medium text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activity && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-8 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-4 right-4 bg-tertiary-container text-on-tertiary-container px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-tertiary/10">
              <Check size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Atividade Pronta</span>
            </div>

            <div className="flex flex-col gap-8">
              <header>
                <h3 className="font-sans font-bold text-2xl text-on-surface leading-tight">{activity.title}</h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-4 py-1 bg-secondary-container/30 text-secondary text-[10px] font-black uppercase rounded-full flex items-center gap-1.5">
                    <Clock size={12} /> {activity.duration}
                  </span>
                  <span className="px-4 py-1 bg-primary-container/30 text-primary text-[10px] font-black uppercase rounded-full flex items-center gap-1.5">
                    <Layers size={12} /> {activity.type}
                  </span>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <AlertCircle size={14} /> Materiais Necessários
                  </h4>
                  <ul className="space-y-2">
                    {activity.materials.map((m, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Check size={12} />
                        </div>
                        <span className="text-sm font-medium">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-[3/4] md:h-80 border border-outline-variant group bg-white relative flex flex-col justify-between shadow-inner p-5 transition-colors">
                  
                  {/* Preview da Folha de Atividade */}
                  <div className="flex flex-col h-full opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="border-b border-outline-variant/50 pb-2 mb-3">
                      <div className="flex justify-between text-[8px] text-on-surface-variant mb-2">
                         <span>Nome: _______________________</span>
                         <span>Data: ___/___/____</span>
                      </div>
                      <h4 className="font-serif font-bold text-xs text-on-surface line-clamp-1">{activity.title}</h4>
                    </div>
                    
                    <div className="flex-1 overflow-hidden relative">
                      <p className="text-[9px] font-bold text-on-surface mb-2">Questões da Folha do Aluno:</p>
                      <div className="space-y-3">
                        {(activity.studentQuestions || []).slice(0, 3).map((q, i) => {
                          const isDraw = /desenhe|pinte|colorir/i.test(q);
                          return (
                           <div key={i}>
                             <p className="text-[9px] text-on-surface-variant font-medium line-clamp-1">{q}</p>
                             {isDraw ? (
                               <div className="border border-dashed border-primary/30 h-6 w-full rounded flex items-center justify-center bg-primary/5">
                                 <span className="text-[7px] text-primary font-bold">🎨 Ilustração IA inclusa</span>
                               </div>
                             ) : (
                               <>
                                 <div className="border-b border-dashed border-outline-variant/50 h-3 w-full"></div>
                                 <div className="border-b border-dashed border-outline-variant/50 h-3 w-full"></div>
                               </>
                             )}
                           </div>
                          );
                        })}
                        {activity.studentQuestions && activity.studentQuestions.length > 3 && (
                           <p className="text-[8px] text-on-surface-variant text-center pt-2 italic">... +{activity.studentQuestions.length - 3} questões</p>
                        )}
                      </div>
                      {/* Fade para caso o texto passe do tamanho */}
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
                    </div>
                    
                    <div className="mt-auto pt-2 border-t border-outline-variant/50 flex justify-between items-center text-[8px] text-on-surface-variant uppercase tracking-widest">
                      <span>Folha do Aluno</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-surface-container-lowest/20 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <button 
                    disabled={isPrinting}
                    onClick={async () => {
                      setIsPrinting(true);

                      const isDrawingQ = (q: string) => /desenhe|pinte|colorir|colore|ilustre/i.test(q);

                      const getPromptText = (question: string, index: number) => {
                        if (activity?.illustrationPrompts && activity.illustrationPrompts[index]) {
                          return `simple cute black and white coloring page for children, ${activity.illustrationPrompts[index]}, thick bold outlines, no shading, cartoon style, printable worksheet`;
                        }

                        const cleanSubject = question
                          .replace(/^\d+[\.\)\s]*/,'')
                          .replace(/desenhe|pinte|colorir|colore|ilustre|no espaço abaixo|abaixo[:\s]*/gi, '')
                          .replace(/[:\/\?\\#]/g, ' ')
                          .replace(/\s+/g,' ').trim().substring(0, 60);

                        const cleanTitle = activity!.title
                          .replace(/[:\/\?\\#]/g, ' ')
                          .replace(/\s+/g,' ').trim();

                        return `black and white coloring page, simple drawing of ${cleanSubject}, ${cleanTitle}, cartoon style, thick outlines, isolated on white background`;
                      };

                      const getProxyUrl = (prompt: string, seed: number, model: string = 'flux') => {
                        return `/api/image-proxy?prompt=${encodeURIComponent(prompt)}&seed=${seed}&model=${model}`;
                      };

                      const questions = activity!.studentQuestions || [];

                      // Track valid images to prevent broken icons in the final PDF
                      const validImageUrls = new Map<string, string>();
                      
                      const drawingQuestions = questions.map((q, i) => ({ q, index: i })).filter(item => isDrawingQ(item.q));
                      if (drawingQuestions.length > 0) {
                        setPrintProgress(`Iniciando geração (0/${drawingQuestions.length})...`);
                        setError(null); // Limpa erros anteriores
                        for (let k = 0; k < drawingQuestions.length; k++) {
                          const item = drawingQuestions[k];
                          const prompt = getPromptText(item.q, item.index);
                          const url = getProxyUrl(prompt, item.index + 1, 'flux');
                          
                          let success = false;
                          let attempts = 3;
                          
                          while (attempts > 0 && !success) {
                            setPrintProgress(`Gerando imagem ${k + 1} de ${drawingQuestions.length}...${attempts < 3 ? ` (Tentativa ${4 - attempts}/3)` : ''}`);
                            
                            success = await new Promise<boolean>(async (resolve) => {
                              try {
                                const controller = new AbortController();
                                const timeoutId = setTimeout(() => controller.abort(), 95000); // 95s timeout
                                
                                const res = await fetch(url, { signal: controller.signal });
                                clearTimeout(timeoutId);
                                
                                if (res.ok) {
                                  await res.blob(); // Baixa os bytes para o cache do navegador
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
                              if (attempts > 0) {
                                setPrintProgress(`Servidor ocupado. Reabastecendo em 3s...`);
                                await new Promise((resolve) => setTimeout(resolve, 3000));
                              }
                            }
                          }

                          if (success) {
                            validImageUrls.set(item.q, url);
                          } else {
                            // Se falhar após todas as tentativas, cancelamos a impressão para não gerar folha em branco
                            setError("O servidor de ilustrações da IA está muito congestionado. Por favor, aguarde alguns segundos e clique em Imprimir novamente.");
                            setIsPrinting(false);
                            return;
                          }

                          // Aguarda 2 segundos antes de iniciar a próxima requisição para liberar o túnel de IP
                          if (k < drawingQuestions.length - 1) {
                            await new Promise((resolve) => setTimeout(resolve, 2000));
                          }
                        }
                      }
                      setPrintProgress('Formatando folha para impressão...');

                      const questionsHtml = questions.map((q, i) => {
                        const isDrawing = isDrawingQ(q);
                        const imgUrl = validImageUrls.get(q);
                        
                        return `
                          <div class="question-block">
                            <div class="question-text">${q}</div>
                            ${isDrawing
                              ? (imgUrl 
                                  ? `<img src="${imgUrl}" class="drawing-img" alt="Ilustracao da atividade" />`
                                  : `<div class="drawing-box"></div>`)
                              : `<div class="answer-line"></div><div class="answer-line"></div>`
                            }
                          </div>`;
                      }).join('');

                      // Create a hidden iframe on the same origin (prevents CORS and mixed content blocks in about:blank)
                      const iframe = document.createElement('iframe');
                      iframe.style.position = 'fixed';
                      iframe.style.width = '0';
                      iframe.style.height = '0';
                      iframe.style.border = 'none';
                      iframe.style.zIndex = '-9999';
                      document.body.appendChild(iframe);

                      // Message handler for clean up
                      const handleMessage = (event: MessageEvent) => {
                        if (event.data === 'print-done') {
                          setIsPrinting(false);
                          if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                          }
                          window.removeEventListener('message', handleMessage);
                        }
                      };
                      window.addEventListener('message', handleMessage);

                      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
                      if (iframeDoc) {
                        iframeDoc.write(`
                          <html>
                            <head>
                              <title>Atividade - ${activity!.title}</title>
                              <style>
                                @page { margin: 2cm; }
                                body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                                .student-header { margin-bottom: 30px; border: 1px solid #ccc; padding: 18px 20px; border-radius: 8px; }
                                .student-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
                                .student-row:last-child { margin-bottom: 0; }
                                .header-title { text-align: center; border-bottom: 2px solid #222; padding-bottom: 15px; margin-bottom: 30px; }
                                .header-title h1 { font-size: 22px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px; }
                                .meta { font-size: 11px; color: #e67e22; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
                                .question-block { margin-bottom: 35px; page-break-inside: avoid; }
                                .question-text { font-size: 15px; font-weight: bold; margin-bottom: 12px; color: #222; }
                                .answer-line { border-bottom: 1px dashed #999; height: 35px; margin-bottom: 8px; }
                                .drawing-img { max-width: 100%; height: auto; border: 2px dashed #ccc; border-radius: 10px; padding: 8px; box-sizing: border-box; display: block; margin: 8px auto 0; }
                                .drawing-box { border: 2px dashed #ccc; height: 200px; border-radius: 10px; margin-top: 8px; }
                                .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; text-transform: uppercase; letter-spacing: 2px; }
                              </style>
                            </head>
                            <body>
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
                                <h1>${activity!.title}</h1>
                                <div class="meta">Atividade ${activity!.type} de Artes e Descoberta</div>
                              </div>
                              <div class="questions">${questionsHtml}</div>
                              <div class="footer">Folha de Atividade · Gerada por IA · Educakids</div>
                              <script>
                                var imgs = Array.from(document.querySelectorAll('.drawing-img'));
                                var doPrint = function() {
                                  setTimeout(function() {
                                    window.print();
                                    window.parent.postMessage('print-done', '*');
                                  }, 500);
                                };
                                if (imgs.length === 0) {
                                  doPrint();
                                } else {
                                  var done = 0;
                                  var check = function() { if (++done >= imgs.length) doPrint(); };
                                  imgs.forEach(function(img) {
                                    if (img.complete) { check(); }
                                    else { img.onload = check; img.onerror = check; }
                                  });
                                  // Fallback limit: 15s (since already cached)
                                  setTimeout(doPrint, 15000);
                                }
                              </script>
                            </body>
                          </html>
                        `);
                        iframeDoc.close();
                      }
                    }}
                    className={`absolute bottom-5 left-1/2 -translate-x-1/2 ${isPrinting ? 'bg-surface-container-high text-on-surface' : 'bg-primary text-on-primary'} px-5 py-3 rounded-full font-bold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all z-20 ${isPrinting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} translate-y-4 group-hover:translate-y-0 w-max`}
                  >
                    {isPrinting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
                        {printProgress || 'Carregando Ilustrações...'}
                      </>
                    ) : (
                      <>
                        <Printer size={16} /> Imprimir com Ilustrações
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Instruções Passo a Passo</h4>
                <div className="space-y-4">
                  {activity.steps.map((step, i) => {
                    const clean = (s: string) => (s ?? '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
                    return (
                    <div key={i} className="flex gap-4 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-all group">
                      <span className="font-sans font-black text-2xl text-secondary opacity-30 group-hover:opacity-100 transition-opacity">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{clean(step.title)}</p>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{clean(step.content)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
        </div>

        {/* Right Column: History List */}
        <div className="space-y-6 lg:col-span-1">
          <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 space-y-6">
            <div className="flex items-center gap-2 mb-2 text-secondary">
              <History size={20} />
              <h2 className="font-sans font-bold text-xl text-on-surface">Histórico</h2>
            </div>
            
            {historyList.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant/60 space-y-2">
                <p className="text-sm font-medium">Nenhuma atividade gerada ainda.</p>
                <p className="text-xs opacity-75">Suas atividades salvas aparecerão aqui para acesso rápido.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActivity(item.activity);
                      setFormData(item.formData);
                    }}
                    className={`p-4 rounded-2xl bg-surface-container-lowest border cursor-pointer transition-all hover:scale-[1.02] flex justify-between items-start gap-3 group ${
                      activity?.title === item.activity.title 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-outline-variant/30 hover:border-primary/50'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                        {item.activity.title}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                        {item.formData.theme || 'Sem Tema'}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] opacity-75">
                        <span className="bg-primary-container/30 px-2 py-0.5 rounded text-primary font-bold">
                          {item.formData.difficulty}
                        </span>
                        <span className="font-semibold text-outline">
                          {item.timestamp.split(',')[0]}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="text-on-surface-variant hover:text-error p-1 rounded-lg hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Excluir do histórico"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
