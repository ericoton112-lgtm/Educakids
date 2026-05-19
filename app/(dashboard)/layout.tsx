'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Home, Sparkles, Calendar, LayoutGrid, Bell, Sun, Moon, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Atividades', href: '/activities', icon: Sparkles },
    { label: 'Agenda', href: '/planner', icon: Calendar },
    { label: 'Sala', href: '/classroom', icon: LayoutGrid },
    { label: 'Biblioteca', href: '/explore', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex justify-between items-center px-5 h-16 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container hover:scale-105 transition-transform block">
            <img 
              alt="Profile" 
              src="https://picsum.photos/seed/teacher/200" 
              className="w-full h-full object-cover"
            />
          </Link>
          <h1 className="font-sans font-bold text-xl text-primary">Educakids</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-primary hover:bg-primary-container/10 rounded-full transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-2 text-primary hover:bg-primary-container/10 rounded-full transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 pt-20 pb-24 px-5 max-w-5xl mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface-container-lowest shadow-[0_-4px_20px_rgba(0,107,87,0.12)] rounded-t-lg transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-container text-on-primary-container scale-105 shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <item.icon size={24} className={isActive ? 'animate-bounce-short' : ''} />
              <span className="text-[10px] font-bold uppercase mt-1">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
