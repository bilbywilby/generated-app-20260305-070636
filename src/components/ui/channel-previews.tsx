import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail, MessageSquare, Send, User, Hash, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
interface PreviewProps {
  content: string;
  title?: string;
}
export function EmailPreview({ content, title }: PreviewProps) {
  return (
    <div className="rounded-3xl border-2 border-border bg-background shadow-soft overflow-hidden h-full flex flex-col">
      <div className="bg-muted/50 p-4 border-b space-y-2">
        <div className="flex gap-1.5 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
          <span className="text-muted-foreground font-semibold">Subject:</span>
          <span className="font-bold text-foreground truncate">{title || 'No Subject'}</span>
          <span className="text-muted-foreground font-semibold">From:</span>
          <span className="text-foreground">NexusDraft <span className="text-muted-foreground">&lt;assistant@nexusdraft.ai&gt;</span></span>
          <span className="text-muted-foreground font-semibold">To:</span>
          <span className="text-foreground">Recipient <span className="text-muted-foreground">&lt;client@example.com&gt;</span></span>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-zinc-950">
        <article className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{content || '_Type something to see a preview..._'}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
export function SlackPreview({ content }: PreviewProps) {
  return (
    <div className="rounded-3xl border-2 border-border bg-[#1A1D21] text-white overflow-hidden h-full flex">
      <div className="w-12 bg-[#121519] flex flex-col items-center py-4 gap-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">N</div>
        <div className="w-8 h-8 rounded-lg bg-zinc-700/50" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Hash className="w-4 h-4 text-zinc-400" />
            <span>general</span>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex gap-3 group hover:bg-white/5 p-2 rounded-lg transition-colors">
            <div className="w-9 h-9 rounded bg-orange-500 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-black text-sm hover:underline cursor-pointer">NexusBot</span>
                <span className="text-2xs text-zinc-400 uppercase">12:00 PM</span>
              </div>
              <div className="text-sm text-zinc-200 mt-1 prose-invert prose-sm">
                <ReactMarkdown>{content || 'Waiting for message...'}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function SMSPreview({ content }: PreviewProps) {
  return (
    <div className="mx-auto w-[280px] h-[580px] rounded-[3rem] border-[8px] border-zinc-800 bg-zinc-900 relative shadow-2xl overflow-hidden flex flex-col">
      <div className="h-12 w-32 bg-zinc-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20" />
      <div className="bg-zinc-800/80 backdrop-blur-md pt-14 pb-4 px-4 border-b border-white/5 text-center">
        <div className="w-10 h-10 rounded-full bg-zinc-600 mx-auto mb-1 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="text-[10px] font-bold text-white tracking-wide">NEXUS ASSISTANT</div>
      </div>
      <div className="flex-1 bg-black p-4 overflow-y-auto flex flex-col justify-end gap-2">
        <div className="bg-zinc-800 text-white p-3 rounded-2xl rounded-bl-none text-xs max-w-[85%] self-start border border-white/5">
          How can I help you today?
        </div>
        <div className="bg-primary text-white p-3 rounded-2xl rounded-br-none text-xs max-w-[85%] self-end shadow-lg">
          <ReactMarkdown>{content || 'Drafting...'}</ReactMarkdown>
        </div>
      </div>
      <div className="p-4 bg-zinc-800/80 backdrop-blur-md flex gap-2 items-center">
        <div className="flex-1 bg-zinc-700 rounded-full h-8 px-4 text-[10px] text-zinc-400 flex items-center">iMessage</div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Send className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}