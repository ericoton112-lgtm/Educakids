'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Music, Puzzle, ArrowRight, Heart, X, Volume2, Sparkles, Trophy, Play, RotateCcw, ChevronLeft, Award } from 'lucide-react';

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState('Todas as Idades');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Audio Synthesizer via Web Audio API
  const playXyloNote = (frequency: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'triangle', duration = 0.8) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const categories = [
    { title: 'Histórias', desc: '10 Leituras interativas ilustradas', icon: BookOpen, color: 'bg-primary-container/20 text-primary', span: 'col-span-2 md:col-span-2' },
    { title: 'Músicas', desc: '10 Cantigas e Instrumentos Reais', icon: Music, color: 'bg-secondary-container/20 text-secondary', span: 'col-span-1 md:col-span-1' },
    { title: 'Jogos', desc: '10 Desafios e Mini-jogos Lúdicos', icon: Puzzle, color: 'bg-tertiary-container/20 text-tertiary', span: 'col-span-1 md:col-span-1' },
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

  // --- INTERACTIVE SYSTEM STATES ---
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [activeMusicIdx, setActiveMusicIdx] = useState<number | null>(null);
  const [activeGameIdx, setActiveGameIdx] = useState<number | null>(null);

  const closeModal = () => {
    setSelectedCategory(null);
    setActiveStoryIdx(null);
    setActiveMusicIdx(null);
    setActiveGameIdx(null);
  };

  // 📖 --- 10 DIVERSIFIED STORIES ---
  const [storyStep, setStoryStep] = useState(0);
  const storiesList = [
    {
      title: "A Raposinha Sonolenta 🦊💤",
      desc: "Ajude a Vivi a descansar sob o grande carvalho do jardim.",
      emoji: "🦊",
      pages: [
        { emoji: "🦊💤", bg: "from-amber-100 to-orange-100 text-orange-950", text: "Esta é a Vivi, a raposinha sonolenta. Ela adora descansar sob o carvalho gigante, mas hoje está inquieta.", action: "Faça carinho na orelha da Vivi para acalmá-la!", buttonText: "Dar carinho 🧡" },
        { emoji: "🌟🦉", bg: "from-indigo-900 to-slate-900 text-indigo-100", text: "A noite chegou! As estrelas estão apagadas e a Dona Coruja precisa de luz para cantar sua canção.", action: "Toque na tela para acender o brilho das estrelas!", buttonText: "Acender Estrelas ⭐" },
        { emoji: "🦊😴", bg: "from-emerald-100 to-teal-100 text-teal-950", text: "Parabéns! Vivi adormeceu profundamente e agora sonha com doces amoras selvagens.", action: "História concluída! Obrigado pela ajuda!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "O Leão Sem Rugido 🦁🔇",
      desc: "Léo perdeu o seu rugido! Vamos ajudá-lo a recuperá-lo?",
      emoji: "🦁",
      pages: [
        { emoji: "🦁🥺", bg: "from-yellow-100 to-amber-100 text-amber-950", text: "Léo tentou dar um rugido forte, mas só saiu um sopro bem fraquinho! Ele está muito envergonhado.", action: "Ajude o Léo a respirar bem fundo para encher os pulmões!", buttonText: "Respirar Fundo 💨" },
        { emoji: "🦁💨✨", bg: "from-orange-100 to-red-100 text-red-950", text: "Léo encheu o peito de ar! Agora ele precisa de toda a sua torcida para soltar o som da floresta.", action: "Dê palmas clicando no botão para motivar o Léo!", buttonText: "Bater Palmas 👏🎉" },
        { emoji: "🦁🔊👑", bg: "from-amber-200 to-yellow-200 text-amber-900", text: "ROOOAAARRR! Léo rugiu tão forte que as folhas das árvores dançaram! Ele recuperou seu trono!", action: "História concluída! O rei da floresta agradece seu apoio!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "O Macaco Pintor 🐒🎨",
      desc: "Ajude o sapeca Kiko a misturar tintas e colorir a floresta.",
      emoji: "🐒",
      pages: [
        { emoji: "🐒🎨", bg: "from-sky-100 to-blue-100 text-blue-950", text: "Kiko quer pintar a grande palmeira, mas só tem potes de tinta Azul e Amarela. Ele está pensando...", action: "Misture as duas cores para criar uma nova cor mágica!", buttonText: "Misturar Cores 🌀" },
        { emoji: "🐒🍃✨", bg: "from-lime-100 to-emerald-100 text-emerald-950", text: "Uau! Azul com amarelo virou VERDE folha! Kiko começou a pintar as árvores alegremente.", action: "Ajude o Kiko a desenhar um sol bem brilhante no topo!", buttonText: "Adicionar Sol ☀️" },
        { emoji: "🐒🖼️✨", bg: "from-violet-100 to-fuchsia-100 text-fuchsia-950", text: "Ficou espetacular! A floresta verde agora tem um sol lindo e Kiko está orgulhoso da sua obra.", action: "História concluída! Kiko adora a sua parceria artística!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "A Tartaruga Apressada 🐢💨",
      desc: "Tuga quer chegar a tempo para o piquenique das frutas.",
      emoji: "🐢",
      pages: [
        { emoji: "🐢🥵", bg: "from-green-100 to-emerald-100 text-emerald-950", text: "Tuga a tartaruga está correndo tão rápido que seu casco está esquentando! Mas ela precisa descansar.", action: "Diga para a Tuga ir devagar e respirar um pouquinho!", buttonText: "Ir Devagar 🐢" },
        { emoji: "🐢🥗", bg: "from-yellow-100 to-orange-100 text-orange-950", text: "Muito melhor! Agora Tuga avistou uma grande folha de alface deliciosa no meio do caminho.", action: "Alimente a Tuga para dar energia a ela!", buttonText: "Comer Alface 🥬" },
        { emoji: "🐢🧺🥳", bg: "from-sky-100 to-indigo-100 text-indigo-950", text: "Parabéns! Tuga chegou ao piquenique no tempo certo e encontrou todos os seus amigos reunidos.", action: "História concluída! Comer devagar é muito melhor!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "O Elefantinho e o Balão 🐘🎈",
      desc: "Dumbo encontrou um balão vermelho mágico.",
      emoji: "🐘",
      pages: [
        { emoji: "🐘🎈", bg: "from-cyan-100 to-sky-100 text-sky-950", text: "Dumbo encontrou um lindo balão murcho. Ele quer ver o balão voar alto pelo céu do parque.", action: "Use a tromba do Dumbo para soprar o balão!", buttonText: "Soprar Balão 💨" },
        { emoji: "🐘🎈📈", bg: "from-purple-100 to-pink-100 text-pink-950", text: "O balão ficou enorme e começou a flutuar, puxando o Dumbo levemente pelas patas!", action: "Segure o Dumbo clicando para ele não voar longe demais!", buttonText: "Segurar Firme 🤝" },
        { emoji: "🐘⛅🎈", bg: "from-amber-100 to-yellow-100 text-amber-900", text: "Que divertido! Dumbo deu um pulo e flutuou suavemente como uma nuvem de algodão pelo céu.", action: "História concluída! Voar de balão é pura magia!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "A Abelha Sem Mel 🐝🍯",
      desc: "Ajude a abelhinha Mel a colher pólen nas flores coloridas.",
      emoji: "🐝",
      pages: [
        { emoji: "🐝🥀", bg: "from-rose-100 to-pink-100 text-rose-950", text: "Mel voou por todo o jardim, mas as flores vermelhas estão murchas devido à falta de carinho.", action: "Regue as flores clicando para elas desabrocharem!", buttonText: "Regar Flores 💧" },
        { emoji: "🐝🌸✨", bg: "from-yellow-100 to-amber-100 text-amber-950", text: "As flores abriram e estão cheias de pólen! Mel começou a recolher tudo para levar à colmeia.", action: "Ajude a Mel a fazer seu zumbido de abelha feliz!", buttonText: "Fazer Buzz 🐝" },
        { emoji: "🐝🍯🎉", bg: "from-emerald-100 to-teal-100 text-teal-950", text: "Sucesso! A colmeia está cheia de mel fresquinho e dourado para todos os animaizinhos.", action: "História concluída! Mel agradece seu carinho com as flores!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "O Golfinho Dançarino 🐬🌊",
      desc: "Flippy quer fazer o maior salto acrobático do oceano.",
      emoji: "🐬",
      pages: [
        { emoji: "🐬🌊", bg: "from-blue-100 to-cyan-100 text-blue-950", text: "Flippy ama dançar nas ondas do mar. Hoje o oceano está calmo e perfeito para um grande show.", action: "Ajude o Flippy a pegar velocidade nadando fundo!", buttonText: "Nadar Rápido ⚡" },
        { emoji: "🐬🚀🌊", bg: "from-sky-200 to-blue-200 text-sky-950", text: "Flippy subiu voando da água! Ele está no ar pronto para fazer sua famosa pirueta dupla.", action: "Clique para o Flippy girar no ar com elegância!", buttonText: "Fazer Pirueta 🌀" },
        { emoji: "🐬👏🏅", bg: "from-teal-100 to-emerald-100 text-teal-950", text: "SPLASH! O salto foi perfeito e todos os peixinhos aplaudiram a linda acrobacia de Flippy.", action: "História concluída! Flippy é o campeão dos saltos!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "A Coruja Curiosa 🦉📚",
      desc: "Clara quer ler seu livro de mistérios no escuro.",
      emoji: "🦉",
      pages: [
        { emoji: "🦉📖", bg: "from-slate-800 to-indigo-950 text-indigo-100", text: "Clara a corujinha encontrou um livro antigo sob as folhas, mas a floresta está escura demais.", action: "Abra as páginas do livro de Clara!", buttonText: "Abrir Livro 📖" },
        { emoji: "🦉🕯️✨", bg: "from-yellow-950 to-amber-900 text-amber-100", text: "O livro fala sobre estrelas perdidas! Vamos acender uma lanterna para ler as letras miúdas.", action: "Acenda a lanterna clicando no botão abaixo!", buttonText: "Acender Lanterna 💡" },
        { emoji: "🦉🎓🌟", bg: "from-blue-900 to-slate-900 text-sky-100", text: "Incrível! Clara descobriu o segredo do brilho da lua e agora é a corujinha mais sábia do carvalho.", action: "História concluída! A curiosidade nos leva a aprender muito!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "O Coelho Saltitante 🐰🥕",
      desc: "Tico precisa pular as pedras para pegar sua cenoura gigante.",
      emoji: "🐰",
      pages: [
        { emoji: "🐰⛰️", bg: "from-orange-100 to-amber-100 text-amber-950", text: "Tico o coelhinho avistou uma cenoura dourada gigante, mas há pedras altas no meio do caminho.", action: "Ajude o Tico a dar um pulo bem alto sobre as pedras!", buttonText: "Dar Pulo Alto 🦘" },
        { emoji: "🐰🥕👀", bg: "from-yellow-100 to-orange-100 text-orange-950", text: "Quase lá! A cenoura está enterrada na terra macia e Tico precisa de ajuda para puxá-la.", action: "Puxe a cenoura com toda a força clicando abaixo!", buttonText: "Puxar Cenoura 🥕" },
        { emoji: "🐰😋🎉", bg: "from-emerald-100 to-green-100 text-green-950", text: "Nham nham! A cenoura é a mais doce de todas! Tico vai fazer um banquete com seus irmãos.", action: "História concluída! Trabalho em equipe sempre compensa!", buttonText: "Fim da História! 🔁" }
      ]
    },
    {
      title: "O Urso Guloso 🐻🍯",
      desc: "Poldo quer comer o mel sem assustar as abelhas.",
      emoji: "🐻",
      pages: [
        { emoji: "🐻🐝", bg: "from-amber-100 to-yellow-100 text-amber-950", text: "Poldo o ursinho sentiu o cheirinho de mel doce. Mais a colmeia está cercada de abelhas ativas.", action: "Cante uma música calma para acalmar as abelhas!", buttonText: "Cantar Suave 🎶" },
        { emoji: "🐻🍯✨", bg: "from-orange-100 to-amber-100 text-amber-950", text: "Funcionou! As abelhinhas foram descansar e deixaram um pote cheio de mel para o Poldo.", action: "Ajude o Poldo a lamber o mel dourado com a pata!", buttonText: "Lamber Mel 🍯" },
        { emoji: "🐻🥰💤", bg: "from-emerald-100 to-teal-100 text-teal-950", text: "De barriguinha cheia, Poldo deitou-se na grama macia para tirar uma soneca tranquila de urso.", action: "História concluída! Dividir e respeitar a natureza é ótimo!", buttonText: "Fim da História! 🔁" }
      ]
    }
  ];

  // 🎵 --- 10 DIVERSIFIED SONGS ---
  const musicList = [
    { title: "A Dona Aranha 🕷️", desc: "Clássico infantil sobre persistência.", emoji: "🕷️", lyrics: "A Dona Aranha subiu pela parede, veio a chuva forte e a derrubou...", sequence: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'] },
    { title: "Brilha Estrelinha ⭐", desc: "Tutorial! Toque as notas recomendadas para a melodia.", emoji: "⭐", lyrics: "Brilha, brilha, estrelinha, quero ver você brilhar no céu...", sequence: ['Dó', 'Dó', 'Sol', 'Sol', 'Lá', 'Lá', 'Sol'] },
    { title: "Pintinho Amarelinho 🐥", desc: "Acompanhe com o bumbo e caixa da bateria real!", emoji: "🐥", lyrics: "Meu pintinho amarelinho, cabe aqui na minha mão, na minha mão...", sequence: ['Mi', 'Mi', 'Ré', 'Ré', 'Dó'] },
    { title: "Cai Cai Balão 🎈", desc: "Alegre canção de festa junina.", emoji: "🎈", lyrics: "Cai cai balão, cai cai balão, aqui na minha mão. Não cai não...", sequence: ['Fá', 'Fá', 'Mi', 'Mi', 'Ré', 'Dó'] },
    { title: "Alecrim Dourado 🌱", desc: "Suave e calma melodia do campo.", emoji: "🌱", lyrics: "Alecrim, alecrim dourado que nasceu no campo sem ser semeado...", sequence: ['Mi', 'Sol', 'Lá', 'Sol', 'Mi'] },
    { title: "Borboletinha 🦋", desc: "Divertida canção de cozinha das fadas.", emoji: "🦋", lyrics: "Borboletinha está na cozinha, fazendo chocolate para a madrinha...", sequence: ['Dó', 'Ré', 'Mi', 'Ré', 'Dó'] },
    { title: "Samba Lelê 💃", desc: "Ritmo folclórico brasileiro clássico.", emoji: "💃", lyrics: "Samba Lelê tá doente, tá com a cabeça quebrada...", sequence: ['Sol', 'Sol', 'Mi', 'Fá', 'Sol'] },
    { title: "Ciranda Cirandinha ⭕", desc: "Ritmo de roda tradicional.", emoji: "⭕", lyrics: "Ciranda, cirandinha, vamos todos cirandar. Vamos dar a meia volta...", sequence: ['Dó', 'Mi', 'Sol', 'Mi', 'Dó'] },
    { title: "Peixe Vivo 🐟", desc: "Linda cantiga mineira sobre companheirismo.", emoji: "🐟", lyrics: "Como pode um peixe vivo viver fora da água fria? Como poderei viver...", sequence: ['Ré', 'Fá', 'Lá', 'Fá', 'Ré'] },
    { title: "Indiozinhos 🛶", desc: "Ótima cantiga para praticar contagem.", emoji: "🛶", lyrics: "1, 2, 3 indiozinhos, 4, 5, 6 indiozinhos, 7, 8, 9 indiozinhos...", sequence: ['Dó', 'Mi', 'Sol', 'Dó⁺', 'Sol'] }
  ];

  const xyloKeys = [
    { note: 'Dó', freq: 261.63, color: 'bg-red-500 hover:bg-red-400' },
    { note: 'Ré', freq: 293.66, color: 'bg-orange-500 hover:bg-orange-400' },
    { note: 'Mi', freq: 329.63, color: 'bg-yellow-500 hover:bg-yellow-400' },
    { note: 'Fá', freq: 349.23, color: 'bg-emerald-500 hover:bg-emerald-400' },
    { note: 'Sol', freq: 392.00, color: 'bg-teal-500 hover:bg-teal-400' },
    { note: 'Lá', freq: 440.00, color: 'bg-blue-500 hover:bg-blue-400' },
    { note: 'Si', freq: 493.88, color: 'bg-purple-500 hover:bg-purple-400' },
    { note: 'Dó⁺', freq: 523.25, color: 'bg-pink-500 hover:bg-pink-400' },
  ];

  // Drum Synth Function
  const playDrumSound = (type: 'kick' | 'snare') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'kick') {
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 🧩 --- 10 DIVERSIFIED GAMES ---
  const gamesList = [
    { title: "Jogo da Memória dos Bichinhos 🐶", desc: "Encontre os pares dos animais fofinhos.", emoji: "🐶", category: "memory" },
    { title: "Jogo da Memória das Frutas 🍓", desc: "Encontre os pares das frutas deliciosas.", emoji: "🍓", category: "memory" },
    { title: "Jogo da Memória dos Carros 🚗", desc: "Encontre os pares dos meios de transporte.", emoji: "🚗", category: "memory" },
    { title: "Salada de Frutas do Kiko 🍌", desc: "Reflexos! Clique nas bananas e maçãs no cesto!", emoji: "🍌", category: "reflex" },
    { title: "Estoura Balão no Parque 🎈", desc: "Reflexos! Clique nos balões rápidos antes de subirem!", emoji: "🎈", category: "reflex" },
    { title: "Estrela Cadente Cadê? ⭐", desc: "Reflexos! Pegue as estrelas cadentes brilhantes!", emoji: "⭐", category: "reflex" },
    { title: "Cores e Formas Geométricas 🟥", desc: "Desafio! Identifique a forma correta.", emoji: "🟥", category: "quiz-shapes" },
    { title: "Detetive dos Animais 🔎", desc: "Pedagógico! Identifique o animal pelo som ou dica.", emoji: "🐱", category: "quiz-detective" },
    { title: "Contando com os Dedinhos 🔢", desc: "Matemática! Conte quantos emojis aparecem.", emoji: "🔢", category: "quiz-count" },
    { title: "Descubra o Oposto ⚖️", desc: "Lógica! Encontre o oposto da palavra indicada.", emoji: "⚖️", category: "quiz-opposites" }
  ];

  // --- GAME: MEMORY SYSTEM STATE ---
  const memoryThemes = [
    ['🐶', '🐶', '🐱', '🐱', '🦊', '🦊', '🦁', '🦁', '🐼', '🐼', '🐨', '🐨'], // Animal
    ['🍓', '🍓', '🍌', '🍌', '🍎', '🍎', '🍉', '🍉', '🍇', '🍇', '🍒', '🍒'], // Fruit
    ['🚗', '🚗', '✈️', '✈️', '🚢', '🚢', '🚀', '🚀', '🚲', '🚲', '🚂', '🚂']  // Transport
  ];
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initMemoryGame = (themeIdx: number) => {
    const shuffled = [...memoryThemes[themeIdx]].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    playXyloNote(280 + index * 30, 'sine', 0.4);
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      if (cards[first] === cards[second]) {
        setMatched(prev => [...prev, first, second]);
        setFlipped([]);
        setTimeout(() => {
          playXyloNote(523.25, 'triangle', 0.6);
          setTimeout(() => playXyloNote(659.25, 'triangle', 0.6), 100);
        }, 150);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  // --- GAME: REFLEX TAPPING SYSTEM STATE ---
  const [score, setScore] = useState(0);
  const [activeReflexIdx, setActiveReflexIdx] = useState<number | null>(null);
  const reflexThemes = [
    { items: ['🍌', '🍎', '🍇', '🍓', '🍉'], bg: '🧺' }, // Fruits
    { items: ['🎈', '🎈', '🎈', '🎈', '🎈'], bg: '🌳' }, // Balloons
    { items: ['⭐', '🌟', '✨', '⭐', '🌟'], bg: '☁️' }  // Stars
  ];
  const [currentReflexEmoji, setCurrentReflexEmoji] = useState('🍌');

  const startReflexGame = (themeIdx: number) => {
    setScore(0);
    spawnReflex(themeIdx);
  };

  const spawnReflex = (themeIdx: number) => {
    const randomSpot = Math.floor(Math.random() * 4);
    const items = reflexThemes[themeIdx].items;
    const randomEmoji = items[Math.floor(Math.random() * items.length)];
    setActiveReflexIdx(randomSpot);
    setCurrentReflexEmoji(randomEmoji);
  };

  const handleReflexClick = (idx: number, themeIdx: number) => {
    if (idx !== activeReflexIdx) return;
    playXyloNote(400 + score * 15, 'sine', 0.35);
    setScore(prev => prev + 10);
    setActiveReflexIdx(null);
    setTimeout(() => spawnReflex(themeIdx), 350);
  };

  // --- GAME: QUIZ SYSTEMS STATES ---
  const [quizChallenge, setQuizChallenge] = useState({ prompt: '', correct: '', options: [] as string[] });
  const [quizStreak, setQuizStreak] = useState(0);

  const shapesListChall = [
    { prompt: "Estrela Amarela ⭐", correct: "⭐", options: ["⭐", "🟥", "🔵"] },
    { prompt: "Círculo Vermelho 🔴", correct: "🔴", options: ["🟢", "🔴", "🔺"] },
    { prompt: "Triângulo Verde 🔺", correct: "🔺", options: ["🔺", "🟦", "🟡"] },
    { prompt: "Quadrado Azul 🟦", correct: "🟦", options: ["⭐", "🟥", "🟦"] }
  ];

  const detectiveListChall = [
    { prompt: "Quem faz Miau? 🐱", correct: "🐱", options: ["🐶", "🐱", "🦁"] },
    { prompt: "Quem voa no céu? 🐦", correct: "🐦", options: ["🐳", "🐸", "🐦"] },
    { prompt: "Quem mora na água? 🐟", correct: "🐟", options: ["🐟", "🐰", "🐒"] },
    { prompt: "Quem adora banana? 🐒", correct: "🐒", options: ["🐨", "🐒", "🐘"] }
  ];

  const countListChall = [
    { prompt: "Quantos corações? ❤️❤️❤️", correct: "3", options: ["2", "3", "4"] },
    { prompt: "Quantas estrelas? ⭐⭐", correct: "2", options: ["1", "2", "3"] },
    { prompt: "Quantas maçãs? 🍎🍎🍎🍎", correct: "4", options: ["3", "4", "5"] },
    { prompt: "Quantas borboletas? 🦋", correct: "1", options: ["1", "2", "3"] }
  ];

  const oppositesListChall = [
    { prompt: "O oposto de Dia ☀️ é...", correct: "Noite 🌙", options: ["Chuva 🌧️", "Noite 🌙", "Quente 🔥"] },
    { prompt: "O oposto de Grande 🐘 é...", correct: "Pequeno 🐭", options: ["Pequeno 🐭", "Alto 🦒", "Gordo 🐻"] },
    { prompt: "O oposto de Feliz 😊 é...", correct: "Triste 😢", options: ["Triste 😢", "Bravo 😡", "Sonolento 😴"] },
    { prompt: "O oposto de Rápido ⚡ é...", correct: "Lento 🐢", options: ["Lento 🐢", "Forte 💪", "Alto 🧗"] }
  ];

  const initQuizGame = (gameIdx: number) => {
    let dataset = shapesListChall;
    if (gameIdx === 7) dataset = detectiveListChall;
    if (gameIdx === 8) dataset = countListChall;
    if (gameIdx === 9) dataset = oppositesListChall;

    const chall = dataset[Math.floor(Math.random() * dataset.length)];
    const shuffledOptions = [...chall.options].sort(() => Math.random() - 0.5);
    setQuizChallenge({
      prompt: chall.prompt,
      correct: chall.correct,
      options: shuffledOptions
    });
  };

  const handleQuizSelect = (option: string, gameIdx: number) => {
    if (option === quizChallenge.correct) {
      playXyloNote(523.25, 'triangle', 0.5);
      setQuizStreak(prev => prev + 1);
      setTimeout(() => initQuizGame(gameIdx), 400);
    } else {
      playXyloNote(170, 'sawtooth', 0.6);
      setQuizStreak(0);
    }
  };

  // Setup specific game setups when selected
  useEffect(() => {
    if (activeGameIdx !== null) {
      if (activeGameIdx >= 0 && activeGameIdx <= 2) {
        initMemoryGame(activeGameIdx); // Setup Memory Theme
      } else if (activeGameIdx >= 3 && activeGameIdx <= 5) {
        startReflexGame(activeGameIdx - 3); // Setup Reflex Theme
      } else if (activeGameIdx >= 6 && activeGameIdx <= 9) {
        setQuizStreak(0);
        initQuizGame(activeGameIdx); // Setup Quiz Theme
      }
    }
  }, [activeGameIdx]);

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
            onClick={() => {
              setSelectedCategory(cat.title);
              setActiveStoryIdx(null);
              setActiveMusicIdx(null);
              setActiveGameIdx(null);
            }}
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

      {/* --- POPUP INTERACTIVE CATEGORY MODAL --- */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-[2.5rem] max-w-2xl w-full p-6 md:p-8 shadow-2xl relative space-y-6"
            >
              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-5 right-5 bg-surface-container text-on-surface hover:bg-primary/10 hover:text-primary transition-colors p-2 rounded-full"
              >
                <X size={20} />
              </button>

              {/* Header Title with Back button navigation */}
              <div className="flex items-center gap-3">
                {(activeStoryIdx !== null || activeMusicIdx !== null || activeGameIdx !== null) && (
                  <button 
                    onClick={() => {
                      setActiveStoryIdx(null);
                      setActiveMusicIdx(null);
                      setActiveGameIdx(null);
                    }}
                    className="p-2 bg-surface-container text-on-surface hover:bg-primary/15 rounded-full transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <span className="p-3 bg-primary/10 text-primary rounded-2xl">
                  {selectedCategory === 'Histórias' && <BookOpen size={24} />}
                  {selectedCategory === 'Músicas' && <Music size={24} />}
                  {selectedCategory === 'Jogos' && <Puzzle size={24} />}
                </span>
                <div>
                  <h3 className="font-sans font-black text-2xl text-on-surface">{selectedCategory}</h3>
                  <p className="text-xs text-on-surface-variant font-medium">Selecione uma das 10 opções lúdicas!</p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* === CATEGORY: STORIES === */}
              {selectedCategory === 'Histórias' && (
                <>
                  {activeStoryIdx === null ? (
                    /* STORIES SELECTION LIST (10 STORIES!) */
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 hide-scrollbar">
                      <p className="text-xs font-black text-secondary tracking-widest uppercase sticky top-0 bg-surface-container-lowest py-2 z-10">Selecione uma história ilustrada:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                        {storiesList.map((story, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ y: -2, scale: 1.01 }}
                            onClick={() => {
                              setActiveStoryIdx(idx);
                              setStoryStep(0);
                            }}
                            className="p-4 bg-surface-container-low hover:bg-primary/5 rounded-2xl border border-outline-variant/30 flex gap-3 items-center cursor-pointer transition-all shadow-sm"
                          >
                            <span className="text-3xl bg-primary/10 p-2.5 rounded-xl">{story.emoji}</span>
                            <div className="space-y-0.5">
                              <h4 className="font-sans font-black text-xs text-on-surface leading-tight">{story.title}</h4>
                              <p className="text-[10px] text-on-surface-variant leading-tight">{story.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* ACTIVE INTERACTIVE STORY CONTAINER */
                    <div className="space-y-6">
                      <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${storiesList[activeStoryIdx].pages[storyStep].bg} text-center space-y-4 shadow-inner relative overflow-hidden transition-all duration-500 min-h-[200px] flex flex-col justify-center`}>
                        <div className="text-6xl animate-bounce duration-1000 mb-1">
                          {storiesList[activeStoryIdx].pages[storyStep].emoji}
                        </div>
                        <p className="text-sm font-bold leading-relaxed max-w-md mx-auto">
                          {storiesList[activeStoryIdx].pages[storyStep].text}
                        </p>
                      </div>
                      
                      <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 space-y-4 flex flex-col items-center">
                        <p className="text-xs font-black uppercase text-secondary tracking-widest text-center flex items-center gap-1.5">
                          <Sparkles size={14} className="text-primary animate-pulse" />
                          Ação necessária: {storiesList[activeStoryIdx].pages[storyStep].action}
                        </p>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            playXyloNote(380 + storyStep * 60, 'sine', 0.4);
                            if (storyStep === storiesList[activeStoryIdx].pages.length - 1) {
                              setActiveStoryIdx(null); // Back to catalog
                            } else {
                              setStoryStep((prev) => prev + 1);
                            }
                          }}
                          className="bg-primary text-on-primary font-black uppercase tracking-wider text-[10px] px-8 py-3.5 rounded-full shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                          <Play size={12} className="fill-current" />
                          {storiesList[activeStoryIdx].pages[storyStep].buttonText}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ======================================================== */}
              {/* === CATEGORY: MUSIC === */}
              {selectedCategory === 'Músicas' && (
                <>
                  {activeMusicIdx === null ? (
                    /* MUSIC SELECTION LIST (10 SONGS!) */
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 hide-scrollbar">
                      <p className="text-xs font-black text-secondary tracking-widest uppercase sticky top-0 bg-surface-container-lowest py-2 z-10">Selecione uma cantiga popular:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                        {musicList.map((m, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ y: -2, scale: 1.01 }}
                            onClick={() => setActiveMusicIdx(idx)}
                            className="p-4 bg-surface-container-low hover:bg-secondary/5 rounded-2xl border border-outline-variant/30 flex gap-3 items-center cursor-pointer transition-all shadow-sm"
                          >
                            <span className="text-3xl bg-secondary/15 p-2.5 rounded-xl">{m.emoji}</span>
                            <div className="space-y-0.5">
                              <h4 className="font-sans font-black text-xs text-on-surface leading-tight">{m.title}</h4>
                              <p className="text-[10px] text-on-surface-variant leading-tight">{m.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* ACTIVE MUSIC & INSTRUMENTS BOARD */
                    <div className="space-y-6">
                      <div className="bg-secondary-container/10 border border-secondary-container p-6 rounded-[2.5rem] text-center space-y-3 relative overflow-hidden">
                        <span className="absolute top-2 right-2 text-2xl animate-spin duration-3000">🎵</span>
                        <h4 className="font-sans font-bold text-lg text-secondary">Cantando: {musicList[activeMusicIdx].title} {musicList[activeMusicIdx].emoji}</h4>
                        <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic max-w-md mx-auto">
                          "{musicList[activeMusicIdx].lyrics}"
                        </p>
                        <div className="flex justify-center gap-1.5 pt-2">
                          {musicList[activeMusicIdx].sequence.map((n, idx) => (
                            <span key={idx} className="px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-full text-[10px] font-black uppercase text-primary tracking-widest">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Drum accompaniment helper for specific songs */}
                      {activeMusicIdx === 2 && (
                        <div className="bg-surface-container-low p-4 rounded-[2rem] border border-outline-variant/30 flex justify-center gap-4">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => playDrumSound('kick')}
                            className="w-24 h-16 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center shadow-md border-b-4 border-amber-700"
                          >
                            Bumbo 🥁
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => playDrumSound('snare')}
                            className="w-24 h-16 bg-slate-500 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center shadow-md border-b-4 border-slate-700"
                          >
                            Caixa 🥁
                          </motion.button>
                        </div>
                      )}

                      {/* Playable Xylophone Board */}
                      <div className="bg-surface-container-high rounded-[2.5rem] p-6 shadow-inner flex justify-center gap-2 items-stretch h-56 border border-outline-variant/30">
                        {xyloKeys.map((k, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ y: 2 }}
                            whileTap={{ scale: 0.92, opacity: 0.9 }}
                            onClick={() => playXyloNote(k.freq)}
                            className={`w-10 rounded-2xl flex flex-col justify-end pb-4 items-center text-white font-black text-xs shadow-md border-b-8 border-black/25 ${k.color} transition-all`}
                            style={{ height: `${100 - idx * 4}%` }}
                          >
                            <Volume2 size={12} className="mb-2 opacity-60" />
                            <span>{k.note}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ======================================================== */}
              {/* === CATEGORY: GAMES === */}
              {selectedCategory === 'Jogos' && (
                <>
                  {activeGameIdx === null ? (
                    /* GAMES SELECTION LIST (10 GAMES!) */
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 hide-scrollbar">
                      <p className="text-xs font-black text-secondary tracking-widest uppercase sticky top-0 bg-surface-container-lowest py-2 z-10">Selecione um mini-jogo educativo:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                        {gamesList.map((g, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ y: -2, scale: 1.01 }}
                            onClick={() => setActiveGameIdx(idx)}
                            className="p-4 bg-surface-container-low hover:bg-tertiary/5 rounded-2xl border border-outline-variant/30 flex gap-3 items-center cursor-pointer transition-all shadow-sm"
                          >
                            <span className="text-3xl bg-tertiary/15 p-2.5 rounded-xl">{g.emoji}</span>
                            <div className="space-y-0.5">
                              <h4 className="font-sans font-black text-xs text-on-surface leading-tight">{g.title}</h4>
                              <p className="text-[10px] text-on-surface-variant leading-tight">{g.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* ACTIVE INTERACTIVE GAME CONTAINER */
                    <div className="space-y-4">
                      
                      {/* MEMORY GAMES (GAMES 0, 1, 2) */}
                      {activeGameIdx >= 0 && activeGameIdx <= 2 && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-surface-container-low px-5 py-3 rounded-2xl border border-outline-variant/20">
                            <span className="text-xs font-black uppercase text-secondary tracking-widest flex items-center gap-1.5">
                              <Trophy size={14} className="text-tertiary" />
                              Movimentos: {moves}
                            </span>
                            <button 
                              onClick={() => initMemoryGame(activeGameIdx)}
                              className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-1.5 hover:opacity-80"
                            >
                              <RotateCcw size={12} /> Reiniciar
                            </button>
                          </div>

                          {matched.length === cards.length && cards.length > 0 ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-emerald-50 border border-emerald-200 rounded-[2rem] p-8 text-center space-y-4"
                            >
                              <span className="text-5xl">🏆✨</span>
                              <h4 className="font-sans font-bold text-xl text-emerald-800">Você ganhou! Lindo!</h4>
                              <p className="text-xs text-emerald-600 font-medium">Parabéns! Completou em {moves} rodadas.</p>
                              <button
                                onClick={() => initMemoryGame(activeGameIdx)}
                                className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider px-6 py-3 rounded-full hover:bg-emerald-500 shadow-lg"
                              >
                                Jogar Novamente 🔁
                              </button>
                            </motion.div>
                          ) : (
                            <div className="grid grid-cols-4 gap-3 bg-surface-container-high p-4 rounded-[2rem] border border-outline-variant/30 shadow-inner">
                              {cards.map((emoji, index) => {
                                const isFlipped = flipped.includes(index) || matched.includes(index);
                                return (
                                  <motion.button
                                    key={index}
                                    whileHover={{ scale: isFlipped ? 1 : 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleCardClick(index)}
                                    className={`h-20 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-sm ${
                                      isFlipped 
                                        ? 'bg-surface-container-lowest border-2 border-primary/20 scale-100 rotate-0' 
                                        : 'bg-gradient-to-tr from-primary to-secondary scale-95 border-b-4 border-primary/60 cursor-pointer'
                                    }`}
                                  >
                                    {isFlipped ? emoji : '❓'}
                                  </motion.button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* REFLEX TAPPING GAMES (GAMES 3, 4, 5) */}
                      {activeGameIdx >= 3 && activeGameIdx <= 5 && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-surface-container-low px-5 py-3 rounded-2xl border border-outline-variant/20">
                            <span className="text-xs font-black uppercase text-secondary tracking-widest flex items-center gap-1.5">
                              <Sparkles size={14} className="text-amber-500" />
                              Pontuação: {score} / 100
                            </span>
                            <button 
                              onClick={() => startReflexGame(activeGameIdx - 3)}
                              className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-1.5 hover:opacity-80"
                            >
                              <RotateCcw size={12} /> Reiniciar
                            </button>
                          </div>

                          {score >= 100 ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 text-center space-y-4"
                            >
                              <span className="text-5xl">🏆🎈⭐</span>
                              <h4 className="font-sans font-bold text-xl text-amber-800">Parabéns! Excelente agilidade!</h4>
                              <p className="text-xs text-amber-600 font-medium">Você concluiu o desafio rápido com 100 pontos!</p>
                              <button
                                onClick={() => startReflexGame(activeGameIdx - 3)}
                                className="bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider px-6 py-3 rounded-full hover:bg-emerald-500 shadow-lg"
                              >
                                Jogar Novamente 🔁
                              </button>
                            </motion.div>
                          ) : (
                            <div className="bg-surface-container-high rounded-[2.5rem] p-8 min-h-[220px] flex flex-col justify-center border border-outline-variant/30 shadow-inner">
                              <p className="text-center text-[10px] text-on-surface-variant font-bold mb-6">Clique no item piscando o mais rápido possível!</p>
                              <div className="grid grid-cols-4 gap-4 justify-items-center">
                                {[0, 1, 2, 3].map((idx) => {
                                  const isActive = idx === activeReflexIdx;
                                  return (
                                    <motion.button
                                      key={idx}
                                      onClick={() => handleReflexClick(idx, activeGameIdx - 3)}
                                      whileTap={{ scale: 0.9 }}
                                      className={`w-16 h-20 rounded-2xl flex flex-col items-center justify-center text-4xl shadow-md border border-outline-variant/30 transition-all ${
                                        isActive 
                                          ? 'bg-amber-100 border-amber-500 scale-105 shadow-amber-200/50' 
                                          : 'bg-surface-container-low opacity-40 cursor-default'
                                      }`}
                                    >
                                      {isActive ? currentReflexEmoji : reflexThemes[activeGameIdx - 3].bg}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PEDAGOGICAL QUIZ GAMES (GAMES 6, 7, 8, 9) */}
                      {activeGameIdx >= 6 && activeGameIdx <= 9 && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-surface-container-low px-5 py-3 rounded-2xl border border-outline-variant/20">
                            <span className="text-xs font-black uppercase text-secondary tracking-widest flex items-center gap-1.5">
                              <Award size={14} className="text-primary" />
                              Acertos Seguidos: {quizStreak} / 5
                            </span>
                            <button 
                              onClick={() => { setQuizStreak(0); initQuizGame(activeGameIdx); }}
                              className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-1.5 hover:opacity-80"
                            >
                              <RotateCcw size={12} /> Reiniciar
                            </button>
                          </div>

                          {quizStreak >= 5 ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-primary-container/10 border border-primary-container rounded-[2rem] p-8 text-center space-y-4"
                            >
                              <span className="text-5xl">🏆🎓✨</span>
                              <h4 className="font-sans font-bold text-xl text-primary">Sensacional! Você é um Gênio!</h4>
                              <p className="text-xs text-on-surface-variant font-medium">Completou com sucesso a sequência pedagógica de 5 acertos!</p>
                              <button
                                onClick={() => { setQuizStreak(0); initQuizGame(activeGameIdx); }}
                                className="bg-primary text-on-primary font-black text-[10px] uppercase tracking-wider px-6 py-3 rounded-full hover:bg-primary/95 shadow-lg"
                              >
                                Jogar Novamente 🔁
                              </button>
                            </motion.div>
                          ) : (
                            <div className="bg-surface-container-high rounded-[2.5rem] p-6 border border-outline-variant/30 shadow-inner text-center space-y-6">
                              <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Identifique o correto:</p>
                              <h3 className="font-sans font-black text-xl text-on-surface bg-surface-container-lowest border border-outline-variant/30 py-4 px-6 rounded-[2rem] inline-block shadow-sm">
                                {quizChallenge.prompt}
                              </h3>
                              
                              <div className="flex justify-center gap-3 pt-2">
                                {quizChallenge.options.map((opt, index) => (
                                  <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleQuizSelect(opt, activeGameIdx)}
                                    className="px-5 py-4 bg-surface-container-lowest hover:bg-primary/10 rounded-2xl flex items-center justify-center text-xl font-bold shadow-md border border-outline-variant/30 min-w-[80px]"
                                  >
                                    {opt}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
