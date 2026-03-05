import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IllustrativeCard } from '@/components/ui/illustrative-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare, Send, Search, Filter, MoreVertical, Trash2, Copy, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export default function DraftsListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'email' | 'slack' | 'sms'>('all');
  const { data: drafts, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.drafts.list()
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.drafts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft deleted');
    }
  });
  const filteredDrafts = drafts?.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || d.channel === filter;
    return matchesSearch && matchesFilter;
  });
  const channelIcons = {
    email: <Mail className="w-4 h-4" />,
    slack: <MessageSquare className="w-4 h-4" />,
    sms: <Send className="w-4 h-4" />
  };
  return (
    <AppLayout container>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Communication Library</h1>
            <p className="text-muted-foreground font-medium text-lg">Manage and organize your cross-platform drafts.</p>
          </div>
          <Button asChild className="btn-soft bg-primary text-white shadow-lg shadow-primary/20">
            <Link to="/drafts/new">New Draft</Link>
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-3xl border-2 border-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search drafts..." 
              className="input-rounded pl-10 w-full" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['all', 'email', 'slack', 'sms'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "btn-soft capitalize",
                  filter === f ? "bg-primary text-white" : "border-border"
                )}
                size="sm"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-muted rounded-3xl animate-pulse" />)}
          </div>
        ) : filteredDrafts?.length === 0 ? (
          <IllustrativeCard className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No drafts found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or create a new message.</p>
            <Button variant="outline" onClick={() => { setSearch(''); setFilter('all'); }} className="btn-soft">Clear Filters</Button>
          </IllustrativeCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDrafts?.map((draft) => (
              <IllustrativeCard key={draft.id} className="p-4 md:p-6 group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      draft.channel === 'email' ? 'bg-blue-100 text-blue-600' : 
                      draft.channel === 'slack' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    )}>
                      {channelIcons[draft.channel]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg truncate">{draft.title || 'Untitled'}</h3>
                        <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 uppercase tracking-tighter">
                          {draft.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(draft.updatedAt)} ago
                        </span>
                        <span className="hidden sm:block truncate italic">
                          {draft.content.slice(0, 60)}...
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="hidden sm:flex btn-soft">
                      <Link to={`/drafts/${draft.id}`}>Edit</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 border-2">
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                          <Link to={`/drafts/${draft.id}`}>
                            <ExternalLink className="w-4 h-4 mr-2" /> Open Studio
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl cursor-pointer">
                          <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => deleteMutation.mutate(draft.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </IllustrativeCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}