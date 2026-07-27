"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Paperclip, Send, Maximize2, Minimize2, Trash2, Image as ImageIcon, Link as LinkIcon, Bold, Italic, List } from "lucide-react";
import { useMessages } from "@/contexts/MessagesContext";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: any;
}

export default function ComposeModal({ isOpen, onClose, replyTo }: ComposeModalProps) {
  const { sendMessage } = useMessages();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [to, setTo] = useState(replyTo?.sender?.email || "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : "");
  const [body, setBody] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!to || (!subject && !body)) return; // basic validation
    
    sendMessage({
      to,
      cc,
      bcc,
      subject,
      body,
      attachments: []
    });
    
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          height: isMinimized ? "50px" : "auto"
        }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-0 right-4 sm:right-24 z-50 w-full max-w-[600px] bg-[#1E1E23] border border-border/80 rounded-t-[20px] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: isMinimized ? "50px" : "80vh" }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 bg-muted-bg border-b border-border/50 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <span className="font-semibold text-sm">New Message</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
              className="p-1 hover:bg-card rounded-md transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-1 hover:bg-card rounded-md hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        {!isMinimized && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center border-b border-border/50 px-4 py-2">
              <span className="text-muted-foreground text-sm w-12">To:</span>
              <input 
                type="text" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm" 
                placeholder="recipient@example.com"
              />
              <button 
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cc/Bcc
              </button>
            </div>
            
            {showCcBcc && (
              <>
                <div className="flex items-center border-b border-border/50 px-4 py-2">
                  <span className="text-muted-foreground text-sm w-12">Cc:</span>
                  <input type="text" value={cc} onChange={e => setCc(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
                </div>
                <div className="flex items-center border-b border-border/50 px-4 py-2">
                  <span className="text-muted-foreground text-sm w-12">Bcc:</span>
                  <input type="text" value={bcc} onChange={e => setBcc(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              </>
            )}

            <div className="flex items-center border-b border-border/50 px-4 py-2">
              <span className="text-muted-foreground text-sm w-12">Subject:</span>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm font-semibold" 
              />
            </div>

            <div className="flex-1 flex flex-col p-4 min-h-[300px]">
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm resize-none"
                placeholder="Write your message here..."
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-muted-bg/50 border-t border-border/50">
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"><Bold size={16} /></button>
                <button className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"><Italic size={16} /></button>
                <button className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"><List size={16} /></button>
                <div className="w-px h-4 bg-border mx-1" />
                <button className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"><Paperclip size={16} /></button>
                <button className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"><ImageIcon size={16} /></button>
                <button className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"><LinkIcon size={16} /></button>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={handleSend}
                  className="flex items-center gap-2 px-5 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold text-sm rounded-full transition-all"
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
