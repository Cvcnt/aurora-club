import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Crown, Star, User, ArrowLeft, Calendar, Clock, Check, X, Code, Sparkles } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Redemption {
  id: string;
  benefit_id: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  redeemed_at: string;
  used_at?: string;
  expiry_date?: string;
  redemption_code?: string;
  notes?: string;
  benefits: {
    title: string;
    description: string;
    category: string;
    partner_name?: string;
    discount_percentage?: number;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRedemptions();
    }
  }, [user]);

  const fetchRedemptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select(`
          *,
          benefits (
            title,
            description,
            category,
            partner_name,
            discount_percentage
          )
        `)
        .eq('user_id', user?.id)
        .order('redeemed_at', { ascending: false });

      if (error) {
        console.error('Error fetching redemptions:', error);
        toast({
          title: "Erro ao carregar histórico",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        });
        return;
      }

      setRedemptions(data || []);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'expired':
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Usado';
      case 'expired':
        return 'Expirado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'expired':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiry_date?: string) => {
    if (!expiry_date) return false;
    return new Date(expiry_date) < new Date();
  };

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRedemptions = redemptions.filter(r => r.status === 'pending' && !isExpired(r.expiry_date));
  const usedRedemptions = redemptions.filter(r => r.status === 'completed');
  const expiredRedemptions = redemptions.filter(r => r.status === 'expired' || isExpired(r.expiry_date));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gradient-text drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">NEX RUMO</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="aurora-glow p-4 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile.plan === 'vip' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {profile.plan === 'vip' ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                  Plano {profile.plan === 'vip' ? 'VIP' : 'Básico'}
                </Badge>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </div>

          {profile.plan === 'basic' && (
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium mb-1">Upgrade para VIP</h3>
                    <p className="text-sm text-muted-foreground">
                      Desbloqueie benefícios exclusivos e descontos de até 50%
                    </p>
                  </div>
                  <Button className="gold-button">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="benefit-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Resgates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{redemptions.length}</p>
            </CardContent>
          </Card>
          
          <Card className="benefit-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">{activeRedemptions.length}</p>
            </CardContent>
          </Card>
          
          <Card className="benefit-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{usedRedemptions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Redemptions History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Resgates</CardTitle>
            <CardDescription>
              Acompanhe todos os seus benefícios resgatados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Ativos ({activeRedemptions.length})</TabsTrigger>
                <TabsTrigger value="used">Usados ({usedRedemptions.length})</TabsTrigger>
                <TabsTrigger value="expired">Expirados ({expiredRedemptions.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-6">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : activeRedemptions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum benefício ativo</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeRedemptions.map((redemption) => (
                      <Card key={redemption.id} className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{redemption.benefits.title}</h4>
                              {redemption.benefits.partner_name && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  Parceiro: {redemption.benefits.partner_name}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Resgatado em {formatDate(redemption.redeemed_at)}
                                </div>
                                {redemption.expiry_date && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Expira em {formatDate(redemption.expiry_date)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="mb-2">
                                {getStatusIcon(redemption.status)}
                                <span className="ml-1">{getStatusLabel(redemption.status)}</span>
                              </Badge>
                              {redemption.redemption_code && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Code className="h-3 w-3" />
                                  <code className="bg-muted px-2 py-1 rounded text-xs">
                                    {redemption.redemption_code}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="used" className="mt-6">
                {usedRedemptions.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum benefício utilizado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usedRedemptions.map((redemption) => (
                      <Card key={redemption.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{redemption.benefits.title}</h4>
                              {redemption.benefits.partner_name && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  Parceiro: {redemption.benefits.partner_name}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Usado em {redemption.used_at ? formatDate(redemption.used_at) : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <Badge variant={getStatusVariant(redemption.status)}>
                              {getStatusIcon(redemption.status)}
                              <span className="ml-1">{getStatusLabel(redemption.status)}</span>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="expired" className="mt-6">
                {expiredRedemptions.length === 0 ? (
                  <div className="text-center py-8">
                    <X className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum benefício expirado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expiredRedemptions.map((redemption) => (
                      <Card key={redemption.id} className="opacity-60">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{redemption.benefits.title}</h4>
                              {redemption.benefits.partner_name && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  Parceiro: {redemption.benefits.partner_name}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Resgatado em {formatDate(redemption.redeemed_at)}
                                </div>
                                {redemption.expiry_date && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Expirou em {formatDate(redemption.expiry_date)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant="destructive">
                              {getStatusIcon(redemption.status)}
                              <span className="ml-1">Expirado</span>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;