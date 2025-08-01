import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserCheck, Crown, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  user_id: string;
  name: string;
  plan: 'basic' | 'vip';
  created_at: string;
  phone?: string;
  avatar_url?: string;
  role?: 'admin' | 'moderator' | 'user';
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles dos usuários
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combinar dados de perfil com roles
      const usersWithRoles = profilesData?.map(profile => ({
        ...profile,
        role: rolesData?.find(role => role.user_id === profile.user_id)?.role || 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userId: string, newPlan: 'basic' | 'vip') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ plan: newPlan })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano do usuário atualizado com sucesso"
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano do usuário",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      // Primeiro, remove o role existente
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Depois, adiciona o novo role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Permissão do usuário atualizada com sucesso"
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a permissão do usuário",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-yellow-100 text-yellow-800">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-100 text-blue-800">Moderador</Badge>;
      default:
        return <Badge variant="secondary">Usuário</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>;
      default:
        return <Badge variant="outline">Básico</Badge>;
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
        <h2 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h2>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os usuários da plataforma
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar usuários específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista de todos os usuários registrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Membro desde</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <UserCheck className="h-4 w-4" />
                        </div>
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPlanBadge(user.plan)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role || 'user')}
                      {getRoleBadge(user.role || 'user')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.phone || 'Não informado'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={user.plan}
                        onValueChange={(value) => updateUserPlan(user.user_id, value as 'basic' | 'vip')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={user.role || 'user'}
                        onValueChange={(value) => updateUserRole(user.user_id, value as 'admin' | 'moderator' | 'user')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="moderator">Moderador</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum usuário encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;