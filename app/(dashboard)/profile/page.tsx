'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Bell, Shield, Moon, LogOut, ChevronRight, GraduationCap, Building, Edit2, Save, Camera, X, Check, Sparkles, Calendar, LayoutGrid, BookOpen, Sun, Smile, Loader2, Award, Clock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { startOfWeek, format } from 'date-fns';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Professora',
    email: 'profa@educakids.com',
    classes: 'Berçário A',
    school: 'Escola',
    avatar: 'https://picsum.photos/seed/teacher/400'
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [isDark, setIsDark] = useState(false);

  // Estatísticas
  const [stats, setStats] = useState({ students: 0, activities: 0, planners: 0 });

  // Dados do dia
  const [todaySummary, setTodaySummary] = useState({ theme: '', present: 0, total: 0, activity: '' });

  // Conquistas
  const [achievements, setAchievements] = useState<{ id: string; label: string; icon: string; earned: boolean }[]>([]);

  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Tema atual
    setIsDark(document.documentElement.classList.contains('dark'));

    // 1. Carregar do localStorage
    const stored = localStorage.getItem('educakids_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfile(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
        }));
      } catch { /* ignore */ }
    }

    // 2. Carregar do Supabase
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setProfile({
              name: data.name || profile.name,
              email: data.email || user.email || profile.email,
              classes: data.classes || profile.classes,
              school: data.school || profile.school,
              avatar: data.avatar || profile.avatar,
            });
            localStorage.setItem('educakids_user', JSON.stringify({
              name: data.name || profile.name,
              email: data.email || profile.email,
            }));
            return;
          }
        } catch { /* ignore */ }

        const metaName = user.user_metadata?.name;
        const metaClasses = user.user_metadata?.classes || '';
        const metaSchool = user.user_metadata?.school || '';
        if (metaName || metaClasses || metaSchool) {
          setProfile(prev => ({
            ...prev,
            name: metaName || prev.name,
            email: user.email || prev.email,
            classes: metaClasses || prev.classes,
            school: metaSchool || prev.school,
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      }
    };
    loadProfile();

    // 3. Estatísticas
    const studentsData = localStorage.getItem('educakids_students');
    const studentCount = studentsData ? JSON.parse(studentsData).length : 0;

    const historyData = localStorage.getItem('educakids_activity_history');
    const activityCount = historyData ? JSON.parse(historyData).length : 0;

    let plannerCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('educakids_plan_')) plannerCount++;
    }
    setStats({ students: studentCount, activities: activityCount, planners: plannerCount });

    // 4. Resumo do dia
    const now = new Date();
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    const weekKey = format(monday, 'yyyy-MM-dd');
    const planData = localStorage.getItem(`educakids_plan_${weekKey}`);
    let theme = '';
    let activity = '';
    if (planData) {
      try {
        const plan = JSON.parse(planData);
        theme = plan.theme || '';
        const todayIndex = now.getDay() - 1;
        if (todayIndex >= 0 && todayIndex < (plan.days || []).length) {
          const todayPlan = plan.days[todayIndex];
          activity = todayPlan?.activities?.[0]?.text || todayPlan?.focus || '';
        }
      } catch { /* ignore */ }
    }
    const present = studentsData ? JSON.parse(studentsData).filter((s: any) => s.behavior !== 'absent').length : 0;
    setTodaySummary({ theme, present, total: studentCount, activity });

    // 5. Conquistas
    const achievementsList = [
      { id: 'planner', label: 'Planejador', icon: '📋', earned: plannerCount > 0 },
      { id: 'creative', label: 'Criativo', icon: '🎨', earned: activityCount > 0 },
      { id: 'turma', label: 'Professor(a)', icon: '👥', earned: studentCount >= 3 },
      { id: 'explorer', label: 'Explorador', icon: '🗺️', earned: plannerCount >= 3 },
      { id: 'dedicado', label: 'Dedicado', icon: '⭐', earned: activityCount >= 3 },
    ];
    setAchievements(achievementsList);
  }, [supabase]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfile(prev => ({ ...prev, avatar: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('educakids_theme', newDark ? 'dark' : 'light');
  };

  const handleSave = async () => {
    setSaving(true);

    localStorage.setItem('educakids_user', JSON.stringify({
      name: profile.name,
      email: profile.email,
    }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: profile.name,
            email: profile.email,
            classes: profile.classes,
            school: profile.school,
            avatar: profile.avatar,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.warn('Tabela profiles pode não existir:', error.message);
        }
      }
      showToast('Dados salvos com sucesso! ✅', 'success');
    } catch (err: any) {
      console.warn('Erro ao salvar no Supabase:', err?.message || err);
      showToast('Salvo localmente! ☁️', 'success');
    } finally {
      setSaving(false);
    }
  };

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalAchievements = achievements.length;

  const quickActions = [
    { label: 'Chamada', href: '/classroom', icon: LayoutGrid, color: 'bg-primary/10 text-primary' },
    { label: 'Atividades', href: '/activities', icon: Sparkles, color: 'bg-secondary/10 text-secondary' },
    { label: 'Planejar', href: '/planner', icon: Calendar, color: 'bg-tertiary/10 text-tertiary' },
    { label: 'Biblioteca', href: '/explore', icon: BookOpen, color: 'bg-primary/10 text-primary' },
  ];

  const profileSettings = [
    { id: 'notif', icon: Bell, title: 'Notificações', desc: 'Gerencie alertas e e-mails diários', color: 'text-primary bg-primary-container/30' },
    { id: 'theme', icon: isDark ? Sun : Moon, title: isDark ? 'Modo Claro' : 'Modo Escuro', desc: isDark ? 'Ativar tema claro' : 'Ativar tema escuro', color: 'text-secondary bg-secondary-container/30', onClick: toggleTheme },
    { id: 'sec', icon: Shield, title: 'Segurança da Conta', desc: 'Senha, PIN e autenticação de 2 fatores', color: 'text-tertiary bg-tertiary-container/30' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border ${
              toast.type === 'success'
                ? 'bg-success-container text-on-success-container border-success/30'
                : 'bg-error-container text-on-error-container border-error/30'
            }`}
          >
            {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Principal do Perfil */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] p-6 sm:p-8 border border-outline-variant/30 shadow-soft flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-surface shadow-lg relative z-10 bg-surface-container">
            <img 
              alt="Teacher" 
              src={profile.avatar} 
              className={`w-full h-full object-cover transition-opacity ${isEditing ? 'opacity-50' : 'opacity-100'}`}
            />
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white bg-black/40 hover:bg-black/60 transition-colors cursor-pointer rounded-full"
              >
                <Camera size={22} className="mb-0.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Alterar</span>
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3 mt-1 w-full">
          {isEditing ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-left w-full max-w-xl"
            >
              <div>
                <label className="text-[10px] font-black text-outline uppercase tracking-widest px-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-surface-container-low border-none rounded-2xl px-5 py-3 font-sans font-bold text-on-surface focus:ring-2 focus:ring-primary/50 text-lg outline-none transition-all shadow-inner"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-outline uppercase tracking-widest px-2">Turmas (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    value={profile.classes} 
                    onChange={e => setProfile({...profile, classes: e.target.value})}
                    placeholder="Ex: Berçário A, Maternal I"
                    className="w-full bg-surface-container-low border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-outline uppercase tracking-widest px-2">Instituição / Escola</label>
                  <input 
                    type="text" 
                    value={profile.school} 
                    onChange={e => setProfile({...profile, school: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner text-on-surface"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="px-5 bg-surface-container-high text-on-surface-variant rounded-2xl font-bold hover:bg-error-container hover:text-error transition-colors flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div>
                  <h2 className="font-sans font-black text-2xl sm:text-3xl text-on-surface">Olá, Prof(a). {profile.name}</h2>
                  <p className="text-on-surface-variant font-medium text-sm flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <Mail size={14} />
                    {profile.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface font-bold text-xs flex items-center gap-2 hover:bg-surface-container-high hover:shadow-md transition-all border border-outline-variant/30"
                  >
                    <Edit2 size={14} className="text-primary" />
                    Editar
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-all border border-outline-variant/30"
                    title={isDark ? 'Modo Claro' : 'Modo Escuro'}
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                {profile.classes.split(',').map((c, i) => {
                  if(!c.trim()) return null;
                  return (
                    <span key={i} className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <GraduationCap size={14} />
                      {c.trim()}
                    </span>
                  );
                })}
                {profile.school.trim() && (
                  <span className="px-4 py-1.5 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Building size={14} />
                    {profile.school.trim()}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Cards de Estatísticas */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-2xl text-center space-y-1">
          <Smile size={20} className="mx-auto text-primary" />
          <p className="font-black text-2xl text-on-surface">{stats.students}</p>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Alunos</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-2xl text-center space-y-1">
          <Sparkles size={20} className="mx-auto text-secondary" />
          <p className="font-black text-2xl text-on-surface">{stats.activities}</p>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Atividades</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-2xl text-center space-y-1">
          <Calendar size={20} className="mx-auto text-tertiary" />
          <p className="font-black text-2xl text-on-surface">{stats.planners}</p>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Planos</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-2xl text-center space-y-1">
          <Award size={20} className="mx-auto text-primary" />
          <p className="font-black text-2xl text-on-surface">{earnedCount}/{totalAchievements}</p>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Conquistas</p>
        </div>
      </section>

      {/* Mini Resumo do Dia */}
      {(todaySummary.theme || todaySummary.activity || todaySummary.total > 0) && (
        <section className="bg-gradient-to-br from-primary/5 via-surface-container-lowest to-secondary/5 rounded-3xl p-5 border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Resumo do Dia</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {todaySummary.theme && (
              <div className="bg-surface-container-low/40 rounded-2xl p-3 text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tema da Semana</p>
                <p className="font-bold text-sm text-on-surface">{todaySummary.theme}</p>
              </div>
            )}
            {todaySummary.total > 0 && (
              <div className="bg-surface-container-low/40 rounded-2xl p-3 text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Presenças</p>
                <p className="font-bold text-sm text-on-surface">
                  <Smile size={14} className="inline text-success mr-1" />
                  {todaySummary.present}/{todaySummary.total}
                </p>
              </div>
            )}
            {todaySummary.activity && (
              <div className="bg-surface-container-low/40 rounded-2xl p-3 text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Próxima Atividade</p>
                <p className="font-bold text-sm text-on-surface leading-tight">{todaySummary.activity}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Atalhos Rápidos */}
      <section className="space-y-3">
        <h3 className="font-sans font-bold text-lg text-on-surface px-1">Atalhos Rápidos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href} className="block">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-2xl flex flex-col items-center gap-2 text-center hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon size={20} />
                </div>
                <span className="text-xs font-bold text-on-surface">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Conquistas */}
      {achievements.some(a => a.earned) && (
        <section className="space-y-3">
          <h3 className="font-sans font-bold text-lg text-on-surface px-1">Conquistas</h3>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  a.earned
                    ? 'bg-primary-container/30 text-primary border-primary/20 shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant/40 border-outline-variant/20 opacity-50'
                }`}
              >
                <span>{a.icon}</span>
                {a.label}
                {a.earned && <Check size={12} className="text-primary" />}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Configurações da Conta */}
      <section className="space-y-3">
        <h3 className="font-sans font-bold text-lg text-on-surface px-1">Configurações</h3>
        <div className="grid grid-cols-1 gap-2">
          {profileSettings.map((setting, i) => (
            <motion.div 
              key={setting.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={setting.onClick}
              className="bg-surface-container-lowest border border-outline-variant/30 p-4 rounded-3xl flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${setting.color}`}>
                <setting.icon size={22} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-on-surface text-sm">{setting.title}</h4>
                <p className="text-xs text-on-surface-variant">{setting.desc}</p>
              </div>
              <div className="text-outline group-hover:text-primary group-hover:translate-x-1 transition-all mr-2">
                <ChevronRight size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Logout */}
      <section className="pt-2">
        <motion.button 
          onClick={async () => {
            localStorage.removeItem('educakids_user');
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-error-container text-on-error-container font-bold py-4 rounded-full flex items-center justify-center gap-2 border border-error/20 hover:bg-error hover:text-on-error transition-colors shadow-sm"
        >
          <LogOut size={20} />
          Sair da Conta
        </motion.button>
      </section>
    </div>
  );
}