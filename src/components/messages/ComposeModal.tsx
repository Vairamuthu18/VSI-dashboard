"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Paperclip, Send, Maximize2, Minimize2, Trash2, Image as ImageIcon, Link as LinkIcon, Bold, Italic, Underline, List } from "lucide-react";
import { useMessages } from "@/contexts/MessagesContext";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: any;
}

export default function ComposeModal({ isOpen, onClose, replyTo }: ComposeModalProps) {
  const { sendMessage, saveDraft } = useMessages();
  const [isMinimized, setIsMinimized] = useState(false);

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: string; type: string; url: string }[]>([]);

  // Validation state
  const [errors, setErrors] = useState<{ to?: string; subject?: string; body?: string }>({});

  useEffect(() => {
    if (replyTo) {
      setTo(replyTo.sender?.email || "");
      setSubject(replyTo.subject ? (replyTo.subject.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`) : "");
    } else {
      setTo("");
      setSubject("");
      setBody("");
      setAttachedFiles([]);
    }
    setErrors({});
  }, [replyTo, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { to?: string; subject?: string; body?: string } = {};
    if (!to.trim()) {
      newErrors.to = "Recipient email is required.";
    } else if (!/\S+@\S+\.\S+/.test(to.trim()) && !to.includes("@")) {
      newErrors.to = "Please enter a valid recipient email address.";
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!body.trim()) {
      newErrors.body = "Message body cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;

    sendMessage({
      to: to.trim(),
      cc: cc.trim(),
      bcc: bcc.trim(),
      subject: subject.trim(),
      body: body.trim(),
      attachments: attachedFiles,
    });

    // Reset and close
    setTo("");
    setSubject("");
    setBody("");
    setAttachedFiles([]);
    setErrors({});
    onClose();
  };

  const handleDiscard = () => {
    setTo("");
    setSubject("");
    setBody("");
    setAttachedFiles([]);
    setErrors({});
    onClose();
  };

  const handleCloseAutoSave = () => {
    if (to.trim() || subject.trim() || body.trim()) {
      saveDraft({
        to: to.trim(),
        cc: cc.trim(),
        bcc: bcc.trim(),
        subject: subject.trim(),
        body: body.trim(),
        attachments: attachedFiles,
      });
    }
    onClose();
  };

  const applyFormat = (formatType: string) => {
    if (formatType === "bold") setBody((b) => b + " **bold text** ");
    if (formatType === "italic") setBody((b) => b + " *italic text* ");
    if (formatType === "underline") setBody((b) => b + " <u>underlined text</u> ");
    if (formatType === "list") setBody((b) => b + "\n- Item 1\n- Item 2\n");
    if (formatType === "link") setBody((b) => b + " [Link Title](https://example.com) ");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAtt = {
        id: `att_${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || "file",
        url: "#",
      };
      setAttachedFiles((prev) => [...prev, newAtt]);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          height: isMinimized ? "52px" : "auto",
        }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-0 right-4 sm:right-12 z-50 w-full max-w-[640px] bg-[#1E1E23] border border-border/80 rounded-t-[20px] shadow-2xl flex flex-col overflow-hidden text-foreground"
        style={{ maxHeight: isMinimized ? "52px" : "85vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-[#121217] border-b border-border/60 cursor-pointer select-none"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <span className="h-2 w-2 rounded-full bg-[#FF6B00]" />
            New Message
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-1.5 hover:bg-card rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseAutoSave();
              }}
              className="p-1.5 hover:bg-card rounded-lg hover:text-rose-500 transition-colors text-muted-foreground"
              title="Close & Save Draft"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        {!isMinimized && (
          <div className="flex flex-col flex-1 overflow-y-auto bg-[#1E1E23]">
            {/* Recipient To Field */}
            <div className="border-b border-border/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-semibold w-16">To</span>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    if (errors.to) setErrors((prev) => ({ ...prev, to: undefined }));
                  }}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 font-medium"
                  placeholder="recipient@example.com"
                />
                <button
                  type="button"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className="text-xs font-semibold text-[#FF6B00] hover:underline ml-2"
                >
                  {showCcBcc ? "Hide Cc/Bcc" : "Cc/Bcc"}
                </button>
              </div>
              {errors.to && <p className="text-xs text-rose-500 font-semibold mt-1 pl-16">{errors.to}</p>}
            </div>

            {/* Optional Cc / Bcc */}
            {showCcBcc && (
              <>
                <div className="flex items-center border-b border-border/40 px-4 py-2.5">
                  <span className="text-muted-foreground text-sm font-semibold w-16">Cc</span>
                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
                    placeholder="cc@example.com"
                  />
                </div>
                <div className="flex items-center border-b border-border/40 px-4 py-2.5">
                  <span className="text-muted-foreground text-sm font-semibold w-16">Bcc</span>
                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
                    placeholder="bcc@example.com"
                  />
                </div>
              </>
            )}

            {/* Clean Editable Subject Field */}
            <div className="border-b border-border/40 px-4 py-3">
              <div className="flex items-center">
                <span className="text-muted-foreground text-sm font-semibold w-16">Subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                  }}
                  className="flex-1 bg-transparent outline-none text-sm font-semibold text-foreground placeholder:text-muted-foreground/60"
                  placeholder="Subject"
                  autoFocus={false}
                />
              </div>
              {errors.subject && <p className="text-xs text-rose-500 font-semibold mt-1 pl-16">{errors.subject}</p>}
            </div>

            {/* Message Body Textarea (Min Height 300px) */}
            <div className="flex-1 flex flex-col p-4 min-h-[300px]">
              <textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  if (errors.body) setErrors((prev) => ({ ...prev, body: undefined }));
                }}
                className="flex-1 min-h-[280px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 resize-none leading-relaxed"
                placeholder="Write your message..."
              />
              {errors.body && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.body}</p>}
            </div>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div className="px-4 py-2 bg-muted/30 border-t border-border/40 flex flex-wrap gap-2">
                {attachedFiles.map((att) => (
                  <span
                    key={att.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-foreground font-medium"
                  >
                    📎 {att.name} ({att.size})
                    <button
                      onClick={() => setAttachedFiles((prev) => prev.filter((a) => a.id !== att.id))}
                      className="ml-1 text-muted-foreground hover:text-rose-500 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Formatting Toolbar & Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121217] border-t border-border/60">
              <div className="flex items-center gap-1 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => applyFormat("bold")}
                  className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("italic")}
                  className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("underline")}
                  className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"
                  title="Underline"
                >
                  <Underline size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("list")}
                  className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"
                  title="Bullet List"
                >
                  <List size={16} />
                </button>

                <div className="w-px h-4 bg-border/60 mx-1" />

                <label className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors cursor-pointer" title="Attach File">
                  <Paperclip size={16} />
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => applyFormat("link")}
                  className="p-2 hover:bg-card hover:text-foreground rounded-lg transition-colors"
                  title="Insert Link"
                >
                  <LinkIcon size={16} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors flex items-center gap-1.5"
                  title="Discard draft"
                >
                  <Trash2 size={15} /> Discard
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-sm rounded-full transition-all shadow-md shadow-[#FF6B00]/20 hover:scale-[1.02]"
                >
                  <Send size={15} />
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
