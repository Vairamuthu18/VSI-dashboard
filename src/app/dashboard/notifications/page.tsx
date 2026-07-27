"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, Check, Trash2, Search, Zap, UserPlus, FileText, AlertCircle, 
  ChevronRight, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifications, NotificationType, Notification } from "@/contexts/NotificationsContext";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isNavigating, setIsNavigating] = useState(false);

  // Handlers
  const handleNavigateBack = () => {
    setIsNavigating(true);
    router.back();
  };

  const handleNotificationClick = (notification: Notification) => {
    setIsNavigating(true);
    router.push(`/dashboard/notifications/${notification.slug}`);
  };

  // Filtering & Search
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(n => {
        if (filter === 'unread' && n.isRead) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
        }
        return true;
      });
  }, [notifications, filter, searchQuery]);

  // Icon mapping
  const getIcon = (type: NotificationType) => {
    switch(type) {
      case 'alert': return <AlertCircle size={16} className="text-rose-500" />;
      case 'system': return <Zap size={16} className="text-amber-500" />;
      case 'report': return <FileText size={16} className="text-primary" />;
      case 'user': return <UserPlus size={16} className="text-emerald-500" />;
      default: return <Bell size={16} className="text-blue-500" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch(type) {
      case 'alert': return 'bg-rose-500/10 border-rose-500/20';
      case 'system': return 'bg-amber-500/10 border-amber-500/20';
      case 'report': return 'bg-primary/10 border-primary/20';
      case 'user': return 'bg-emerald-500/10 border-emerald-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1200px] mx-auto font-sans transition-colors bg-background min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-foreground">Navigating...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-border/80 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleNavigateBack}
            className="p-2 rounded-full hover:bg-muted-bg text-muted-foreground hover:text-foreground transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="text-xs font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                    {unreadCount} New
                  </span>
                )}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
              Manage your system alerts, reports, and AI engine updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check size={14} />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Controls: Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-card border border-border/80 rounded-full w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'all' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-bg'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'unread' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-bg'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`w-1.5 h-1.5 rounded-full ${filter === 'unread' ? 'bg-white' : 'bg-amber-500'}`} />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full bg-card border border-border rounded-full pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Notifications List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {filteredNotifications.length === 0 ? (
          <motion.div variants={itemVariants} className="rounded-[20px] border border-dashed border-border bg-card p-12 text-center shadow-sm mt-8">
            <Bell size={36} className="text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-base font-bold text-foreground mb-1">No Notifications Found</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {searchQuery ? "We couldn't find any notifications matching your search." : "You're all caught up! There are no notifications to display right now."}
            </p>
          </motion.div>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div 
              key={notification.id}
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex flex-col sm:flex-row gap-4 p-5 rounded-[20px] border transition-all duration-300 cursor-pointer ${
                notification.isRead 
                  ? 'bg-card border-border/80 hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.06)]' 
                  : 'bg-card border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.08)] hover:border-amber-500/80 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* Unread Indicator */}
              {!notification.isRead && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              )}

              {/* Icon */}
              <div className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${getIconBg(notification.type)}`}>
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h3 className={`text-sm font-bold truncate ${notification.isRead ? 'text-foreground' : 'text-foreground'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-[10px] font-semibold text-muted-foreground shrink-0 whitespace-nowrap bg-muted-bg px-2 py-0.5 rounded-full border border-border group-hover:border-amber-500/30 transition-colors">
                    {notification.timestamp}
                  </span>
                </div>
                <p className={`text-xs ${notification.isRead ? 'text-muted-foreground' : 'text-foreground/90 font-medium'}`}>
                  {notification.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                    className="p-2 rounded-full bg-muted-bg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors border border-transparent hover:border-emerald-500/20"
                    title="Mark as Read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                  className="p-2 rounded-full bg-muted-bg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors border border-transparent hover:border-rose-500/20"
                  title="Delete Notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
