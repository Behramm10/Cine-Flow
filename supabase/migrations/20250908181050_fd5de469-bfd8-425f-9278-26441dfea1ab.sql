-- Add admin-only policies for role management (these should replace any user self-insert policies)
-- First, check if policies exist and create them if they don't

-- Create admin-only policies for role management
DO $$ 
BEGIN
    -- Add admin-only INSERT policy for user_roles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'Only admins can insert user roles'
    ) THEN
        CREATE POLICY "Only admins can insert user roles" 
        ON public.user_roles 
        FOR INSERT 
        WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
    END IF;

    -- Add admin-only UPDATE policy for user_roles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'Only admins can update user roles'
    ) THEN
        CREATE POLICY "Only admins can update user roles" 
        ON public.user_roles 
        FOR UPDATE 
        USING (has_role(auth.uid(), 'admin'::app_role));
    END IF;

    -- Add admin-only DELETE policy for user_roles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'Only admins can delete user roles'
    ) THEN
        CREATE POLICY "Only admins can delete user roles" 
        ON public.user_roles 
        FOR DELETE 
        USING (has_role(auth.uid(), 'admin'::app_role));
    END IF;
END $$;

-- Add missing RLS policies for showtimes table (admin-only operations)
DO $$ 
BEGIN
    -- Add admin-only INSERT policy for showtimes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'showtimes' 
        AND policyname = 'Admins can insert showtimes'
    ) THEN
        CREATE POLICY "Admins can insert showtimes" 
        ON public.showtimes 
        FOR INSERT 
        WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
    END IF;

    -- Add admin-only UPDATE policy for showtimes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'showtimes' 
        AND policyname = 'Admins can update showtimes'
    ) THEN
        CREATE POLICY "Admins can update showtimes" 
        ON public.showtimes 
        FOR UPDATE 
        USING (has_role(auth.uid(), 'admin'::app_role));
    END IF;

    -- Add admin-only DELETE policy for showtimes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'showtimes' 
        AND policyname = 'Admins can delete showtimes'
    ) THEN
        CREATE POLICY "Admins can delete showtimes" 
        ON public.showtimes 
        FOR DELETE 
        USING (has_role(auth.uid(), 'admin'::app_role));
    END IF;
END $$;

-- Create audit table for role changes (security monitoring)
CREATE TABLE IF NOT EXISTS public.role_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  action text NOT NULL CHECK (action IN ('granted', 'revoked')),
  performed_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.role_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'role_audit' 
        AND policyname = 'Admins can view role audit logs'
    ) THEN
        CREATE POLICY "Admins can view role audit logs" 
        ON public.role_audit 
        FOR SELECT 
        USING (has_role(auth.uid(), 'admin'::app_role));
    END IF;
END $$;

-- Create or replace trigger function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit (user_id, role, action, performed_by)
    VALUES (NEW.user_id, NEW.role, 'granted', auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_audit (user_id, role, action, performed_by)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for role change logging if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'role_changes_audit_trigger'
    ) THEN
        CREATE TRIGGER role_changes_audit_trigger
          AFTER INSERT OR DELETE ON public.user_roles
          FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();
    END IF;
END $$;