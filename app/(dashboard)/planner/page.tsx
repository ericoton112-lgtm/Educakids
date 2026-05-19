'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Edit3, CheckCircle, Star, CloudRain, Sun, Palette, Footprints, MessageCircle, Info, ChevronRight } from 'lucide-react';

export default function PlannerPage() {
  const weekDays = [
    {
      day: 'Segunda-feira',
      date: '16 Out',
      focus: 'A Jornada da Formiga',
      codes: ['EI03EO03', 'EI03TS02'],
      icon: Sun,
      iconBg: 'bg-primary-container text-on-primary-container',
      activities: [
        { type: 'Roda de Conversa', text: 'Contação de história: "A Formiga Trabalhadora"' },
        { type: 'Brincadeira Sensorial', text: 'Rastreamento na areia com lupas' },
      ]
    },
    {
      day: 'Terça-feira',
      date: '17 Out',
      focus: 'Cores da Borboleta',
      codes: ['EI03ET01'],
      icon: Palette,
      iconBg: 'bg-secondary-container text-on-secondary-container',
      activities: [
        { type: 'Oficina de Arte', text: 'Pintura simétrica de borboletas' },
        { type: 'Passeio no Jardim', text: 'Identificando cores na natureza' },
      ]
    },
    {
      day: 'Quarta-feira',
      date: '18 Out',
      focus: 'Minhocas e Solo',
      codes: ['EI03ET04', 'EI03CG05'],
      icon: CloudRain,
      iconBg: 'bg-tertiary-container/40 text-on-tertiary-container',
      activities: [
        { type: 'Hub de Ciências', text: 'Observando a caixa de compostagem' },
        { type: 'Música e Movimento', text: 'Dança rítmica "Mexa-se como minhoca"' },
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Semana Atual</p>
          <h1 className="font-sans font-bold text-3xl text-on-surface">Planejador Semanal</h1>
          <p className="text-on-surface-variant mt-1 font-medium">16 de Outubro - 20 de Outubro, 2023</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => alert('O Editor do Plano Semanal será disponibilizado na próxima atualização!')}
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-8 py-3 rounded-full shadow-lg shadow-primary/10"
        >
          <Edit3 size={18} />
          Editar Plano
        </motion.button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-secondary-container/30 border border-secondary-container p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-5 text-on-secondary-container">
            <Star size={24} className="fill-current" />
            <h2 className="font-sans font-bold text-xl leading-tight">Principais Objetivos da Semana</h2>
          </div>
          <ul className="space-y-4">
            {[
              'Explorar o conceito de biodiversidade através da observação de insetos no jardim.',
              'Desenvolver habilidades motoras finas usando materiais de colagem texturizados.',
              'Praticar o revezamento colaborativo durante as sessões de música em grupo.'
            ].map((goal, idx) => (
              <li key={idx} className="flex gap-3 items-start text-sm text-on-surface">
                <CheckCircle size={18} className="text-primary shrink-0 mt-0.5 fill-primary/20" />
                <span className="font-medium leading-relaxed">{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-tertiary-container/20 border border-tertiary-container/40 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-tertiary uppercase tracking-widest mb-2">Tema da Semana</h3>
            <p className="font-sans font-bold text-2xl text-on-tertiary-container leading-tight">Pequenos Exploradores: Vida no Jardim</p>
          </div>
          <div className="mt-6">
            <span className="inline-flex items-center px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black uppercase rounded-full shadow-sm">
              8/10 Objetivos BNCC
            </span>
          </div>
        </div>
      </section>

      <section className="overflow-x-auto hide-scrollbar -mx-5 px-5 select-none active:cursor-grabbing">
        <div className="flex gap-6 min-w-max pb-6">
          {weekDays.map((wd, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              className="w-80 bg-surface-container-low border border-outline-variant p-5 rounded-3xl shadow-sm space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-sans font-bold text-lg text-on-surface">{wd.day}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">{wd.date}</p>
                </div>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${wd.iconBg}`}>
                  <wd.icon size={20} />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Foco do Tema</p>
                <p className="font-bold text-on-surface leading-tight">{wd.focus}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Códigos BNCC</p>
                <div className="flex flex-wrap gap-2">
                  {wd.codes.map(c => (
                    <span key={c} className="px-3 py-1 bg-surface-container-highest border border-outline-variant rounded-lg text-[10px] font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <Star size={10} /> Atividades
                </p>
                {wd.activities.map((a, j) => (
                  <div key={j} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 group cursor-pointer hover:border-primary/40 transition-all shadow-sm">
                    <p className="text-[10px] font-black text-primary uppercase mb-1">{a.type}</p>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{a.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="w-full md:w-56 h-48 rounded-2xl overflow-hidden flex-shrink-0 border border-outline-variant bg-surface-container" />
        <div className="flex-grow space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Star size={16} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dica Pro para a Semana</span>
          </div>
          <h3 className="font-sans font-bold text-xl text-on-surface">Incentive a Documentação</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Capture fotos das crianças usando lupas para documentar a habilidade <span className="font-bold text-primary">EI03ET01 (Curiosidade e Investigação)</span>. 
            Estas fotos são excelentes para relatórios aos pais e para construir o portfólio digital ao final do semestre.
          </p>
          <button className="text-primary text-xs font-bold flex items-center gap-1 mt-2">
            Ver Portfólios <ChevronRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
