'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  Edit3, 
  CheckCircle, 
  Star, 
  CloudRain, 
  Sun, 
  Palette, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Save, 
  X, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  Calendar,
  Trash2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import CreatePlannerModal from '@/app/components/modals/CreatePlannerModal';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths, 
  addDays, 
  parseISO 
} from 'date-fns';

// Algoritmo de Meeus/Jones/Butcher para determinar o Domingo de Páscoa
function getEasterDate(year: number): Date {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}

// Retorna feriados nacionais brasileiros fixos e móveis
function getHolidays(year: number): Record<string, string> {
  const holidays: Record<string, string> = {
    [`${year}-01-01`]: "Confraternização Universal",
    [`${year}-04-21`]: "Tiradentes",
    [`${year}-05-01`]: "Dia do Trabalhador",
    [`${year}-09-07`]: "Independência do Brasil",
    [`${year}-10-12`]: "Nossa Senhora Aparecida / Dia das Crianças",
    [`${year}-11-02`]: "Finados",
    [`${year}-11-15`]: "Proclamação da República",
    [`${year}-11-20`]: "Dia da Consciência Negra",
    [`${year}-12-25`]: "Natal",
  };

  const easter = getEasterDate(year);
  const formatKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  // Carnaval: 47 dias antes da Páscoa
  const carnaval = new Date(easter);
  carnaval.setDate(easter.getDate() - 47);
  holidays[formatKey(carnaval)] = "Carnaval";
  
  // Sexta-feira Santa: 2 dias antes da Páscoa
  const sextaSanta = new Date(easter);
  sextaSanta.setDate(easter.getDate() - 2);
  holidays[formatKey(sextaSanta)] = "Sexta-feira Santa";

  // Páscoa
  holidays[formatKey(easter)] = "Páscoa";

  // Corpus Christi: 60 dias após a Páscoa
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);
  holidays[formatKey(corpusChristi)] = "Corpus Christi";

  return holidays;
}

// Helper para retornar dicas pedagógicas de ouro conforme o tema
function getTipsForTheme(themeStr: string) {
  const t = (themeStr || "").toLowerCase();
  
  if (t.includes("junina") || t.includes("joão") || t.includes("são joão") || t.includes("caipira")) {
    return [
      {
        title: "Ambientação Junina 🎪",
        text: "Enfeite a sala com as bandeirinhas feitas pelas próprias crianças. Coloque uma música instrumental de sanfona ao fundo logo na entrada para criar uma atmosfera acolhedora e animada!",
        badge: "Cultura"
      },
      {
        title: "Pescaria de Aprendizados 🎣",
        text: "Use a brincadeira de pescaria para ensinar cores, números ou iniciais dos nomes. Cada peixe pescado pode ter uma letra que a criança deve identificar na roda de conversa.",
        badge: "Pedagógico"
      },
      {
        title: "Fogueira de Papel Segura 🔥",
        text: "Ao fazer a oficina da fogueira de papel, use palitos de picolé reais. O relevo tridimensional dos palitos estimula a percepção de texturas e o senso tridimensional das crianças.",
        badge: "Arte"
      },
      {
        title: "Culinária e Sentidos 🌽",
        text: "Aproveite o momento da pipoca ou do milho para trabalhar os sentidos: o som do milho estourando (audição), o cheiro da pipoca (olfato) e o sabor e calor do alimento (paladar/tato).",
        badge: "Sensorial"
      }
    ];
  }

  if (t.includes("animal") || t.includes("animais") || t.includes("bicho") || t.includes("inseto")) {
    return [
      {
        title: "Sons da Natureza 🔊",
        text: "Toque gravações de sons de animais e estimule os alunos a adivinharem de quem é o som antes de imitarem seus movimentos. Isso treina a percepção auditiva.",
        badge: "Escuta"
      },
      {
        title: "Pegadas Sensoriais 🐾",
        text: "Faça carimbos de pegadas de animais usando esponjas cortadas. Deixe as crianças criarem caminhos no papel kraft e andarem por cima imitando o animal correspondente.",
        badge: "Movimento"
      },
      {
        title: "Alimentando o Respeito 🥕",
        text: "Promova conversas sobre o que cada animal come e a importância de respeitar e cuidar dos pets e animais silvestres. Excelente para trabalhar empatia e ecologia.",
        badge: "Empatia"
      },
      {
        title: "Histórias com Fantoches 🦁",
        text: "Use fantoches simples de animais para contar histórias clássicas, deixando que as crianças interajam com o fantoche fazendo perguntas e respondendo a ele.",
        badge: "Linguagem"
      }
    ];
  }

  if (t.includes("natureza") || t.includes("ambiente") || t.includes("jardim") || t.includes("planta") || t.includes("folha")) {
    return [
      {
        title: "Exploração Ativa no Jardim 🌿",
        text: "Leve as crianças para o jardim com lupas e potes transparentes. Incentive-as a observar pequenos insetos e plantas. Capture fotos desse momento para o portfólio!",
        badge: "Investigação"
      },
      {
        title: "Decalque de Texturas 🍁",
        text: "Coloque folhas caídas do jardim sob o papel e esfregue giz de cera por cima. As nervuras e formas surgirão magicamente na folha, fascinando os pequenos.",
        badge: "Criatividade"
      },
      {
        title: "Plantio Coletivo 🌱",
        text: "Plante sementes de feijão no algodão ou girassóis em pequenos vasos. Atribuir a tarefa diária de regar ajuda as crianças a desenvolverem responsabilidade e paciência.",
        badge: "Cuidado"
      },
      {
        title: "Mural Ecológico ♻️",
        text: "Crie um mural usando apenas elementos naturais coletados do chão e embalagens recicláveis. Ensine a importância da reciclagem e da preservação de forma prática.",
        badge: "Consciência"
      }
    ];
  }

  return [
    {
      title: `Explorando ${themeStr} de forma Lúdica 🌟`,
      text: `Inicie a semana introduzindo o tema "${themeStr}" através de perguntas abertas. Escute ativamente o que os alunos já conhecem para guiar as atividades seguintes de forma adaptada.`,
      badge: "Introdução"
    },
    {
      title: `Expressão Criativa em Foco 🎨`,
      text: `Forneça diferentes materiais (tinta, massinha, colagens) e deixe os alunos expressarem livremente sua visão sobre "${themeStr}". O foco deve ser o processo criativo, e não o resultado final.`,
      badge: "Expressão"
    },
    {
      title: `Trabalho em Grupo e Cooperação 🤝`,
      text: `Planeje brincadeiras ou desafios motores em duplas ou trios baseados em "${themeStr}". Dividir materiais estimula a cooperação, a negociação e a socialização das crianças.`,
      badge: "Socialização"
    },
    {
      title: `Roda de Histórias e Encerramento 📖`,
      text: `No fim da semana, crie um momento calmo de contação de histórias relacionado a "${themeStr}". Use fantoches, entonações de voz diferentes ou livros ilustrados para prender a atenção.`,
      badge: "Linguagem"
    }
  ];
}

export default function PlannerPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [holidayTooltip, setHolidayTooltip] = useState<{ date: Date; name: string; x: number; y: number } | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState(false);

  // States do Planejamento ativo
  const [theme, setTheme] = useState('Pequenos Exploradores: Vida no Jardim');
  const [goals, setGoals] = useState([
    'Explorar o conceito de biodiversidade através da observação de insetos no jardim.',
    'Desenvolver habilidades motoras finas usando materiais de colagem texturizados.',
    'Praticar o revezamento colaborativo durante as sessões de música em grupo.'
  ]);
  const [days, setDays] = useState<any[]>([]);

  // States do Modal de Criação com IA
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Auxiliar para formatação brasileira compacta de datas
  const formatDateBr = (d: Date) => {
    const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
  };

  const monthsLong = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Gera o plano base limpo para uma determinada semana (segunda-feira inicial)
  const getDefaultPlanForWeek = (monday: Date) => {
    const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    const icons = ['Sun', 'Palette', 'CloudRain', 'Sparkles', 'Star'];
    const backgrounds = [
      'bg-primary-container text-on-primary-container',
      'bg-secondary-container text-on-secondary-container',
      'bg-tertiary-container/40 text-on-tertiary-container',
      'bg-primary-container text-on-primary-container',
      'bg-secondary-container text-on-secondary-container'
    ];
    
    const formattedDays = daysOfWeek.map((dayName, idx) => {
      const dayDate = addDays(monday, idx);
      return {
        day: dayName,
        date: formatDateBr(dayDate),
        focus: 'Foco do Tema a ser definido',
        iconName: icons[idx],
        iconBg: backgrounds[idx],
        activities: [
          { type: 'Atividade 1', text: 'Clique em Editar para preencher esta atividade.' },
          { type: 'Atividade 2', text: 'Clique em Editar para preencher esta atividade.' }
        ]
      };
    });

    return {
      theme: 'Tema da Semana',
      goals: [
        'Objetivo Geral 1 para desenvolver com a turma.',
        'Objetivo Geral 2 focado em coordenação motora ou socialização.',
        'Objetivo Geral 3 alinhado com a BNCC.'
      ],
      days: formattedDays
    };
  };

  // Resetar índice da dica pedagógica de ouro quando o tema mudar
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setCurrentTipIndex(0), 0);
    return () => clearTimeout(timer);
  }, [theme]);

  // Carregar planos quando a semana ou data selecionada mudar
  useEffect(() => {
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekKey = format(monday, 'yyyy-MM-dd');
    
    const loadPlan = () => {
      // 1. Tentar ler do localStorage
      const localSaved = localStorage.getItem(`educakids_plan_${weekKey}`);
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          setTheme(parsed.theme);
          setGoals(parsed.goals);
          setDays(parsed.days);
          return;
        } catch (e) {
          console.error("Erro ao ler do localStorage", e);
        }
      }

      // 2. Se for a semana padrão do mock inicial (16 de Outubro de 2023)
      if (weekKey === '2023-10-16') {
        setTheme('Pequenos Exploradores: Vida no Jardim');
        setGoals([
          'Explorar o conceito de biodiversidade através da observação de insetos no jardim.',
          'Desenvolver habilidades motoras finas usando materiais de colagem texturizados.',
          'Praticar o revezamento colaborativo durante as sessões de música em grupo.'
        ]);
        setDays([
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
        return;
      }

      // 3. Fallback: Criar novo planejamento padrão em branco para a semana
      const defaultPlan = getDefaultPlanForWeek(monday);
      setTheme(defaultPlan.theme);
      setGoals(defaultPlan.goals);
      setDays(defaultPlan.days);
    };
    
    const timer = setTimeout(loadPlan, 0);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  // Sincronizar com o Supabase no primeiro carregamento
  useEffect(() => {
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
          // Detectar a qual semana pertence
          const currentMonday = startOfWeek(selectedDate, { weekStartsOn: 1 });
          const weekKey = format(currentMonday, 'yyyy-MM-dd');
          
          setTheme(data.theme);
          setGoals(data.goals);
          setDays(data.days);

          localStorage.setItem(`educakids_plan_${weekKey}`, JSON.stringify({
            theme: data.theme,
            goals: data.goals,
            days: data.days
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar do Supabase. Usando dados locais.', err);
        setDbError(true);
      }
    };
    loadPlanner();
  }, [supabase]);

  // Salvar plano ativo
  const handleSave = async () => {
    setIsEditing(false);
    setLoading(true);
    
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekKey = format(monday, 'yyyy-MM-dd');
    
    // Salva localmente
    localStorage.setItem(`educakids_plan_${weekKey}`, JSON.stringify({ theme, goals, days }));
    
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

  // Excluir planejamento ativo da semana
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Deseja realmente excluir o planejamento desta semana? Esta ação não pode ser desfeita e os dados locais e na nuvem serão limpos.");
    if (!confirmDelete) return;

    setLoading(true);
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekKey = format(monday, 'yyyy-MM-dd');

    // 1. Remover do localStorage
    localStorage.removeItem(`educakids_plan_${weekKey}`);

    // 2. Resetar estados para o plano padrão da semana
    const defaultPlan = getDefaultPlanForWeek(monday);
    setTheme(defaultPlan.theme);
    setGoals(defaultPlan.goals);
    setDays(defaultPlan.days);

    // 3. Deletar do Supabase se conectado
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('planner_plans')
          .delete()
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.error('Erro ao excluir do Supabase.', err);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Geração por IA (Gemini)
  const handleGenerateWithAI = async (data: { theme: string; ageGroup: string; guidelines: string; weekStart: string }) => {
    if (!data.theme.trim()) {
      setGenerationError("Por favor, insira um tema para o planejamento.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/genai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: data.theme,
          ageGroup: data.ageGroup,
          guidelines: data.guidelines
        })
      });

      if (!response.ok) {
        throw new Error("Falha na chamada de API.");
      }

      const result = await response.json();
      
      const parsedStartDate = new Date(data.weekStart + "T12:00:00");
      const monday = startOfWeek(parsedStartDate, { weekStartsOn: 1 });
      const weekKey = format(monday, 'yyyy-MM-dd');

      const updatedDays = result.days.map((d: any, idx: number) => {
        const dayDate = addDays(monday, idx);
        return { ...d, date: formatDateBr(dayDate) };
      });

      setTheme(result.theme);
      setGoals(result.goals);
      setDays(updatedDays);
      setSelectedDate(monday);
      setCurrentMonth(monday);

      localStorage.setItem(`educakids_plan_${weekKey}`, JSON.stringify({
        theme: result.theme, goals: result.goals, days: updatedDays
      }));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('planner_plans').select('id').eq('user_id', user.id).single();
        if (existing) {
          await supabase.from('planner_plans').update({ theme: result.theme, goals: result.goals, days: updatedDays, updated_at: new Date().toISOString() }).eq('user_id', user.id);
        } else {
          await supabase.from('planner_plans').insert({ user_id: user.id, theme: result.theme, goals: result.goals, days: updatedDays });
        }
      }

      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      setGenerationError("Erro ao gerar planejamento. Tente novamente em instantes.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Criação manual sem IA
  const handleCreateManually = (weekStart: string) => {
    const parsedStartDate = new Date(weekStart + "T12:00:00");
    const monday = startOfWeek(parsedStartDate, { weekStartsOn: 1 });
    const weekKey = format(monday, 'yyyy-MM-dd');

    const manualPlan = getDefaultPlanForWeek(monday);
    setTheme(manualPlan.theme);
    setGoals(manualPlan.goals);
    setDays(manualPlan.days);
    setSelectedDate(monday);
    setCurrentMonth(monday);

    localStorage.setItem(`educakids_plan_${weekKey}`, JSON.stringify(manualPlan));
    
    setIsCreateModalOpen(false);
    setIsEditing(true);
  };

  // Dicas pedagógicas dinâmicas baseadas no tema
  const tips = getTipsForTheme(theme);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  // Mapeamento de ícones do Lucide
  const iconMap: Record<string, React.ComponentType<any>> = {
    Sun: Sun,
    Palette: Palette,
    CloudRain: CloudRain,
    Sparkles: Sparkles,
    Star: Star
  };

  // Lógica do Calendário
  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(startMonth);
  const gridStartDate = startOfWeek(startMonth, { weekStartsOn: 0 }); // Domingo
  const gridEndDate = endOfWeek(endMonth, { weekStartsOn: 0 }); // Sábado
  const gridDays = eachDayOfInterval({ start: gridStartDate, end: gridEndDate });

  const holidays = getHolidays(currentMonth.getFullYear());

  const getHolidayKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Filtrar feriados do mês atual para listagem
  const monthHolidays = Object.entries(holidays)
    .filter(([key]) => {
      const d = parseISO(key);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    })
    .map(([key, name]) => {
      const d = parseISO(key);
      return { date: d, name };
    })
    .sort((a, b) => a.date.getDate() - b.date.getDate());

  // Formatação das datas de início e fim da semana ativa no cabeçalho
  const activeMonday = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const activeFriday = addDays(activeMonday, 4);
  const formattedWeekRange = `${activeMonday.getDate()} de ${monthsLong[activeMonday.getMonth()]} - ${activeFriday.getDate()} de ${monthsLong[activeFriday.getMonth()]}, ${activeMonday.getFullYear()}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 pb-20">
      {dbError && (
        <div className="bg-[#E7F3F1] dark:bg-[#1E2E2A] text-on-surface p-4 rounded-3xl flex items-start gap-3 border border-primary/20">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-primary" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Modo Offline (Sem Sincronização)</h4>
            <p className="text-xs opacity-90 font-medium leading-relaxed">
              Não encontramos as tabelas no seu Supabase. Os seus dados estão sendo salvos localmente. 
              Para sincronizar com a nuvem, execute o arquivo <code className="bg-black/10 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">supabase_setup.sql</code> no SQL Editor do seu Supabase Dashboard!
            </p>
          </div>
        </div>
      )}

      {/* Grid Layout Principal: 8 Colunas (Planner) + 4 Colunas (Calendário) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Detalhes do Planejamento Semanal (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Planejador Semanal</p>
              <h1 className="font-sans font-bold text-3xl text-on-surface">Planejamento</h1>
              <p className="text-on-surface-variant mt-1 font-medium text-sm flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                {formattedWeekRange}
              </p>
            </div>
            
            <div className="flex gap-2.5">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 bg-secondary text-on-secondary font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-md shadow-secondary/10 hover:bg-secondary/90 transition-colors"
              >
                <Plus size={16} />
                Criar Planejamento
              </motion.button>

              {isEditing ? (
                <div className="flex gap-2">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-md shadow-primary/10 disabled:opacity-75"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Salvar
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center justify-center bg-surface-container-high text-on-surface-variant w-11 h-11 rounded-full border border-outline-variant/30"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    disabled={loading}
                    className="inline-flex items-center justify-center bg-error-container text-on-error-container hover:bg-error/20 w-11 h-11 rounded-full border border-outline-variant/30 transition-colors shrink-0"
                    title="Excluir Planejamento"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md shadow-primary/10 hover:bg-primary/90 transition-colors"
                  >
                    <Edit3 size={16} />
                    Editar Plano
                  </motion.button>
                </div>
              )}
            </div>
          </section>

          {/* Seção de Objetivos e Tema da Semana */}
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
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3 font-sans font-bold text-sm text-on-surface focus:ring-2 focus:ring-tertiary/50 outline-none"
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

          {/* Atividades da Semana (Scroll Horizontal) */}
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
                        <p className="text-xs text-on-surface-variant font-bold">{wd.date}</p>
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
                        <p className="font-bold text-on-surface leading-tight text-sm">{wd.focus}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                        <Star size={10} /> Atividades
                      </p>
                      {wd.activities && wd.activities.map((a: any, j: number) => (
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

                    {!isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/activities?theme=${encodeURIComponent(wd.focus)}&type=${encodeURIComponent(wd.activities?.[0]?.type || '')}`)}
                        className="w-full mt-2 inline-flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-black text-[10px] uppercase tracking-wider px-3 py-2.5 rounded-xl border border-primary/20 transition-all"
                      >
                        <Sparkles size={12} />
                        Gerar Folha com IA
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Dica do Dia */}
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

        {/* Lado Direito: Calendário Interativo e Feriados Brasileiros (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="w-full flex items-center justify-between bg-surface-container border border-outline-variant rounded-3xl p-4 shadow-sm"
            >
              <span className="font-sans font-bold text-sm text-on-surface flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                {monthsLong[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <motion.div
                animate={{ rotate: isCalendarOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} className="text-on-surface-variant" />
              </motion.div>
            </button>
          </div>
          <div className={isCalendarOpen ? 'block' : 'hidden lg:block'}>
            <div className="bg-surface-container border border-outline-variant rounded-3xl p-5 shadow-sm space-y-4">
              
              {/* Header do Calendário: Navegador de Meses */}
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/50">
                <span className="font-sans font-bold text-sm text-on-surface capitalize">
                  {monthsLong[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-all border border-outline-variant/30 text-on-surface"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-all border border-outline-variant/30 text-on-surface"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Dias da Semana (D, S, T, Q...) */}
              <div className="grid grid-cols-7 text-center">
                {weekdays.map((d, i) => (
                  <span key={i} className="text-[10px] font-black text-on-surface-variant/70 uppercase py-1">
                    {d}
                  </span>
                ))}
              </div>

              {/* Grade dos Dias */}
              <div className="grid grid-cols-7 gap-1">
                {gridDays.map((day, idx) => {
                  const isCurrentMonthDay = isSameMonth(day, currentMonth);
                  const holidayName = holidays[getHolidayKey(day)];
                  const isSelectedWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
                  const isDayWeekStart = startOfWeek(day, { weekStartsOn: 1 });
                  const isInSelectedWeek = isSameDay(isSelectedWeekStart, isDayWeekStart);
                  const isDayToday = isToday(day);

                  let dayStyles = "h-8 w-full flex items-center justify-center rounded-lg text-xs transition-all relative font-medium ";
                  
                  if (isSameDay(selectedDate, day)) {
                    dayStyles += "bg-primary text-on-primary font-black shadow-sm z-10 scale-105 ";
                  } else if (isInSelectedWeek) {
                    dayStyles += "bg-primary/10 text-primary font-bold ";
                  } else if (isCurrentMonthDay) {
                    dayStyles += "text-on-surface hover:bg-surface-container-high cursor-pointer ";
                  } else {
                    dayStyles += "text-on-surface/30 hover:bg-surface-container-high/40 cursor-pointer ";
                  }

                  if (isDayToday && !isSameDay(selectedDate, day)) {
                    dayStyles += "border border-primary/50 ";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        setSelectedDate(day);
                        if (!isSameMonth(day, currentMonth)) {
                          setCurrentMonth(day);
                        }
                        if (holidayName) {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setHolidayTooltip({
                            date: day,
                            name: holidayName,
                            x: rect.left + rect.width / 2,
                            y: rect.bottom + 4,
                          });
                          setTimeout(() => setHolidayTooltip(null), 4000);
                        }
                      }}
                      className={dayStyles}
                    >
                      <span>{day.getDate()}</span>
                      
                      {holidayName && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-error" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Holiday Tooltip */}
              <AnimatePresence>
                {holidayTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-3 shadow-xl"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{holidayTooltip.name}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {holidayTooltip.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-[9px] text-primary font-medium mt-1 italic">
                          Sugestão: Aproveite a data para atividades temáticas e contação de histórias relacionadas ao feriado.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista de Feriados do Mês Corrente */}
              {monthHolidays.length > 0 && (
                <div className="mt-4 pt-4 border-t border-outline-variant/50 space-y-2">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                    Feriados de {monthsLong[currentMonth.getMonth()]}
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {monthHolidays.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-on-surface font-semibold bg-surface-container-low p-2 rounded-xl border border-outline-variant/20">
                        <span className="w-5 h-5 flex items-center justify-center bg-error/10 text-error text-[10px] font-black rounded-full shrink-0">
                          {h.date.getDate()}
                        </span>
                        <span className="truncate flex-1" title={h.name}>{h.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreatePlannerModal
        isOpen={isCreateModalOpen}
        isGenerating={isGenerating}
        error={generationError}
        onGenerate={handleGenerateWithAI}
        onManual={handleCreateManually}
        onClose={() => !isGenerating && setIsCreateModalOpen(false)}
      />
    </div>
  );
}
