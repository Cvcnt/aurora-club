import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gift, ShoppingCart, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalBenefits: number;
  totalRedemptions: number;
  activeUsers: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBenefits: 0,
    totalRedemptions: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Buscar total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Buscar total de benefícios
      const { count: totalBenefits } = await supabase
        .from('benefits')
        .select('*', { count: 'exact', head: true });

      // Buscar total de resgates
      const { count: totalRedemptions } = await supabase
        .from('redemptions')
        .select('*', { count: 'exact', head: true });

      // Buscar usuários ativos (que fizeram pelo menos um resgate)
      const { data: activeUsersData } = await supabase
        .from('redemptions')
        .select('user_id')
        .eq('status', 'completed');

      const uniqueActiveUsers = new Set(activeUsersData?.map(r => r.user_id) || []).size;

      setStats({
        totalUsers: totalUsers || 0,
        totalBenefits: totalBenefits || 0,
        totalRedemptions: totalRedemptions || 0,
        activeUsers: uniqueActiveUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema NEX RUMO
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefícios Ativos</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBenefits}</div>
            <p className="text-xs text-muted-foreground">
              Benefícios disponíveis no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Resgates</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">
              Resgates realizados pelos usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários que realizaram resgates
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Principais tarefas administrativas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              • Gerenciar benefícios e ofertas especiais
            </div>
            <div className="text-sm">
              • Monitorar atividade dos usuários
            </div>
            <div className="text-sm">
              • Acompanhar métricas de engajamento
            </div>
            <div className="text-sm">
              • Configurar novos planos e categorias
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Informações sobre o funcionamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema de Benefícios</span>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Autenticação</span>
              <span className="text-sm text-green-600 font-medium">Funcionando</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de Dados</span>
              <span className="text-sm text-green-600 font-medium">Conectada</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;