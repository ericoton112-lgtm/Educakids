'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { Student } from '@/types';

const PREDEFINED_TAGS = [
  'Apetite OK', 'Dorme Fácil', 'Participativo', 'Agitado',
  'Febre/Alerta', 'Estimulado', 'Sociável', 'Concentrado', 'Mamadeira OK', 'Fralda Trocada'
];

interface Props {
  isOpen: boolean;
  studentId: string | null;
  students: Student[];
  onToggleTag: (studentId: string, tag: string) => void;
  onClose: () => void;
}

export default function TagManagerModal({ isOpen, studentId, students, onToggleTag, onClose }: Props) {
  const [customTagInput, setCustomTagInput] = useState('');

  const student = students.find(s => s.id === studentId);

  const handleAddCustomTag = () => {
    if (!customTagInput.trim() || !studentId) return;
    onToggleTag(studentId, customTagInput.trim());
    setCustomTagInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && studentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md border border-outline-variant/30 shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
              <div>
                <h3 className="font-sans font-bold text-lg text-on-surface">Gerenciar Tags Pedagógicas</h3>
                <p className="text-[10px] text-outline font-black uppercase mt-0.5">Aluno: {student?.name}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-outline uppercase tracking-wider">Sugestões de Rotina</span>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => {
                  const isActive = student?.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => studentId && onToggleTag(studentId, tag)}
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
              <button onClick={onClose} className="px-5 py-2.5 bg-surface-container hover:bg-outline-variant/20 rounded-2xl text-xs font-bold uppercase tracking-wider">
                Concluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
