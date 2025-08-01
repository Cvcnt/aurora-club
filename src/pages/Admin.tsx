import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Navigate } from 'react-router-dom';
import { Crown, Users, Gift, BarChart3, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminBenefits from '@/components/admin/AdminBenefits';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminRedemptions from '@/components/admin/AdminRedemptions';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold nex-logo-text">Administração NEX RUMO</h1>
                <p className="text-muted-foreground">Painel de controle administrativo</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="benefits" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Benefícios
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Resgates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="benefits" className="mt-6">
            <AdminBenefits />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="redemptions" className="mt-6">
            <AdminRedemptions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;