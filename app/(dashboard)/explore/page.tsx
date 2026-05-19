'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Music, Puzzle, ArrowRight, Heart } from 'lucide-react';

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState('Todas as Idades');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { title: 'Histórias', desc: 'Leituras interativas em voz alta', icon: BookOpen, color: 'bg-primary-container/20 text-primary', span: 'col-span-2 md:col-span-2' },
    { title: 'Músicas', desc: 'Ritmos para gastar energia', icon: Music, color: 'bg-secondary-container/20 text-secondary', span: 'col-span-1 md:col-span-1' },
    { title: 'Jogos', desc: 'Lógica e coordenação', icon: Puzzle, color: 'bg-tertiary-container/20 text-tertiary', span: 'col-span-1 md:col-span-1' },
  ];

  const [resources, setResources] = useState([
    { id: 1, title: 'Traçado do Alfabeto Animal', meta: 'Idade 4-5 • 5 Páginas', ageGroup: '4-5 Anos', tag: 'Atividades', tagBg: 'bg-secondary-fixed text-on-secondary-fixed', img: 'https://picsum.photos/seed/alphabet/200', liked: false },
    { id: 2, title: 'A Raposinha Sonolenta', meta: 'Idade 2-3 • Audiolivro', ageGroup: '2-3 Anos', tag: 'Histórias', tagBg: 'bg-primary-fixed text-on-primary-fixed-variant', img: 'https://picsum.photos/seed/fox/200', liked: true },
    { id: 3, title: 'Dança do Ritmo do Arco-íris', meta: 'Todas as idades • Áudio + Letra', ageGroup: 'Todas as Idades', tag: 'Músicas', tagBg: 'bg-tertiary-fixed text-on-tertiary-fixed', img: 'https://picsum.photos/seed/rainbow/200', liked: false },
    { id: 4, title: 'Caixa de Classificação Sensorial', meta: 'Idade 0-1 • Guia Prático', ageGroup: '0-1 Ano', tag: 'Jogos', tagBg: 'bg-secondary-fixed text-on-secondary-fixed', img: 'https://picsum.photos/seed/sensory/200', liked: false },
    { id: 5, title: 'Cantigas de Roda Clássicas', meta: 'Todas as idades • Playlist', ageGroup: 'Todas as Idades', tag: 'Músicas', tagBg: 'bg-tertiary-fixed text-on-tertiary-fixed', img: 'https://picsum.photos/seed/music/200', liked: true },
  ]);

  const filters = ['Todas as Idades', '0-1 Ano', '2-3 Anos', '4-5 Anos'];

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || res.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'Todas as Idades' || res.ageGroup === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleLike = (id: number) => {
    setResources(prev => prev.map(res => res.id === id ? { ...res, liked: !res.liked } : res));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      <section className="space-y-6">
        <div className="relative group">
          <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por histórias, músicas ou jogos..."
            className="w-full pl-16 pr-6 py-5 bg-surface-container-low border-none rounded-[2rem] focus:ring-2 focus:ring-primary shadow-sm text-sm font-medium transition-all text-on-surface"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-2 px-2 pb-2">
          {filters.map((f) => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-none px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                activeFilter === f ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30 hover:border-primary/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => alert(`Sessão de ${cat.title} em construção!`)}
            className={`${cat.span} ${cat.color} rounded-[2.5rem] p-6 border border-current/10 flex flex-col justify-between hover:shadow-xl transition-all cursor-pointer group h-full min-h-[160px]`}
          >
            <div>
              <cat.icon size={32} className="mb-4" />
              <h3 className="font-sans font-black text-xl leading-tight">{cat.title}</h3>
              {cat.desc && <p className="text-current text-xs mt-1 font-medium italic opacity-70">{cat.desc}</p>}
            </div>
            <div className="self-end group-hover:translate-x-1 transition-transform">
              <ArrowRight size={24} />
            </div>
          </motion.div>
        ))}
      </section>

      <section className="space-y-6 min-h-[300px]">
        <h2 className="font-sans font-bold text-2xl text-on-surface">
          {searchQuery ? 'Resultados da Busca' : 'Recursos em Destaque'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredResources.length > 0 ? (
              filteredResources.map((res) => (
                <motion.div 
                  layout
                  key={res.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  // Corrigido bg-white para bg-surface-container-lowest
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-4 flex gap-4 hover:shadow-lg transition-shadow group"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner bg-surface-container">
                    <img alt={res.title} src={res.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-between flex-grow py-1">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`${res.tagBg} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm`}>{res.tag}</span>
                        <button 
                          onClick={() => toggleLike(res.id)}
                          className={`p-1.5 rounded-full transition-colors ${res.liked ? 'text-error bg-error/10' : 'text-outline-variant hover:text-error hover:bg-error/10'}`}
                        >
                          <Heart size={18} className={res.liked ? 'fill-current' : ''} />
                        </button>
                      </div>
                      <h4 className="font-sans font-bold text-sm text-on-surface leading-tight group-hover:text-primary transition-colors cursor-pointer">{res.title}</h4>
                      <p className="text-[10px] text-on-surface-variant font-black uppercase opacity-60 tracking-wider font-body">{res.meta}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="col-span-full py-12 text-center"
              >
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant/30">
                  <Search size={24} className="text-outline" />
                </div>
                <h3 className="font-sans font-bold text-lg text-on-surface">Nenhum recurso encontrado</h3>
                <p className="text-sm text-on-surface-variant mt-1">Tente usar outros termos de busca ou filtros de idade.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
