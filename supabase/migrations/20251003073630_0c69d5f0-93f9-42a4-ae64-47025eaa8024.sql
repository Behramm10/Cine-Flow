-- Make performed_by nullable to allow system actions during signup
ALTER TABLE public.role_audit 
ALTER COLUMN performed_by DROP NOT NULL;

-- Update the trigger function to handle NULL performed_by gracefully
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;