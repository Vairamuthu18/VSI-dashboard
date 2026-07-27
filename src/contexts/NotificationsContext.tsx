"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type NotificationType = 'alert' | 'system' | 'report' | 'user';
export type NotificationSeverity = 'high' | 'medium' | 'low' | 'info';

export interface Notification {
  id: string;
  slug: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  fullDetails: string;
  timestamp: string;
  isRead: boolean;
  relatedClient?: string;
  aiEngine?: string;
  recommendedActions: string[];
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    slug: "ai-engine-visibility-drop",
    type: "alert",
    severity: "high",
    title: "AI Engine Visibility Drop",
    message: "Visibility for 'Acme Corp' dropped by 12% on ChatGPT 4o.",
    fullDetails: "Our daily scan detected a significant 12% drop in direct citations for 'Acme Corp' across ChatGPT 4o generative search responses. This impacts 8 core commercial keywords.",
    timestamp: "10 mins ago",
    isRead: false,
    relatedClient: "Acme Corp",
    aiEngine: "ChatGPT 4o",
    recommendedActions: ["Open Visibility Analytics", "Review Keyword Gap Analysis"]
  },
  {
    id: "2",
    slug: "weekly-citation-report",
    type: "report",
    severity: "info",
    title: "Weekly Citation Report Ready",
    message: "Your weekly AI citation performance report for Oct 12 - 19 is now available.",
    fullDetails: "The automated weekly summary is complete. Your overall AI visibility score improved by 2.4% across the portfolio. 15 new citations were discovered for your top 3 clients.",
    timestamp: "2 hours ago",
    isRead: false,
    recommendedActions: ["Open Reports Module", "Download PDF Summary"]
  },
  {
    id: "3",
    slug: "system-maintenance",
    type: "system",
    severity: "low",
    title: "System Maintenance Scheduled",
    message: "Scheduled maintenance will occur on Sunday at 2 AM UTC.",
    fullDetails: "We will be upgrading our data processing pipelines to support faster citation indexing. Expected downtime is approximately 45 minutes.",
    timestamp: "1 day ago",
    isRead: true,
    recommendedActions: ["Open System Status"]
  },
  {
    id: "4",
    slug: "new-client-onboarded",
    type: "user",
    severity: "info",
    title: "New Client Onboarded",
    message: "VG Digital has been successfully added to your tracked portfolio.",
    fullDetails: "Initial onboarding scans have been queued. We are currently evaluating 250 initial keywords against 5 AI engines.",
    timestamp: "2 days ago",
    isRead: true,
    relatedClient: "VG Digital",
    recommendedActions: ["Open Client Profile"]
  },
  {
    id: "5",
    slug: "api-quota-warning",
    type: "alert",
    severity: "medium",
    title: "API Quota Warning",
    message: "You have consumed 90% of your monthly API limits.",
    fullDetails: "Your agency has used 90,000 out of 100,000 monthly API requests. Consider upgrading your tier or reviewing usage to avoid throttling.",
    timestamp: "3 days ago",
    isRead: true,
    recommendedActions: ["Open API Settings"]
  },
  {
    id: "6",
    slug: "competitor-alert",
    type: "alert",
    severity: "high",
    title: "Competitor Alert",
    message: "A new competitor 'Global Reach' is gaining SOV in your tracked segments.",
    fullDetails: "Our anomaly detection flagged a rapid increase in AI citations for 'Global Reach'. They have displaced your client 'TechSolutions' in 5 key queries.",
    timestamp: "4 days ago",
    isRead: true,
    recommendedActions: ["Open Competitor Benchmark"]
  }
];

interface NotificationsContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getNotificationBySlug: (slug: string) => Notification | undefined;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationBySlug = (slug: string) => {
    return notifications.find(n => n.slug === slug);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationsContext.Provider value={{
      notifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      getNotificationBySlug,
      unreadCount
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
