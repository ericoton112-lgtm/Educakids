'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, Calendar, LayoutGrid, BookOpen, Sun, Moon, ChevronDown } from 'lucide-react';
import { PrintProvider } from '../context/PrintContext';
import InstallPrompt from '../components/InstallPrompt';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [teacherName, setTeacherName] = useState('Professora');

  useEffect(() => {
    const saved = localStorage.getItem('educakids_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const stored = localStorage.getItem('educakids_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setTeacherName(parsed.name);
      } catch { /* ignore */ }
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
      <div className="flex flex-col min-h-screen md:ml-64">
        <InstallPrompt />

        {/* Sidebar - Desktop only */}
        <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-full bg-surface border-r border-outline-variant/20 p-5 z-50">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-black text-sm shadow-md">
              EK
            </div>
            <span className="font-sans font-bold text-xl text-primary">EducaKids</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-container/80 text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-bold">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface-variant hover:bg-surface-container-high transition-colors mb-4"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-sm font-bold">{isDarkMode ? 'Claro' : 'Escuro'}</span>
          </button>

          <Link href="/profile" className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-high hover:bg-surface-container-higher transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">{teacherName}</p>
              <p className="text-[10px] text-on-surface-variant font-medium truncate">Professor(a)</p>
            </div>
            <ChevronDown size={14} className="text-on-surface-variant/50" />
          </Link>
        </aside>

        {/* Top Header */}
        <header className="fixed top-0 left-0 md:left-64 right-0 z-40 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center px-5 h-16 md:h-14">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container hover:scale-105 transition-transform block shrink-0">
              <div className="w-full h-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            </Link>
            <h1 className="font-sans font-bold text-xl text-primary">Educakids</h1>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleDarkMode} className="p-2 text-primary hover:bg-primary-container/10 rounded-full transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 pt-16 pb-24 md:pb-16 px-4 max-w-5xl mx-auto w-full">
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

        {/* Bottom Navigation - Mobile only */}
        <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden flex justify-around items-center px-4 pb-6 pt-3 bg-surface/70 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,107,87,0.08)] transition-colors duration-300">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 relative ${
                  isActive ? 'bg-primary-container/80 text-on-primary-container scale-105 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <item.icon size={24} />
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
