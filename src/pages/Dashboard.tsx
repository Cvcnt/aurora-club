import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Crown, Star, Gift, User, LogOut, Filter, Sparkles, ExternalLink } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Benefit {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  plan_required: 'basic' | 'vip';
  discount_percentage?: number;
  partner_name?: string;
  terms_conditions?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'gastronomia', label: 'Gastronomia' },
    { value: 'viagem', label: 'Viagem' },
    { value: 'entretenimento', label: 'Entretenimento' },
    { value: 'compras', label: 'Compras' },
    { value: 'beleza', label: 'Beleza & Bem-estar' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'esportes', label: 'Esportes' },
    { value: 'educacao', label: 'Educação' }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBenefits();
    }
  }, [user, selectedCategory]);

  const fetchBenefits = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('benefits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as any);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching benefits:', error);
        toast({
          title: "Erro ao carregar benefícios",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        });
        return;
      }

      setBenefits(data || []);
    } catch (error) {
      console.error('Error fetching benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemBenefit = async (benefitId: string) => {
    if (!user || !profile) return;

    setRedeeming(benefitId);

    try {
      // Generate redemption code
      const redemptionCode = `ACB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { error } = await supabase
        .from('redemptions')
        .insert({
          user_id: user.id,
          benefit_id: benefitId,
          status: 'pending',
          redemption_code: redemptionCode,
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

      if (error) {
        toast({
          title: "Erro ao resgatar benefício",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Show success with confetti effect (we'll simulate it)
      toast({
        title: "🎉 Benefício resgatado com sucesso!",
        description: `Código: ${redemptionCode}. Válido por 30 dias.`,
      });

      // Navigate to profile to see redemption
      navigate('/profile');

    } catch (error) {
      console.error('Error redeeming benefit:', error);
      toast({
        title: "Erro ao resgatar benefício",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const canAccessBenefit = (benefit: Benefit) => {
    if (!profile) return false;
    return benefit.plan_required === 'basic' || profile.plan === 'vip';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Crown className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold nex-logo-text">NEX RUMO</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={profile.plan === 'vip' ? 'default' : 'secondary'} className="flex items-center gap-1">
                {profile.plan === 'vip' ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                {profile.plan === 'vip' ? 'VIP' : 'Básico'}
              </Badge>
              <span className="text-sm text-muted-foreground">Olá, {profile.name}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Seus benefícios exclusivos
          </h1>
          <p className="text-muted-foreground">
            Explore e resgate experiências únicas disponíveis para seu plano
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {profile.plan === 'basic' && (
            <Button 
              variant="outline" 
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={() => navigate('/upgrade')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade para VIP
            </Button>
          )}
        </div>

        {/* Benefits Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando benefícios...</p>
          </div>
        ) : benefits.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum benefício encontrado</h3>
            <p className="text-muted-foreground">
              Tente alterar os filtros ou volte mais tarde
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card 
                key={benefit.id} 
                className={`benefit-card ${!canAccessBenefit(benefit) ? 'opacity-60' : ''}`}
              >
                {benefit.image_url && (
                  <div className="aspect-video overflow-hidden rounded-t-xl">
                    <img 
                      src={benefit.image_url} 
                      alt={benefit.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{benefit.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={benefit.plan_required === 'vip' ? 'default' : 'secondary'}>
                          {benefit.plan_required === 'vip' ? 'VIP' : 'Básico'}
                        </Badge>
                        {benefit.discount_percentage && (
                          <Badge variant="outline" className="text-accent border-accent">
                            {benefit.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {benefit.partner_name && (
                    <p className="text-sm text-muted-foreground">
                      Parceiro: {benefit.partner_name}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {benefit.description}
                  </CardDescription>
                  
                  {benefit.terms_conditions && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {benefit.terms_conditions}
                    </p>
                  )}
                  
                  <Button 
                    className="w-full aurora-button"
                    disabled={!canAccessBenefit(benefit) || redeeming === benefit.id}
                    onClick={() => redeemBenefit(benefit.id)}
                  >
                    {redeeming === benefit.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Resgatando...
                      </>
                    ) : !canAccessBenefit(benefit) ? (
                      'Upgrade necessário'
                    ) : (
                      <>
                        Resgatar benefício
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;