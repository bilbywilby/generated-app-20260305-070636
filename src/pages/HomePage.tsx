import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IllustrativeCard } from '@/components/ui/illustrative-card';
import { Button } from '@/components/ui/button';
import { Plus, Layout, Zap, ArrowRight, MessageSquare, Mail, Send, Sparkles, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { chatService } from '@/lib/chat';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};
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
      const response = await chatService.sendMessage(`Draft a communication based on this rough input: "${rewriteInput}". Make it professional and ready to send.`);
      if (response.success && response.data?.messages) {
        const lastMsg = response.data.messages[response.data.messages.length - 1];
        const newDraft = await api.drafts.create({
          title: 'Quick Rewrite Result',
          content: lastMsg.content,
          channel: 'email',
          status: 'draft'
        });
        toast.success("AI transformation complete!");
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
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-16"
      >
        <motion.header variants={item} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Dashboard Overview
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
            Hello, <span className="text-primary italic">Stark</span>.
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl font-medium tracking-tight">
            The future of communication is drafted right here. What shall we create today?
          </p>
        </motion.header>
        <motion.section variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <IllustrativeCard className="bg-primary/5 border-primary/20 p-8 flex flex-col items-center text-center space-y-6 group">
            <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Blank Draft</h3>
              <p className="text-muted-foreground text-sm mt-1">Free-form AI-assisted creation</p>
            </div>
            <Button asChild className="w-full btn-soft bg-primary text-white mt-auto py-6 shadow-lg shadow-primary/20">
              <Link to="/drafts/new">Start Drafting</Link>
            </Button>
          </IllustrativeCard>
          <IllustrativeCard className="bg-accent/5 border-accent/20 p-8 flex flex-col items-center text-center space-y-6 group">
            <div className="w-16 h-16 rounded-3xl bg-accent flex items-center justify-center text-white shadow-xl shadow-accent/30 group-hover:scale-110 transition-transform duration-300">
              <Layout className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Templates</h3>
              <p className="text-muted-foreground text-sm mt-1">Proven communication schemas</p>
            </div>
            <Button asChild variant="outline" className="w-full btn-soft border-accent text-accent hover:bg-accent/10 mt-auto py-6">
              <Link to="/templates">Browse Library</Link>
            </Button>
          </IllustrativeCard>
          <IllustrativeCard className="bg-indigo-500/5 border-indigo-500/20 p-8 flex flex-col items-center text-center space-y-6 group">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-300 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Rewriter</h3>
              <p className="text-muted-foreground text-sm mt-1">Instant messy-to-pro AI fix</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsRewriterOpen(true)}
              className="w-full btn-soft border-indigo-500 text-indigo-500 hover:bg-indigo-500/10 mt-auto py-6"
            >
              Open Studio
            </Button>
          </IllustrativeCard>
        </motion.section>
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter">Recent Drafts</h2>
              <Button variant="ghost" asChild className="hover:bg-primary/5 text-primary font-bold">
                <Link to="/drafts" className="flex items-center">
                  All Drafts <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-48 rounded-4xl bg-muted animate-pulse" />)}
              </div>
            ) : drafts?.length === 0 ? (
              <IllustrativeCard className="p-16 text-center border-dashed border-2 border-muted-foreground/30 bg-muted/10">
                <div className="max-w-xs mx-auto space-y-6">
                  <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-full mx-auto flex items-center justify-center shadow-inner">
                    <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">Empty Library</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">Your drafting archive is waiting for its first masterpiece.</p>
                  </div>
                  <Button asChild className="btn-soft bg-primary text-white shadow-lg shadow-primary/20 px-8">
                    <Link to="/drafts/new">Create First Draft</Link>
                  </Button>
                </div>
              </IllustrativeCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {drafts?.slice(0, 4).map((draft) => (
                  <Link key={draft.id} to={`/drafts/${draft.id}`}>
                    <IllustrativeCard className="p-6 h-full flex flex-col hover:border-primary/40 transition-all cursor-pointer group bg-white dark:bg-zinc-950">
                      <div className="flex justify-between items-start mb-6">
                        <div className={cn(
                          "p-3 rounded-2xl text-white shadow-lg",
                          draft.channel === 'email' ? 'bg-blue-500' : draft.channel === 'slack' ? 'bg-[#4A154B]' : 'bg-green-500'
                        )}>
                          {draft.channel === 'email' ? <Mail className="w-5 h-5" /> : draft.channel === 'slack' ? <MessageSquare className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                          {formatDistanceToNow(draft.updatedAt)} AGO
                        </span>
                      </div>
                      <h4 className="text-xl font-black group-hover:text-primary transition-colors mb-2 line-clamp-1">
                        {draft.title || 'Untitled Draft'}
                      </h4>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-6 font-medium italic opacity-70">
                        {draft.content || 'Empty content awaiting your input...'}
                      </p>
                      <div className="mt-auto pt-4 border-t border-muted/50 flex items-center justify-between">
                         <span className={cn(
                           "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                           draft.status === 'draft' ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                         )}>
                           {draft.status}
                         </span>
                         <div className="flex items-center text-primary font-bold text-xs opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                           Studio <ChevronRight className="w-4 h-4" />
                         </div>
                      </div>
                    </IllustrativeCard>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <aside className="lg:col-span-1 space-y-8">
            <div className="p-8 rounded-4xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none space-y-6">
              <h3 className="text-xl font-black">Pro Tip</h3>
              <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                "Switch channels in the Studio to see how your draft transforms for Email, Slack, and SMS automatically."
              </p>
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-70">AI Status</div>
                    <div className="text-sm font-bold">Systems Online</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-4xl border-2 border-border space-y-4">
              <h3 className="text-lg font-black tracking-tight">System Notice</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Although this project has AI capabilities, there is a limit on requests per session. Use the Studio wisely!
              </p>
            </div>
          </aside>
        </motion.div>
      </motion.div>
      <Dialog open={isRewriterOpen} onOpenChange={setIsRewriterOpen}>
        <DialogContent className="sm:max-w-2xl rounded-4xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-indigo-600 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-2xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                Quick Rewriter
              </DialogTitle>
              <DialogDescription className="text-indigo-100 text-lg font-medium">
                Paste your rough notes. Nexus will turn them into professional gold.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-zinc-950">
            <Textarea
              className="rounded-3xl min-h-[200px] border-2 border-muted focus-visible:ring-primary/20 text-lg p-6 bg-slate-50 dark:bg-zinc-900"
              placeholder="e.g. tell the team about the offsite. it's on friday at 2pm. bring pizza money."
              value={rewriteInput}
              onChange={(e) => setRewriteInput(e.target.value)}
            />
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" onClick={() => setIsRewriterOpen(false)} className="btn-soft font-bold">Discard</Button>
              <Button
                disabled={isRewriting || !rewriteInput.trim()}
                onClick={handleQuickRewrite}
                className="btn-soft bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none px-10 h-14 text-lg font-black"
              >
                {isRewriting ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Sparkles className="w-6 h-6 mr-2" />}
                {isRewriting ? 'TRANSFORMING...' : 'UPGRADE TEXT'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}