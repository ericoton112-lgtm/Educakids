'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, ClipboardList, Smile, Meh, Frown, Plus, Check,
  Edit2, Package, X, AlertCircle, Tag, Award, Heart, HelpCircle,
  Sparkles, Calendar, CheckCircle2, Trash2, Pencil, Phone, BarChart3
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { saveStudents, getSupplies, saveSupplies, saveMoodRecord } from '@/utils/storage';
import type { Student, SupplyCategory, MoodRecord } from '@/types';
import AvatarPickerModal from '@/app/components/modals/AvatarPickerModal';
import TagManagerModal from '@/app/components/modals/TagManagerModal';
import AddStudentModal from '@/app/components/modals/AddStudentModal';
import EditStudentModal from '@/app/components/modals/EditStudentModal';
import AddSupplyModal from '@/app/components/modals/AddSupplyModal';
import MoodChart from '@/app/components/MoodChart';

const AVATAR_MAP: Record<string, { emoji: string; label: string; bg: string }> = {
  lion: { emoji: '🦁', label: 'Leãozinho', bg: 'bg-[#FFEBCD] dark:bg-[#5E4E3C]' },
  panda: { emoji: '🐼', label: 'Pandinha', bg: 'bg-[#F5F5F5] dark:bg-[#3C4A52]' },
  fox: { emoji: '🦊', label: 'Raposinha', bg: 'bg-[#FFE0B2] dark:bg-[#6E4228]' },
  koala: { emoji: '🐨', label: 'Coala', bg: 'bg-[#ECEFF1] dark:bg-[#3A454B]' },
  rabbit: { emoji: '🐰', label: 'Coelhinho', bg: 'bg-[#FCE4EC] dark:bg-[#5D3A4B]' },
  bear: { emoji: '🐻', label: 'Ursinho', bg: 'bg-[#D7CCC8] dark:bg-[#4E3D35]' }
};

const CLASS_OPTIONS = ['Berçário A', 'Maternal B', 'Infantil I'];

export default function ClassroomPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('comportamento');
  const [activeClass, setActiveClass] = useState('Berçário A');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'comportamento' || tabParam === 'inventario') {
      setActiveTab(tabParam);
    }
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);
  const [selectedStudentForAvatar, setSelectedStudentForAvatar] = useState<string | null>(null);
  const [selectedStudentForTags, setSelectedStudentForTags] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [dbError, setDbError] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [supplies, setSupplies] = useState<SupplyCategory[]>(() => {
    const local = getSupplies();
    return local.length > 0 ? local : [];
  });
  const [moodHistory, setMoodHistory] = useState<MoodRecord[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      let loadedStudents: Student[] | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('classroom_students').select('*').eq('user_id', user.id);
          if (error) throw error;
          if (data && data.length > 0) {
            loadedStudents = data.map(s => ({
              id: s.id, name: s.name, class: s.class_name,
              behavior: s.behavior, notes: s.notes, tags: s.tags || [],
              color: s.color, age: s.age || '', parentName: s.parentName || '',
              emergencyContact: s.emergencyContact || ''
            }));
          }
        }
      } catch { setDbError(true); }

      if (!loadedStudents) {
        try {
          const stored = localStorage.getItem('educakids_students');
          if (stored) {
            const parsed = JSON.parse(stored);
            const fakeIds = ['MOCK_1', 'MOCK_2', 'MOCK_3', 'MOCK_4', 'LB', 'SC', 'OW', 'AM', 'LS', 'BL', 'EO', 'AC'];
            if (Array.isArray(parsed) && parsed.some((s: any) => fakeIds.includes(s.id))) {
              localStorage.removeItem('educakids_students');
            } else {
              loadedStudents = parsed;
            }
          }
        } catch { /* ignore */ }
      }

      if (loadedStudents) setStudents(loadedStudents);
    };
    loadStudents();

    const stored = localStorage.getItem('educakids_mood_history');
    if (stored) {
      try { setMoodHistory(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [supabase]);

  useEffect(() => {
    if (students.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const present = students.filter(s => s.behavior !== 'absent');
      const record: MoodRecord = {
        date: today,
        smileCount: present.filter(s => s.behavior === 'smile').length,
        mehCount: present.filter(s => s.behavior === 'meh').length,
        sadCount: present.filter(s => s.behavior === 'sad').length,
        totalPresent: present.length,
      };
      saveMoodRecord(record);
      const stored = localStorage.getItem('educakids_mood_history');
      if (stored) {
        try { setMoodHistory(JSON.parse(stored)); } catch { /* ignore */ }
      }
    }
  }, [students]);

  const syncStudentToDb = async (student: Student) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('classroom_students').upsert({
        id: student.id, user_id: user.id, name: student.name,
        class_name: student.class, behavior: student.behavior,
        notes: student.notes || '', tags: student.tags || [], color: student.color
      });
    } catch { setDbError(true); }
  };

  const toggleBehavior = async (id: string, behavior: 'smile' | 'meh' | 'sad') => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, behavior } : s);
      const student = updated.find(s => s.id === id);
      if (student) syncStudentToDb(student);
      saveStudents(updated);
      return updated;
    });
  };

  const togglePresence = async (id: string) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        const newBehavior: 'smile' | 'absent' = s.behavior === 'absent' ? 'smile' : 'absent';
        return { ...s, behavior: newBehavior };
      });
      const student = updated.find(s => s.id === id);
      if (student) syncStudentToDb(student);
      saveStudents(updated);
      return updated;
    });
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, notes } : s);
      saveStudents(updated);
      return updated;
    });
  };

  const handleNotesBlur = async (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) await syncStudentToDb(student);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este aluno?")) return;
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveStudents(updated);
      return updated;
    });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('classroom_students').delete().eq('id', id).eq('user_id', user.id);
      }
    } catch { /* ignore */ }
  };

  const handleAddStudentSubmit = (data: { name: string; class: string; avatar: string; age: string; parentName: string; emergencyContact: string }) => {
    const names = data.name.trim().split(' ');
    let id = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
    let suffix = 1;
    let finalId = id;
    while (students.some(s => s.id === finalId)) { finalId = `${id}${suffix}`; suffix++; }

    const avatarObj = AVATAR_MAP[data.avatar] || AVATAR_MAP.lion;
    const newStudent: Student = {
      id: finalId, name: data.name.trim(), class: data.class,
      behavior: 'smile', notes: '', color: avatarObj.bg,
      tags: [`avatar:${data.avatar}`], age: data.age, parentName: data.parentName,
      emergencyContact: data.emergencyContact
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    saveStudents(updated);
    syncStudentToDb(newStudent);
    setIsAddStudentOpen(false);
  };

  const handleSelectAvatar = (studentId: string, avatarKey: string) => {
    const avatarObj = AVATAR_MAP[avatarKey] || AVATAR_MAP.lion;
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== studentId) return s;
        const cleanTags = s.tags.filter(t => !t.startsWith('avatar:'));
        const updatedStudent = { ...s, color: avatarObj.bg, tags: [...cleanTags, `avatar:${avatarKey}`] };
        syncStudentToDb(updatedStudent);
        return updatedStudent;
      });
      saveStudents(updated);
      return updated;
    });
    setSelectedStudentForAvatar(null);
  };

  const handleToggleTag = (studentId: string, tag: string) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== studentId) return s;
        const hasTag = s.tags.includes(tag);
        const newTags = hasTag ? s.tags.filter(t => t !== tag) : [...s.tags, tag];
        const updatedStudent = { ...s, tags: newTags };
        syncStudentToDb(updatedStudent);
        return updatedStudent;
      });
      saveStudents(updated);
      return updated;
    });
  };

  const toggleSupplyItem = (catIndex: number, itemIndex: number) => {
    setSupplies(prev => {
      const next = [...prev];
      const item = next[catIndex].items[itemIndex];
      if (item.status === 'completed') { item.status = 'ok'; item.val = 'Estoque OK'; }
      else { item.status = 'completed'; item.val = 'Verificado'; }
      saveSupplies(next);
      return next;
    });
  };

  const cycleSupplyStatus = (catIndex: number, itemIndex: number) => {
    setSupplies(prev => {
      const next = [...prev];
      const item = next[catIndex].items[itemIndex];
      if (item.status === 'completed') return next;
      if (item.status === 'ok') { item.status = 'low'; item.val = 'Estoque Baixo'; }
      else if (item.status === 'low') { item.status = 'empty'; item.val = 'Falta Reposição'; }
      else { item.status = 'ok'; item.val = 'Estoque OK'; }
      saveSupplies(next);
      return next;
    });
  };

  const handleAddSupplySubmit = (data: { name: string; category: string }) => {
    setSupplies(prev => {
      const next = [...prev];
      let cat = next.find(c => c.category === data.category);
      if (!cat) { cat = { category: data.category, items: [] }; next.push(cat); }
      cat.items.push({ name: data.name, val: 'Estoque OK', status: 'ok' });
      saveSupplies(next);
      return next;
    });
    setIsAddSupplyOpen(false);
  };

  const handleSaveEditStudent = (data: any) => {
    const avatarObj = AVATAR_MAP[data.avatar] || AVATAR_MAP.lion;
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== data.id) return s;
        const cleanTags = s.tags.filter(t => !t.startsWith('avatar:'));
        const updatedStudent = { ...s, name: data.name.trim(), class: data.class, color: avatarObj.bg, tags: [...cleanTags, `avatar:${data.avatar}`], age: data.age || '', parentName: data.parentName || '', emergencyContact: data.emergencyContact || '' };
        syncStudentToDb(updatedStudent);
        return updatedStudent;
      });
      saveStudents(updated);
      return updated;
    });
    setEditingStudent(null);
  };

  const getAvatarKey = (tags: string[]) => {
    const avatarTag = tags.find(t => t.startsWith('avatar:'));
    return avatarTag ? avatarTag.split(':')[1] : 'lion';
  };

  const getCleanTags = (tags: string[]) => tags.filter(t => !t.startsWith('avatar:'));

  const classStudents = students.filter(s => s.class === activeClass);
  const totalStudentsCount = classStudents.length;
  const presentStudents = classStudents.filter(s => s.behavior !== 'absent');
  const presentCount = presentStudents.length;
  const presencePercentage = totalStudentsCount > 0 ? Math.round((presentCount / totalStudentsCount) * 100) : 0;
  const happyCount = presentStudents.filter(s => s.behavior === 'smile').length;
  const emotionalPercentage = presentCount > 0 ? Math.round((happyCount / presentCount) * 100) : 100;
  const criticalSuppliesCount = supplies.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'low' || i.status === 'empty').length, 0);
  const totalSuppliesCount = supplies.reduce((acc, cat) => acc + cat.items.length, 0);
  const verifiedSuppliesCount = supplies.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'completed').length, 0);
  const suppliesVerifiedPercentage = totalSuppliesCount > 0 ? Math.round((verifiedSuppliesCount / totalSuppliesCount) * 100) : 0;

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

      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-sans font-bold text-3xl text-on-surface">Visão Geral da Sala</h2>
          <p className="text-on-surface-variant mt-1 text-sm font-medium">Controle a frequência diária, acompanhe o humor dos pequenos e monitore materiais de arte e escrita.</p>
        </div>
        <div className="flex p-1 bg-surface-container rounded-full shadow-inner border border-outline-variant/20 self-start md:self-auto">
          {['comportamento', 'inventario'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === tab ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab === 'comportamento' ? 'Diário e Presença' : 'Estoque de Suprimentos'}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div whileHover={{ y: -2 }} className="bg-secondary-container/20 bg-gradient-to-br from-secondary-container/30 to-secondary-container/10 backdrop-blur-sm border border-secondary-container/40 p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Smile size={20} />
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
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-primary-container/20 bg-gradient-to-br from-primary-container/30 to-primary-container/10 backdrop-blur-sm border border-primary-container/40 p-5 rounded-3xl flex flex-col justify-between">
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
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${presencePercentage}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-semibold">
              <span>{presencePercentage}% de comparência</span>
              <span>Turma: {activeClass}</span>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-tertiary-container/10 bg-gradient-to-br from-tertiary-container/20 to-tertiary-container/5 backdrop-blur-sm border border-tertiary-container/30 p-5 rounded-3xl flex flex-col justify-between">
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
              <div className="bg-tertiary h-full rounded-full transition-all duration-500" style={{ width: `${suppliesVerifiedPercentage}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-semibold">
              <span>{suppliesVerifiedPercentage}% verificados no checklist</span>
              <button onClick={() => setActiveTab('inventario')} className="text-primary hover:underline hover:opacity-85 font-black uppercase">Ver Estoque</button>
            </div>
          </div>
        </motion.div>
      </section>

      <AnimatePresence mode="wait">
        {activeTab === 'comportamento' ? (
          <motion.div key="comportamento" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-2 p-1 bg-surface-container-low border border-outline-variant/30 rounded-2xl w-fit">
                {CLASS_OPTIONS.map((c) => (
                  <button key={c} onClick={() => setActiveClass(c)}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      activeClass === c ? 'bg-surface-container-highest text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >{c}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setStudents(prev => {
                      const updated = prev.map(s => s.class === activeClass ? { ...s, behavior: 'smile' as const } : s);
                      saveStudents(updated);
                      updated.filter(s => s.class === activeClass).forEach(s => syncStudentToDb(s));
                      return updated;
                    });
                  }}
                  className="inline-flex items-center justify-center gap-1.5 bg-secondary/10 text-secondary font-black text-xs uppercase tracking-wider px-4 py-3 rounded-full border border-secondary/20 hover:bg-secondary/20 transition-colors self-start sm:self-auto"
                ><Check size={14} /> Marcar Presença Geral</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsAddStudentOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-md hover:bg-primary/95 transition-colors self-start sm:self-auto"
                ><Plus size={16} /> Adicionar Aluno</motion.button>
              </div>
            </div>

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
                      layout key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      className={`bg-surface-container-lowest border p-5 rounded-3xl shadow-sm flex flex-col gap-4 relative transition-all duration-300 ${
                        isPresent ? 'border-outline-variant/30 opacity-100' : 'border-outline-variant/15 opacity-60 bg-surface-container-low/20'
                      }`}
                    >
                      <div className="absolute top-4 right-4 flex gap-1.5">
                        <button onClick={() => setEditingStudent({ id: s.id, name: s.name, class: s.class, avatar: getAvatarKey(s.tags), age: s.age || '', parentName: s.parentName || '', emergencyContact: s.emergencyContact || '' })}
                          className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-primary hover:text-on-primary rounded-full text-on-surface-variant/65 transition-colors shadow-sm" title="Editar"
                        ><Pencil size={12} /></button>
                        <button onClick={() => handleDeleteStudent(s.id)}
                          className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-error-container hover:text-on-error-container rounded-full text-on-surface-variant/65 transition-colors shadow-sm" title="Remover"
                        ><Trash2 size={12} /></button>
                      </div>

                      <div className="flex justify-between items-start pr-20">
                        <div className="flex items-center gap-4">
                          <div onClick={() => setSelectedStudentForAvatar(s.id)}
                            className={`w-14 h-14 rounded-2xl ${avatarObj.bg} flex items-center justify-center text-3xl shadow-sm cursor-pointer hover:scale-105 transition-transform relative group/avatar`}>
                            <span>{avatarObj.emoji}</span>
                            <span className="absolute inset-0 bg-black/40 text-white rounded-2xl text-[9px] font-black uppercase flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">Mudar</span>
                          </div>
                          <div>
                            <h3 className="font-sans font-bold text-lg text-on-surface leading-tight">{s.name}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="bg-secondary-fixed text-on-secondary-fixed px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">{s.class}</span>
                              {s.age && <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded-full">🎂 {s.age}</span>}
                            </div>
                            {(s.parentName || s.emergencyContact) && (
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                {s.parentName && <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-1"><Users size={10} />{s.parentName}</span>}
                                {s.emergencyContact && <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-1"><Phone size={10} />{s.emergencyContact}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => togglePresence(s.id)}
                          className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
                            isPresent ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20' : 'bg-surface-container-high text-on-surface-variant/50 border border-outline-variant/30 hover:bg-surface-container-highest'
                          }`}
                        >{isPresent ? '👋 Presente' : '💤 Ausente'}</button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Diário de Humor</label>
                        {isPresent ? (
                          <div className="grid grid-cols-3 gap-2">
                            {(['smile', 'meh', 'sad'] as const).map((b) => (
                              <button key={b} onClick={() => toggleBehavior(s.id, b)}
                                className={`py-2 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all shadow-sm ${
                                  s.behavior === b
                                    ? b === 'smile' ? 'bg-success/15 text-success border-success/40 scale-[1.02]' : b === 'meh' ? 'bg-secondary/15 text-secondary border-secondary/30 scale-[1.02]' : 'bg-error/15 text-error border-error/30 scale-[1.02]'
                                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 opacity-70 hover:opacity-100 hover:bg-surface-container'
                                }`}
                              >
                                {b === 'smile' ? <><Smile size={16} /> Alegre</> : b === 'meh' ? <><Meh size={16} /> Calmo</> : <><Frown size={16} /> Dengoso</>}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-surface-container-low/40 rounded-2xl py-3 px-4 text-center border border-outline-variant/20 text-xs font-semibold text-on-surface-variant/50 flex items-center justify-center gap-2">
                            <AlertCircle size={14} /> Aluno ausente. Atividades e humor desabilitados.
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">NOTAS DIÁRIAS</label>
                        <textarea value={s.notes} disabled={!isPresent}
                          onChange={(e) => handleUpdateNotes(s.id, e.target.value)} onBlur={() => handleNotesBlur(s.id)}
                          className="w-full bg-surface-container-low border-none rounded-2xl p-4 font-medium text-xs text-on-surface focus:ring-2 focus:ring-primary/20 resize-none min-h-[85px] outline-none disabled:bg-surface-container-low/20 disabled:opacity-40"
                          placeholder={isPresent ? "Escreva atualizações de comportamento, sono, mamadeira..." : "Registro de notas desabilitado."}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Tags Pedagógicas</label>
                        <div className="flex flex-wrap gap-2 items-center">
                          {cleanTags.map(tag => (
                            <span key={tag} onClick={() => handleToggleTag(s.id, tag)}
                              className="px-3.5 py-1 bg-primary-container/20 text-primary border border-primary/20 hover:bg-error-container hover:text-error hover:border-error/30 cursor-pointer rounded-full text-[10px] font-bold uppercase transition-all shadow-sm group/tag">
                              <span className="group-hover/tag:hidden">{tag}</span>
                              <span className="hidden group-hover/tag:inline">Remover ×</span>
                            </span>
                          ))}
                          <button onClick={() => setSelectedStudentForTags(s.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/40 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm"
                          ><Plus size={10} /> Tag</button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Mood History Chart */}
            <section id="mood-chart" className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                <h3 className="font-sans font-bold text-lg text-on-surface">Histórico de Humor</h3>
              </div>
              <MoodChart records={moodHistory} days={30} />
            </section>
          </motion.div>
        ) : (
          <motion.section key="inventario" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="bg-tertiary-container/20 border border-tertiary/20 rounded-3xl p-4 flex items-start gap-3">
              <Sparkles size={20} className="text-tertiary shrink-0 mt-0.5" />
              <div className="text-xs font-medium text-on-surface leading-relaxed">
                <span className="font-bold text-tertiary">Dica da IA:</span> Itens marcados como <span className="font-bold">&ldquo;Estoque OK&rdquo;</span> são priorizados pela Inteligência Artificial na hora de sugerir e criar folhas de atividades, garantindo que os materiais recomendados estejam sempre disponíveis na sua sala.
              </div>
            </div>
            <div className="flex justify-between items-center gap-4">
              <p className="text-sm font-semibold text-on-surface-variant">Sinalize o estado de conservação e quantidade clicando no badge circular de status.</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsAddSupplyOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-md hover:bg-primary/95 transition-colors shrink-0"
              ><Plus size={16} /> Adicionar Item</motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {supplies.map((cat, i) => (
                <div key={cat.category} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between">
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
                          <li key={item.name}
                            className={`flex items-center justify-between gap-3 p-3.5 bg-surface-container-low/40 rounded-2xl border transition-all ${
                              isVerified ? 'border-primary/10 opacity-70 bg-primary/5' : 'border-outline-variant/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <button onClick={() => toggleSupplyItem(i, j)}
                                className={`w-[22px] h-[22px] rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isVerified ? 'bg-primary border-primary' : 'border-outline-variant hover:border-primary/60'
                                }`}
                              >{isVerified && <Check size={12} className="text-on-primary font-black" />}</button>
                              <span className={`font-semibold text-xs leading-normal ${isVerified ? 'text-on-surface-variant line-through opacity-65' : 'text-on-surface'}`}>{item.name}</span>
                            </div>
                            <button onClick={() => cycleSupplyStatus(i, j)} disabled={isVerified}
                              className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm select-none transition-all ${
                                isVerified ? 'bg-primary-container/20 text-primary cursor-not-allowed' :
                                item.status === 'ok' ? 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/20' :
                                item.status === 'low' ? 'bg-warning-container text-on-warning-container border border-warning/20 hover:scale-105' :
                                'bg-error-container text-on-error-container border border-error/20 hover:scale-105'
                              }`}
                            >{item.status === 'ok' ? 'Estoque OK' : item.status === 'low' ? 'Pouco Estoque' : item.status === 'empty' ? 'Repor!' : 'Verificado'}</button>
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

      <AvatarPickerModal isOpen={!!selectedStudentForAvatar} studentId={selectedStudentForAvatar} onSelect={handleSelectAvatar} onClose={() => setSelectedStudentForAvatar(null)} />
      <TagManagerModal isOpen={!!selectedStudentForTags} studentId={selectedStudentForTags} students={students} onToggleTag={handleToggleTag} onClose={() => setSelectedStudentForTags(null)} />
      <AddStudentModal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} onSubmit={handleAddStudentSubmit} />
      <EditStudentModal student={editingStudent} onSave={handleSaveEditStudent} onClose={() => setEditingStudent(null)} />
      <AddSupplyModal isOpen={isAddSupplyOpen} onClose={() => setIsAddSupplyOpen(false)} onSubmit={handleAddSupplySubmit} />
    </div>
  );
}
