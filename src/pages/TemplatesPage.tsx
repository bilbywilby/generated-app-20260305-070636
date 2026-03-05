import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IllustrativeCard } from '@/components/ui/illustrative-card';
import { Button } from '@/components/ui/button';
import { Plus, Layout, Trash2, Edit3, Tag, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [usingId, setUsingId] = useState<string | null>(null);
  const { data: templates, isLoading } = useQuery({ 
    queryKey: ['templates'], 
    queryFn: api.templates.list 
  });
  const createMutation = useMutation({
    mutationFn: api.templates.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setIsCreateOpen(false);
      toast.success('Template created successfully');
    }
  });
  const deleteMutation = useMutation({
    mutationFn: api.templates.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.info('Template removed');
    }
  });
  const handleUseTemplate = async (tpl: any) => {
    setUsingId(tpl.id);
    try {
      const newDraft = await api.drafts.create({
        title: `New ${tpl.name} Draft`,
        content: tpl.content,
        templateId: tpl.id,
        channel: 'email', // Default
        status: 'draft'
      });
      toast.success('Draft created from template');
      navigate(`/drafts/${newDraft.id}`);
    } catch (e) {
      toast.error('Failed to create draft');
    } finally {
      setUsingId(null);
    }
  };
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as string,
      schema: (formData.get('schema') as string).split(',').map(s => s.trim())
    });
  };
  return (
    <AppLayout container>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Template Registry</h1>
            <p className="text-muted-foreground font-medium">Standardize your brand's voice across all platforms.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-soft bg-primary text-white">
                <Plus className="mr-2 h-4 w-4" /> New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Draft a New Template</DialogTitle>
                <DialogDescription className="text-muted-foreground">Create a new reusable template for your brand communications. Supports dynamic variables like {'{{name}}'}, {'{{date}}'} for personalization across email, Slack, and SMS channels.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" name="name" required className="input-rounded" placeholder="e.g. Onboarding Email" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" className="input-rounded" placeholder="e.g. Growth" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schema">Variables (comma separated)</Label>
                    <Input id="schema" name="schema" className="input-rounded" placeholder="name, date, coupon" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content Structure (Markdown)</Label>
                  <Textarea id="content" name="content" className="rounded-2xl min-h-[200px]" placeholder="Hi {{name}}, welcome to Nexus..." />
                </div>
                <Button type="submit" className="w-full btn-soft bg-primary text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Save Template'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-4xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates?.map((tpl) => (
              <IllustrativeCard key={tpl.id} className="group relative overflow-hidden flex flex-col">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteMutation.mutate(tpl.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{tpl.name}</h3>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Tag className="w-3 h-3 mr-1" /> {tpl.category}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-3 bg-muted/30 p-3 rounded-xl italic border border-border">
                    {tpl.content}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tpl.schema.map(v => (
                      <span key={v} className="text-[10px] font-bold bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-auto p-4 border-t bg-muted/20">
                  <Button 
                    disabled={usingId === tpl.id}
                    onClick={() => handleUseTemplate(tpl)}
                    variant="outline" 
                    className="w-full btn-soft border-primary/20 text-primary hover:bg-primary/5"
                  >
                    {usingId === tpl.id ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Edit3 className="mr-2 w-4 h-4" />}
                    Use Template
                  </Button>
                </div>
              </IllustrativeCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}