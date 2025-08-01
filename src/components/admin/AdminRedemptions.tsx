import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Redemption {
  id: string;
  user_id: string;
  benefit_id: string;
  status: string;
  redemption_code?: string;
  redeemed_at: string;
  used_at?: string;
  expiry_date?: string;
  notes?: string;
  user_name?: string;
  benefit_title?: string;
}

const AdminRedemptions = () => {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select('*')
        .order('redeemed_at', { ascending: false });

      if (error) throw error;

      // Buscar dados dos usuários e benefícios separadamente
      const userIds = [...new Set(data?.map(r => r.user_id) || [])];
      const benefitIds = [...new Set(data?.map(r => r.benefit_id) || [])];

      const [{ data: profiles }, { data: benefits }] = await Promise.all([
        supabase.from('profiles').select('user_id, name').in('user_id', userIds),
        supabase.from('benefits').select('id, title').in('id', benefitIds)
      ]);

      const redemptionsWithDetails = data?.map((redemption: any) => ({
        ...redemption,
        user_name: profiles?.find(p => p.user_id === redemption.user_id)?.name || 'Usuário desconhecido',
        benefit_title: benefits?.find(b => b.id === redemption.benefit_id)?.title || 'Benefício não encontrado'
      })) || [];

      setRedemptions(redemptionsWithDetails);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os resgates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRedemptionStatus = async (redemptionId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.used_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('redemptions')
        .update(updateData)
        .eq('id', redemptionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do resgate atualizado com sucesso"
      });
      fetchRedemptions();
    } catch (error) {
      console.error('Error updating redemption status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do resgate",
        variant: "destructive"
      });
    }
  };

  const filteredRedemptions = redemptions.filter(redemption => {
    const matchesSearch = 
      redemption.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.benefit_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.redemption_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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
        <h2 className="text-3xl font-bold tracking-tight">Gerenciar Resgates</h2>
        <p className="text-muted-foreground">
          Monitore e gerencie todos os resgates de benefícios realizados pelos usuários
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, benefício ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resgates ({filteredRedemptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Benefício</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data do Resgate</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRedemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>{redemption.user_name}</TableCell>
                  <TableCell>{redemption.benefit_title}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {redemption.redemption_code || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                  <TableCell>{formatDate(redemption.redeemed_at)}</TableCell>
                  <TableCell>
                    <Select
                      value={redemption.status}
                      onValueChange={(value) => updateRedemptionStatus(redemption.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="expired">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRedemptions;