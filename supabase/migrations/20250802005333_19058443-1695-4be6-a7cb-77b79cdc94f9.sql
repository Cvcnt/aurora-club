-- Assign admin role to the current user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('982e3a4e-12f7-45bd-9300-d4d714b4662b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;