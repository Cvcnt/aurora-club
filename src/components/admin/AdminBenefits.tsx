import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Benefit {
  id: string;
  title: string;
  description: string;
  category: 'gastronomia' | 'viagem' | 'entretenimento' | 'compras' | 'beleza' | 'tecnologia' | 'esportes' | 'educacao';
  plan_required: 'basic' | 'vip';
  discount_percentage?: number;
  original_price?: number;
  partner_name?: string;
  link?: string;
  is_active: boolean;
  image_url?: string;
}

const AdminBenefits = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: 'gastronomia' | 'viagem' | 'entretenimento' | 'compras' | 'beleza' | 'tecnologia' | 'esportes' | 'educacao';
    plan_required: 'basic' | 'vip';
    discount_percentage: number;
    original_price: number;
    partner_name: string;
    link: string;
    image_url: string;
    is_active: boolean;
  }>({
    title: '',
    description: '',
    category: 'viagem' as const,
    plan_required: 'basic' as const,
    discount_percentage: 0,
    original_price: 0,
    partner_name: '',
    link: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBenefits(data || []);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os benefícios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBenefit) {
        const { error } = await supabase
          .from('benefits')
          .update(formData)
          .eq('id', editingBenefit.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Benefício atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('benefits')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Benefício criado com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingBenefit(null);
      resetForm();
      fetchBenefits();
    } catch (error) {
      console.error('Error saving benefit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o benefício",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      title: benefit.title,
      description: benefit.description,
      category: benefit.category,
      plan_required: benefit.plan_required,
      discount_percentage: benefit.discount_percentage || 0,
      original_price: benefit.original_price || 0,
      partner_name: benefit.partner_name || '',
      link: benefit.link || '',
      image_url: benefit.image_url || '',
      is_active: benefit.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este benefício?')) return;

    try {
      const { error } = await supabase
        .from('benefits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Benefício excluído com sucesso"
      });
      fetchBenefits();
    } catch (error) {
      console.error('Error deleting benefit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o benefício",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'viagem' as const,
      plan_required: 'basic' as const,
      discount_percentage: 0,
      original_price: 0,
      partner_name: '',
      link: '',
      image_url: '',
      is_active: true
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Benefícios</h2>
          <p className="text-muted-foreground">
            Adicione, edite e gerencie os benefícios disponíveis na plataforma
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingBenefit(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Benefício
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBenefit ? 'Editar Benefício' : 'Novo Benefício'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do benefício
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="partner_name">Parceiro</Label>
                  <Input
                    id="partner_name"
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viagem">Viagem</SelectItem>
                      <SelectItem value="gastronomia">Gastronomia</SelectItem>
                      <SelectItem value="entretenimento">Entretenimento</SelectItem>
                      <SelectItem value="compras">Compras</SelectItem>
                      <SelectItem value="beleza">Beleza</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="esportes">Esportes</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plan_required">Plano Necessário</Label>
                  <Select value={formData.plan_required} onValueChange={(value: any) => setFormData({ ...formData, plan_required: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_percentage">Desconto (%)</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="original_price">Preço Original (R$)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="link">Link do Benefício</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBenefit ? 'Atualizar' : 'Criar'} Benefício
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit.id} className="benefit-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {benefit.partner_name && `Por ${benefit.partner_name}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(benefit)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(benefit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {benefit.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{benefit.category}</Badge>
                  <Badge variant={benefit.plan_required === 'basic' ? 'default' : 'secondary'}>
                    {benefit.plan_required}
                  </Badge>
                  {benefit.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  ) : (
                    <Badge variant="destructive">Inativo</Badge>
                  )}
                </div>

                {benefit.discount_percentage && benefit.discount_percentage > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-primary">
                      {benefit.discount_percentage}% de desconto
                    </span>
                    {benefit.original_price && benefit.original_price > 0 && (
                      <span className="text-muted-foreground ml-2">
                        de R$ {benefit.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {benefits.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum benefício encontrado. Crie o primeiro benefício para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBenefits;