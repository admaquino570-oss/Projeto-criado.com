import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, Film, Tv } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  const [contents, setContents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', type: 'movie' as 'movie' | 'series',
    category_id: '', release_year: '', rating: '', is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: contentsData } = await supabase.from('content').select('*, categories(name)').order('created_at', { ascending: false });
    setContents(contentsData || []);
    const { data: categoriesData } = await supabase.from('categories').select('*');
    setCategories(categoriesData || []);
  };

  const handleUploadCover = async (file: File, contentId: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${contentId}/cover.${fileExt}`;
    const { error } = await supabase.storage.from('covers').upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(filePath);
    await supabase.from('content').update({ cover_url: publicUrl }).eq('id', contentId);
    return publicUrl;
  };

  const handleUploadVideo = async (file: File, contentId: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${contentId}/video.${fileExt}`;
    const { error } = await supabase.storage.from('videos').upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);
    await supabase.from('content').update({ video_url: publicUrl }).eq('id', contentId);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        category_id: formData.category_id || null,
        release_year: formData.release_year ? parseInt(formData.release_year) : null,
      };

      if (editingContent) {
        await supabase.from('content').update(payload).eq('id', editingContent.id);
        toast.success('Conteúdo atualizado!');
      } else {
        await supabase.from('content').insert(payload);
        toast.success('Conteúdo criado!');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    await supabase.from('content').delete().eq('id', id);
    toast.success('Conteúdo excluído!');
    fetchData();
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', type: 'movie', category_id: '', release_year: '', rating: '', is_featured: false });
    setEditingContent(null);
  };

  const openEditDialog = (content: any) => {
    setEditingContent(content);
    setFormData({
      title: content.title, description: content.description || '', type: content.type,
      category_id: content.category_id || '', release_year: content.release_year?.toString() || '',
      rating: content.rating || '', is_featured: content.is_featured,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display">Painel Administrativo</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Adicionar Conteúdo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingContent ? 'Editar' : 'Adicionar'} Conteúdo</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Título</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                  <div><Label>Tipo</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'movie' | 'series' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="movie">Filme</SelectItem><SelectItem value="series">Série</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Descrição</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Ano</Label><Input type="number" value={formData.release_year} onChange={(e) => setFormData({ ...formData, release_year: e.target.value })} /></div>
                  <div><Label>Classificação</Label><Input value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} placeholder="Ex: 16+" /></div>
                  <div><Label>Categoria</Label>
                    <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                  <Label htmlFor="featured">Destaque</Label>
                </div>
                <Button type="submit" disabled={loading} className="w-full">{loading ? 'Salvando...' : 'Salvar'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="content">
          <TabsList><TabsTrigger value="content">Conteúdos</TabsTrigger><TabsTrigger value="categories">Categorias</TabsTrigger></TabsList>
          <TabsContent value="content" className="mt-6">
            <div className="grid gap-4">
              {contents.map((content) => (
                <div key={content.id} className="flex items-center gap-4 p-4 bg-card rounded-lg">
                  <div className="h-20 w-14 bg-muted rounded overflow-hidden flex-shrink-0">
                    {content.cover_url ? <img src={content.cover_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">{content.type === 'movie' ? <Film className="h-6 w-6 text-muted-foreground" /> : <Tv className="h-6 w-6 text-muted-foreground" />}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{content.title}</h3>
                    <p className="text-sm text-muted-foreground">{content.type === 'movie' ? 'Filme' : 'Série'} • {content.release_year || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (e.target.files?.[0]) { await handleUploadCover(e.target.files[0], content.id); fetchData(); toast.success('Capa enviada!'); } }} />
                      <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4 mr-1" />Capa</span></Button>
                    </label>
                    <label className="cursor-pointer">
                      <input type="file" accept="video/mp4" className="hidden" onChange={async (e) => { if (e.target.files?.[0]) { await handleUploadVideo(e.target.files[0], content.id); fetchData(); toast.success('Vídeo enviado!'); } }} />
                      <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4 mr-1" />Vídeo</span></Button>
                    </label>
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(content)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(content.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              {contents.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum conteúdo cadastrado</p>}
            </div>
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <CategoryManager categories={categories} onUpdate={fetchData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const CategoryManager = ({ categories, onUpdate }: { categories: any[]; onUpdate: () => void }) => {
  const [name, setName] = useState('');

  const addCategory = async () => {
    if (!name.trim()) return;
    await supabase.from('categories').insert({ name: name.trim() });
    setName('');
    onUpdate();
    toast.success('Categoria criada!');
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    onUpdate();
    toast.success('Categoria excluída!');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova categoria" />
        <Button onClick={addCategory}>Adicionar</Button>
      </div>
      <div className="grid gap-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 bg-card rounded">
            <span>{c.name}</span>
            <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
