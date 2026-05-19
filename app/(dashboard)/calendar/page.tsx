'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Users, Cake, Trees as Park, Plus, Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('Todos');

  const monthStart = startOfMonth(activeMonth);
  const monthEnd = endOfMonth(monthStart);
  // Semana começando na Segunda-feira (1)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const today = new Date();
  const [events] = useState([
    { id: 1, time: '09:00', title: 'Reunião de Equipe', desc: 'Sala 4 • Sra. Sarah', category: 'Reuniões', icon: Users, color: 'bg-secondary-container text-secondary', date: today },
    { id: 2, time: '11:00', title: 'Festa do Leo', desc: 'Área de Lazer • Cupcakes', category: 'Celebrações', icon: Cake, color: 'bg-tertiary-container text-tertiary', date: today },
    { id: 3, time: '10:00', title: 'Atividade Externa', desc: 'Jardim • Passeio Botânico', category: 'Externas', icon: Park, color: 'bg-surface-variant text-outline', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) },
    { id: 4, time: '14:30', title: 'Reunião de Pais', desc: 'Auditório Principal', category: 'Reuniões', icon: Users, color: 'bg-primary-container text-primary', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2) },
    { id: 5, time: '15:00', title: 'Festa da Primavera', desc: 'Pátio Central', category: 'Celebrações', icon: Cake, color: 'bg-error-container text-error', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5) },
  ]);

  const prevMonth = () => setActiveMonth(subMonths(activeMonth, 1));
  const nextMonth = () => setActiveMonth(addMonths(activeMonth, 1));

  const eventsInMonth = events.filter(e => isSameMonth(e.date, activeMonth)).length;
  const selectedEvents = events.filter(e => isSameDay(e.date, currentDate) && (activeFilter === 'Todos' || e.category === activeFilter));

  const filters = ['Todos', 'Reuniões', 'Celebrações', 'Externas'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
      <section className="flex justify-between items-end">
        <div>
          <h1 className="font-sans font-bold text-3xl text-on-surface capitalize">{format(activeMonth, 'MMMM yyyy', { locale: ptBR })}</h1>
          <p className="text-on-surface-variant text-sm mt-1 font-medium">{eventsInMonth} evento{eventsInMonth !== 1 ? 's' : ''} neste mês</p>
        </div>
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={prevMonth}
            className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-high transition-colors"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={nextMonth}
            className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-high transition-colors"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </section>

      <section className="bg-white border border-outline-variant/30 rounded-[2.5rem] p-6 shadow-soft overflow-hidden">
        <div className="grid grid-cols-7 text-center mb-4">
          {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map(d => (
            <div key={d} className="text-[10px] font-black text-outline tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2">
          {days.map((day, i) => {
            const isSelected = isSameDay(day, currentDate);
            const isCurrentMonth = isSameMonth(day, activeMonth);
            const isTodayDate = isToday(day);
            const hasEvent = events.some(e => isSameDay(e.date, day));
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentDate(day);
                  if (!isCurrentMonth) setActiveMonth(day);
                }}
                className={`py-3 relative flex flex-col items-center justify-center rounded-3xl transition-all ${
                  isSelected ? 'bg-primary text-on-primary shadow-md font-bold' : 
                  isTodayDate ? 'bg-primary-container/30 text-on-surface font-bold border border-primary/20' :
                  'text-on-surface hover:bg-surface-container-low'
                } ${!isCurrentMonth ? 'opacity-30' : ''}`}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                {hasEvent && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {filters.map((f) => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-none px-6 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              activeFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30 hover:border-primary/30'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-outline-variant/30"></div>
          <span className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">
            {isToday(currentDate) ? 'Hoje, ' : ''}{format(currentDate, "d 'de' MMMM", { locale: ptBR })}
          </span>
          <div className="h-px flex-1 bg-outline-variant/30"></div>
        </div>

        <div className="space-y-4 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <motion.div 
                  key={event.id}
                  layout
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white border border-outline-variant/20 p-4 rounded-3xl flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl ${event.color.split(' ')[0]} flex flex-col items-center justify-center shrink-0 shadow-inner`}>
                    <span className="text-xs font-black leading-none">{event.time.split(':')[0]}</span>
                    <span className="text-[10px] font-medium leading-none mt-1 opacity-70">{event.time.split(':')[1]}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-sans font-bold text-base text-on-surface group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">{event.desc}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${event.color.split(' ')[1]} flex items-center justify-center border border-current`}>
                    <event.icon size={18} />
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 text-on-surface-variant"
              >
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant/20">
                  <Search size={24} className="text-outline" />
                </div>
                <p className="font-bold text-sm text-on-surface">Nenhum evento encontrado</p>
                <p className="text-xs mt-1">Aproveite o dia livre ou adicione um novo evento na agenda.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="fixed bottom-24 right-6 z-40">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => alert('Em breve: Formulário para adicionar novos eventos!')}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center shadow-primary/30"
        >
          <Plus size={32} />
        </motion.button>
      </div>
    </div>
  );
}
