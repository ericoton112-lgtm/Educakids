'use client';

import { useMemo } from 'react';
import { Smile, Meh, Frown } from 'lucide-react';
import type { MoodRecord } from '@/types';

interface Props {
  records: MoodRecord[];
  days?: number;
}

export default function MoodChart({ records, days = 30 }: Props) {
  const recent = useMemo(() => {
    return records.slice(-days);
  }, [records, days]);

  const maxCount = useMemo(() => {
    return Math.max(...recent.map(r => Math.max(r.smileCount, r.mehCount, r.sadCount, 1)));
  }, [recent]);

  if (recent.length === 0) {
    return (
      <div className="text-center py-8 text-on-surface-variant/60 space-y-2">
        <Meh size={32} className="mx-auto opacity-30" />
        <p className="text-sm font-medium">Nenhum registro de humor ainda.</p>
        <p className="text-xs opacity-75">Os dados aparecerão aqui conforme você registrar o humor diário dos alunos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[10px] font-black text-outline uppercase tracking-widest px-1">
        <span>Últimos {days} dias</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Smile size={12} className="text-success" /> Alegre</span>
          <span className="flex items-center gap-1"><Meh size={12} className="text-secondary" /> Calmo</span>
          <span className="flex items-center gap-1"><Frown size={12} className="text-error" /> Dengoso</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4">
        <div className="flex items-end gap-1 h-32">
          {recent.map((record, i) => {
            const smileH = (record.smileCount / maxCount) * 100;
            const mehH = (record.mehCount / maxCount) * 100;
            const sadH = (record.sadCount / maxCount) * 100;
            const dateObj = new Date(record.date + 'T12:00:00');
            const label = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            return (
              <div key={record.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full flex flex-col-reverse h-28 rounded-sm overflow-hidden">
                  <div
                    className="w-full bg-error/60 hover:bg-error/80 transition-all min-h-[2px]"
                    style={{ height: `${Math.max(sadH, 2)}%` }}
                    title={`Dengoso: ${record.sadCount}`}
                  />
                  <div
                    className="w-full bg-secondary/60 hover:bg-secondary/80 transition-all min-h-[2px]"
                    style={{ height: `${Math.max(mehH, 2)}%` }}
                    title={`Calmo: ${record.mehCount}`}
                  />
                  <div
                    className="w-full bg-success/60 hover:bg-success/80 transition-all min-h-[2px]"
                    style={{ height: `${Math.max(smileH, 2)}%` }}
                    title={`Alegre: ${record.smileCount}`}
                  />
                </div>
                <span className="text-[7px] font-bold text-outline opacity-60 group-hover:opacity-100 transition-opacity">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
