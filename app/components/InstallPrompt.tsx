'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Share2 } from 'lucide-react';

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const dismissed = localStorage.getItem('educakids_install_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const dismissed = localStorage.getItem('educakids_install_dismissed');
      if (!dismissed) { setShow(true); return; }
      setShow(true);
    };
    window.addEventListener('educakids:show-install', handler);
    return () => window.removeEventListener('educakids:show-install', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShow(false);
        setInstallPrompt(null);
        localStorage.setItem('educakids_install_dismissed', 'true');
      }
    } else {
      setShow(false);
    }
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('educakids_install_dismissed', 'true');
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[70] pt-12 pb-3 px-4 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-xl"
        >
          {isIOS && !installPrompt ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Smartphone size={22} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">Instalar Educakids</p>
                  <p className="text-[10px] text-on-surface-variant">Use como app no seu iPhone</p>
                </div>
                <button onClick={dismiss} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high shrink-0">
                  <X size={16} />
                </button>
              </div>
              <div className="bg-surface-container-high rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">1</span>
                  <span>Toque em <Share2 size={12} className="inline text-primary" /> <strong>Compartilhar</strong> no Safari</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">2</span>
                  <span>Role até <strong>Adicionar à Tela de Início</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">3</span>
                  <span>Toque em <strong>Adicionar</strong> no canto superior</span>
                </div>
              </div>
              <p className="text-center text-[10px] text-on-surface-variant">Depois de instalar, feche esta mensagem</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Download size={22} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface">Instalar Educakids</p>
                <p className="text-[10px] text-on-surface-variant">Instale como app no seu celular</p>
              </div>
              <button
                onClick={handleInstall}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0"
              >
                <Download size={14} />
                Instalar
              </button>
              <button onClick={dismiss} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high shrink-0">
                <X size={16} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}