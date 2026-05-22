'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const AVATAR_MAP: Record<string, { emoji: string; label: string; bg: string }> = {
  lion: { emoji: '🦁', label: 'Leãozinho', bg: 'bg-[#FFEBCD] dark:bg-[#5E4E3C]' },
  panda: { emoji: '🐼', label: 'Pandinha', bg: 'bg-[#F5F5F5] dark:bg-[#3C4A52]' },
  fox: { emoji: '🦊', label: 'Raposinha', bg: 'bg-[#FFE0B2] dark:bg-[#6E4228]' },
  koala: { emoji: '🐨', label: 'Coala', bg: 'bg-[#ECEFF1] dark:bg-[#3A454B]' },
  rabbit: { emoji: '🐰', label: 'Coelhinho', bg: 'bg-[#FCE4EC] dark:bg-[#5D3A4B]' },
  bear: { emoji: '🐻', label: 'Ursinho', bg: 'bg-[#D7CCC8] dark:bg-[#4E3D35]' }
};

interface Props {
  isOpen: boolean;
  studentId: string | null;
  onSelect: (studentId: string, avatarKey: string) => void;
  onClose: () => void;
}

export default function AvatarPickerModal({ isOpen, studentId, onSelect, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && studentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-md max-h-[90vh] border border-outline-variant/30 shadow-2xl space-y-5 flex flex-col"
          >
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40 shrink-0">
              <h3 className="font-sans font-bold text-lg text-on-surface">Selecione o Avatar de Animal</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-outline-variant/30 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(AVATAR_MAP).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => onSelect(studentId, key)}
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
  );
}
