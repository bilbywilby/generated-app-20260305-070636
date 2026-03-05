import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { IllustrativeCard } from '@/components/ui/illustrative-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare, Send, Sparkles, Save, ChevronLeft, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import { chatService } from '@/lib/chat';
import { toast } from 'sonner';
export default function DraftEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<'email' | 'slack' | 'sms'>('email');
  const [aiInput, setAiInput] = useState('');
  const [aiHistory, setAiHistory] = useState<{ role: string, content: string }[]>([]);
  const { data: draft, isLoading } = useQuery({
    queryKey: ['draft', id],
    queryFn: () => api.drafts.get(id!),
    enabled: !isNew
  });
  useEffect(() => {
    if (draft) {
      setContent(draft.content);
      setTitle(draft.title);
      setChannel(draft.channel);
    }
  }, [draft]);
  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.drafts.create(data) : api.drafts.update(id!, data),
    onSuccess: (saved) => {
      toast.success('Progress saved');
      if (isNew) navigate(`/drafts/${saved.id}`);
    }
  });
  const handleAiAsk = async () => {
    if (!aiInput.trim()) return;
    const prompt = `Rewrite or improve this communication draft. Current draft: "${content}". User Request: "${aiInput}"`;
    setAiHistory(prev => [...prev, { role: 'user', content: aiInput }]);
    setAiInput('');
    try {
      const response = await chatService.sendMessage(prompt);
      if (response.success && response.data?.messages) {
        const lastMsg = response.data.messages[response.data.messages.length - 1];
        setAiHistory(prev => [...prev, { role: 'assistant', content: lastMsg.content }]);
      }
    } catch (e) {
      toast.error("AI assistant encountered a snag.");
    }
  };
  return (
    <AppLayout className="h-screen overflow-hidden">
      <div className="flex flex-col h-full bg-background border-l-2 border-border">
        {/* Editor Toolbar */}
        <header className="h-16 border-b-2 border-border px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Draft Title..." 
              className="bg-transparent border-none text-xl font-bold focus-visible:ring-0 p-0 w-64"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="btn-soft text-destructive" onClick={() => navigate('/')}>
              <Trash2 className="w-4 h-4 mr-2" /> Discard
            </Button>
            <Button className="btn-soft bg-primary text-white" onClick={() => saveMutation.mutate({ title, content, channel, status: 'draft' })}>
              <Save className="w-4 h-4 mr-2" /> {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {/* Configuration Panel */}
          <aside className="w-72 border-r-2 border-border p-6 space-y-8 bg-muted/10 overflow-y-auto">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Channel</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'email', icon: Mail, label: 'Email' },
                  { id: 'slack', icon: MessageSquare, label: 'Slack' },
                  { id: 'sms', icon: Send, label: 'SMS' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setChannel(c.id as any)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all",
                      channel === c.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/20"
                    )}
                  >
                    <c.icon className="w-4 h-4" />
                    <span className="font-semibold">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Variables</label>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border text-xs italic text-muted-foreground">
                Detected: No variables found. Wrap text in double braces like <code className="bg-muted px-1">{"{{name}}"}</code> to create them.
              </div>
            </div>
          </aside>
          {/* Main Editor */}
          <main className="flex-1 p-8 overflow-y-auto bg-card/30">
            <div className="max-w-3xl mx-auto space-y-6">
              <IllustrativeCard className="p-8 min-h-[600px] flex flex-col shadow-lg border-2 border-border focus-within:border-primary transition-colors">
                <Textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Start drafting your masterpiece..." 
                  className="flex-1 border-none focus-visible:ring-0 text-lg leading-relaxed resize-none p-0 bg-transparent min-h-[400px]"
                />
              </IllustrativeCard>
            </div>
          </main>
          {/* Assistant & Preview Pane */}
          <aside className="w-96 border-l-2 border-border flex flex-col bg-muted/10">
            <Tabs defaultValue="assistant" className="flex flex-col h-full">
              <TabsList className="h-14 bg-card border-b-2 border-border rounded-none p-0">
                <TabsTrigger value="assistant" className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold">
                  Assistant
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold">
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="assistant" className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden mt-0">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {aiHistory.map((msg, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' ? "bg-muted ml-8 border border-border" : "bg-primary/10 mr-8 text-primary border border-primary/10"
                    )}>
                      {msg.content}
                    </div>
                  ))}
                  {aiHistory.length === 0 && (
                    <div className="text-center py-12 space-y-4 opacity-50">
                      <Sparkles className="w-12 h-12 mx-auto text-primary" />
                      <p className="font-medium">Need a tone shift or a quick rewrite? Just ask.</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t-2 border-border">
                  <div className="relative">
                    <Input 
                      value={aiInput} 
                      onChange={(e) => setAiInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                      placeholder="Ask AI to polish..." 
                      className="input-rounded pr-12"
                    />
                    <Button 
                      size="icon" 
                      className="absolute right-1 top-1 h-8 w-8 rounded-xl bg-primary hover:bg-primary/90 text-white"
                      onClick={handleAiAsk}
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="flex-1 p-6 overflow-y-auto mt-0">
                <div className="rounded-3xl border-2 border-border bg-background p-6 shadow-soft min-h-full">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="ml-4 h-6 flex-1 bg-muted rounded-full" />
                  </div>
                  <div className="prose prose-sm dark:prose-invert">
                    <ReactMarkdown>{content || '_No content to preview yet_'}</ReactMarkdown>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}