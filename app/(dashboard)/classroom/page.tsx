'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ClipboardList, Smile, Meh, Plus, Check, Edit2, Package, X, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ClassroomPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('comportamento');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [dbError, setDbError] = useState(false);

  // Convertendo estudantes para estado para podermos alterar os comportamentos
  const [students, setStudents] = useState([
    { id: 'LB', name: 'Liam Bennett', class: 'Berçário A', behavior: 'smile', notes: 'Muita Energia', color: 'bg-secondary-container', tags: ['Sabe Compartilhar'] },
    { id: 'SC', name: 'Sophia Chen', class: 'Berçário A', behavior: 'meh', notes: 'Dormiu por 45 min. Um pouco quieta hoje.', color: 'bg-primary-container', tags: ['Pouco Apetite'] },
    { id: 'OW', name: 'Oliver White', class: 'Berçário A', behavior: 'smile', notes: 'Ajudou muito durante a arrumação!', color: 'bg-tertiary-fixed-dim', tags: ['Prestativo', 'Sociável'] },
    { id: 'AM', name: 'Ava Martinez', class: 'Berçário A', behavior: 'smile', notes: '', color: 'bg-secondary-fixed', tags: ['Dormindo'] },
  ]);

  // Convertendo inventário para estado para podermos fazer o "check" dos itens
  const [supplies, setSupplies] = useState([
    { category: 'Papelaria', items: [
      { name: 'Canetinhas Laváveis', val: '12/15', status: 'ok' },
      { name: 'Bastões de Cola', val: 'OK', status: 'completed' },
      { name: 'Tesouras Sem Ponta', val: 'Estoque Baixo', status: 'low' },
    ]},
    { category: 'Artes e Ofícios', items: [
      { name: 'Tintas a Dedo', val: '', status: 'ok' },
      { name: 'Papel Cartão', val: '', status: 'ok' },
      { name: 'Cola com Glitter', val: 'OK', status: 'completed' },
    ]}
  ]);

  // Load from Supabase on mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('classroom_students')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map(s => ({
            id: s.id,
            name: s.name,
            class: s.class_name,
            behavior: s.behavior,
            notes: s.notes,
            tags: s.tags || [],
            color: s.color
          }));
          setStudents(mapped);
        }
      } catch (err) {
        console.error('Erro ao buscar alunos do Supabase. Usando dados locais.', err);
        setDbError(true);
      }
    };
    loadStudents();
  }, [supabase]);

  // Background sync helper
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
      console.error('Erro de sincronização em segundo plano:', err);
      setDbError(true);
    }
  };

  const toggleBehavior = async (id: string, behavior: 'smile' | 'meh') => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, behavior } : s);
      const student = updated.find(s => s.id === id);
      if (student) {
        syncStudentToDb(student);
      }
      return updated;
    });
  };

  const toggleSupplyItem = (catIndex: number, itemIndex: number) => {
    setSupplies(prev => {
      const newSupplies = [...prev];
      const item = newSupplies[catIndex].items[itemIndex];
      item.status = item.status === 'completed' ? 'ok' : 'completed';
      return newSupplies;
    });
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    if (activeTab === 'comportamento') {
      const names = newItemName.split(' ');
      const id = names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : names[0].substring(0, 2).toUpperCase();
      
      const newStudent = {
        id,
        name: newItemName,
        class: 'Berçário A',
        behavior: 'smile' as const,
        notes: '',
        color: 'bg-primary-container',
        tags: []
      };

      setStudents(prev => [...prev, newStudent]);
      await syncStudentToDb(newStudent);
    } else {
      setSupplies(prev => {
        const newSupplies = [...prev];
        newSupplies[0].items.push({ name: newItemName, val: 'Novo', status: 'ok' });
        return newSupplies;
      });
    }

    setNewItemName('');
    setIsModalOpen(false);
  };

  const completedCount = supplies.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'completed').length, 0);
  const totalItems = supplies.reduce((acc, cat) => acc + cat.items.length, 0);
  const budgetPercentage = Math.round((completedCount / totalItems) * 100) || 0;

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

      <section>
        <h2 className="font-sans font-bold text-3xl text-on-surface">Visão Geral da Sala</h2>
        <p className="text-on-surface-variant mt-1">Gerencie os registros diários dos alunos e o estoque da sala.</p>
      </section>

      <div className="flex p-1 bg-surface-container rounded-full w-full md:w-fit shadow-inner">
        <button 
          onClick={() => setActiveTab('comportamento')}
          className={`flex-1 md:px-10 py-2.5 rounded-full font-bold text-sm transition-all ${
            activeTab === 'comportamento' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Comportamento
        </button>
        <button 
          onClick={() => setActiveTab('inventario')}
          className={`flex-1 md:px-10 py-2.5 rounded-full font-bold text-sm transition-all ${
            activeTab === 'inventario' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Lista de Suprimentos
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'comportamento' ? (
          <motion.div 
            key="comportamento"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {students.map((s) => (
              <motion.div 
                key={s.id}
                whileHover={{ scale: 1.01 }}
                className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-3xl shadow-soft flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center font-sans font-black text-on-primary-container text-lg shadow-sm`}>
                      {s.id}
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-lg text-on-surface leading-tight">{s.name}</h3>
                      <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{s.class}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleBehavior(s.id, 'smile')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                        s.behavior === 'smile' ? 'bg-primary text-on-primary scale-110' : 'bg-surface-container text-on-surface-variant opacity-50 hover:opacity-100 hover:bg-surface-container-high'
                      }`}
                    >
                      <Smile size={20} />
                    </button>
                    <button 
                      onClick={() => toggleBehavior(s.id, 'meh')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                        s.behavior === 'meh' ? 'bg-error text-on-error scale-110' : 'bg-surface-container text-on-surface-variant opacity-50 hover:opacity-100 hover:bg-surface-container-high'
                      }`}
                    >
                      <Meh size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">NOTAS DIÁRIAS</label>
                  <textarea 
                    value={s.notes}
                    onChange={(e) => {
                      const text = e.target.value;
                      setStudents(prev => prev.map(stud => stud.id === s.id ? { ...stud, notes: text } : stud));
                    }}
                    onBlur={async () => {
                      const updatedStudent = students.find(stud => stud.id === s.id);
                      if (updatedStudent) {
                        await syncStudentToDb(updatedStudent);
                      }
                    }}
                    className="w-full bg-surface-container-low border-none rounded-2xl p-4 font-body text-xs text-on-surface focus:ring-2 focus:ring-primary/20 resize-none min-h-[80px] outline-none" 
                    placeholder="Escreva atualizações de comportamento..."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {s.tags.map(tag => (
                    <span key={tag} className="px-4 py-1 bg-primary-container/30 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.section 
            key="inventario"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {supplies.map((cat, i) => (
                <div key={i} className={`bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl ${i === 1 ? 'md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6' : 'md:col-span-1'}`}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      {cat.category === 'Papelaria' ? <Edit2 size={20} className="text-primary" /> : <Package size={20} className="text-secondary" />}
                      <h4 className="font-sans font-bold text-xl text-on-surface">{cat.category}</h4>
                    </div>
                    <ul className="space-y-4">
                      {cat.items.map((item, j) => (
                        <li 
                          key={j} 
                          onClick={() => toggleSupplyItem(i, j)}
                          className="flex items-center gap-3 group cursor-pointer"
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            item.status === 'completed' ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary/50'
                          }`}>
                            {item.status === 'completed' && <Check size={14} className="text-on-primary font-black" />}
                          </div>
                          <span className={`font-medium text-sm flex-1 transition-colors ${item.status === 'completed' ? 'text-on-surface-variant line-through opacity-60' : 'text-on-surface group-hover:text-primary'}`}>
                            {item.name}
                          </span>
                          {item.val && (
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'low' ? 'bg-error-container text-on-error-container' : 
                              item.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
                            }`}>
                              {item.val}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {i === 1 && (
                    <div className="bg-primary-container/10 rounded-2xl p-6 flex flex-col justify-between border border-primary/20">
                      <div>
                        <p className="font-sans font-bold text-lg text-on-surface mb-1">Status da Sala</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed">Progresso das verificações de estoque diário.</p>
                      </div>
                      <div className="mt-8">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Concluído</span>
                          <span className="text-lg font-black text-primary">{budgetPercentage}%</span>
                        </div>
                        <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetPercentage}%` }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className="bg-primary h-full rounded-full shadow-lg" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-6 z-40">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center transition-all"
        >
          <Plus size={32} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-sm border border-outline-variant/30 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-sans font-bold text-xl text-on-surface">
                  {activeTab === 'comportamento' ? 'Adicionar Aluno' : 'Adicionar Suprimento'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-error hover:text-on-error rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-outline uppercase tracking-widest px-2">
                    {activeTab === 'comportamento' ? 'Nome do Aluno' : 'Nome do Item'}
                  </label>
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    autoFocus
                    placeholder={activeTab === 'comportamento' ? 'Ex: João Silva' : 'Ex: Tinta Guache'}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-5 py-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/50 text-sm outline-none transition-all mt-1"
                  />
                </div>
                
                <button 
                  onClick={handleAddItem}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center shadow-md hover:bg-primary/90 transition-all active:scale-95"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
