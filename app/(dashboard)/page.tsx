'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Calendar as CalendarIcon, AlertCircle, CheckCircle, Cake, Plus, ChevronRight, Sun, X, Play, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function HomePage() {
  const supabase = createClient();
  const [teacherName, setTeacherName] = useState('Professora');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Tentar carregar da tabela pública
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (data && data.name) {
          setTeacherName(data.name);
        } else if (user.user_metadata?.name) {
          setTeacherName(user.user_metadata.name);
        }
      } catch (err) {
        console.error('Erro ao carregar nome:', err);
      }
    };
    loadProfile();
  }, [supabase]);

  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Alerta de Alergia: Leo M.',
      desc: 'Sem laticínios no lanche da manhã hoje, conforme nota dos pais.',
      tag: 'URGENTE',
      tagColor: 'bg-error-container text-on-error-container',
      icon: AlertCircle,
      iconColor: 'text-error',
    },
    {
      id: 2,
      title: 'Prep. Hora do Sono',
      desc: 'Verificar berços e playlist de música suave.',
      tag: 'TAREFA',
      tagColor: 'bg-primary-container/30 text-primary',
      icon: CheckCircle,
      iconColor: 'text-primary',
    },
    {
      id: 3,
      title: 'Aniversário da Maya!',
      desc: 'Preparar o "Chapéu de Aniversário" para a roda.',
      tag: 'FESTA',
      tagColor: 'bg-secondary-container/30 text-secondary',
      icon: Cake,
      iconColor: 'text-secondary',
    },
  ]);

  const [isStarted, setIsStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  const dismissItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newItemTitle,
      desc: newItemDesc || 'Novo lembrete adicionado.',
      tag: 'TAREFA',
      tagColor: 'bg-primary-container/30 text-primary',
      icon: CheckCircle,
      iconColor: 'text-primary',
    };

    setItems([newItem, ...items]);
    setNewItemTitle('');
    setNewItemDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <section>
        <h2 className="font-sans font-bold text-3xl text-on-surface">Olá, {teacherName}</h2>

        <p className="text-on-surface-variant mt-1 italic">Pronta para mais um dia de brincadeiras estruturadas?</p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-primary-container text-on-primary-container p-5 rounded-2xl flex items-center justify-between shadow-soft border border-primary/10 transition-colors duration-300">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">
              {isStarted ? 'Atividade Atual' : 'Próxima Atividade'}
            </p>
            <h3 className="font-sans font-bold text-xl">Pintura a Dedo</h3>
            <div className="flex items-center gap-1.5 text-sm opacity-90">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>10:30 AM</span>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsStarted(!isStarted)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm shadow-md flex items-center gap-2 transition-colors duration-300 ${
              isStarted ? 'bg-tertiary text-on-tertiary' : 'bg-primary text-on-primary'
            }`}
          >
            {isStarted ? (
              <>
                <Check size={16} /> Em andamento
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" /> Iniciar
              </>
            )}
          </motion.button>
        </div>

        <Link href="/classroom" className="block">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-secondary-container text-on-secondary-container p-5 rounded-2xl border border-secondary/10 flex flex-col justify-between h-36"
          >
            <FileText size={24} />
            <span className="font-bold text-sm">Notas da Aula</span>
          </motion.div>
        </Link>

        <Link href="/planner" className="block">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-tertiary-container text-on-tertiary-container p-5 rounded-2xl border border-tertiary/10 flex flex-col justify-between h-36"
          >
            <CalendarIcon size={24} />
            <span className="font-bold text-sm">Calendário</span>
          </motion.div>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-sans font-bold text-lg text-on-surface">Agenda Semanal</h3>
          <Link href="/planner" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            Ver tudo <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-4 gap-3 h-48">
          <div className="col-span-2 row-span-2 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-end relative overflow-hidden group">
            <Sun className="absolute top-2 right-2 text-primary/10 w-24 h-24 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Quarta-feira</p>
              <h4 className="font-sans font-bold text-lg leading-tight">Passeio na Natureza</h4>
              <p className="text-on-surface-variant text-xs mt-1">Coleta de folhas para colagem</p>
            </div>
          </div>
          
          <div className="col-span-2 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
              <span className="material-symbols-outlined text-xl">music_note</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant opacity-70">QUI</p>
              <p className="font-bold text-sm truncate">Hora da Música</p>
            </div>
          </div>
          
          <div className="col-span-2 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
              <span className="material-symbols-outlined text-xl">science</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant opacity-70">SEX</p>
              <p className="font-bold text-sm truncate">Mistura de Cores</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-sans font-bold text-lg text-on-surface">Foco de Hoje</h3>
          {items.length === 0 && (
             <span className="text-xs text-on-surface-variant italic">Tudo limpo!</span>
          )}
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-2xl flex items-start gap-4 hover:bg-surface-container-low transition-colors shadow-sm cursor-pointer"
                onClick={() => dismissItem(item.id)}
              >
                <div className={`mt-1 ${item.iconColor}`}>
                  <item.icon size={20} className="fill-current" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">{item.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <div className={`${item.tagColor} px-2 py-0.5 rounded-full text-[9px] font-black shrink-0`}>
                  {item.tag}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* FAB - Botão Flutuante */}
      <div className="fixed bottom-24 right-6 z-40">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center border-2 border-white/20"
        >
          <Plus size={32} />
        </motion.button>
      </div>

      {/* Modal de Novo Lembrete */}
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
                <h3 className="font-sans font-bold text-xl text-on-surface">Novo Foco de Hoje</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-surface-container-high rounded-full text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Título</label>
                  <input 
                    type="text" 
                    required
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Ex: Ligar para os pais do Leo"
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Descrição (opcional)</label>
                  <textarea 
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    rows={3}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm resize-none"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold mt-2 hover:bg-primary/90 transition-colors"
                >
                  Adicionar Foco
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

