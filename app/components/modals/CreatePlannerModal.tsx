'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { startOfWeek, format } from 'date-fns';

interface Props {
  isOpen: boolean;
  isGenerating: boolean;
  error: string | null;
  onGenerate: (data: { theme: string; ageGroup: string; guidelines: string; weekStart: string }) => void;
  onManual: (weekStart: string) => void;
  onClose: () => void;
}

export default function CreatePlannerModal({ isOpen, isGenerating, error, onGenerate, onManual, onClose }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onGenerate({
      theme: data.get('theme') as string,
      ageGroup: data.get('ageGroup') as string,
      guidelines: data.get('guidelines') as string,
      weekStart: data.get('weekStart') as string,
    });
  };

  const defaultWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-lg max-h-[90vh] border border-outline-variant/30 shadow-2xl space-y-5 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40 shrink-0">
              <h3 className="font-sans font-bold text-lg text-on-surface">Criar Planejamento Semanal</h3>
              <button onClick={onClose} disabled={isGenerating} className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant ml-2">Data de Início da Semana</label>
                <input
                  type="date"
                  name="weekStart"
                  defaultValue={defaultWeekStart}
                  className="w-full h-12 px-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant ml-2">Faixa Etária</label>
                <select
                  name="ageGroup"
                  defaultValue="Crianças Pequenas (4 anos a 5 anos e 11 meses)"
                  className="w-full h-12 px-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                >
                  <option>Bebês (0-1 ano e 6 meses)</option>
                  <option>Crianças Bem Pequenas (1 ano e 7 meses a 3 anos e 11 meses)</option>
                  <option>Crianças Pequenas (4 anos a 5 anos e 11 meses)</option>
                  <option>Crianças Maiores (6 anos a 8 anos)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant ml-2">Tema da Semana</label>
                <input
                  type="text"
                  name="theme"
                  required
                  placeholder="Ex: Animais da Fazenda, Primavera, Festa Junina..."
                  className="w-full h-12 px-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant ml-2">Diretrizes (opcional)</label>
                <textarea
                  name="guidelines"
                  rows={3}
                  placeholder="O que você deseja focar? Quais habilidades ou áreas do conhecimento?"
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm font-medium focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>

              {error && (
                <div className="bg-error-container text-on-error-container p-4 rounded-2xl border border-error/20 flex items-start gap-3">
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  <p className="font-medium text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (form) {
                      const fd = new FormData(form);
                      onManual(fd.get('weekStart') as string || defaultWeekStart);
                    }
                  }}
                  disabled={isGenerating}
                  className="px-5 py-3 bg-surface-container hover:bg-outline-variant/30 rounded-2xl text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  Criar em Branco (Manual)
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 bg-primary text-on-primary hover:bg-primary/95 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-60 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <><Loader2 size={16} className="animate-spin" /> Gerando...</>
                  ) : (
                    <><Sparkles size={16} /> Gerar com IA</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
