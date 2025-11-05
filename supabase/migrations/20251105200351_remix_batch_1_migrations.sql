
-- Migration: 20251029005236

-- Migration: 20251016184442
-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('master', 'gerente', 'usuario');

-- Criar tabela de roles dos usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função de segurança para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar tabela de configurações da empresa
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  company_description TEXT,
  logo_url TEXT,
  target_audience TEXT,
  work_profile TEXT,
  interests TEXT,
  main_clients TEXT,
  whatsapp TEXT,
  email TEXT,
  facebook TEXT,
  instagram TEXT,
  linkedin TEXT,
  twitter TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_company_settings_updated
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Políticas RLS para user_roles
CREATE POLICY "Masters podem ver todas as roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters podem inserir roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters podem atualizar roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters podem deletar roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Usuários podem ver suas próprias roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Masters podem atualizar qualquer perfil"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'master'));

-- Políticas RLS para company_settings
CREATE POLICY "Masters podem ver configurações da empresa"
  ON public.company_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'master') OR public.has_role(auth.uid(), 'gerente'));

CREATE POLICY "Masters podem inserir configurações"
  ON public.company_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters podem atualizar configurações"
  ON public.company_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Usuários podem ver configurações"
  ON public.company_settings FOR SELECT
  USING (true);

-- Criar bucket de storage para logos e avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Públicos podem ver assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-assets');

CREATE POLICY "Usuários autenticados podem fazer upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar seus próprios assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Masters podem deletar assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'company-assets' AND (
    SELECT public.has_role(auth.uid(), 'master')
  ));

-- Migration: 20251016184500
-- Corrigir search_path da função handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Migration: 20251016185347
-- Drop the overly permissive policy that allows everyone to see all profiles
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

-- Create a restricted policy that only allows users to see their own profile
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow masters to view all profiles for administrative purposes
CREATE POLICY "Masters podem ver todos os perfis"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'master'::app_role));

-- Migration: 20251016185512
-- Drop the overly permissive policy that allows everyone to see company settings
DROP POLICY IF EXISTS "Usuários podem ver configurações" ON public.company_settings;

-- The existing role-based policy "Masters podem ver configurações da empresa" already restricts 
-- access to masters and managers, so no additional policy needed;

-- Migration: 20251016185706
-- Allow users to insert their own profile
CREATE POLICY "Usuários podem criar seu próprio perfil"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow masters to insert profiles for administrative purposes
CREATE POLICY "Masters podem criar perfis"
ON public.profiles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'master'::app_role));

-- Migration: 20251016190207
-- Create a separate table for sensitive contact information
CREATE TABLE public.user_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_contacts
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own contact information
CREATE POLICY "Usuários podem ver seus próprios contatos"
ON public.user_contacts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own contact information
CREATE POLICY "Usuários podem criar seus próprios contatos"
ON public.user_contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own contact information
CREATE POLICY "Usuários podem atualizar seus próprios contatos"
ON public.user_contacts
FOR UPDATE
USING (auth.uid() = user_id);

-- Masters can view all contact information for administrative purposes
CREATE POLICY "Masters podem ver todos os contatos"
ON public.user_contacts
FOR SELECT
USING (has_role(auth.uid(), 'master'::app_role));

-- Masters can update all contact information
CREATE POLICY "Masters podem atualizar contatos"
ON public.user_contacts
FOR UPDATE
USING (has_role(auth.uid(), 'master'::app_role));

-- Masters can insert contact information
CREATE POLICY "Masters podem criar contatos"
ON public.user_contacts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'master'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_user_contacts_updated_at
BEFORE UPDATE ON public.user_contacts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Migrate existing phone data from profiles to user_contacts
INSERT INTO public.user_contacts (user_id, phone)
SELECT id, phone 
FROM public.profiles 
WHERE phone IS NOT NULL;

-- Remove phone column from profiles table
ALTER TABLE public.profiles DROP COLUMN phone;

-- Migration: 20251016195504
-- Adicionar tenant_id à tabela company_settings para isolamento multi-tenant
ALTER TABLE public.company_settings 
ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Criar índice para melhorar performance nas queries
CREATE INDEX idx_company_settings_tenant_id ON public.company_settings(tenant_id);

-- Remover políticas RLS existentes
DROP POLICY IF EXISTS "Masters podem ver configurações da empresa" ON public.company_settings;
DROP POLICY IF EXISTS "Masters podem atualizar configurações" ON public.company_settings;
DROP POLICY IF EXISTS "Masters podem inserir configurações" ON public.company_settings;

-- Criar novas políticas RLS com isolamento de tenant
CREATE POLICY "Masters e gerentes podem ver configurações da própria empresa"
ON public.company_settings
FOR SELECT
USING (
  (has_role(auth.uid(), 'master'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND tenant_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Masters podem atualizar configurações da própria empresa"
ON public.company_settings
FOR UPDATE
USING (
  has_role(auth.uid(), 'master'::app_role)
  AND tenant_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Masters podem inserir configurações da própria empresa"
ON public.company_settings
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'master'::app_role)
  AND tenant_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Migration: 20251016195813
-- Adicionar tenant_id à tabela profiles para associação usuário-tenant
ALTER TABLE public.profiles 
ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Criar índice para melhorar performance
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);

-- Criar função security definer para obter tenant_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Atualizar políticas RLS da company_settings para usar tenant dinâmico
DROP POLICY IF EXISTS "Masters e gerentes podem ver configurações da própria empresa" ON public.company_settings;
DROP POLICY IF EXISTS "Masters podem atualizar configurações da própria empresa" ON public.company_settings;
DROP POLICY IF EXISTS "Masters podem inserir configurações da própria empresa" ON public.company_settings;

-- Novas políticas com tenant dinâmico
CREATE POLICY "Usuários podem ver configurações da própria empresa"
ON public.company_settings
FOR SELECT
USING (
  (has_role(auth.uid(), 'master'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND tenant_id = get_user_tenant_id()
);

CREATE POLICY "Masters podem atualizar configurações da própria empresa"
ON public.company_settings
FOR UPDATE
USING (
  has_role(auth.uid(), 'master'::app_role)
  AND tenant_id = get_user_tenant_id()
);

CREATE POLICY "Masters podem inserir configurações da própria empresa"
ON public.company_settings
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'master'::app_role)
  AND tenant_id = get_user_tenant_id()
);

-- Atualizar o trigger handle_new_user para definir tenant_id padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, tenant_id)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    '00000000-0000-0000-0000-000000000000'::uuid  -- Default tenant em modo single-tenant
  );
  RETURN new;
END;
$$;

-- Migration: 20251016195854
-- Criar função security definer para obter tenant_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Atualizar políticas RLS da company_settings para usar tenant dinâmico
DROP POLICY IF EXISTS "Usuários podem ver configurações da própria empresa" ON public.company_settings;
DROP POLICY IF EXISTS "Masters podem atualizar configurações da própria empresa" ON public.company_settings;
DROP POLICY IF EXISTS "Masters podem inserir configurações da própria empresa" ON public.company_settings;

-- Novas políticas com tenant dinâmico baseado no perfil do usuário
CREATE POLICY "Usuários podem ver configurações da própria empresa"
ON public.company_settings
FOR SELECT
USING (
  (has_role(auth.uid(), 'master'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND tenant_id = get_user_tenant_id()
);

CREATE POLICY "Masters podem atualizar configurações da própria empresa"
ON public.company_settings
FOR UPDATE
USING (
  has_role(auth.uid(), 'master'::app_role)
  AND tenant_id = get_user_tenant_id()
);

CREATE POLICY "Masters podem inserir configurações da própria empresa"
ON public.company_settings
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'master'::app_role)
  AND tenant_id = get_user_tenant_id()
);

-- Atualizar função handle_new_user para garantir tenant_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, tenant_id)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(
      (new.raw_user_meta_data->>'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid
    )
  );
  RETURN new;
END;
$$;

