'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookMarked, Mail, Lock, LogIn, Chrome, ShieldCheck, RefreshCw, Loader2, UserPlus, User, GraduationCap, Building } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [teachingSegment, setTeachingSegment] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        router.push('/');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName || 'Professora Maria',
              classes: teachingSegment || 'Berçário A',
              school: schoolName || 'Colégio Saber',
            }
          }
        });
        if (error) throw error;
        
        alert('Cadastro realizado com sucesso! Você já pode entrar.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <div className="fixed top-20 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2"></div>
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <header className="w-full max-w-md flex justify-between items-center h-20 px-4 absolute top-0">
        <div className="flex items-center gap-3">
          <BookMarked size={32} className="text-primary" />
          <h1 className="font-sans font-bold text-2xl text-primary tracking-tight">Educakids</h1>
        </div>
      </header>

      <main className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/30 shadow-2xl space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="font-sans font-black text-2xl text-on-surface">
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta!'}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {isLogin ? 'Entre para gerenciar sua sala de aula' : 'Junte-se à plataforma educacional'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4" htmlFor="fullName">Nome Completo</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      id="fullName"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Professora Maria"
                      className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4" htmlFor="teachingSegment">Segmento / Turma</label>
                  <div className="relative group">
                    <GraduationCap size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      id="teachingSegment"
                      required
                      value={teachingSegment}
                      onChange={(e) => setTeachingSegment(e.target.value)}
                      placeholder="Berçário A"
                      className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4" htmlFor="schoolName">Nome da Escola</label>
                  <div className="relative group">
                    <Building size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      id="schoolName"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Colégio Saber"
                      className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all text-on-surface"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4" htmlFor="email">Endereço de E-mail</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input 
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="profa.maria@educakids.com"
                  className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest" htmlFor="password">Senha</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black text-primary hover:opacity-80 transition-opacity">ESQUECEU A SENHA?</button>
                )}
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input 
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all text-on-surface"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-error-container text-on-error-container text-xs font-bold p-3 rounded-xl text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-sans font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isLogin ? (
                <><LogIn size={20} /> Entrar</>
              ) : (
                <><UserPlus size={20} /> Cadastrar</>
              )}
            </motion.button>
          </form>


          <p className="text-center text-xs text-on-surface-variant">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'} 
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-primary font-black ml-1 hover:underline underline-offset-4 uppercase text-[10px]"
            >
              {isLogin ? 'Cadastre-se' : 'Entrar'}
            </button>
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
