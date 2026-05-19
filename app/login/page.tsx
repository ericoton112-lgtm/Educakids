'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BookMarked, Mail, Lock, LogIn, Chrome, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <div className="fixed top-20 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2"></div>
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <header className="w-full max-w-md flex justify-between items-center h-20 px-4 absolute top-0">
        <div className="flex items-center gap-3">
          <BookMarked size={32} className="text-primary" />
          <h1 className="font-sans font-bold text-2xl text-primary tracking-tight">EduSpark</h1>
        </div>
      </header>

      <main className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/30 shadow-2xl space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="font-sans font-black text-2xl text-on-surface">Bem-vindo de volta!</h2>
            <p className="text-sm text-on-surface-variant">Entre para gerenciar sua sala de aula</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4" htmlFor="email">Endereço de E-mail</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input 
                  type="email"
                  id="email"
                  placeholder="profa.maria@eduspark.com"
                  className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest" htmlFor="password">Senha</label>
                <button type="button" className="text-[10px] font-black text-primary hover:opacity-80 transition-opacity">ESQUECEU A SENHA?</button>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input 
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <Link href="/" className="block">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-sans font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <LogIn size={20} />
                Entrar
              </motion.button>
            </Link>
          </form>

          <div className="relative flex items-center gap-4">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="text-[9px] font-black text-outline uppercase tracking-widest">OU CONTINUE COM</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button className="w-full flex items-center justify-center gap-3 py-4 border-2 border-outline-variant/20 rounded-full text-xs font-black uppercase text-on-surface hover:bg-surface-container-low transition-colors active:scale-98">
              Sincronizar com Supabase
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-4 border-2 border-outline-variant/20 rounded-full text-xs font-black uppercase text-on-surface hover:bg-surface-container-low transition-colors active:scale-98">
              <Chrome size={20} className="text-[#EA4335]" />
              Entrar com Google
            </button>
          </div>

          <p className="text-center text-xs text-on-surface-variant">
            Não tem uma conta? 
            <button className="text-primary font-black ml-1 hover:underline underline-offset-4 uppercase text-[10px]">Cadastre-se</button>
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-primary-container/20 p-4 rounded-3xl flex flex-col items-center text-center gap-2 border border-primary/10">
            <ShieldCheck size={24} className="text-primary" />
            <span className="text-[10px] font-black text-on-primary-container uppercase tracking-wider">Espaço Seguro</span>
          </div>
          <div className="bg-secondary-container/20 p-4 rounded-3xl flex flex-col items-center text-center gap-2 border border-secondary/10">
            <RefreshCw size={24} className="text-secondary" />
            <span className="text-[10px] font-black text-on-secondary-container uppercase tracking-wider">Sincronização</span>
          </div>
        </div>
      </main>
    </div>
  );
}
