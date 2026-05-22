'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, Calendar, LayoutGrid, BookOpen, Sun, Moon } from 'lucide-react';
import { PrintProvider } from '../context/PrintContext';
import InstallPrompt from '../components/InstallPrompt';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('educakids_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('educakids_theme', next ? 'dark' : 'light');
  };

  const navItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Atividades', href: '/activities', icon: Sparkles },
    { label: 'Agenda', href: '/planner', icon: Calendar },
    { label: 'Sala', href: '/classroom', icon: LayoutGrid },
    { label: 'Biblioteca', href: '/explore', icon: BookOpen },
  ];

  return (
    <PrintProvider>
      <div className="flex flex-col min-h-screen">
        <InstallPrompt />

        <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center px-5 h-16 md:h-14">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container hover:scale-105 transition-transform block shrink-0">
              <img alt="Profile" src="https://picsum.photos/seed/teacher/200" className="w-full h-full object-cover" />
            </Link>
            <h1 className="font-sans font-bold text-xl text-primary">Educakids</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 text-primary hover:bg-primary-container/10 rounded-full transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 pt-16 pb-24 px-4 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface/70 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,107,87,0.08)] transition-colors duration-300">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 relative ${
                  isActive ? 'bg-primary-container/80 text-on-primary-container scale-105 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <item.icon size={24} className={isActive ? '' : ''} />
                <span className="text-[10px] font-bold uppercase mt-0.5">{item.label}</span>
                {isActive && <motion.div layoutId="activeNav" className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </PrintProvider>
  );
}
