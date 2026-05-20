'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ClipboardList, 
  Smile, 
  Meh, 
  Frown, 
  Plus, 
  Check, 
  Edit2, 
  Package, 
  X, 
  AlertCircle, 
  Tag, 
  Award,
  Heart,
  HelpCircle,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Pencil,
  Phone
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// Configurações de avatares pedagógicos suportados
const AVATAR_MAP: Record<string, { emoji: string; label: string; bg: string }> = {
  lion: { emoji: '🦁', label: 'Leãozinho', bg: 'bg-[#FFEBCD] dark:bg-[#5E4E3C]' },
  panda: { emoji: '🐼', label: 'Pandinha', bg: 'bg-[#F5F5F5] dark:bg-[#3C4A52]' },
  fox: { emoji: '🦊', label: 'Raposinha', bg: 'bg-[#FFE0B2] dark:bg-[#6E4228]' },
  koala: { emoji: '🐨', label: 'Coala', bg: 'bg-[#ECEFF1] dark:bg-[#3A454B]' },
  rabbit: { emoji: '🐰', label: 'Coelhinho', bg: 'bg-[#FCE4EC] dark:bg-[#5D3A4B]' },
  bear: { emoji: '🐻', label: 'Ursinho', bg: 'bg-[#D7CCC8] dark:bg-[#4E3D35]' }
};

const PREDEFINED_TAGS = [
  'Apetite OK',
  'Dorme Fácil',
  'Participativo',
  'Agitado',
  'Febre/Alerta',
  'Estimulado',
  'Sociável',
  'Concentrado',
  'Mamadeira OK',
  'Fralda Trocada'
];

export default function ClassroomPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('comportamento');
  const [activeClass, setActiveClass] = useState('Berçário A');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);
  
  // States para novos cadastros
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Berçário A');
  const [newStudentAvatar, setNewStudentAvatar] = useState('lion');
  const [newStudentAge, setNewStudentAge] = useState('');
  const [newStudentParentName, setNewStudentParentName] = useState('');
  const [newStudentEmergencyContact, setNewStudentEmergencyContact] = useState('');
  
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyCategory, setNewSupplyCategory] = useState('Papelaria & Escrita');
  
  // Modais de Edição Rápida
  const [selectedStudentForAvatar, setSelectedStudentForAvatar] = useState<string | null>(null);
  const [selectedStudentForTags, setSelectedStudentForTags] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  
  // Modal de Edição de Dados do Aluno
  const [editingStudent, setEditingStudent] = useState<{ id: string; name: string; class: string; avatar: string; age: string; parentName: string; emergencyContact: string } | null>(null);

  const [dbError, setDbError] = useState(false);

  // Lista de estudantes
  const [students, setStudents] = useState<any[]>([]);

  // Lista de suprimentos com categorias expandidas (lazy init from localStorage)
  const [supplies, setSupplies] = useState<{ category: string; items: { name: string; val: string; status: string }[] }[]>(() => {
    if (typeof window !== 'undefined') {
      const localSaved = localStorage.getItem('educakids_supplies');
      if (localSaved) {
        try { return JSON.parse(localSaved); } catch (e) { console.error(e); }
      }
    }
    return [
      { 
        category: 'Papelaria & Escrita', 
        items: [
          { name: 'Canetinhas Laváveis', val: 'Estoque OK', status: 'ok' },
          { name: 'Bastões de Cola', val: 'Verificado', status: 'completed' },
          { name: 'Tesouras Sem Ponta', val: 'Estoque Baixo', status: 'low' },
          { name: 'Papel Sulfite A4', val: 'Estoque OK', status: 'ok' },
        ]
      },
      { 
        category: 'Artes & Colagem', 
        items: [
          { name: 'Tintas Guache 6 Cores', val: 'Estoque OK', status: 'ok' },
          { name: 'Papel Cartão Colorido', val: 'Estoque Baixo', status: 'low' },
          { name: 'Cola com Glitter', val: 'Verificado', status: 'completed' },
          { name: 'Massinha de Modelar', val: 'Falta Reposição', status: 'empty' },
        ]
      },
      { 
        category: 'Higiene & Limpeza', 
        items: [
          { name: 'Lenços Umedecidos', val: 'Estoque OK', status: 'ok' },
          { name: 'Sabonete Líquido Infantil', val: 'Estoque Baixo', status: 'low' },
          { name: 'Álcool em Gel 70%', val: 'Verificado', status: 'completed' },
        ]
      }
    ];
  });

  // Carregar dados de estudantes (Supabase e local)
  useEffect(() => {
    const loadStudents = async () => {
      let loadedStudents = null;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('classroom_students')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            loadedStudents = data.map(s => ({
              id: s.id,
              name: s.name,
              class: s.class_name,
              behavior: s.behavior,
              notes: s.notes,
              tags: s.tags || [],
              color: s.color
            }));
          }
        }
      } catch (err) {
        console.error('Erro ao buscar alunos do Supabase. Usando dados locais.', err);
        setDbError(true);
      }

      if (!loadedStudents) {
        const localSaved = localStorage.getItem('educakids_students');
        if (localSaved) {
          try {
            loadedStudents = JSON.parse(localSaved);
          } catch (e) {
            console.error("Erro ao ler do localStorage", e);
          }
        }
      }

      if (loadedStudents) {
        setStudents(loadedStudents);
      } else {
        const defaultStudents = [
          { id: 'LB', name: 'Liam Bennett', class: 'Berçário A', behavior: 'smile', notes: 'Muita Energia', color: 'bg-[#FFEBCD] dark:bg-[#5E4E3C]', tags: ['Sabe Compartilhar', 'avatar:lion'], age: '2 anos', parentName: 'Maria Bennett', emergencyContact: '(11) 99999-1234' },
          { id: 'SC', name: 'Sophia Chen', class: 'Berçário A', behavior: 'meh', notes: 'Dormiu por 45 min. Um pouco quieta hoje.', color: 'bg-[#F5F5F5] dark:bg-[#3C4A52]', tags: ['Pouco Apetite', 'avatar:panda'], age: '1 ano e 8 meses', parentName: 'Wei Chen', emergencyContact: '(11) 98888-5678' },
          { id: 'OW', name: 'Oliver White', class: 'Berçário A', behavior: 'smile', notes: 'Ajudou muito durante a arrumação!', color: 'bg-[#FFE0B2] dark:bg-[#6E4228]', tags: ['Prestativo', 'Sociável', 'avatar:fox'], age: '2 anos e 3 meses', parentName: 'Laura White', emergencyContact: '(11) 97777-9012' },
          { id: 'AM', name: 'Ava Martinez', class: 'Berçário A', behavior: 'smile', notes: '', color: 'bg-[#ECEFF1] dark:bg-[#3A454B]', tags: ['Dormindo', 'avatar:koala'], age: '1 ano e 10 meses', parentName: 'Carlos Martinez', emergencyContact: '(21) 96666-3456' },
          
          { id: 'LS', name: 'Lucas Souza', class: 'Maternal B', behavior: 'smile', notes: 'Adora desenhar e pintar.', color: 'bg-[#D7CCC8] dark:bg-[#4E3D35]', tags: ['Super Criativo', 'avatar:bear'], age: '3 anos', parentName: 'Ana Souza', emergencyContact: '(11) 95555-7890' },
          { id: 'BL', name: 'Beatriz Lima', class: 'Maternal B', behavior: 'smile', notes: 'Participou ativamente das brincadeiras de roda.', color: 'bg-[#FCE4EC] dark:bg-[#5D3A4B]', tags: ['Comunicação OK', 'avatar:rabbit'], age: '3 anos e 5 meses', parentName: 'Fernanda Lima', emergencyContact: '(21) 94444-1234' },
          
          { id: 'EO', name: 'Enzo Oliveira', class: 'Infantil I', behavior: 'meh', notes: 'Agitado hoje pela manhã.', color: 'bg-[#FFE0B2] dark:bg-[#6E4228]', tags: ['Foco Reduzido', 'avatar:lion'], age: '4 anos', parentName: 'Roberto Oliveira', emergencyContact: '(11) 93333-5678' },
          { id: 'AC', name: 'Alice Costa', class: 'Infantil I', behavior: 'smile', notes: 'Comeu todo o lanche sozinho.', color: 'bg-[#ECEFF1] dark:bg-[#3A454B]', tags: ['Apetite OK', 'avatar:koala'], age: '4 anos e 2 meses', parentName: 'Juliana Costa', emergencyContact: '(31) 92222-9012' },
        ];
        setStudents(defaultStudents);
        localStorage.setItem('educakids_students', JSON.stringify(defaultStudents));
      }
    };

    loadStudents();
  }, [supabase]);

  // Sincronizador com Supabase (Estudantes)
  const syncStudentToDb = async (student: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('classroom_students')
        .upsert({
          id: student.id,
          user_id: user.id,
          name: student.name,
          class_name: student.class,
          behavior: student.behavior,
          notes: student.notes || '',
          tags: student.tags || [],
          color: student.color
        });

      if (error) throw error;
    } catch (err) {
      console.error('Erro de sincronização:', err);
      setDbError(true);
    }
  };

  // Alterar humor/comportamento
  const toggleBehavior = async (id: string, behavior: 'smile' | 'meh' | 'sad') => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, behavior } : s);
      const student = updated.find(s => s.id === id);
      if (student) {
        syncStudentToDb(student);
      }
      localStorage.setItem('educakids_students', JSON.stringify(updated));
      return updated;
    });
  };

  // Alterar chamada/presença do aluno (se ausente, humor vira 'absent')
  const togglePresence = async (id: string) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        const newBehavior = s.behavior === 'absent' ? 'smile' : 'absent';
        return { ...s, behavior: newBehavior };
      });
      const student = updated.find(s => s.id === id);
      if (student) {
        syncStudentToDb(student);
      }
      localStorage.setItem('educakids_students', JSON.stringify(updated));
      return updated;
    });
  };

  // Alterar notas diárias
  const handleUpdateNotes = (id: string, notes: string) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, notes } : s);
      localStorage.setItem('educakids_students', JSON.stringify(updated));
      return updated;
    });
  };

  // Salvar notas ao perder o foco (blur)
  const handleNotesBlur = async (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      await syncStudentToDb(student);
    }
  };

  // Deletar aluno
  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este aluno de seus registros?")) return;

    setStudents(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('educakids_students', JSON.stringify(updated));
      return updated;
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('classroom_students')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Adicionar Aluno Novo
  const handleAddStudentSubmit = async () => {
    if (!newStudentName.trim()) return;

    const names = newStudentName.trim().split(' ');
    let id = '';
    if (names.length > 1) {
      id = `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    } else {
      id = names[0].substring(0, 2).toUpperCase();
    }
    
    // Evitar ID duplicado
    let suffix = 1;
    let finalId = id;
    while (students.some(s => s.id === finalId)) {
      finalId = `${id}${suffix}`;
      suffix++;
    }

    const selectedAvatarObj = AVATAR_MAP[newStudentAvatar] || AVATAR_MAP.lion;

    const newStudent = {
      id: finalId,
      name: newStudentName.trim(),
      class: newStudentClass,
      behavior: 'smile',
      notes: '',
      color: selectedAvatarObj.bg,
      tags: [`avatar:${newStudentAvatar}`],
      age: newStudentAge.trim() || '',
      parentName: newStudentParentName.trim() || '',
      emergencyContact: newStudentEmergencyContact.trim() || ''
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('educakids_students', JSON.stringify(updated));
    await syncStudentToDb(newStudent);

    // Resetar estados
    setNewStudentName('');
    setNewStudentAge('');
    setNewStudentParentName('');
    setNewStudentEmergencyContact('');
    setIsAddStudentOpen(false);
  };

  // Trocar avatar de animal
  const handleSelectAvatar = (studentId: string, avatarKey: string) => {
    const selectedAvatarObj = AVATAR_MAP[avatarKey] || AVATAR_MAP.lion;
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== studentId) return s;
        const cleanTags = s.tags.filter((t: string) => !t.startsWith('avatar:'));
        const updatedStudent = {
          ...s,
          color: selectedAvatarObj.bg,
          tags: [...cleanTags, `avatar:${avatarKey}`]
        };
        syncStudentToDb(updatedStudent);
        return updatedStudent;
      });
      localStorage.setItem('educakids_students', JSON.stringify(updated));
      return updated;
    });
    setSelectedStudentForAvatar(null);
  };

  // Adicionar / Remover Tags
  const handleToggleTag = (studentId: string, tag: string) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== studentId) return s;
        const hasTag = s.tags.includes(tag);
        const newTags = hasTag ? s.tags.filter((t: string) => t !== tag) : [...s.tags, tag];
        const updatedStudent = { ...s, tags: newTags };
        syncStudentToDb(updatedStudent);
        return updatedStudent;
      });
      localStorage.setItem('educakids_students', JSON.stringify(updated));
      return updated;
    });
  };

  // Adicionar tag personalizada escrita
  const handleAddCustomTag = () => {
    if (!customTagInput.trim() || !selectedStudentForTags) return;
    const cleanTag = customTagInput.trim();
    handleToggleTag(selectedStudentForTags, cleanTag);
    setCustomTagInput('');
  };

  // Sincronizar e salvar checklist de suprimentos
  const toggleSupplyItem = (catIndex: number, itemIndex: number) => {
    setSupplies(prev => {
      const next = [...prev];
      const item = next[catIndex].items[itemIndex];
      if (item.status === 'completed') {
        item.status = 'ok';
        item.val = 'Estoque OK';
      } else {
        item.status = 'completed';
        item.val = 'Verificado';
      }
      localStorage.setItem('educakids_supplies', JSON.stringify(next));
      return next;
    });
  };

  // Ciclar status do suprimento (ok -> low -> empty -> ok)
  const cycleSupplyStatus = (catIndex: number, itemIndex: number) => {
    setSupplies(prev => {
      const next = [...prev];
      const item = next[catIndex].items[itemIndex];
      
      if (item.status === 'completed') return next;

      if (item.status === 'ok') {
        item.status = 'low';
        item.val = 'Estoque Baixo';
      } else if (item.status === 'low') {
        item.status = 'empty';
        item.val = 'Falta Reposição';
      } else {
        item.status = 'ok';
        item.val = 'Estoque OK';
      }

      localStorage.setItem('educakids_supplies', JSON.stringify(next));
      return next;
    });
  };

  // Adicionar item de estoque
  const handleAddSupplySubmit = () => {
    if (!newSupplyName.trim()) return;

    setSupplies(prev => {
      const next = [...prev];
      let cat = next.find(c => c.category === newSupplyCategory);
      if (!cat) {
        cat = { category: newSupplyCategory, items: [] };
        next.push(cat);
      }
      cat.items.push({
        name: newSupplyName.trim(),
        val: 'Estoque OK',
        status: 'ok'
      });
      localStorage.setItem('educakids_supplies', JSON.stringify(next));
      return next;
    });

    setNewSupplyName('');
    setIsAddSupplyOpen(false);
  };

  // Salvar edições de dados do aluno (nome, turma, idade, responsável, contato)
  const handleSaveEditStudent = async () => {
    if (!editingStudent || !editingStudent.name.trim()) return;
    const { id, name, class: cls, avatar, age, parentName, emergencyContact } = editingStudent;
    const selectedAvatarObj = AVATAR_MAP[avatar] || AVATAR_MAP.lion;

    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        const cleanTags = s.tags.filter((t: string) => !t.startsWith('avatar:'));
        const updatedStudent = {
          ...s,
          name: name.trim(),
          class: cls,
          color: selectedAvatarObj.bg,
          tags: [...cleanTags, `avatar:${avatar}`],
          age: age || '',
          parentName: parentName || '',
          emergencyContact: emergencyContact || ''
        };
        syncStudentToDb(updatedStudent);
        return updatedStudent;
      });
      localStorage.setItem('educakids_students', JSON.stringify(updated));
      return updated;
    });
    setEditingStudent(null);
  };

  // Auxiliares para extrair avatar e tags limpas de alunos
  const getAvatarKey = (tags: string[]) => {
    const avatarTag = tags.find(t => t.startsWith('avatar:'));
    return avatarTag ? avatarTag.split(':')[1] : 'lion';
  };

  const getCleanTags = (tags: string[]) => {
    return tags.filter(t => !t.startsWith('avatar:'));
  };

  // Cálculos das estatísticas de presença, humor e suprimentos da turma ativa
  const classStudents = students.filter(s => s.class === activeClass);
  const totalStudentsCount = classStudents.length;
  const presentStudents = classStudents.filter(s => s.behavior !== 'absent');
  const presentCount = presentStudents.length;
  
  // Percentual de Presença
  const presencePercentage = totalStudentsCount > 0 ? Math.round((presentCount / totalStudentsCount) * 100) : 0;
  
  // Clima Emocional (% de sorrisos em relação aos presentes)
  const happyCount = presentStudents.filter(s => s.behavior === 'smile').length;
  const emotionalPercentage = presentCount > 0 ? Math.round((happyCount / presentCount) * 100) : 100;
  
  // Suprimentos Críticos (Contagem)
  const criticalSuppliesCount = supplies.reduce(
    (acc, cat) => acc + cat.items.filter(i => i.status === 'low' || i.status === 'empty').length, 
    0
  );
  const totalSuppliesCount = supplies.reduce((acc, cat) => acc + cat.items.length, 0);
  const verifiedSuppliesCount = supplies.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'completed').length, 0);
  const suppliesVerifiedPercentage = totalSuppliesCount > 0 ? Math.round((verifiedSuppliesCount / totalSuppliesCount) * 100) : 0;

  // Frase descritiva do humor geral
  const getHumorMessage = (pct: number) => {
    if (presentCount === 0) return "Sem alunos presentes hoje.";
    if (pct === 100) return "Todo mundo sorrindo! Dia maravilhoso! ☀️";
    if (pct >= 75) return "Clima alegre e super participativo! 🌤️";
    if (pct >= 50) return "Dia produtivo, com algumas calmas. ⛅";
    return "Turma agitada ou dengosa hoje. 🌧️";
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-20">
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

      {/* Título Principal */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-sans font-bold text-3xl text-on-surface">Visão Geral da Sala</h2>
          <p className="text-on-surface-variant mt-1 text-sm font-medium">Controle a frequência diária, acompanhe o humor dos pequenos e monitore materiais de arte e escrita.</p>
        </div>
        
        {/* Alternador de Abas */}
        <div className="flex p-1 bg-surface-container rounded-full shadow-inner border border-outline-variant/20 self-start md:self-auto">
          <button 
            onClick={() => setActiveTab('comportamento')}
            className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'comportamento' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Diário e Presença
          </button>
          <button 
            onClick={() => setActiveTab('inventario')}
            className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'inventario' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Estoque de Suprimentos
          </button>
        </div>
      </section>

      {/* Grid de Cards de Estatísticas e Visões Gerais */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Clima Emocional (Humor) */}
        <div className="bg-secondary-container/20 border border-secondary-container/40 p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Smile size={20} className="fill-current/10" />
            </div>
            <div>
              <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Clima da Sala</span>
              <h3 className="font-sans font-bold text-xl text-on-secondary-container">{emotionalPercentage}% Alegre</h3>
            </div>
          </div>
          <div className="mt-5 space-y-1">
            <p className="text-xs text-on-surface font-semibold">{getHumorMessage(emotionalPercentage)}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">calculado a partir dos presentes ativos no dia</p>
          </div>
        </div>

        {/* Card 2: Frequência Diária (Chamada) */}
        <div className="bg-primary-container/20 border border-primary-container/40 p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Presença Diária</span>
              <h3 className="font-sans font-bold text-xl text-on-primary-container">{presentCount} / {totalStudentsCount} Presentes</h3>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden shadow-inner">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${presencePercentage}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-semibold">
              <span>{presencePercentage}% de comparência</span>
              <span>Turma: {activeClass}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Status de Estoque */}
        <div className="bg-tertiary-container/10 border border-tertiary-container/30 p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-tertiary-container/30 flex items-center justify-center text-on-tertiary-container">
              <Package size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-tertiary uppercase tracking-widest">Suprimentos Críticos</span>
              <h3 className="font-sans font-bold text-xl text-on-tertiary-container">{criticalSuppliesCount} em Alerta</h3>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden shadow-inner">
              <div 
                className="bg-tertiary h-full rounded-full transition-all duration-500" 
                style={{ width: `${suppliesVerifiedPercentage}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-semibold">
              <span>{suppliesVerifiedPercentage}% verificados no checklist</span>
              <button 
                onClick={() => setActiveTab('inventario')}
                className="text-primary hover:underline hover:opacity-85 font-black uppercase"
              >
                Ver Estoque
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo das Abas */}
      <AnimatePresence mode="wait">
        {activeTab === 'comportamento' ? (
          <motion.div 
            key="comportamento"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filtro de Turma e Botão Novo Aluno */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-2 p-1 bg-surface-container-low border border-outline-variant/30 rounded-2xl w-fit">
                {['Berçário A', 'Maternal B', 'Infantil I'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveClass(c)}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      activeClass === c 
                        ? 'bg-surface-container-highest text-primary shadow-sm font-black' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddStudentOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-md hover:bg-primary/95 transition-colors self-start sm:self-auto"
              >
                <Plus size={16} />
                Adicionar Aluno
              </motion.button>
            </div>

            {/* Lista de Cartões de Estudantes */}
            {classStudents.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-3xl space-y-3">
                <Users className="mx-auto text-on-surface-variant/45" size={40} />
                <div>
                  <h4 className="font-bold text-on-surface text-base">Nenhum aluno cadastrado</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">Clique em &ldquo;Adicionar Aluno&rdquo; acima para cadastrar a primeira criança na turma {activeClass}.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classStudents.map((s) => {
                  const avatarKey = getAvatarKey(s.tags);
                  const avatarObj = AVATAR_MAP[avatarKey] || AVATAR_MAP.lion;
                  const cleanTags = getCleanTags(s.tags);
                  const isPresent = s.behavior !== 'absent';

                  return (
                    <motion.div 
                      key={s.id}
                      whileHover={{ y: -2 }}
                      className={`bg-surface-container-lowest border p-5 rounded-3xl shadow-sm flex flex-col gap-4 relative transition-all duration-300 ${
                        isPresent ? 'border-outline-variant/30 opacity-100' : 'border-outline-variant/15 opacity-60 bg-surface-container-low/20'
                      }`}
                    >
                      {/* Botões de ação (Deletar + Editar) no canto superior */}
                      <div className="absolute top-4 right-4 flex gap-1.5">
                        <button 
                          onClick={() => setEditingStudent({ id: s.id, name: s.name, class: s.class, avatar: getAvatarKey(s.tags), age: s.age || '', parentName: s.parentName || '', emergencyContact: s.emergencyContact || '' })}
                          className="w-7 h-7 flex items-center justify-center bg-surface-container hover:bg-primary hover:text-on-primary rounded-full text-on-surface-variant/65 transition-colors shadow-sm"
                          title="Editar dados do aluno"
                        >
                          <Pencil size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(s.id)}
                          className="w-7 h-7 flex items-center justify-center bg-surface-container hover:bg-error-container hover:text-on-error-container rounded-full text-on-surface-variant/65 transition-colors shadow-sm"
                          title="Remover Aluno"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Header do Aluno: Avatar + Nome + Chamada */}
                      <div className="flex justify-between items-start pr-20">
                        <div className="flex items-center gap-4">
                          {/* Bloco de Avatar Interativo */}
                          <div 
                            onClick={() => setSelectedStudentForAvatar(s.id)}
                            className={`w-14 h-14 rounded-2xl ${avatarObj.bg} flex items-center justify-center text-3xl shadow-sm cursor-pointer hover:scale-105 transition-transform relative group/avatar`}
                            title="Alterar Animal Avatar"
                          >
                            <span>{avatarObj.emoji}</span>
                            <span className="absolute inset-0 bg-black/40 text-white rounded-2xl text-[9px] font-black uppercase flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                              Mudar
                            </span>
                          </div>
                          <div>
                            <h3 className="font-sans font-bold text-lg text-on-surface leading-tight">
                              {s.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="bg-secondary-fixed text-on-secondary-fixed px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">{s.class}</span>
                              {s.age && <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded-full">🎂 {s.age}</span>}
                              <span className="text-[10px] font-bold text-outline">ID: {s.id}</span>
                            </div>
                            {(s.parentName || s.emergencyContact) && (
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                {s.parentName && (
                                  <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                                    <Users size={10} className="shrink-0" />
                                    {s.parentName}
                                  </span>
                                )}
                                {s.emergencyContact && (
                                  <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                                    <Phone size={10} className="shrink-0" />
                                    {s.emergencyContact}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Switch de Chamada/Presença */}
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => togglePresence(s.id)}
                            className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
                              isPresent 
                                ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 dark:bg-primary/20 dark:border-primary/40' 
                                : 'bg-surface-container-high text-on-surface-variant/50 border border-outline-variant/30 hover:bg-surface-container-highest'
                            }`}
                          >
                            {isPresent ? '👋 Presente' : '💤 Ausente'}
                          </button>
                        </div>
                      </div>

                      {/* Seleção de Humor/Humor Diário */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Diário de Humor</label>
                        {isPresent ? (
                          <div className="grid grid-cols-3 gap-2">
                            {/* Alegre */}
                            <button
                              onClick={() => toggleBehavior(s.id, 'smile')}
                              className={`py-2 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all shadow-sm ${
                                s.behavior === 'smile' 
                                  ? 'bg-success/15 text-success border-success/40 scale-[1.02] dark:bg-success/20 dark:border-success/30' 
                                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 opacity-70 hover:opacity-100 hover:bg-surface-container'
                              }`}
                            >
                              <Smile size={16} />
                              Alegre
                            </button>
                            {/* Calmo / Neutro */}
                            <button
                              onClick={() => toggleBehavior(s.id, 'meh')}
                              className={`py-2 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all shadow-sm ${
                                s.behavior === 'meh' 
                                  ? 'bg-secondary/15 text-secondary border-secondary/30 scale-[1.02] dark:bg-secondary/20 dark:border-secondary/25' 
                                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 opacity-70 hover:opacity-100 hover:bg-surface-container'
                              }`}
                            >
                              <Meh size={16} />
                              Calmo
                            </button>
                            {/* Choroso / Agitado */}
                            <button
                              onClick={() => toggleBehavior(s.id, 'sad')}
                              className={`py-2 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all shadow-sm ${
                                s.behavior === 'sad' 
                                  ? 'bg-error/15 text-error border-error/30 scale-[1.02] dark:bg-error/20 dark:border-error/25' 
                                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 opacity-70 hover:opacity-100 hover:bg-surface-container'
                              }`}
                            >
                              <Frown size={16} />
                              Dengoso
                            </button>
                          </div>
                        ) : (
                          <div className="bg-surface-container-low/40 rounded-2xl py-3 px-4 text-center border border-outline-variant/20 text-xs font-semibold text-on-surface-variant/50 flex items-center justify-center gap-2">
                            <AlertCircle size={14} />
                            Aluno ausente. Atividades e humor desabilitados.
                          </div>
                        )}
                      </div>

                      {/* Campo de Notas Diárias */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">NOTAS DIÁRIAS</label>
                        <textarea 
                          value={s.notes}
                          disabled={!isPresent}
                          onChange={(e) => handleUpdateNotes(s.id, e.target.value)}
                          onBlur={() => handleNotesBlur(s.id)}
                          className="w-full bg-surface-container-low border-none rounded-2xl p-4 font-medium text-xs text-on-surface focus:ring-2 focus:ring-primary/20 resize-none min-h-[85px] outline-none disabled:bg-surface-container-low/20 disabled:opacity-40" 
                          placeholder={isPresent ? "Escreva atualizações de comportamento, sono, mamadeira..." : "Registro de notas desabilitado."}
                        />
                      </div>

                      {/* Tags Pedagógicas */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Tags Pedagógicas</label>
                        <div className="flex flex-wrap gap-2 items-center">
                          {cleanTags.map(tag => (
                            <span 
                              key={tag} 
                              onClick={() => handleToggleTag(s.id, tag)}
                              className="px-3.5 py-1 bg-primary-container/20 text-primary border border-primary/20 hover:bg-error-container hover:text-error hover:border-error/30 cursor-pointer rounded-full text-[10px] font-bold uppercase transition-all shadow-sm group/tag"
                              title="Clique para excluir esta tag"
                            >
                              <span className="group-hover/tag:hidden">{tag}</span>
                              <span className="hidden group-hover/tag:inline flex items-center gap-1">Remover ×</span>
                            </span>
                          ))}
                          
                          {/* Botão de adicionar tag */}
                          <button
                            onClick={() => setSelectedStudentForTags(s.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/40 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm"
                          >
                            <Plus size={10} /> Tag
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.section 
            key="inventario"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Controles de Busca / Cadastro no Estoque */}
            <div className="flex justify-between items-center gap-4">
              <p className="text-sm font-semibold text-on-surface-variant">Sinalize o estado de conservação e quantidade clicando no badge circular de status.</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddSupplyOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-md hover:bg-primary/95 transition-colors shrink-0"
              >
                <Plus size={16} />
                Adicionar Item
              </motion.button>
            </div>

            {/* Listagem das Categorias de Estoque */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {supplies.map((cat, i) => (
                <div 
                  key={cat.category}
                  className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant/40">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        {i === 0 ? <Edit2 size={16} /> : i === 1 ? <Award size={16} /> : <Heart size={16} />}
                      </div>
                      <h4 className="font-sans font-bold text-lg text-on-surface leading-tight">{cat.category}</h4>
                    </div>

                    <ul className="space-y-3.5">
                      {cat.items.map((item, j) => {
                        const isVerified = item.status === 'completed';

                        return (
                          <li 
                            key={item.name}
                            className={`flex items-center justify-between gap-3 p-3.5 bg-surface-container-low/40 rounded-2xl border transition-all ${
                              isVerified ? 'border-primary/10 opacity-70 bg-primary/5' : 'border-outline-variant/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Checkbox de Verificado */}
                              <button 
                                onClick={() => toggleSupplyItem(i, j)}
                                className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isVerified ? 'bg-primary border-primary' : 'border-outline-variant hover:border-primary/60'
                                }`}
                              >
                                {isVerified && <Check size={12} className="text-on-primary font-black" />}
                              </button>
                              
                              <span className={`font-semibold text-xs leading-normal ${
                                isVerified ? 'text-on-surface-variant line-through opacity-65' : 'text-on-surface'
                              }`}>
                                {item.name}
                              </span>
                            </div>

                            {/* Badge Clicável de Ciclagem de Status */}
                            <button
                              onClick={() => cycleSupplyStatus(i, j)}
                              disabled={isVerified}
                              className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm select-none transition-all ${
                                isVerified 
                                  ? 'bg-primary-container/20 text-primary cursor-not-allowed'
                                  : item.status === 'ok' 
                                    ? 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/20'
                                    : item.status === 'low'
                                      ? 'bg-warning-container text-on-warning-container border border-warning/20 hover:scale-105'
                                      : 'bg-error-container text-on-error-container border border-error/20 hover:scale-105'
                              }`}
                              title={isVerified ? "Item verificado" : "Clique para alterar estado do estoque"}
                            >
                              {item.status === 'ok' ? 'Estoque OK' : item.status === 'low' ? 'Pouco Estoque' : item.status === 'empty' ? 'Repor!' : 'Verificado'}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ========================================================
          MODAIS E DIÁLOGOS FLUTUANTES (ANIMAÇÕES)
          ======================================================== */}
      
      {/* 1. Modal: Selecionar Avatar */}
      <AnimatePresence>
        {selectedStudentForAvatar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md max-h-[90vh] border border-outline-variant/30 shadow-2xl space-y-5 flex flex-col"
            >
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40 shrink-0">
                <h3 className="font-sans font-bold text-lg text-on-surface">Selecione o Avatar de Animal</h3>
                <button 
                  onClick={() => setSelectedStudentForAvatar(null)}
                  className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {Object.entries(AVATAR_MAP).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectAvatar(selectedStudentForAvatar, key)}
                    className={`p-4 rounded-2xl border border-outline-variant/20 hover:border-primary flex flex-col items-center justify-center gap-2 hover:scale-[1.05] transition-all ${item.bg}`}
                  >
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal: Editar Tags Pedagógicas */}
      <AnimatePresence>
        {selectedStudentForTags && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md border border-outline-variant/30 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
                <div>
                  <h3 className="font-sans font-bold text-lg text-on-surface">Gerenciar Tags Pedagógicas</h3>
                  <p className="text-[10px] text-outline font-black uppercase mt-0.5">Aluno: {students.find(s => s.id === selectedStudentForTags)?.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedStudentForTags(null)}
                  className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tags Padrões Disponíveis */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-outline uppercase tracking-wider">Sugestões de Rotina</span>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map(tag => {
                    const student = students.find(s => s.id === selectedStudentForTags);
                    const isActive = student?.tags.includes(tag);

                    return (
                      <button
                        key={tag}
                        onClick={() => handleToggleTag(selectedStudentForTags, tag)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm ${
                          isActive 
                            ? 'bg-primary text-on-primary font-black scale-105' 
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {tag} {isActive ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Personalizada */}
              <div className="space-y-2 border-t border-outline-variant/40 pt-4">
                <span className="text-[10px] font-black text-outline uppercase tracking-wider">Tag Customizada</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Ex: Alergia a Leite"
                    className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-2.5 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                  />
                  <button
                    onClick={handleAddCustomTag}
                    className="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/95 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedStudentForTags(null)}
                  className="px-5 py-2.5 bg-surface-container hover:bg-outline-variant/20 rounded-2xl text-xs font-bold uppercase tracking-wider"
                >
                  Concluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Modal: Adicionar Novo Aluno */}
      <AnimatePresence>
        {isAddStudentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md border border-outline-variant/30 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
                <h3 className="font-sans font-bold text-lg text-on-surface">Adicionar Novo Aluno</h3>
                <button 
                  onClick={() => setIsAddStudentOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Nome Completo</label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Ex: João da Silva Santos"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                    autoFocus
                  />
                </div>

                {/* Turma */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Turma</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="Berçário A">Berçário A</option>
                    <option value="Maternal B">Maternal B</option>
                    <option value="Infantil I">Infantil I</option>
                  </select>
                </div>

                {/* Idade */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Idade</label>
                  <input
                    type="text"
                    value={newStudentAge}
                    onChange={(e) => setNewStudentAge(e.target.value)}
                    placeholder="Ex: 2 anos e 3 meses"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Nome do Responsável */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Nome do Responsável (Mãe/Pai)</label>
                  <input
                    type="text"
                    value={newStudentParentName}
                    onChange={(e) => setNewStudentParentName(e.target.value)}
                    placeholder="Ex: Maria da Silva"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Contato de Emergência */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1 flex items-center gap-1.5">
                    <Phone size={10} />
                    Contato de Emergência
                  </label>
                  <input
                    type="tel"
                    value={newStudentEmergencyContact}
                    onChange={(e) => setNewStudentEmergencyContact(e.target.value)}
                    placeholder="Ex: (11) 99999-1234"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Seleção do Avatar do Novo Aluno */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Selecione o Avatar Lúdico</label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(AVATAR_MAP).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewStudentAvatar(key)}
                        className={`py-2 text-2xl rounded-xl border flex items-center justify-center transition-all ${
                          newStudentAvatar === key 
                            ? 'border-primary ring-2 ring-primary/45 bg-[#DCEEEB] dark:bg-primary-container' 
                            : 'border-outline-variant/20 hover:bg-surface-container bg-surface-container-low'
                        }`}
                        title={item.label}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    onClick={() => setIsAddStudentOpen(false)}
                    className="px-5 py-2.5 bg-surface-container hover:bg-outline-variant/30 rounded-2xl text-xs font-bold uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddStudentSubmit}
                    className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary/95 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
                  >
                    Adicionar Aluno
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Modal: Editar Dados do Aluno */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md max-h-[90vh] border border-outline-variant/30 shadow-2xl space-y-5 flex flex-col"
            >
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40 shrink-0">
                <h3 className="font-sans font-bold text-lg text-on-surface">Editar Dados do Aluno</h3>
                <button 
                  onClick={() => setEditingStudent(null)}
                  className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Nome Completo</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Ex: João da Silva Santos"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                    autoFocus
                  />
                </div>

                {/* Turma */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Turma</label>
                  <select
                    value={editingStudent.class}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, class: e.target.value } : null)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="Berçário A">Berçário A</option>
                    <option value="Maternal B">Maternal B</option>
                    <option value="Infantil I">Infantil I</option>
                  </select>
                </div>

                {/* Idade */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Idade</label>
                  <input
                    type="text"
                    value={editingStudent.age}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, age: e.target.value } : null)}
                    placeholder="Ex: 2 anos e 3 meses"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Nome do Responsável */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Nome do Responsável (Mãe/Pai)</label>
                  <input
                    type="text"
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, parentName: e.target.value } : null)}
                    placeholder="Ex: Maria da Silva"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Contato de Emergência */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1 flex items-center gap-1.5">
                    <Phone size={10} />
                    Contato de Emergência
                  </label>
                  <input
                    type="tel"
                    value={editingStudent.emergencyContact}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, emergencyContact: e.target.value } : null)}
                    placeholder="Ex: (11) 99999-1234"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Seleção do Avatar */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Avatar do Bichinho</label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(AVATAR_MAP).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditingStudent(prev => prev ? { ...prev, avatar: key } : null)}
                        className={`py-2 text-2xl rounded-xl border flex items-center justify-center transition-all ${
                          editingStudent.avatar === key 
                            ? 'border-primary ring-2 ring-primary/45 bg-primary/10 dark:bg-primary/20' 
                            : 'border-outline-variant/20 hover:bg-surface-container bg-surface-container-low'
                        }`}
                        title={item.label}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    onClick={() => setEditingStudent(null)}
                    className="px-5 py-2.5 bg-surface-container hover:bg-outline-variant/30 rounded-2xl text-xs font-bold uppercase tracking-wider text-on-surface"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEditStudent}
                    className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary/95 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Modal: Adicionar Novo Suprimento */}
      <AnimatePresence>
        {isAddSupplyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md border border-outline-variant/30 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
                <h3 className="font-sans font-bold text-lg text-on-surface">Adicionar Material ao Estoque</h3>
                <button 
                  onClick={() => setIsAddSupplyOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nome do Material */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Descrição do Material</label>
                  <input
                    type="text"
                    value={newSupplyName}
                    onChange={(e) => setNewSupplyName(e.target.value)}
                    placeholder="Ex: Pincéis Chatos Nº 12"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                    autoFocus
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Categoria</label>
                  <select
                    value={newSupplyCategory}
                    onChange={(e) => setNewSupplyCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="Papelaria & Escrita">Papelaria & Escrita</option>
                    <option value="Artes & Colagem">Artes & Colagem</option>
                    <option value="Higiene & Limpeza">Higiene & Limpeza</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    onClick={() => setIsAddSupplyOpen(false)}
                    className="px-5 py-2.5 bg-surface-container hover:bg-outline-variant/30 rounded-2xl text-xs font-bold uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddSupplySubmit}
                    className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary/95 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
                  >
                    Adicionar Material
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
