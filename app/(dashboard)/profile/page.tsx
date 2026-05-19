'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Bell, Shield, Moon, LogOut, ChevronRight, GraduationCap, Building, Edit2, Save, Camera, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Professora Maria',
    email: 'profa.maria@eduspark.com',
    classes: 'Berçário A',
    school: 'Colégio Saber',
    avatar: 'https://picsum.photos/seed/teacher/400'
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Tentar buscar da tabela pública "profiles"
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile({
            name: data.name || 'Professora Maria',
            email: data.email || user.email || 'profa.maria@eduspark.com',
            classes: data.classes || 'Berçário A',
            school: data.school || 'Colégio Saber',
            avatar: data.avatar || 'https://picsum.photos/seed/teacher/400'
          });
        } else {
          // Fallback seguro caso a tabela profiles ainda não tenha o registro
          setProfile(prev => ({
            ...prev,
            email: user.email || prev.email,
            name: user.user_metadata?.name || prev.name,
            classes: user.user_metadata?.classes || prev.classes,
            school: user.user_metadata?.school || prev.school,
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar perfil público:', err);
      }
    };
    loadProfile();
  }, [supabase]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newAvatarUrl = URL.createObjectURL(e.target.files[0]);
      setProfile(prev => ({ ...prev, avatar: newAvatarUrl }));
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Atualizar tabela pública "profiles"
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: profile.name,
            email: user.email,
            classes: profile.classes,
            school: profile.school,
            avatar: profile.avatar,
            updated_at: new Date().toISOString()
          });
      }
    } catch (err) {
      console.error('Erro ao salvar perfil no Supabase:', err);
    }
  };

  const profileSettings = [
    { id: 'notif', icon: Bell, title: 'Notificações', desc: 'Gerencie alertas e e-mails diários', color: 'text-primary bg-primary-container/30' },
    { id: 'sec', icon: Shield, title: 'Segurança da Conta', desc: 'Senha, PIN e autenticação de 2 fatores', color: 'text-secondary bg-secondary-container/30' },
    { id: 'theme', icon: Moon, title: 'Aparência', desc: 'Alterne entre o tema claro e escuro no menu superior', color: 'text-tertiary bg-tertiary-container/30' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 border border-outline-variant/30 shadow-soft flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-lg relative z-10 bg-surface-container">
            <img 
              alt="Teacher Profile" 
              src={profile.avatar} 
              className={`w-full h-full object-cover transition-opacity ${isEditing ? 'opacity-50' : 'opacity-100'}`}
            />
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
              >
                <Camera size={24} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Alterar</span>
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

        <div className="flex-1 space-y-3 mt-2 w-full">
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
                  className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 hover:scale-[1.02] transition-all active:scale-95"
                >
                  <Save size={18} /> Salvar Alterações
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
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                <div>
                  <h2 className="font-sans font-black text-3xl text-on-surface">Olá, Prof(a). {profile.name}</h2>
                  <p className="text-on-surface-variant font-medium text-sm flex items-center justify-center md:justify-start gap-2">
                    <Mail size={14} />
                    {profile.email}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-full bg-surface-container-low text-on-surface font-bold text-xs flex items-center gap-2 hover:bg-surface-container-high hover:shadow-md transition-all border border-outline-variant/30"
                >
                  <Edit2 size={14} className="text-primary" />
                  Editar Perfil
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
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

      <section className="space-y-4">
        <h3 className="font-sans font-bold text-xl text-on-surface px-2">Configurações da Conta</h3>
        <div className="grid grid-cols-1 gap-3">
          {profileSettings.map((setting, i) => (
            <motion.div 
              key={setting.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-surface-container-lowest border border-outline-variant/30 p-4 rounded-3xl flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${setting.color}`}>
                <setting.icon size={24} />
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

      <section className="pt-4">
        <motion.button 
          onClick={async () => {
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
