-- ========================================================
-- EDUCAKIDS - SCRIPT DE SETUP DO BANCO DE DADOS SUPABASE
-- ========================================================
-- Instruções: Copie todo o código abaixo, acesse o painel
-- do seu Supabase, clique em "SQL Editor" -> "New Query",
-- cole o código e clique em "Run" (Executar).
--
-- NOTA: Este script agora é 100% SEGURO e pode ser executado
-- várias vezes sem causar erros de "já existe".

-- 1. TABELA DE PLANEJAMENTO SEMANAL
CREATE TABLE IF NOT EXISTS public.planner_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL,
    goals JSONB NOT NULL DEFAULT '[]'::jsonb,
    days JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar segurança RLS (Row Level Security)
ALTER TABLE public.planner_plans ENABLE ROW LEVEL SECURITY;

-- Evita erro de "política já existe" apagando a antiga antes de criar
DROP POLICY IF EXISTS "Professores podem gerenciar seus próprios planos" ON public.planner_plans;

-- Política para que professores gerenciem apenas seus próprios planos
CREATE POLICY "Professores podem gerenciar seus próprios planos" 
ON public.planner_plans FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. TABELA DE ALUNOS DA SALA DE AULA
CREATE TABLE IF NOT EXISTS public.classroom_students (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    behavior TEXT NOT NULL DEFAULT 'smile',
    notes TEXT NOT NULL DEFAULT '',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    color TEXT NOT NULL DEFAULT 'bg-primary-container',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar segurança RLS (Row Level Security)
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;

-- Evita erro de "política já existe" apagando a antiga antes de criar
DROP POLICY IF EXISTS "Professores podem gerenciar seus próprios alunos" ON public.classroom_students;

-- Política para que professores gerenciem apenas seus próprios alunos
CREATE POLICY "Professores podem gerenciar seus próprios alunos" 
ON public.classroom_students FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. TABELA DE PERFIS DE PROFESSORES (PÚBLICA)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    classes TEXT,
    school TEXT,
    avatar TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar segurança RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Evita erros de políticas existentes para a tabela profiles
DROP POLICY IF EXISTS "Professores autenticados podem ver perfis" ON public.profiles;
DROP POLICY IF EXISTS "Professores podem atualizar seu próprio perfil" ON public.profiles;

-- Política para visualizar perfis
CREATE POLICY "Professores autenticados podem ver perfis" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Política para atualizar o próprio perfil
CREATE POLICY "Professores podem atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Função especial do PostgreSQL para criar o perfil público automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, classes, school, avatar)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Professora Maria'),
    new.email,
    coalesce(new.raw_user_meta_data->>'classes', 'Berçário A'),
    coalesce(new.raw_user_meta_data->>'school', 'Colégio Saber'),
    'https://picsum.photos/seed/teacher/400'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Evita erro de trigger duplicado removendo o antigo se já existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger para executar a função automaticamente no cadastro do Supabase Auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar replicação em tempo real para sincronização instantânea (Opcional)
-- Usamos bloco de exceção para evitar erros caso a tabela já esteja na publicação
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.planner_plans;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_students;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
