'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Calendar as CalendarIcon, AlertCircle, CheckCircle, Plus, ChevronRight, Sun, X, Play, Check, CloudRain, Palette, Sparkles, Star, Users, Smile, Meh, Frown, BarChart3, Loader2, BookOpen, LayoutGrid, ClipboardList } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { startOfWeek, format } from 'date-fns';
import ModoAula from '@/app/components/ModoAula';

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('Professora');
  const [teacherClass, setTeacherClass] = useState('');
  const [mounted, setMounted] = useState(false);

  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  // Dados do Planner
  const [todayActivity, setTodayActivity] = useState<{ title: string; time: string; type: string; steps?: { title: string; content: string }[] } | null>(null);
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const [weekTheme, setWeekTheme] = useState('');

  // Dados da Sala
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  // Foco de Hoje
  const [focusItems, setFocusItems] = useState<{ id: number; title: string; done: boolean }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isModoAulaOpen, setIsModoAulaOpen] = useState(false);
  const [activeSteps, setActiveSteps] = useState<{ title: string; content: string }[]>([]);

  // Data e saudação
  const now = useMemo(() => new Date(), [mounted]);
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const greetingIcon = hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌙';

  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const monthsLong = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const todayName = daysOfWeek[now.getDay()];
  const formattedDate = `${todayName}, ${now.getDate()} de ${monthsLong[now.getMonth()]} de ${now.getFullYear()}`;

  useEffect(() => {
    setMounted(true);

    // Auto-inicializar dados mockados se o localStorage estiver limpo (para testes e primeiro uso)
    const storedStudents = localStorage.getItem('educakids_students');
    if (!storedStudents) {
      const defaultStudents = [
        {
          id: 'MOCK_1',
          name: 'Lucas Souza',
          class: 'Berçário A',
          behavior: 'smile',
          notes: 'Muito ativo hoje, adorou as tintas.',
          color: 'bg-[#FFEBCD] dark:bg-[#5E4E3C]',
          tags: ['avatar:lion'],
          age: '1 ano',
          parentName: 'Renata Souza',
          emergencyContact: '11999999999'
        },
        {
          id: 'MOCK_2',
          name: 'Beatriz Lima',
          class: 'Berçário A',
          behavior: 'smile',
          notes: 'Dormiu bem no período da tarde.',
          color: 'bg-[#FCE4EC] dark:bg-[#5D3A4B]',
          tags: ['avatar:rabbit'],
          age: '1 ano',
          parentName: 'Marcos Lima',
          emergencyContact: '11988888888'
        },
        {
          id: 'MOCK_3',
          name: 'Sofia Cruz',
          class: 'Berçário A',
          behavior: 'meh',
          notes: 'Um pouco dengosa pela manhã.',
          color: 'bg-[#FFE0B2] dark:bg-[#6E4228]',
          tags: ['avatar:fox'],
          age: '1 ano',
          parentName: 'Ana Cruz',
          emergencyContact: '11977777777'
        },
        {
          id: 'MOCK_4',
          name: 'Gael Silva',
          class: 'Berçário A',
          behavior: 'smile',
          notes: 'Comeu toda a fruta no lanche.',
          color: 'bg-[#F5F5F5] dark:bg-[#3C4A52]',
          tags: ['avatar:panda'],
          age: '1 ano',
          parentName: 'Julia Silva',
          emergencyContact: '11966666666'
        }
      ];
      localStorage.setItem('educakids_students', JSON.stringify(defaultStudents));
    }

    const monday = startOfWeek(now, { weekStartsOn: 1 });
    const weekKey = format(monday, 'yyyy-MM-dd');
    const planKey = `educakids_plan_${weekKey}`;
    const storedPlan = localStorage.getItem(planKey);
    if (!storedPlan) {
      const defaultWeeklyPlan = {
        theme: 'Animais da Floresta & Texturas',
        goals: [
          'Explorar diferentes materiais e texturas (areia, argila, tintas).',
          'Reconhecer sons de animais comuns.',
          'Estimular a coordenação motora fina através de colagem.'
        ],
        days: [
          {
            day: 'Segunda-feira',
            focus: 'Pintura a dedo com cores da floresta',
            iconName: 'Palette',
            iconBg: 'bg-primary/10 text-primary',
            activities: [
              { type: 'Arte Sensorial', text: 'Pintura a dedo com cores da floresta' }
            ]
          },
          {
            day: 'Terça-feira',
            focus: 'Brincadeira com argila e folhas',
            iconName: 'Sun',
            iconBg: 'bg-secondary/10 text-secondary',
            activities: [
              { type: 'Exploração', text: 'Brincadeira com argila e folhas' }
            ]
          },
          {
            day: 'Quarta-feira',
            focus: 'Sons dos animais da floresta',
            iconName: 'Sparkles',
            iconBg: 'bg-tertiary/10 text-tertiary',
            activities: [
              { type: 'Música & Ritmo', text: 'Sons dos animais da floresta' }
            ]
          },
          {
            day: 'Quinta-feira',
            focus: 'Colagem com folhas secas',
            iconName: 'CloudRain',
            iconBg: 'bg-error/10 text-error',
            activities: [
              { type: 'Arte & Colagem', text: 'Colagem com folhas secas' }
            ]
          },
          {
            day: 'Sexta-feira',
            focus: 'Exploração sensorial com caixa de areia',
            iconName: 'Star',
            iconBg: 'bg-warning/10 text-warning',
            activities: [
              { type: 'Sensorial', text: 'Exploração sensorial com caixa de areia' }
            ]
          }
        ]
      };
      localStorage.setItem(planKey, JSON.stringify(defaultWeeklyPlan));
    }

    // 1. Carregar nome do professor
    const stored = localStorage.getItem('educakids_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setTeacherName(parsed.name);
      } catch { /* ignore */ }
    }

    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
          const { data } = await supabase
            .from('profiles')
            .select('name, classes')
            .eq('id', user.id)
            .single();

          if (data?.name) {
            setTeacherName(data.name);
            if (data.classes) setTeacherClass(data.classes);
            localStorage.setItem('educakids_user', JSON.stringify({
              name: data.name,
              email: user.email,
            }));
            return;
          }
        } catch { /* ignore */ }

        const metaName = user.user_metadata?.name;
        if (metaName) {
          setTeacherName(metaName);
          setTeacherClass(user.user_metadata?.classes || '');
        }
      } catch (err) {
        console.error('Erro ao carregar nome:', err);
      }
    };
    loadProfile();

    // 2. Carregar planner da semana atual
    const planData = localStorage.getItem(planKey);
    if (planData) {
      try {
        const plan = JSON.parse(planData);
        if (plan.theme) setWeekTheme(plan.theme);
        if (plan.days) {
          setWeekDays(plan.days);
          const todayIndex = now.getDay() - 1; // 0=segunda
          if (todayIndex >= 0 && todayIndex < plan.days.length) {
            const todayPlan = plan.days[todayIndex];
            if (todayPlan.activities && todayPlan.activities.length > 0) {
              setTodayActivity({
                title: todayPlan.activities[0].text,
                time: 'Manhã',
                type: todayPlan.activities[0].type,
              });
            } else {
              setTodayActivity({
                title: todayPlan.focus || 'Exploração Livre',
                time: 'Manhã',
                type: 'Atividade do Dia',
              });
            }
          }
        }
      } catch { /* ignore */ }
    }

    // 3. Carregar dados da sala
    const studentsData = localStorage.getItem('educakids_students');
    if (studentsData) {
      try {
        const students = JSON.parse(studentsData);
        setTotalStudents(students.length);
        setPresentCount(students.filter((s: any) => s.behavior !== 'absent').length);
        setAbsentCount(students.filter((s: any) => s.behavior === 'absent').length);
        setSmileCount(students.filter((s: any) => s.behavior === 'smile').length);
        setMehCount(students.filter((s: any) => s.behavior === 'meh').length);
        setSadCount(students.filter((s: any) => s.behavior === 'sad').length);
      } catch { /* ignore */ }
    }

    // 4. Carregar focos do localStorage
    const savedFocus = localStorage.getItem('educakids_focus_items');
    if (savedFocus) {
      try {
        setFocusItems(JSON.parse(savedFocus));
      } catch { /* ignore */ }
    }
  }, [supabase, now]);

  useEffect(() => {
    if (countdownValue === null) return;
    if (countdownValue <= 0) {
      setCountdownValue(null);
      setIsModoAulaOpen(true);
      setIsStarted(true);
      return;
    }
    const timer = setTimeout(() => setCountdownValue(prev => (prev as number) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdownValue]);

  // Salvar focos no localStorage
  const saveFocusItems = (items: { id: number; title: string; done: boolean }[]) => {
    setFocusItems(items);
    localStorage.setItem('educakids_focus_items', JSON.stringify(items));
  };

  const toggleFocusDone = (id: number) => {
    saveFocusItems(focusItems.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const dismissFocus = (id: number) => {
    saveFocusItems(focusItems.filter(item => item.id !== id));
  };

  const handleAddFocus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const newItem = { id: Date.now(), title: newItemTitle.trim(), done: false };
    saveFocusItems([newItem, ...focusItems]);
    setNewItemTitle('');
    setIsModalOpen(false);
  };

  const progressTotal = focusItems.length;
  const progressDone = focusItems.filter(i => i.done).length;
  const progressPercent = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;

  // Cards da agenda semanal (máximo 5 dias)
  const agendaDays = weekDays.slice(0, 5);
  const weekDayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const iconMap: Record<string, any> = { Sun, Palette, CloudRain, Sparkles, Star };

  // Contagem de humor dos alunos
  const [smileCount, setSmileCount] = useState(0);
  const [mehCount, setMehCount] = useState(0);
  const [sadCount, setSadCount] = useState(0);

  useEffect(() => {
    const studentsData = localStorage.getItem('educakids_students');
    if (studentsData) {
      try {
        const students = JSON.parse(studentsData);
        setSmileCount(students.filter((s: any) => s.behavior === 'smile').length);
        setMehCount(students.filter((s: any) => s.behavior === 'meh').length);
        setSadCount(students.filter((s: any) => s.behavior === 'sad').length);
      } catch { /* ignore */ }
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Saudação e Data */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-sans font-bold text-3xl text-on-surface">
            {greeting}, {teacherName} {greetingIcon}
          </h2>
          <p className="text-on-surface-variant mt-0.5 text-sm font-medium">{formattedDate}</p>
          {teacherClass && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-black text-secondary uppercase tracking-wider bg-secondary-container/30 px-3 py-1 rounded-full">
              <Users size={10} />
              {teacherClass}
            </span>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        {/* Card de Atividade Atual (dinâmico do planner) */}
        <div className="col-span-2 bg-gradient-to-br from-primary to-primary/80 text-on-primary p-5 rounded-2xl flex items-center justify-between shadow-soft border border-primary/10 transition-colors duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
              {isStarted ? '📌 Atividade em Andamento' : '📋 Próxima Atividade'}
            </p>
            <h3 className="font-sans font-bold text-xl leading-tight">
              {todayActivity?.title || 'Nenhuma atividade planejada'}
            </h3>
            {todayActivity && (
              <div className="flex items-center gap-2 text-sm opacity-85 mt-1">
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {todayActivity.type}
                </span>
                <span className="text-xs opacity-70">{todayActivity.time}</span>
              </div>
            )}
            {weekTheme && (
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">
                Tema: {weekTheme}
              </p>
            )}
          </div>
          {todayActivity && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!isStarted) {
                  setActiveSteps(
                    todayActivity.steps || [
                      { title: 'Preparação', content: 'Organize os materiais necessários.' },
                      { title: 'Desenvolvimento', content: 'Conduza a atividade com os alunos.' },
                      { title: 'Encerramento', content: 'Faça uma roda de conversa sobre o que aprenderam.' },
                    ]
                  );
                  setCountdownValue(3);
                } else {
                  setIsStarted(!isStarted);
                }
              }}
              className={`px-5 py-2.5 rounded-full font-bold text-xs shadow-md flex items-center gap-2 transition-colors duration-300 shrink-0 ${
                isStarted 
                  ? 'bg-white/25 text-white border border-white/30' 
                  : 'bg-white text-primary'
              }`}
            >
              {isStarted ? (
                <><Check size={14} /> Concluir</>
              ) : (
                <><Play size={14} fill="currentColor" /> Iniciar</>
              )}
            </motion.button>
          )}
        </div>

        {/* Card Resumo da Sala */}
        <Link href="/classroom?tab=comportamento#presenca" className="block">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-secondary-container/40 text-on-secondary-container p-4 rounded-2xl border border-secondary/10 flex flex-col justify-between h-32 relative overflow-hidden group"
          >
            <Users size={20} className="opacity-30 group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-bold text-2xl leading-none">{presentCount}/{totalStudents}</p>
              <p className="font-bold text-sm mt-1">Presentes</p>
              {absentCount > 0 && (
                <p className="text-[10px] opacity-70 mt-0.5">{absentCount} ausente{absentCount > 1 ? 's' : ''}</p>
              )}
            </div>
          </motion.div>
        </Link>

        {/* Card de Humor da Turma */}
        <Link href="/classroom?tab=comportamento#mood-chart" className="block">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-tertiary-container/40 text-on-tertiary-container p-4 rounded-2xl border border-tertiary/10 flex flex-col justify-between h-32"
          >
            <Smile size={20} className="opacity-30" />
            <div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1"><Smile size={14} className="text-success" /> {smileCount}</span>
                <span className="flex items-center gap-1"><Meh size={14} className="text-secondary" /> {mehCount}</span>
                <span className="flex items-center gap-1"><Frown size={14} className="text-error" /> {sadCount}</span>
              </div>
              <p className="font-bold text-sm mt-1">Humor da Turma</p>
            </div>
          </motion.div>
        </Link>

        {/* Card Notas da Aula */}
        <Link href="/activities" className="block">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-primary-container/30 text-on-primary-container p-4 rounded-2xl border border-primary/10 flex items-center gap-4 h-24"
          >
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">Gerar Atividade</p>
              <p className="text-[10px] opacity-70 mt-0.5">Com inteligência artificial</p>
            </div>
          </motion.div>
        </Link>

        {/* Card Planejamento */}
        <Link href="/planner" className="block">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-secondary-container/30 text-on-secondary-container p-4 rounded-2xl border border-secondary/10 flex items-center gap-4 h-24"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
              <CalendarIcon size={20} className="text-secondary" />
            </div>
            <div>
              <p className="font-bold text-sm">Planejamento</p>
              <p className="text-[10px] opacity-70 mt-0.5">Ver semana atual</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Progresso dos Focos */}
      {progressTotal > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Progresso do Dia
            </span>
            <span className="text-sm font-black text-primary">{progressPercent}%</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="bg-primary h-full rounded-full shadow-lg" 
            />
          </div>
          <p className="text-[10px] text-on-surface-variant font-medium">
            {progressDone} de {progressTotal} {progressTotal === 1 ? 'foco concluído' : 'focos concluídos'}
          </p>
        </div>
      )}

      {/* Agenda Semanal (dinâmica do planner) */}
      {agendaDays.length > 0 && (
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-bold text-lg text-on-surface">Agenda da Semana</h3>
            <Link href="/planner" className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              Ver tudo <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {agendaDays.map((day: any, i: number) => {
              const DayIcon = iconMap[day.iconName || 'Sun'] || Sun;
              const isToday = i === now.getDay() - 1;
              const firstActivity = day.activities?.[0]?.text || day.focus || 'Atividades Livres';

              return (
                <Link key={i} href="/planner" className="block">
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className={`bg-surface-container-low p-3 rounded-2xl border transition-all ${
                      isToday 
                        ? 'border-primary/40 bg-primary/5 shadow-sm' 
                        : 'border-outline-variant/20'
                    }`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${
                      isToday ? 'text-primary' : 'text-on-surface-variant/60'
                    }`}>
                      {weekDayNames[i] || day.day}
                    </p>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
                      day.iconBg || 'bg-surface-container-high'
                    }`}>
                      <DayIcon size={14} />
                    </div>
                    <p className="text-[10px] font-bold text-on-surface leading-tight line-clamp-2">
                      {firstActivity}
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Foco de Hoje */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-sans font-bold text-lg text-on-surface">Foco de Hoje</h3>
          {progressTotal > 0 && (
            <span className="text-[10px] text-on-surface-variant font-medium">
              {progressTotal} {progressTotal === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>

        {focusItems.length === 0 ? (
          <div className="bg-surface-container-low/40 rounded-2xl py-8 px-4 text-center border border-dashed border-outline-variant/30">
            <BarChart3 size={32} className="mx-auto text-on-surface-variant/30 mb-2" />
            <p className="text-sm font-bold text-on-surface-variant/50">Nenhum foco definido hoje</p>
            <p className="text-xs text-on-surface-variant/40 mt-1">Clique no + para adicionar</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {focusItems.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-surface-container-lowest border p-3.5 rounded-2xl flex items-center gap-3 transition-all ${
                    item.done 
                      ? 'border-primary/10 opacity-60' 
                      : 'border-outline-variant/30'
                  }`}
                >
                  <button
                    onClick={() => toggleFocusDone(item.id)}
                    className={`w-[22px] h-[22px] rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                      item.done 
                        ? 'bg-primary border-primary' 
                        : 'border-outline-variant hover:border-primary/60'
                    }`}
                  >
                    {item.done && <Check size={12} className="text-on-primary font-black" />}
                  </button>
                  <span className={`flex-1 text-sm font-semibold leading-snug ${
                    item.done ? 'text-on-surface-variant line-through' : 'text-on-surface'
                  }`}>
                    {item.title}
                  </span>
                  <button
                    onClick={() => dismissFocus(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant/40 hover:text-error hover:bg-error-container/30 transition-all shrink-0"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdownValue !== null && countdownValue > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              key={countdownValue}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-9xl font-black text-white drop-shadow-2xl"
            >
              {countdownValue}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Speed Dial */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isSpeedDialOpen && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.05 }}
              >
                <button
                  onClick={() => { setIsSpeedDialOpen(false); setIsModalOpen(true); }}
                  className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-4 py-2.5 rounded-full shadow-lg text-xs font-bold hover:bg-primary-container/20 transition-all"
                >
                  <Plus size={14} className="text-primary" />
                  Novo Foco
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href="/classroom?tab=comportamento"
                  onClick={() => setIsSpeedDialOpen(false)}
                  className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-4 py-2.5 rounded-full shadow-lg text-xs font-bold hover:bg-secondary-container/20 transition-all"
                >
                  <ClipboardList size={14} className="text-secondary" />
                  Registrar Presença
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.15 }}
              >
                <Link
                  href="/activities"
                  onClick={() => setIsSpeedDialOpen(false)}
                  className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-4 py-2.5 rounded-full shadow-lg text-xs font-bold hover:bg-tertiary-container/20 transition-all"
                >
                  <Sparkles size={14} className="text-tertiary" />
                  Gerar Atividade
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="/planner"
                  onClick={() => setIsSpeedDialOpen(false)}
                  className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-4 py-2.5 rounded-full shadow-lg text-xs font-bold hover:bg-primary-container/20 transition-all"
                >
                  <CalendarIcon size={14} className="text-primary" />
                  Ver Planejamento
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center border-2 border-white/20"
        >
          <motion.div
            animate={{ rotate: isSpeedDialOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={32} />
          </motion.div>
        </motion.button>
      </div>

      {/* Modal de Novo Foco */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 w-full bg-surface z-50 rounded-t-3xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-sans font-bold text-xl text-on-surface">Novo Foco do Dia</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-surface-container-high rounded-full text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddFocus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">O que precisa de atenção hoje?</label>
                  <input 
                    type="text" 
                    required
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Ex: Verificar alergia do Leo"
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm"
                    autoFocus
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold mt-2 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar Foco
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ModoAula
        isOpen={isModoAulaOpen}
        activityTitle={todayActivity?.title || 'Atividade'}
        steps={activeSteps}
        onClose={() => { setIsModoAulaOpen(false); setIsStarted(false); }}
        onComplete={() => { setIsStarted(true); }}
      />
    </div>
  );
}