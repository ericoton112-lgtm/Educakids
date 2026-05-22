'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const CATEGORIES = ['Papelaria & Escrita', 'Artes & Colagem', 'Higiene & Limpeza'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; category: string }) => void;
}

export default function AddSupplyModal({ isOpen, onClose, onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const category = data.get('category') as string;
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), category });
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
            className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md border border-outline-variant/30 shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
              <h3 className="font-sans font-bold text-lg text-on-surface">Adicionar Material ao Estoque</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Descrição do Material</label>
                <input
                  name="name"
                  required
                  placeholder="Ex: Pincéis Chatos Nº 12"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider px-1">Categoria</label>
                <select
                  name="category"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-container hover:bg-outline-variant/30 rounded-2xl text-xs font-bold uppercase tracking-wider">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary/95 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all">
                  Adicionar Material
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
