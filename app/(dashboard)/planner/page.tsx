'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, CheckCircle, Star, CloudRain, Sun, Palette, ChevronRight, Save, X, Plus, Sparkles, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function PlannerPage() {
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState(false);

  const [theme, setTheme] = useState('Pequenos Exploradores: Vida no Jardim');
  const [goals, setGoals] = useState([
    'Explorar o conceito de biodiversidade através da observação de insetos no jardim.',
    'Desenvolver habilidades motoras finas usando materiais de colagem texturizados.',
    'Praticar o revezamento colaborativo durante as sessões de música em grupo.'
  ]);

  const [days, setDays] = useState([
    {
      day: 'Segunda-feira',
      date: '16 Out',
      focus: 'A Jornada da Formiga',
      iconName: 'Sun',
      iconBg: 'bg-primary-container text-on-primary-container',
      activities: [
        { type: 'Roda de Conversa', text: 'Contação de história: "A Formiga Trabalhadora"' },
        { type: 'Brincadeira Sensorial', text: 'Rastreamento na areia com lupas' },
      ]
    },
    {
      day: 'Terça-feira',
      date: '17 Out',
      focus: 'Cores da Borboleta',
      iconName: 'Palette',
      iconBg: 'bg-secondary-container text-on-secondary-container',
      activities: [
        { type: 'Oficina de Arte', text: 'Pintura simétrica de borboletas' },
        { type: 'Passeio no Jardim', text: 'Identificando cores na natureza' },
      ]
    },
    {
      day: 'Quarta-feira',
      date: '18 Out',
      focus: 'Minhocas e Solo',
      iconName: 'CloudRain',
      iconBg: 'bg-tertiary-container/40 text-on-tertiary-container',
      activities: [
        { type: 'Hub de Ciências', text: 'Observando a caixa de compostagem' },
        { type: 'Música e Movimento', text: 'Dança rítmica "Mexa-se como minhoca"' },
      ]
    },
    {
      day: 'Quinta-feira',
      date: '19 Out',
      focus: 'Sementes e Brotinhos',
      iconName: 'Sparkles',
      iconBg: 'bg-primary-container text-on-primary-container',
      activities: [
        { type: 'Plantação Prática', text: 'Plantando sementes de feijão no algodão úmido' },
        { type: 'Contação de História', text: 'Contação: "A Pequena Semente que Cresceu"' },
      ]
    },
    {
      day: 'Sexta-feira',
      date: '20 Out',
      focus: 'Festa do Jardim',
      iconName: 'Star',
      iconBg: 'bg-secondary-container text-on-secondary-container',
      activities: [
        { type: 'Expressão Corporal', text: 'Piquenique no Jardim e Caça ao Tesouro dos Bichinhos' },
        { type: 'Artes Coletivas', text: 'Painel gigante com colagem de folhas e pétalas caídas' },
      ]
    }
  ]);


  // Load from Supabase
  useEffect(() => {
    // Carregar do LocalStorage primeiro como fallback/inicialização offline imediata
    const localPlan = localStorage.getItem('educakids_planner');
    if (localPlan) {
      try {
        const parsed = JSON.parse(localPlan);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.days) setDays(parsed.days);
      } catch (e) {
        console.error('Erro ao ler planejador do localStorage', e);
      }
    }

    const loadPlanner = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('planner_plans')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setTheme(data.theme);
          setGoals(data.goals);
          
          let parsedDays = data.days;
          if (data.days && data.days.length < 5) {
            const mergedDays = [...data.days];
            const defaultDays = [
              {
                day: 'Segunda-feira',
                date: '16 Out',
                focus: 'A Jornada da Formiga',
                iconName: 'Sun',
                iconBg: 'bg-primary-container text-on-primary-container',
                activities: [
                  { type: 'Roda de Conversa', text: 'Contação de história: "A Formiga Trabalhadora"' },
                  { type: 'Brincadeira Sensorial', text: 'Rastreamento na areia com lupas' },
                ]
              },
              {
                day: 'Terça-feira',
                date: '17 Out',
                focus: 'Cores da Borboleta',
                iconName: 'Palette',
                iconBg: 'bg-secondary-container text-on-secondary-container',
                activities: [
                  { type: 'Oficina de Arte', text: 'Pintura simétrica de borboletas' },
                  { type: 'Passeio no Jardim', text: 'Identificando cores na natureza' },
                ]
              },
              {
                day: 'Quarta-feira',
                date: '18 Out',
                focus: 'Minhocas e Solo',
                iconName: 'CloudRain',
                iconBg: 'bg-tertiary-container/40 text-on-tertiary-container',
                activities: [
                  { type: 'Hub de Ciências', text: 'Observando a caixa de compostagem' },
                  { type: 'Música e Movimento', text: 'Dança rítmica "Mexa-se como minhoca"' },
                ]
              },
              {
                day: 'Quinta-feira',
                date: '19 Out',
                focus: 'Sementes e Brotinhos',
                iconName: 'Sparkles',
                iconBg: 'bg-primary-container text-on-primary-container',
                activities: [
                  { type: 'Plantação Prática', text: 'Plantando sementes de feijão no algodão úmido' },
                  { type: 'Contação de História', text: 'Contação: "A Pequena Semente que Cresceu"' },
                ]
              },
              {
                day: 'Sexta-feira',
                date: '20 Out',
                focus: 'Festa do Jardim',
                iconName: 'Star',
                iconBg: 'bg-secondary-container text-on-secondary-container',
                activities: [
                  { type: 'Expressão Corporal', text: 'Piquenique no Jardim e Caça ao Tesouro dos Bichinhos' },
                  { type: 'Artes Coletivas', text: 'Painel gigante com colagem de folhas e pétalas caídas' },
                ]
              }
            ];

            for (let idx = data.days.length; idx < 5; idx++) {
              mergedDays.push(defaultDays[idx]);
            }
            parsedDays = mergedDays;
          }
          setDays(parsedDays);
          localStorage.setItem('educakids_planner', JSON.stringify({
            theme: data.theme,
            goals: data.goals,
            days: parsedDays
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar do Supabase. Usando dados locais.', err);
        setDbError(true);
      }
    };
    loadPlanner();
  }, [supabase]);

  // Dynamic pedagogical tips
  const tips = [
    {
      title: "Exploração Ativa no Jardim 🌿",
      text: "Leve as crianças para o jardim com lupas e potes transparentes. Incentive-as a observar pequenos insetos e plantas. Capture fotos desse momento para enriquecer o portfólio pedagógico e encantar os pais!",
      badge: "Investigação"
    },
    {
      title: "Caça ao Tesouro Sensorial 🔍",
      text: "Esconda objetos com texturas diferentes (penas, pedras polidas, tecidos) em caixas de areia. Essa brincadeira estimula o tato e a concentração, ótima para acalmar a turma após o recreio!",
      badge: "Percepção"
    },
    {
      title: "Pintura Simétrica Mágica 🎨",
      text: "Dobre folhas de papel com gotas de tinta guache fresca no meio. Ao abrir, as crianças descobrem borboletas e padrões incríveis. Uma forma divertida de ensinar sobre cores e formas!",
      badge: "Criatividade"
    },
    {
      title: "Roda de Ritmo e Coordenação 🥁",
      text: "Use palmas, pés e pequenos instrumentos para criar padrões sonoros simples. Deixe que cada criança lidere o ritmo por uma rodada. Excelente para desenvolver o foco auditivo!",
      badge: "Expressão"
    }
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const handleSave = async () => {
    setIsEditing(false);
    setLoading(true);
    
    // Salvar localmente primeiro para garantir persistência instantânea/offline
    localStorage.setItem('educakids_planner', JSON.stringify({ theme, goals, days }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('planner_plans')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existing) {
          await supabase
            .from('planner_plans')
            .update({ theme, goals, days, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('planner_plans')
            .insert({ user_id: user.id, theme, goals, days });
        }
      }
    } catch (err) {
      console.error('Erro ao salvar no Supabase.', err);
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  const iconMap: Record<string, React.ComponentType<any>> = {
    Sun: Sun,
    Palette: Palette,
    CloudRain: CloudRain,
    Sparkles: Sparkles,
    Star: Star
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 pb-20">
      {dbError && (
        <div className="bg-[#E7F3F1] dark:bg-[#1E2E2A] text-on-surface p-4 rounded-3xl flex items-start gap-3 border border-primary/20">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-primary" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Modo Offline (Sem Sincronização)</h4>
            <p className="text-xs opacity-90 font-medium leading-relaxed">
              Não encontramos as tabelas no seu Supabase. Os seus dados estão sendo salvos localmente. 
              Para ativar a sincronização na nuvem do Supabase, execute o arquivo <code className="bg-black/10 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">supabase_setup.sql</code> no SQL Editor do seu Supabase Dashboard!
            </p>
          </div>
        </div>
      )}

      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Semana Atual</p>
          <h1 className="font-sans font-bold text-3xl text-on-surface">Planejador Semanal</h1>
          <p className="text-on-surface-variant mt-1 font-medium">16 de Outubro - 20 de Outubro, 2023</p>
        </div>
        {isEditing ? (
          <div className="flex gap-3">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-6 py-3 rounded-full shadow-lg shadow-primary/10 disabled:opacity-75"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Plano
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center justify-center bg-surface-container-high text-on-surface-variant font-bold w-12 h-12 rounded-full"
            >
              <X size={20} />
            </motion.button>
          </div>
        ) : (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-8 py-3 rounded-full shadow-lg shadow-primary/10 hover:bg-primary/90 transition-colors"
          >
            <Edit3 size={18} />
            Editar Plano
          </motion.button>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-secondary-container/30 border border-secondary-container p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-5 text-on-secondary-container">
            <Star size={24} className="fill-current" />
            <h2 className="font-sans font-bold text-xl leading-tight">Principais Objetivos da Semana</h2>
          </div>
          <ul className="space-y-4">
            {goals.map((goal, idx) => (
              <li key={idx} className="flex gap-3 items-start text-sm text-on-surface">
                <CheckCircle size={18} className="text-primary shrink-0 mt-0.5 fill-primary/20" />
                {isEditing ? (
                  <textarea 
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...goals];
                      newGoals[idx] = e.target.value;
                      setGoals(newGoals);
                    }}
                    className="flex-1 bg-surface-container border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/50 text-sm font-medium outline-none resize-none min-h-[60px] text-on-surface"
                  />
                ) : (
                  <span className="font-medium leading-relaxed">{goal}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-tertiary-container/20 border border-tertiary-container/40 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-tertiary uppercase tracking-widest mb-2">Tema da Semana</h3>
            {isEditing ? (
              <input 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3 font-sans font-bold text-lg text-on-surface focus:ring-2 focus:ring-tertiary/50 outline-none"
              />
            ) : (
              <p className="font-sans font-bold text-2xl text-on-tertiary-container leading-tight">{theme}</p>
            )}
          </div>
          <div className="mt-6">
            <span className="inline-flex items-center px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black uppercase rounded-full shadow-sm">
              Educação Infantil
            </span>
          </div>
        </div>
      </section>

      <section className="overflow-x-auto hide-scrollbar -mx-5 px-5 select-none active:cursor-grabbing">
        <div className="flex gap-6 min-w-max pb-6">
          {days.map((wd, i) => {
            const DayIcon = iconMap[wd.iconName || 'Sun'] || Sun;
            return (
              <motion.div 
                key={i}
                whileHover={{ y: isEditing ? 0 : -4 }}
                className="w-80 bg-surface-container-low border border-outline-variant p-5 rounded-3xl shadow-sm space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-sans font-bold text-lg text-on-surface">{wd.day}</h4>
                    <p className="text-xs text-on-surface-variant font-medium">{wd.date}</p>
                  </div>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${wd.iconBg}`}>
                    <DayIcon size={20} />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Foco do Tema</p>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={wd.focus}
                      onChange={(e) => {
                        const newDays = [...days];
                        newDays[i].focus = e.target.value;
                        setDays(newDays);
                      }}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 font-bold text-sm text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  ) : (
                    <p className="font-bold text-on-surface leading-tight">{wd.focus}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                    <Star size={10} /> Atividades
                  </p>
                  {wd.activities.map((a, j) => (
                    <div key={j} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm space-y-2">
                      {isEditing ? (
                        <>
                          <input 
                            type="text"
                            value={a.type}
                            onChange={(e) => {
                              const newDays = [...days];
                              newDays[i].activities[j].type = e.target.value;
                              setDays(newDays);
                            }}
                            className="w-full bg-surface-container-low border-none rounded-lg p-2 text-[10px] font-black text-primary uppercase focus:ring-1 focus:ring-primary/50 outline-none"
                            placeholder="Tipo"
                          />
                          <textarea 
                            value={a.text}
                            onChange={(e) => {
                              const newDays = [...days];
                              newDays[i].activities[j].text = e.target.value;
                              setDays(newDays);
                            }}
                            className="w-full bg-surface-container-low border-none rounded-lg p-2 text-xs text-on-surface-variant font-medium outline-none resize-none"
                            rows={2}
                            placeholder="Descrição"
                          />
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] font-black text-primary uppercase mb-1">{a.type}</p>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{a.text}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Dynamic Golden Tip (Dica de Ouro) */}
      <section className="bg-gradient-to-br from-primary/10 via-surface-container-lowest to-secondary/5 rounded-3xl p-6 border border-outline-variant shadow-soft relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="w-full md:w-48 h-32 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex flex-col items-center justify-center text-white relative shrink-0 shadow-md">
          <Sparkles size={40} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest mt-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            Dica do Dia
          </span>
        </div>
        
        <div className="flex-grow space-y-3 relative z-10 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
              <Star size={16} className="fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dica de Ouro para a Semana</span>
              <span className="px-2.5 py-0.5 bg-primary/15 text-primary rounded-full text-[9px] font-bold uppercase tracking-wider">
                {tips[currentTipIndex].badge}
              </span>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextTip}
              className="inline-flex items-center justify-center self-center md:self-auto gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold px-4 py-2 rounded-full text-xs shadow-sm border border-outline-variant/30 transition-all"
            >
              <RefreshCw size={12} className="text-secondary" />
              Mudar Sugestão
            </motion.button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTipIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              <h3 className="font-sans font-bold text-xl text-on-surface">
                {tips[currentTipIndex].title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                {tips[currentTipIndex].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
