'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Palette, BookOpen, Brain, Footprints, Bolt, Check, Layers, Clock, AlertCircle, Printer, Trash2, History } from 'lucide-react';
import { usePrint } from '../../context/PrintContext';

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

const loadingPhases = [
  { title: "Despertando a imaginação...", description: "Conectando ao núcleo criativo da IA" },
  { title: "Mapeando a BNCC...", description: "Garantindo alinhamento com as diretrizes pedagógicas" },
  { title: "Selecionando materiais...", description: "Escolhendo itens simples, seguros e acessíveis" },
  { title: "Escrevendo o passo a passo...", description: "Criando instruções lúdicas claras e engajadoras" },
  { title: "Elaborando folha do aluno...", description: "Esboçando questões interativas e espaços de desenho" },
  { title: "Polindo e refinando...", description: "Finalizando formatação e adequação de faixa etária" }
];

export default function ActivitiesPage() {
  const { isPrinting, printProgress, startPrintJob } = usePrint();
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
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
    setLoadingProgress(0);
    setCurrentPhaseIndex(0);
    setError(null);
    setActivity(null);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 98) return 98;
        const step = Math.floor(Math.random() * 2) + 1;
        const nextProgress = Math.min(prev + step, 98);

        if (nextProgress < 15) setCurrentPhaseIndex(0);
        else if (nextProgress < 35) setCurrentPhaseIndex(1);
        else if (nextProgress < 55) setCurrentPhaseIndex(2);
        else if (nextProgress < 72) setCurrentPhaseIndex(3);
        else if (nextProgress < 88) setCurrentPhaseIndex(4);
        else setCurrentPhaseIndex(5);

        return nextProgress;
      });
    }, 150);

    try {
      const previousTitlesAndThemes = historyList.map(item => `${item.activity.title} (${item.formData.theme})`);

      // Read available supplies from localStorage to inject into the AI prompt
      let availableMaterials = '';
      try {
        const stored = localStorage.getItem('educakids_supplies');
        if (stored) {
          const supplies = JSON.parse(stored);
          const okItems = supplies.flatMap((cat: any) =>
            cat.items.filter((i: any) => i.status === 'ok').map((i: any) => i.name)
          );
          if (okItems.length > 0) {
            availableMaterials = okItems.join(', ');
          }
        }
      } catch { /* ignore */ }

      const res = await fetch('/api/genai/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          previousTitlesAndThemes,
          availableMaterials: availableMaterials || undefined
        }),
      });
      if (!res.ok) {
        throw new Error('Erro na requisição');
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Finalize progress smoothly before showing the result
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setCurrentPhaseIndex(5);
      await new Promise(resolve => setTimeout(resolve, 800));

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
      clearInterval(progressInterval);
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
          className={`w-full py-5 text-on-primary rounded-full font-sans font-bold flex items-center justify-center gap-3 shadow-lg transition-all text-lg relative overflow-hidden ${
            loading 
              ? 'bg-gradient-to-r from-primary via-secondary to-primary shadow-secondary/15' 
              : 'bg-primary shadow-primary/20 hover:bg-primary/95'
          }`}
        >
          {loading && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
            />
          )}
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          ) : (
            <Bolt size={24} className="fill-current" />
          )}
          <span>{loading ? `Processando (${loadingProgress}%)` : 'Gerar com IA'}</span>
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
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-container-low rounded-3xl border border-outline-variant/30 p-8 space-y-8 shadow-xl relative overflow-hidden"
          >
            {/* Top Badge */}
            <div className="flex justify-center">
              <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">Criatividade Conectada</span>
              </div>
            </div>

            {/* Main title */}
            <div className="text-center space-y-2">
              <h3 className="font-sans font-bold text-2xl text-on-surface">Educakids AI está criando...</h3>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                Estamos preparando uma atividade estruturada com objetivos da BNCC alinhados e folha de exercícios personalizada.
              </p>
            </div>

            {/* Glowing Orb Centerpiece */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-6">
              {/* Background Glow Blobs */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 0.95, 1.15, 1],
                  rotate: [0, 90, 180, 270, 360],
                  borderRadius: ["40% 60% 60% 40% / 40% 50% 50% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 60% 40% / 40% 50% 50% 60%"]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 blur-2xl"
              />
              <motion.div
                animate={{
                  scale: [1.15, 0.95, 1.25, 1, 1.15],
                  rotate: [360, 270, 180, 90, 0],
                  borderRadius: ["50% 50% 30% 70% / 50% 60% 40% 60%", "30% 60% 70% 40% / 50% 30% 60% 40%", "50% 50% 30% 70% / 50% 60% 40% 60%"]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-bl from-tertiary-container/20 to-primary-container/20 blur-2xl"
              />
              
              {/* Center Icon Container */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10 w-24 h-24 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-2xl flex items-center justify-center"
              >
                {/* Moving color borders */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10 rounded-2xl animate-pulse" />
                
                {/* Animated Icon depending on phase index */}
                {currentPhaseIndex === 0 && <Sparkles className="w-10 h-10 text-primary animate-pulse relative z-10" />}
                {currentPhaseIndex === 1 && <Brain className="w-10 h-10 text-secondary relative z-10" />}
                {currentPhaseIndex === 2 && <Palette className="w-10 h-10 text-tertiary relative z-10" />}
                {currentPhaseIndex === 3 && <BookOpen className="w-10 h-10 text-primary relative z-10" />}
                {currentPhaseIndex === 4 && <Footprints className="w-10 h-10 text-secondary relative z-10" />}
                {currentPhaseIndex === 5 && <Check className="w-10 h-10 text-emerald-500 animate-bounce relative z-10" />}
              </motion.div>
              
              {/* Floating Particles */}
              {[...Array(6)].map((_, i) => {
                const delay = i * 0.4;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1, 0.8, 0],
                      y: [0, -40, -60],
                      x: [0, (i % 2 === 0 ? 30 : -30), (i % 2 === 0 ? 50 : -50)]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: delay,
                      ease: "easeOut"
                    }}
                    className="absolute w-2.5 h-2.5 rounded-full bg-primary-container"
                    style={{
                      left: 'calc(50% - 5px)',
                      top: 'calc(50% - 5px)',
                    }}
                  />
                );
              })}
            </div>

            {/* Split layout: Progress checklist & Skeleton preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4 border-t border-outline-variant/20">
              {/* Left: Progress Checklist */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-wider text-on-surface-variant px-1">
                    <span>Progresso de Geração</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary via-secondary to-primary-container"
                      initial={{ width: "0%" }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                  </div>
                </div>
                
                {/* Phase Checklist Items */}
                <div className="bg-surface-container-lowest/50 border border-outline-variant/20 rounded-2xl p-5 space-y-4">
                  {loadingPhases.map((phase, idx) => {
                    const isCompleted = idx < currentPhaseIndex;
                    const isActive = idx === currentPhaseIndex;
                    const isPending = idx > currentPhaseIndex;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3.5 transition-all duration-300 ${
                          isPending ? 'opacity-35 scale-98' : 'opacity-100'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center"
                            >
                              <Check size={12} className="stroke-[3]" />
                            </motion.div>
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-outline-variant/40" />
                          )}
                        </div>
                        <div className="text-left space-y-0.5">
                          <h4 className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {phase.title}
                          </h4>
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[10px] text-on-surface-variant/80 font-medium leading-relaxed"
                            >
                              {phase.description}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Skeleton Worksheet Preview */}
              <div className="bg-surface-container-lowest/80 border border-outline-variant/30 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-inner h-80 flex flex-col justify-between">
                {/* Shimmer Overlay */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
                />
                
                <div className="space-y-4">
                  {/* Header mockup */}
                  <div className="border-b border-outline-variant/30 pb-3 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-2 bg-surface-container-high rounded w-20" />
                      <div className="h-2 bg-surface-container-high rounded w-16" />
                    </div>
                    <div className="h-4 bg-surface-container-high rounded w-3/4" />
                  </div>
                  
                  {/* Content mock lines */}
                  <div className="space-y-2.5">
                    <div className="h-2 bg-surface-container-high rounded w-1/4" />
                    <div className="h-3 bg-surface-container-high rounded w-full" />
                    <div className="h-3 bg-surface-container-high rounded w-5/6" />
                  </div>
                  
                  {/* Image/exercise block mockup */}
                  <div className="border border-dashed border-outline-variant/40 rounded-xl p-3 bg-surface-container-low/30 space-y-2">
                    <div className="h-2.5 bg-surface-container-high rounded w-1/2 animate-pulse" />
                    <div className="h-12 bg-surface-container-high/40 border border-dashed border-outline-variant/20 rounded flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-on-surface-variant/20 animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[8px] text-on-surface-variant/50 font-bold uppercase tracking-widest border-t border-outline-variant/30 pt-3">
                  <span>Folha do Aluno</span>
                  <span className="flex items-center gap-1"><Sparkles size={8} /> Esboçando Conteúdo</span>
                </div>
              </div>
            </div>
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
                          const hasIllustration = !!(activity.illustrationPrompts?.[i]);
                          const displayText = hasIllustration
                            ? q.replace(/^[\d\.\s]*(Desenhe|desenhe)/, '$& (pinte o desenho)')
                                .replace(/^[\d\.\s]*(Desenhe|desenhe)/, (m) => m.replace(/Desenhe|desenhe/, 'Pinte'))
                            : q;
                          return (
                           <div key={i}>
                              <p className="text-[9px] text-on-surface-variant font-medium line-clamp-1">{displayText}</p>
                              {hasIllustration ? (
                                <div className="border border-dashed border-primary/30 h-6 w-full rounded flex items-center justify-center bg-primary/5">
                                  <span className="text-[7px] text-primary font-bold">🎨 Ilustração para colorir</span>
                                </div>
                              ) : (
                                <>
                                  <div className="border-b border-dashed border-outline-variant/50 h-6 w-full"></div>
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
                    onClick={() => {
                      if (activity) {
                        startPrintJob(activity);
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
