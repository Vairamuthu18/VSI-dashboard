"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, Send, File, Star, Archive, Trash2, Search as SearchIcon, 
  Filter, Plus, Paperclip, Mail, CheckCircle2
} from "lucide-react";
import { useMessages } from "@/contexts/MessagesContext";
import { MessageFolder, Message } from "@/lib/types/messages";
import ComposeModal from "@/components/messages/ComposeModal";

export default function MessagesPage() {
  const router = useRouter();
  const { messages, activeFolder, setActiveFolder, unreadCount, markAsRead, toggleStar, toastMessage } = useMessages();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);

  const folders: { id: MessageFolder; label: string; icon: React.ElementType }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "unread", label: "Unread", icon: Mail },
    { id: "starred", label: "Starred", icon: Star },
    { id: "sent", label: "Sent", icon: Send },
    { id: "drafts", label: "Drafts", icon: File },
    { id: "archived", label: "Archived", icon: Archive },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    
    // Folder filter
    if (activeFolder === "unread") {
      filtered = filtered.filter(m => m.status === "unread" && m.folder !== "trash");
    } else if (activeFolder === "starred") {
      filtered = filtered.filter(m => m.isStarred && m.folder !== "trash");
    } else {
      filtered = filtered.filter(m => m.folder === activeFolder);
    }

    // Toggle filter
    if (filterUnread) {
      filtered = filtered.filter(m => m.status === "unread");
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.subject.toLowerCase().includes(q) ||
        m.sender.name.toLowerCase().includes(q) ||
        m.sender.email.toLowerCase().includes(q) ||
        m.recipient.name.toLowerCase().includes(q) ||
        m.recipient.email.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q)
      );
    }

    // Sort by date (newest first)
    return [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages, activeFolder, searchQuery, filterUnread]);

  const handleMessageClick = (msg: Message) => {
    if (msg.status === "unread") {
      markAsRead(msg.id);
    }
    router.push(`/dashboard/messages/${msg.id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#121217] overflow-hidden relative">
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


      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border/50 hidden md:flex flex-col bg-[#1E1E23]/30">
        <div className="p-4">
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold rounded-[16px] shadow-lg shadow-[#FF6B00]/20 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Compose Message
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {folders.map(folder => {
            const Icon = folder.icon;
            const isActive = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive 
                    ? "bg-[#FF6B00]/10 text-[#FF6B00]" 
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-[#FF6B00]" : "text-muted-foreground"} />
                  {folder.label}
                </div>
                {folder.id === "inbox" && unreadCount > 0 && (
                  <span className="bg-[#FF6B00] text-white text-[10px] px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Message List */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header toolbar */}
        <div className="h-16 border-b border-border/50 flex items-center px-4 sm:px-6 justify-between shrink-0 bg-[#121217]/80 backdrop-blur-md">
          <div className="flex-1 max-w-md relative mr-4">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E23] border border-border/50 rounded-full pl-9 pr-4 py-2 text-sm text-foreground outline-none focus:border-[#FF6B00]/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setFilterUnread(!filterUnread)}
              className={`p-2 rounded-full border transition-colors ${filterUnread ? 'bg-[#FF6B00]/10 border-[#FF6B00]/50 text-[#FF6B00]' : 'bg-[#1E1E23] border-border/50 text-muted-foreground hover:text-foreground'}`}
              title="Filter unread"
            >
              <Filter size={16} />
            </button>
            <button className="md:hidden p-2 rounded-full bg-[#FF6B00] text-white" onClick={() => setIsComposeOpen(true)}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {filteredMessages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-muted-foreground"
                >
                  <div className="text-4xl mb-3">
                    {activeFolder === "sent" ? "📨" : "📥"}
                  </div>
                  <p className="text-lg font-bold text-foreground mb-1">
                    {activeFolder === "sent" ? "No sent messages yet." : "No messages found"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeFolder === "sent" 
                      ? "Messages you compose and send will appear here." 
                      : `You're all caught up in ${activeFolder}.`}
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={containerVariants} 
                  initial="hidden" 
                  animate="show"
                  className="space-y-3"
                >
                  {filteredMessages.map(msg => {
                    const displayUser = (activeFolder === "sent" || activeFolder === "drafts") ? msg.recipient : msg.sender;
                    return (
                      <motion.div 
                        key={msg.id}
                        variants={itemVariants}
                        onClick={() => handleMessageClick(msg)}
                        className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-[20px] border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${
                          msg.status === "unread" 
                            ? "bg-[#1E1E23] border-[#FF6B00]/30 shadow-md" 
                            : "bg-[#1E1E23]/60 border-border/40 hover:bg-[#1E1E23] hover:border-border/80"
                        }`}
                      >
                        {/* Read Indicator */}
                        {msg.status === "unread" && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF6B00] rounded-r-full" />
                        )}

                        {/* Avatar / Actions */}
                        <div className="flex items-center gap-3 shrink-0 sm:pl-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleStar(msg.id); }}
                            className={`p-1 rounded-full transition-colors ${msg.isStarred ? 'text-amber-400 hover:text-amber-500' : 'text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10'}`}
                          >
                            <Star size={18} fill={msg.isStarred ? "currentColor" : "none"} />
                          </button>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-muted-bg to-card border border-border flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-muted-foreground">
                            {displayUser.avatar ? (
                              <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover" />
                            ) : (
                              displayUser.name ? displayUser.name.charAt(0).toUpperCase() : "M"
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm truncate ${msg.status === "unread" ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>
                              {(activeFolder === "sent" || activeFolder === "drafts") ? `To: ${displayUser.name || displayUser.email}` : displayUser.name}
                            </h4>
                            <span className={`text-xs whitespace-nowrap ml-4 ${msg.status === "unread" ? 'font-bold text-[#FF6B00]' : 'text-muted-foreground'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-sm font-semibold truncate ${msg.status === "unread" ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                              {msg.subject || "(No Subject)"}
                            </span>
                            <span className="hidden sm:inline text-xs text-muted-foreground truncate flex-1">
                              — {msg.preview}
                            </span>
                          </div>
                          <span className="sm:hidden text-xs text-muted-foreground truncate block mt-1">
                            {msg.preview}
                          </span>
                        </div>

                        {/* Badges / Extras */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="absolute right-4 bottom-4 sm:static flex items-center justify-center p-1.5 rounded-full bg-card border border-border text-muted-foreground">
                            <Paperclip size={14} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  );
}
