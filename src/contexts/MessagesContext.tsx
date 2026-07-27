"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Message, MessageFolder, MessageStatus } from "@/lib/types/messages";

interface MessagesContextProps {
  messages: Message[];
  activeFolder: MessageFolder;
  setActiveFolder: (folder: MessageFolder) => void;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  toggleStar: (id: string) => void;
  moveToFolder: (id: string, folder: MessageFolder) => void;
  deleteMessage: (id: string) => void;
  sendMessage: (draft: any) => void;
}

const defaultMessages: Message[] = [
  {
    id: "msg-001",
    sender: { name: "Sarah Connor", email: "sarah@skynet-resistance.com" },
    recipient: { name: "System Admin", email: "admin@searchintel.com" },
    subject: "Urgent: Keyword Gap Analysis for Q3",
    preview: "Hey, I was looking at the latest report and we have a major gap in the AI overview section...",
    body: "<p>Hey,</p><p>I was looking at the latest report and we have a major gap in the AI overview section. We need to optimize our content for the new Gemini citations.</p><p>Can we schedule a call?</p><p>- Sarah</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "unread",
    priority: "high",
    folder: "inbox",
    isStarred: true,
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
    status: "read",
    priority: "normal",
    folder: "inbox",
    isStarred: false,
    attachments: [
      { id: "att-1", name: "Report_August.pdf", size: "2.4 MB", type: "application/pdf", url: "#" }
    ]
  },
];

const MessagesContext = createContext<MessagesContextProps | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [activeFolder, setActiveFolder] = useState<MessageFolder>("inbox");

  const unreadCount = messages.filter(m => m.status === "unread" && m.folder === "inbox").length;

  // Simulate real-time incoming message
  useEffect(() => {
    const timer = setTimeout(() => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: { name: "System Alerts", email: "alerts@searchintel.com" },
        recipient: { name: "System Admin", email: "admin@searchintel.com" },
        subject: "New API Key Registered",
        preview: "A new Gemini API key has been registered to your workspace.",
        body: "<p>A new Gemini API key has been registered to your workspace.</p><p>Please ensure this was authorized.</p>",
        timestamp: new Date().toISOString(),
        status: "unread",
        priority: "normal",
        folder: "inbox",
        isStarred: false,
      };
      setMessages(prev => [newMessage, ...prev]);
    }, 15000); // Receive a message after 15 seconds for demonstration

    return () => clearTimeout(timer);
  }, []);

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "read" } : m));
  };

  const markAsUnread = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "unread" } : m));
  };

  const toggleStar = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
  };

  const moveToFolder = (id: string, folder: MessageFolder) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, folder } : m));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, folder: "trash" } : m));
  };

  const sendMessage = (draft: any) => {
    const sentMessage: Message = {
      id: `msg-sent-${Date.now()}`,
      sender: { name: "Me", email: "admin@searchintel.com" },
      recipient: { name: draft.to, email: draft.to },
      subject: draft.subject || "(No Subject)",
      preview: draft.body.substring(0, 50).replace(/<[^>]+>/g, ''),
      body: draft.body,
      timestamp: new Date().toISOString(),
      status: "read",
      priority: "normal",
      folder: "sent",
      isStarred: false,
    };
    setMessages(prev => [sentMessage, ...prev]);
  };

  return (
    <MessagesContext.Provider value={{
      messages,
      activeFolder,
      setActiveFolder,
      unreadCount,
      markAsRead,
      markAsUnread,
      toggleStar,
      moveToFolder,
      deleteMessage,
      sendMessage
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
