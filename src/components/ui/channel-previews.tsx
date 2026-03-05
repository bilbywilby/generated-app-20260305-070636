import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail, MessageSquare, Send, User, Hash, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
interface PreviewProps {
  content: string;
  title?: string;
}
export function EmailPreview({ content, title }: PreviewProps) {
  const readTime = useMemo(() => {
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / 200); // 200 wpm
    return time;
  }, [content]);
  return (
    <div className="rounded-4xl border-2 border-border bg-background shadow-soft overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-muted/50 p-4 border-b space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border">
            <Clock className="w-3 h-3" /> {readTime} MIN READ
          </div>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
          <span className="text-muted-foreground font-semibold">Subject:</span>
          <span className="font-bold text-foreground truncate">{title || 'No Subject'}</span>
          <span className="text-muted-foreground font-semibold">From:</span>
          <span className="text-foreground">NexusDraft <span className="text-muted-foreground">&lt;assistant@nexusdraft.ai&gt;</span></span>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-zinc-950">
        <article className="prose prose-indigo dark:prose-invert max-w-none prose-sm sm:prose-base">
          <ReactMarkdown>{content || '_Type something to see a preview..._'}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
export function SlackPreview({ content }: PreviewProps) {
  return (
    <div className="rounded-4xl border-2 border-border bg-[#1A1D21] text-white overflow-hidden h-full flex animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="w-12 bg-[#121519] flex flex-col items-center py-4 gap-4 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-lg shadow-indigo-900/50">N</div>
        <div className="w-8 h-8 rounded-lg bg-zinc-700/50" />
        <div className="w-8 h-8 rounded-lg bg-zinc-700/50" />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between bg-[#1A1D21]">
          <div className="flex items-center gap-2 font-bold">
            <Hash className="w-4 h-4 text-zinc-400" />
            <span>announcements</span>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex gap-3 group hover:bg-white/5 p-2 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-black text-sm hover:underline cursor-pointer">Nexus Assistant</span>
                <span className="text-[10px] text-zinc-400 font-medium">APP • 12:00 PM</span>
              </div>
              <div className="text-[14px] text-zinc-200 mt-1 prose-invert prose-sm max-w-none leading-normal">
                <ReactMarkdown 
                  components={{
                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                    code: ({children}) => <code className="bg-[#2D3136] px-1 rounded text-pink-400">{children}</code>
                  }}
                >
                  {content || 'Waiting for message input...'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function SMSPreview({ content }: PreviewProps) {
  const chars = content.length;
  const segments = Math.ceil(chars / 160) || 1;
  const isTooLong = segments > 3;
  return (
    <div className="flex flex-col items-center h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mx-auto w-[280px] h-[580px] rounded-[3.5rem] border-[8px] border-zinc-800 bg-zinc-900 relative shadow-2xl overflow-hidden flex flex-col shrink-0">
        <div className="h-7 w-32 bg-zinc-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20" />
        <div className="bg-zinc-800/80 backdrop-blur-md pt-12 pb-4 px-4 border-b border-white/5 text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-600 mx-auto mb-1 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="text-[9px] font-black text-white tracking-widest uppercase">Nexus Draft</div>
        </div>
        <div className="flex-1 bg-black p-4 overflow-y-auto flex flex-col justify-end gap-3 pb-8">
          <div className="bg-zinc-800 text-white p-3 rounded-2xl rounded-bl-none text-xs max-w-[85%] self-start border border-white/5 leading-relaxed">
            Drafting assistant ready for transmission.
          </div>
          <div className="bg-primary text-white p-3 rounded-2xl rounded-br-none text-xs max-w-[85%] self-end shadow-lg leading-relaxed">
            {content || 'Your SMS draft will appear here...'}
          </div>
        </div>
        <div className="p-4 bg-zinc-800/80 backdrop-blur-md flex gap-2 items-center">
          <div className="flex-1 bg-zinc-700 rounded-full h-9 px-4 text-[11px] text-zinc-300 flex items-center italic">iMessage</div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
            <Send className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      <div className="mt-6 w-full max-w-[280px] p-4 rounded-3xl bg-white dark:bg-zinc-800 border-2 border-border space-y-3 shadow-soft">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <span className="text-muted-foreground">Payload Stats</span>
          <span className={cn(isTooLong ? "text-red-500" : "text-primary")}>
            {chars} / {segments * 160}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-2xl bg-muted/50 border border-border text-center">
            <div className="text-lg font-black text-foreground">{segments}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase">Segments</div>
          </div>
          <div className="p-2 rounded-2xl bg-muted/50 border border-border text-center">
            <div className="text-lg font-black text-foreground">{chars}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase">Chars</div>
          </div>
        </div>
        {isTooLong && (
          <div className="flex items-start gap-2 text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded-xl">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>Over 3 segments may increase costs.</span>
          </div>
        )}
      </div>
    </div>
  );
}