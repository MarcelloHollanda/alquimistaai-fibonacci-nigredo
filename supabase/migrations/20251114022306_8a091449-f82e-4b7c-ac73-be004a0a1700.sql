-- Atualizar a função handle_new_user para criar role automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_count INTEGER;
  assigned_role app_role;
BEGIN
  -- Contar quantos usuários já existem
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- Se for o primeiro usuário, atribuir role 'master'
  -- Caso contrário, atribuir role 'usuario' por padrão
  IF user_count <= 1 THEN
    assigned_role := 'master';
  ELSE
    assigned_role := 'usuario';
  END IF;
  
  -- Criar perfil do usuário
  INSERT INTO public.profiles (id, full_name, tenant_id)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(
      (new.raw_user_meta_data->>'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid
    )
  );
  
  -- Criar role do usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, assigned_role);
  
  RETURN new;
END;
$$;