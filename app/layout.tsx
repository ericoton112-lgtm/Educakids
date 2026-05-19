import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Nunito_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const nunito = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'EduSpark - Nurture & Bloom',
  description: 'Sistema de gestão pedagógica e biblioteca de atividades para professores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
