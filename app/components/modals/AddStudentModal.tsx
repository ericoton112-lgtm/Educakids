'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone } from 'lucide-react';

const AVATAR_MAP: Record<string, { emoji: string; label: string; bg: string }> = {
  lion: { emoji: '🦁', label: 'Leãozinho', bg: 'bg-[#FFEBCD] dark:bg-[#5E4E3C]' },
  panda: { emoji: '🐼', label: 'Pandinha', bg: 'bg-[#F5F5F5] dark:bg-[#3C4A52]' },
  fox: { emoji: '🦊', label: 'Raposinha', bg: 'bg-[#FFE0B2] dark:bg-[#6E4228]' },
  koala: { emoji: '🐨', label: 'Coala', bg: 'bg-[#ECEFF1] dark:bg-[#3A454B]' },
  rabbit: { emoji: '🐰', label: 'Coelhinho', bg: 'bg-[#FCE4EC] dark:bg-[#5D3A4B]' },
  bear: { emoji: '🐻', label: 'Ursinho', bg: 'bg-[#D7CCC8] dark:bg-[#4E3D35]' }
};

const CLASS_OPTIONS = ['Berçário A', 'Maternal B', 'Infantil I'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    class: string;
    avatar: string;
    age: string;
    parentName: string;
    emergencyContact: string;
  }) => void;
}

export default function AddStudentModal({ isOpen, onClose, onSubmit }: Props) {
  const [avatar, setAvatar] = useState('lion');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit({
      name: (data.get('name') as string) || '',
      class: (data.get('class') as string) || 'Berçário A',
      avatar,
      age: (data.get('age') as string) || '',
      parentName: (data.get('parentName') as string) || '',
      emergencyContact: (data.get('emergencyContact') as string) || '',
    });
  };

  const handleClose = () => {
    setAvatar('lion');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md max-h-[90vh] border border-outline-variant/30 shadow-2xl space-y-5 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40 shrink-0">
              <h3 className="font-sans font-bold text-lg text-on-surface">Adicionar Novo Aluno</h3>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Nome Completo</label>
                <input
                  name="name"
                  required
                  placeholder="Ex: João da Silva Santos"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Turma</label>
                <select
                  name="class"
                  defaultValue="Berçário A"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                >
                  {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Idade</label>
                <input
                  name="age"
                  placeholder="Ex: 2 anos e 3 meses"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Nome do Responsável</label>
                <input
                  name="parentName"
                  placeholder="Ex: Maria da Silva"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1 flex items-center gap-1.5">
                  <Phone size={10} /> Contato de Emergência
                </label>
                <input
                  name="emergencyContact"
                  type="tel"
                  placeholder="Ex: (11) 99999-1234"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Selecione o Avatar Lúdico</label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.entries(AVATAR_MAP).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAvatar(key)}
                      className={`py-2 text-2xl rounded-xl border transition-all ${
                        avatar === key
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
                <button type="button" onClick={handleClose} className="px-5 py-2.5 bg-surface-container hover:bg-outline-variant/30 rounded-2xl text-xs font-bold uppercase tracking-wider">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary/95 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all">
                  Adicionar Aluno
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
