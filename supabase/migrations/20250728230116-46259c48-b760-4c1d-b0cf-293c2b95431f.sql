-- Create enum for user plans
CREATE TYPE public.user_plan AS ENUM ('basic', 'vip');

-- Create enum for benefit categories
CREATE TYPE public.benefit_category AS ENUM ('gastronomia', 'viagem', 'entretenimento', 'compras', 'beleza', 'tecnologia', 'esportes', 'educacao');

-- Create enum for redemption status
CREATE TYPE public.redemption_status AS ENUM ('pending', 'completed', 'expired', 'cancelled');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan user_plan NOT NULL DEFAULT 'basic',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefits table
CREATE TABLE public.benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category benefit_category NOT NULL,
  image_url TEXT,
  link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  plan_required user_plan NOT NULL DEFAULT 'basic',
  discount_percentage INTEGER DEFAULT 0,
  original_price DECIMAL(10,2),
  partner_name TEXT,
  terms_conditions TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create redemptions table
CREATE TABLE public.redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
  status redemption_status NOT NULL DEFAULT 'pending',
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  redemption_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for benefits (public read for active benefits)
CREATE POLICY "Anyone can view active benefits" 
ON public.benefits 
FOR SELECT 
USING (is_active = true);

-- Admin policy for benefits management (will be implemented later)
CREATE POLICY "Authenticated users can view all benefits" 
ON public.benefits 
FOR SELECT 
TO authenticated
USING (true);

-- Create policies for redemptions
CREATE POLICY "Users can view their own redemptions" 
ON public.redemptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions" 
ON public.redemptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own redemptions" 
ON public.redemptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefits_updated_at
  BEFORE UPDATE ON public.benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_redemptions_updated_at
  BEFORE UPDATE ON public.redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, plan)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.email), 
    'basic'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample benefits
INSERT INTO public.benefits (title, description, category, image_url, plan_required, discount_percentage, partner_name, terms_conditions) VALUES
('Desconto 30% em Restaurantes Premium', 'Descontos exclusivos em mais de 500 restaurantes parceiros nas principais capitais', 'gastronomia', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', 'basic', 30, 'Rede Gastronômica Premium', 'Válido de segunda a quinta-feira. Não cumulativo com outras promoções.'),
('50% OFF em Hotéis de Luxo', 'Hospedagem com desconto em resorts e hotéis 5 estrelas', 'viagem', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 'vip', 50, 'Luxury Hotels Network', 'Sujeito à disponibilidade. Reserva com 48h de antecedência.'),
('Ingressos VIP para Eventos', 'Acesso antecipado e descontos em shows, teatro e eventos culturais', 'entretenimento', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', 'vip', 25, 'Entertainment Plus', 'Quantidade limitada por evento.'),
('Cashback 20% em Compras Online', 'Cashback em milhares de lojas online parceiras', 'compras', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 'basic', 20, 'ShopBack Brasil', 'Cashback creditado em até 30 dias.'),
('Spa e Bem-estar Premium', 'Tratamentos exclusivos com desconto em spas de luxo', 'beleza', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400', 'vip', 40, 'Wellness Network', 'Agendamento sujeito à disponibilidade.'),
('Gadgets e Eletrônicos com Desconto', 'Descontos especiais em tecnologia e eletrônicos', 'tecnologia', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400', 'basic', 15, 'TechZone', 'Garantia estendida inclusa.');

-- Create indexes for better performance
CREATE INDEX idx_benefits_category ON public.benefits(category);
CREATE INDEX idx_benefits_plan_required ON public.benefits(plan_required);
CREATE INDEX idx_benefits_is_active ON public.benefits(is_active);
CREATE INDEX idx_redemptions_user_id ON public.redemptions(user_id);
CREATE INDEX idx_redemptions_benefit_id ON public.redemptions(benefit_id);
CREATE INDEX idx_redemptions_status ON public.redemptions(status);