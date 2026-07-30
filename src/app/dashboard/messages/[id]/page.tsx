"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Reply, Forward, Archive, Trash2, Mail, MailOpen, 
  Star, CornerUpLeft, CornerUpRight, Paperclip, Sparkles, CheckCircle2, Tag
} from "lucide-react";
import { useMessages } from "@/contexts/MessagesContext";
import ComposeModal from "@/components/messages/ComposeModal";
import MessageActionMenu from "@/components/messages/MessageActionMenu";

export default function MessageDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { messages, markAsRead, markAsUnread, toggleStar, moveToFolder, deleteMessage, toastMessage } = useMessages();
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const message = messages.find(m => m.id === id);

  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-[#121217] text-white">
        <Mail className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Message Not Found</h1>
        <p className="text-muted-foreground mb-6">This message may have been deleted.</p>
        <button 
          onClick={() => router.push("/dashboard/messages")}
          className="px-6 py-2 bg-[#FF6B00] text-white font-bold rounded-full hover:bg-[#FF6B00]/90 transition-colors"
        >
          Return to Inbox
        </button>
      </div>
    );
  }

  const handleAction = (action: string) => {
    switch(action) {
      case 'reply':
        setIsComposeOpen(true);
        break;
      case 'archive':
        moveToFolder(message.id, "archived");
        router.push("/dashboard/messages");
        break;
      case 'delete':
        deleteMessage(message.id);
        router.push("/dashboard/messages");
        break;
      case 'markUnread':
        markAsUnread(message.id);
        router.push("/dashboard/messages");
        break;
      case 'markRead':
        markAsRead(message.id);
        break;
    }
  };

  const formattedDate = new Date(message.timestamp).toLocaleString(undefined, {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#121217] overflow-hidden relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-emerald-500 text-white font-semibold text-sm shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={18} />
            <span>{typeof toastMessage === "string" ? toastMessage : toastMessage.text}</span>
            {typeof toastMessage === "object" && toastMessage.actionText && (
              <button
                onClick={toastMessage.onAction}
                className="ml-2 px-2.5 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors underline cursor-pointer"
              >
                {toastMessage.actionText}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Toolbar */}
      <div className="h-16 border-b border-border/50 flex items-center px-4 sm:px-6 justify-between bg-[#1E1E23]/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard/messages")}
            className="p-2 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <button onClick={() => handleAction('archive')} className="p-2 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors" title="Archive">
            <Archive size={18} />
          </button>
          <button onClick={() => handleAction('delete')} className="p-2 rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors" title="Delete">
            <Trash2 size={18} />
          </button>
          
          <div className="w-px h-6 bg-border mx-2" />

          <button onClick={() => handleAction(message.status === "read" ? "markUnread" : "markRead")} className="p-2 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors" title={message.status === "read" ? "Mark Unread" : "Mark Read"}>
            {message.status === "read" ? <Mail size={18} /> : <MailOpen size={18} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-4 hidden sm:inline">Message Actions</span>
          <MessageActionMenu message={message} />
        </div>
      </div>

      {/* Message Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-[#1E1E23] rounded-[24px] border border-border/80 shadow-sm p-6 sm:p-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/5 rounded-full blur-[80px]" />

          {/* Subject & Tags */}
          <div className="flex items-start justify-between gap-4 mb-8 relative z-10">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{message.subject}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-bold uppercase tracking-wider border border-[#FF6B00]/20">
                  {message.folder}
                </span>
                {message.relatedClient && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    Client: {message.relatedClient}
                  </span>
                )}
                {message.priority === "high" && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
                    High Priority
                  </span>
                )}
                {message.labels && message.labels.map(l => (
                  <span key={l} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20 flex items-center gap-1">
                    <Tag size={10} /> {l}
                  </span>
                ))}
              </div>
            </div>
          </div>


          {/* Sender Info Area */}
          <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-muted-bg to-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                {message.sender.avatar ? (
                  <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">{message.sender.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{message.sender.name}</span>
                  <span className="text-sm text-muted-foreground">&lt;{message.sender.email}&gt;</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  to {message.recipient.name} &lt;{message.recipient.email}&gt;
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                {formattedDate}
                <button 
                  onClick={() => toggleStar(message.id)}
                  className={`ml-2 p-1 rounded-full transition-colors ${message.isStarred ? 'text-amber-400 hover:text-amber-500' : 'text-muted-foreground hover:text-amber-400'}`}
                >
                  <Star size={16} fill={message.isStarred ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleAction('reply')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-card text-xs font-semibold text-foreground transition-colors">
                  <CornerUpLeft size={14} /> Reply
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-card text-xs font-semibold text-foreground transition-colors">
                  <CornerUpRight size={14} /> Forward
                </button>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          {message.aiSummary && (
            <div className="mb-8 p-4 rounded-xl bg-[#FF6B00]/5 border border-[#FF6B00]/20 flex gap-3 relative z-10">
              <Sparkles className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">AI Summary</h4>
                <p className="text-sm text-foreground/90 leading-relaxed">{message.aiSummary}</p>
              </div>
            </div>
          )}

          {/* Message Body */}
          <div className="prose prose-invert max-w-none mb-10 text-foreground/90 relative z-10" dangerouslySetInnerHTML={{ __html: message.body }} />

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="border-t border-border/50 pt-6 relative z-10">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                {message.attachments.length} Attachments
              </h4>
              <div className="flex flex-wrap gap-3">
                {message.attachments.map(att => (
                  <a key={att.id} href={att.url} className="flex items-center gap-3 p-3 pr-4 rounded-xl border border-border/50 bg-muted-bg hover:bg-card transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                      <Paperclip size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-[#FF6B00] transition-colors line-clamp-1">{att.name}</p>
                      <p className="text-xs text-muted-foreground">{att.size}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} replyTo={message} />
    </div>
  );
}
