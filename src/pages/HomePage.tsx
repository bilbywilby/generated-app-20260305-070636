import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IllustrativeCard } from '@/components/ui/illustrative-card';
import { Button } from '@/components/ui/button';
import { Plus, Layout, Zap, ArrowRight, MessageSquare, Mail, Send, Sparkles, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { chatService } from '@/lib/chat';
import { toast } from 'sonner';
export function HomePage() {
  const navigate = useNavigate();
  const [isRewriterOpen, setIsRewriterOpen] = useState(false);
  const [rewriteInput, setRewriteInput] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const { data: drafts, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.drafts.list()
  });
  const handleQuickRewrite = async () => {
    if (!rewriteInput.trim()) return;
    setIsRewriting(true);
    try {
      const response = await chatService.sendMessage(`Draft a communication based on this rough input: "${rewriteInput}". Make it professional.`);
      if (response.success && response.data?.messages) {
        const lastMsg = response.data.messages[response.data.messages.length - 1];
        // Create a new draft with this content
        const newDraft = await api.drafts.create({
          title: 'Quick Rewrite Result',
          content: lastMsg.content,
          channel: 'email',
          status: 'draft'
        });
        toast.success("Rewrite complete!");
        navigate(`/drafts/${newDraft.id}`);
      }
    } catch (e) {
      toast.error("Rewrite failed. Please try again.");
    } finally {
      setIsRewriting(false);
      setIsRewriterOpen(false);
    }
  };
  return (
    <AppLayout container>
      <div className="space-y-12">
        <header className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-primary">Stark</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium">
            Ready to craft your next big communication? NexusDraft is primed and ready.
          </p>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <IllustrativeCard className="bg-primary/5 border-primary/20 p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">New Blank Draft</h3>
            <p className="text-muted-foreground text-sm">Start from scratch with AI assistance</p>
            <Button asChild className="w-full btn-soft bg-primary text-white mt-auto">
              <Link to="/drafts/new">Create Draft</Link>
            </Button>
          </IllustrativeCard>
          <IllustrativeCard className="bg-accent/5 border-accent/20 p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">From Template</h3>
            <p className="text-muted-foreground text-sm">Use your pre-defined communication schemas</p>
            <Button asChild variant="outline" className="w-full btn-soft border-accent text-accent hover:bg-accent/10 mt-auto">
              <Link to="/templates">Browse Library</Link>
            </Button>
          </IllustrativeCard>
          <IllustrativeCard className="bg-indigo-500/5 border-indigo-500/20 p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Quick Rewriter</h3>
            <p className="text-muted-foreground text-sm">Paste text and let AI transform it instantly</p>
            <Button 
              variant="outline" 
              onClick={() => setIsRewriterOpen(true)}
              className="w-full btn-soft border-indigo-500 text-indigo-500 hover:bg-indigo-500/10 mt-auto"
            >
              Launch Rewriter
            </Button>
          </IllustrativeCard>
        </section>
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Drafts</h2>
            <Button variant="ghost" asChild className="hover:bg-primary/5 text-primary">
              <Link to="/drafts" className="font-semibold flex items-center">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-4xl bg-muted animate-pulse" />)}
            </div>
          ) : drafts?.length === 0 ? (
            <IllustrativeCard className="p-12 text-center border-dashed border-2 border-muted-foreground/20">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No drafts yet</h3>
                <p className="text-muted-foreground">The silence is deafening. Start drafting to see your activity here.</p>
                <Button asChild className="btn-soft bg-primary text-white shadow-lg shadow-primary/20">
                  <Link to="/drafts/new">Start First Draft</Link>
                </Button>
              </div>
            </IllustrativeCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts?.slice(0, 6).map((draft) => (
                <Link key={draft.id} to={`/drafts/${draft.id}`}>
                  <IllustrativeCard className="p-6 h-full flex flex-col hover:border-primary transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "p-2 rounded-xl text-white",
                        draft.channel === 'email' ? 'bg-blue-500 shadow-blue-200' : draft.channel === 'slack' ? 'bg-orange-500 shadow-orange-200' : 'bg-green-500 shadow-green-200',
                        "shadow-lg dark:shadow-none"
                      )}>
                        {draft.channel === 'email' ? <Mail className="w-4 h-4" /> : draft.channel === 'slack' ? <MessageSquare className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {formatDistanceToNow(draft.updatedAt)} ago
                      </span>
                    </div>
                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors mb-2 line-clamp-1">
                      {draft.title || 'Untitled Draft'}
                    </h4>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 italic">
                      {draft.content || 'Empty content...'}
                    </p>
                    <div className="mt-auto pt-4 border-t flex items-center justify-between">
                       <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-lg">{draft.status}</span>
                       <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </IllustrativeCard>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <Dialog open={isRewriterOpen} onOpenChange={setIsRewriterOpen}>
        <DialogContent className="sm:max-w-xl rounded-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              Quick Rewriter
            </DialogTitle>
            <DialogDescription>
              Paste your messy thoughts and let AI turn them into a professional draft.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              className="rounded-2xl min-h-[150px] border-2 focus-visible:ring-primary/20"
              placeholder="e.g. Tell the team the meeting moved to 4pm Friday because of the holiday..."
              value={rewriteInput}
              onChange={(e) => setRewriteInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRewriterOpen(false)} className="btn-soft">Cancel</Button>
            <Button 
              disabled={isRewriting || !rewriteInput.trim()} 
              onClick={handleQuickRewrite}
              className="btn-soft bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {isRewriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isRewriting ? 'Processing...' : 'Transform to Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <footer className="mt-20 py-8 border-t text-center text-sm text-muted-foreground font-medium">
        Although this project has AI capabilities, there is a limit on the number of requests that can be made.
      </footer>
    </AppLayout>
  );
}