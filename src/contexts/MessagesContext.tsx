"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Message, MessageFolder, ComposeDraft, ToastPayload } from "@/lib/types/messages";

interface MessagesContextProps {
  messages: Message[];
  activeFolder: MessageFolder;
  setActiveFolder: (folder: MessageFolder) => void;
  unreadCount: number;
  toastMessage: ToastPayload;
  setToastMessage: (msg: ToastPayload) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  toggleStar: (id: string) => void;
  moveToFolder: (id: string, folder: MessageFolder) => void;
  deleteMessage: (id: string) => void;
  deletePermanently: (id: string) => void;
  restoreMessage: (id: string, folder?: MessageFolder) => void;
  updateMessageLabels: (id: string, labels: string[]) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  sendMessage: (draft: ComposeDraft) => void;
  saveDraft: (draft: ComposeDraft) => void;
}

const STORAGE_KEY = "vsi_messages_store_v1";

const defaultMessages: Message[] = [
  {
    id: "msg-001",
    sender: { name: "Sarah Connor", email: "sarah@skynet-resistance.com" },
    recipient: { name: "System Admin", email: "admin@searchintel.com" },
    subject: "Urgent: Keyword Gap Analysis for Q3",
    preview: "Hey, I was looking at the latest report and we have a major gap in the AI overview section...",
    body: "<p>Hey,</p><p>I was looking at the latest report and we have a major gap in the AI overview section. We need to optimize our content for the new Gemini citations.</p><p>Can we schedule a call?</p><p>- Sarah</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "unread",
    priority: "high",
    folder: "inbox",
    isStarred: true,
    labels: ["Urgent", "Work"],
    relatedClient: "Skynet Resistance",
    aiSummary: "The sender is requesting a meeting to discuss closing keyword gaps in AI overviews for Q3.",
  },
  {
    id: "msg-002",
    sender: { name: "John Doe", email: "john.doe@example.com", avatar: "https://i.pravatar.cc/150?u=johndoe" },
    recipient: { name: "System Admin", email: "admin@searchintel.com" },
    subject: "Monthly Visibility Report",
    preview: "Please find attached the monthly visibility report for your domains.",
    body: "<p>Please find attached the monthly visibility report for your domains.</p><p>Let me know if you need any further analysis.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "read",
    priority: "normal",
    folder: "inbox",
    isStarred: false,
    labels: ["Client"],
    attachments: [
      { id: "att-1", name: "Report_August.pdf", size: "2.4 MB", type: "application/pdf", url: "#" }
    ]
  },
  {
    id: "msg-sent-001",
    sender: { name: "Me (Admin)", email: "admin@searchintel.com" },
    recipient: { name: "Sarah Connor", email: "sarah@skynet-resistance.com" },
    subject: "Re: Urgent: Keyword Gap Analysis for Q3",
    preview: "Thanks Sarah, I reviewed the AI citation gaps and prepared a optimization proposal...",
    body: "<p>Hi Sarah,</p><p>I reviewed the AI citation gaps and prepared an optimization proposal for Skynet Resistance.</p><p>Let's discuss on Tuesday.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: "read",
    priority: "normal",
    folder: "sent",
    isStarred: false,
    labels: ["Follow-up"],
  }
];

const MessagesContext = createContext<MessagesContextProps | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return defaultMessages;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultMessages;
  });

  const [activeFolder, setActiveFolder] = useState<MessageFolder>("inbox");
  const [toastMessage, setToastMessage] = useState<ToastPayload>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const unreadCount = messages.filter(m => m.status === "unread" && m.folder === "inbox").length;

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "read", updatedAt: new Date().toISOString() } : m));
  };

  const markAsUnread = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "unread", updatedAt: new Date().toISOString() } : m));
  };

  const toggleStar = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred, updatedAt: new Date().toISOString() } : m));
  };

  const moveToFolder = (id: string, folder: MessageFolder) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, folder, updatedAt: new Date().toISOString() } : m));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, folder: "trash", updatedAt: new Date().toISOString() } : m));
  };

  const deletePermanently = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const restoreMessage = (id: string, folder: MessageFolder = "inbox") => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, folder, updatedAt: new Date().toISOString() } : m));
  };

  const updateMessageLabels = (id: string, labels: string[]) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, labels, updatedAt: new Date().toISOString() } : m));
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
  };

  const sendMessage = (draft: ComposeDraft) => {
    const plainText = draft.body.replace(/<[^>]+>/g, '').trim();
    const sentMsg: Message = {
      id: `msg-sent-${Date.now()}`,
      sender: { name: "Me (Admin)", email: "admin@searchintel.com" },
      recipient: { name: draft.to, email: draft.to },
      subject: draft.subject || "Subject",
      preview: plainText.substring(0, 75) || "(No content)",
      body: draft.body || plainText,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "read",
      priority: "normal",
      folder: "sent",
      isStarred: false,
      attachments: draft.attachments || [],
    };

    setMessages(prev => [sentMsg, ...prev.filter(m => draft.id ? m.id !== draft.id : true)]);
    setActiveFolder("sent");
    setToastMessage("Message sent successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveDraft = (draft: ComposeDraft) => {
    if (!draft.to && !draft.subject && !draft.body) return;

    const plainText = draft.body.replace(/<[^>]+>/g, '').trim();
    const draftMsg: Message = {
      id: draft.id || `msg-draft-${Date.now()}`,
      sender: { name: "Me (Admin)", email: "admin@searchintel.com" },
      recipient: { name: draft.to || "Recipient", email: draft.to || "recipient@example.com" },
      subject: draft.subject || "Subject",
      preview: plainText.substring(0, 75) || "(Draft content)",
      body: draft.body || plainText,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "read",
      priority: "normal",
      folder: "drafts",
      isStarred: false,
      attachments: draft.attachments || [],
    };

    setMessages(prev => [draftMsg, ...prev.filter(m => m.id !== draftMsg.id)]);
    setToastMessage("Draft saved automatically.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <MessagesContext.Provider value={{
      messages,
      activeFolder,
      setActiveFolder,
      unreadCount,
      toastMessage,
      setToastMessage,
      markAsRead,
      markAsUnread,
      toggleStar,
      moveToFolder,
      deleteMessage,
      deletePermanently,
      restoreMessage,
      updateMessageLabels,
      updateMessage,
      sendMessage,
      saveDraft,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}

