import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { IllustrativeCard } from '@/components/ui/illustrative-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare, Send, Sparkles, Save, ChevronLeft, Loader2, Tag, Copy, Zap, ArrowRight, BookOpen } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { chatService } from '@/lib/chat';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailPreview, SlackPreview, SMSPreview } from '@/components/ui/channel-previews';
export default function DraftEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNew = id === 'new';
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<'email' | 'slack' | 'sms'>('email');
  const [aiInput, setAiInput] = useState('');
  const [aiHistory, setAiHistory] = useState<{ role: string, content: string }[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
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
  const handleAiAsk = async (customPrompt?: string) => {
    const input = customPrompt || aiInput;
    if (!input.trim() || isAiThinking) return;
    setIsAiThinking(true);
    setAiHistory(prev => [...prev, { role: 'user', content: input }]);
    if (!customPrompt) setAiInput('');
    const prompt = `Task: ${input}\n\nCurrent Draft Content:\n${content}\n\nChannel Context: ${channel.toUpperCase()}\n\nPlease provide an improved version of the draft based on the task. Respond with the content ONLY if it's a direct rewrite, or an explanation followed by content.`;
    try {
      const response = await chatService.sendMessage(prompt);
      if (response.success && response.data?.messages) {
        const lastMsg = response.data.messages[response.data.messages.length - 1];
        setAiHistory(prev => [...prev, { role: 'assistant', content: lastMsg.content }]);
        toast("AI suggestion generated", {
          action: { 
            label: "Apply to Editor", 
            onClick: () => {
              // Simple heuristic to extract content if the AI blabbered
              const cleanContent = lastMsg.content.includes('```') 
                ? lastMsg.content.split('```')[1].replace(/^[a-z]+\n/, '')
                : lastMsg.content;
              setContent(cleanContent.trim());
            } 
          }
        });
      }
    } catch (e) {
      toast.error("AI assistant encountered a snag.");
    } finally {
      setIsAiThinking(false);
    }
  };
  const smartConvert = async (targetChannel: string) => {
    setIsAiThinking(true);
    const prompt = `Convert this ${channel} draft to a ${targetChannel} format. Consider the constraints of ${targetChannel} (e.g., character limits for SMS, block formatting for Slack). Current content: "${content}"`;
    try {
      const response = await chatService.sendMessage(prompt);
      if (response.success && response.data?.messages) {
        const lastMsg = response.data.messages[response.data.messages.length - 1];
        setContent(lastMsg.content.trim());
        setChannel(targetChannel as any);
        toast.success(`Converted to ${targetChannel} style`);
      }
    } catch (e) {
      toast.error("Conversion failed.");
    } finally {
      setIsAiThinking(false);
    }
  };
  const readabilityScore = useMemo(() => {
    if (!content) return 0;
    const words = content.trim().split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    if (sentences === 0) return 100;
    const avg = words / sentences;
    // Simple mock heuristic: 10-20 words per sentence is "good"
    if (avg < 15) return 95;
    if (avg < 25) return 80;
    return 60;
  }, [content]);
  const insertVariable = (v: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const varText = `{{${v}}}`;
    setContent(before + varText + after);
    // Reset focus and cursor position after state update
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + varText.length, start + varText.length);
    }, 0);
  };
  return (
    <AppLayout className="h-screen overflow-hidden">
      <div className="flex flex-col h-full bg-background border-l-2 border-border">
        <header className="h-16 border-b-2 border-border px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Draft Title..."
              className="bg-transparent border-none text-xl font-bold focus-visible:ring-0 p-0 w-64 h-auto"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success("Draft copied!");
            }} className="btn-soft">
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button
              className="btn-soft bg-primary text-white shadow-lg shadow-primary/20"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate({ title, content, channel, status: 'draft' })}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-72 border-r-2 border-border p-6 space-y-8 bg-muted/10 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Channel</label>
                {content.length > 0 && (
                  <button onClick={() => smartConvert(channel)} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1">
                    <Zap className="w-2 h-2" /> AI Re-Style
                  </button>
                )}
              </div>
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
                      channel === c.id ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-transparent hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <c.icon className="w-4 h-4" />
                    <span className="font-semibold">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Performance</label>
              <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-border space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium">Readability</span>
                  <span className={cn("text-lg font-bold", readabilityScore > 80 ? "text-green-500" : "text-amber-500")}>
                    {readabilityScore}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${readabilityScore}%` }}
                    className={cn("h-1.5 rounded-full", readabilityScore > 80 ? "bg-green-500" : "bg-amber-500")}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight italic">
                  {readabilityScore > 80 ? "Your draft is clear and easy to read." : "Consider shortening sentences for better clarity."}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Variables</label>
              <div className="flex flex-wrap gap-2">
                {['name', 'date', 'company', 'product', 'offer'].map(v => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </aside>
          <main className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-black/20">
            <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
              <IllustrativeCard className="p-8 flex-1 flex flex-col shadow-xl border-2 border-border focus-within:border-primary/40 transition-all min-h-[500px] bg-white dark:bg-zinc-950">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="The drafting canvas awaits your vision..."
                  className="flex-1 border-none focus-visible:ring-0 text-xl leading-relaxed resize-none p-0 bg-transparent font-sans"
                />
              </IllustrativeCard>
            </div>
          </main>
          <aside className="w-[450px] border-l-2 border-border flex flex-col bg-muted/10">
            <Tabs defaultValue="assistant" className="flex flex-col h-full">
              <TabsList className="h-14 bg-card border-b-2 border-border rounded-none p-0">
                <TabsTrigger value="assistant" className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold transition-all">
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-bold transition-all">
                  Live Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="assistant" className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden mt-0">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAiAsk("Make this draft more professional and corporate.")} className="btn-soft text-[10px] h-8 border-border">
                    <Zap className="w-3 h-3 mr-1 text-primary" /> Professional
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAiAsk("Shorten this drastically for a quick update.")} className="btn-soft text-[10px] h-8 border-border">
                    <Zap className="w-3 h-3 mr-1 text-amber-500" /> Shorten
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAiAsk("Add a polite call-to-action at the end.")} className="btn-soft text-[10px] h-8 border-border">
                    <Zap className="w-3 h-3 mr-1 text-green-500" /> Add CTA
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAiAsk("Inject some friendly humor or personality.")} className="btn-soft text-[10px] h-8 border-border">
                    <Zap className="w-3 h-3 mr-1 text-purple-500" /> Humanize
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-border">
                  <AnimatePresence>
                    {aiHistory.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium italic">
                          "I can help you rewrite, shorten, or change the tone of your draft. Just ask!"
                        </p>
                      </div>
                    )}
                    {aiHistory.map((msg, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        className={cn(
                          "p-4 rounded-3xl text-sm leading-relaxed border shadow-sm",
                          msg.role === 'user' ? "bg-white dark:bg-zinc-800 ml-8 border-border" : "bg-primary text-white mr-8 border-primary/20"
                        )}
                      >
                        {msg.content}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isAiThinking && (
                    <div className="flex gap-2 items-center text-xs text-primary font-bold p-2 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> NEXUS IS RE-DRAFTING...
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t-2 border-border">
                  <div className="relative group">
                    <Input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                      placeholder="Ask Nexus anything..."
                      className="input-rounded pr-12 h-12 shadow-inner focus:border-primary transition-all"
                    />
                    <Button
                      size="icon"
                      disabled={isAiThinking}
                      className="absolute right-1 top-1 h-10 w-10 rounded-2xl bg-primary hover:bg-primary/90 text-white transition-all shadow-md group-focus-within:scale-105"
                      onClick={() => handleAiAsk()}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="flex-1 p-6 overflow-y-auto mt-0 bg-slate-100 dark:bg-zinc-900/50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={channel}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {channel === 'email' && <EmailPreview content={content} title={title} />}
                    {channel === 'slack' && <SlackPreview content={content} />}
                    {channel === 'sms' && <SMSPreview content={content} />}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}