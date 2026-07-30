"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  TrendingDown, 
  ArrowRight,
  AlertCircle,
  RotateCw,
  Check,
  X,
  Trash2,
  Plus
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useNotifications, Notification } from "@/contexts/NotificationsContext";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("All notifications cleared successfully.");

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const router = useRouter();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { 
    notifications, 
    markAsRead, 
    clearAllNotifications, 
    createNotification,
    refreshNotifications,
    unreadCount 
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
        setShowConfirmDialog(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle ESC key & Keyboard Navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      if (event.key === "Escape") {
        if (showConfirmDialog) {
          setShowConfirmDialog(false);
        } else {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      } else if (event.key === "ArrowDown" && !showConfirmDialog) {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const limit = Math.min(notifications.length, 5);
          const next = prev < limit - 1 ? prev + 1 : 0;
          cardRefs.current[next]?.focus();
          return next;
        });
      } else if (event.key === "ArrowUp" && !showConfirmDialog) {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const limit = Math.min(notifications.length, 5);
          const next = prev > 0 ? prev - 1 : limit - 1;
          cardRefs.current[next]?.focus();
          return next;
        });
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, notifications.length, showConfirmDialog]);

  const handleCardClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.slug) {
      router.push(`/dashboard/notifications/${notification.slug}`);
    }
    setIsOpen(false);
  };

  const handleConfirmClearAll = async () => {
    setIsClearing(true);
    
    // Animate fade out for 200ms
    setTimeout(async () => {
      await clearAllNotifications();
      setIsClearing(false);
      setShowConfirmDialog(false);
      
      // Trigger success toast message
      setToastMessage("All notifications cleared successfully.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }, 200);
  };

  // Helper to trigger test new notification (for testing real-time creation)
  const handleCreateTestNotification = async () => {
    await createNotification({
      title: "New AI Ranking Detected",
      message: "Your brand is now cited in Google Gemini SERP.",
      type: "alert",
      severity: "high",
    });
    setToastMessage("New notification created!");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const getNotificationIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("rank") || t.includes("upgrade") || t.includes("jumped")) {
      return (
        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
          <TrendingUp size={18} />
        </div>
      );
    }
    if (t.includes("ai") || t.includes("citation") || t.includes("sge") || t.includes("gemini")) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
          <Sparkles size={18} />
        </div>
      );
    }
    if (t.includes("task") || t.includes("audit") || t.includes("completed")) {
      return (
        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} />
        </div>
      );
    }
    if (t.includes("report") || t.includes("ready")) {
      return (
        <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
          <FileText size={18} />
        </div>
      );
    }
    if (t.includes("competitor") || t.includes("visibility") || t.includes("dropped")) {
      return (
        <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
          <TrendingDown size={18} />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
        <AlertCircle size={18} />
      </div>
    );
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Notification Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`relative p-2 rounded-[20px] text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-all duration-200 cursor-pointer outline-none ${
          isOpen ? "bg-muted-bg text-foreground ring-2 ring-amber-500/20" : ""
        }`}
        title="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Toggle notification panel"
      >
        <Bell size={18} />
        {/* Red Unread Badge (Hides automatically when count is zero) */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-extrabold text-white ring-2 ring-card shadow-xs animate-in zoom-in-50 duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-[14px] font-sans text-xs font-semibold shadow-2xl border"
            style={{
              background: isDark ? "#18181B" : "#FFFFFF",
              color: isDark ? "#FFFFFF" : "#111827",
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "#E5E7EB",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)"
            }}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Floating Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 z-50 flex flex-col font-sans overflow-hidden"
            style={{
              width: "280px",
              maxWidth: "calc(100vw - 24px)",
              maxHeight: "360px",
              borderRadius: "14px",
              padding: "10px",
              background: isDark ? "#1E1E23" : "#FFFFFF",
              color: isDark ? "#FFFFFF" : "#1F2937",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E7EB",
              boxShadow: isDark ? "0 20px 60px rgba(0,0,0,.45)" : "0 10px 30px rgba(0,0,0,.12)",
            }}
            role="dialog"
            aria-label="Notifications panel"
          >
            {/* Header: 44px Height, Title & Clear All */}
            <div 
              className="flex items-center justify-between border-b shrink-0 px-[14px] py-[12px] mb-1.5"
              style={{
                height: "44px",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
              }}
            >
              <div className="flex items-center gap-[6px]">
                <Bell size={16} className="text-[#FF6B00]" />
                <h3 
                  className="text-[16px] font-semibold tracking-normal normal-case leading-[20px]"
                  style={{ color: isDark ? "#FFFFFF" : "#1F2937" }}
                >
                  Notification
                </h3>
              </div>

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(true)}
                  className="text-[12px] font-semibold transition-all hover:opacity-80 cursor-pointer"
                  style={{ color: "#FF6B00" }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Content Container */}
            <div className="relative flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 custom-scrollbar min-h-0">
              {/* Confirmation Dialog Overlay */}
              <AnimatePresence>
                {showConfirmDialog && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-30 flex flex-col justify-between p-3.5 rounded-[10px]"
                    style={{
                      background: isDark ? "#18181B" : "#FFFFFF",
                      border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #E5E7EB",
                    }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] font-bold text-foreground">
                          Clear all notifications?
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowConfirmDialog(false)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted-bg cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-[11px] font-normal leading-relaxed text-muted-foreground">
                        This action will remove all notifications from your notification list.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => setShowConfirmDialog(false)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmClearAll}
                        className="px-3 py-1 rounded-md text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Clear All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notification Cards or Empty State */}
              {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 px-3 text-center my-auto">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                      color: isDark ? "rgba(255,255,255,0.4)" : "#9CA3AF"
                    }}
                  >
                    <Bell size={24} />
                  </div>
                  
                  <h4 
                    className="text-[14px] font-bold mb-1"
                    style={{ color: isDark ? "#FFFFFF" : "#111827" }}
                  >
                    No Notifications
                  </h4>
                  
                  <p 
                    className="text-[11px] font-normal leading-snug mb-3 max-w-[200px]"
                    style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6B7280" }}
                  >
                    You're all caught up.<br />New notifications will appear here.
                  </p>

                  <button
                    type="button"
                    onClick={handleCreateTestNotification}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer border hover:border-amber-500/50"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.06)" : "#F9FAFB",
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB",
                      color: isDark ? "#FFFFFF" : "#374151"
                    }}
                    title="Simulate a new incoming notification"
                  >
                    <Plus size={11} className="text-[#FF6B00]" />
                    <span>Simulate Notification</span>
                  </button>
                </div>
              ) : (
                <motion.div
                  animate={{ opacity: isClearing ? 0 : 1, y: isClearing ? -4 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-1.5"
                >
                  {notifications.slice(0, 5).map((notification, index) => {
                    const isFocused = focusedIndex === index;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        ref={(node) => {
                          cardRefs.current[index] = node;
                        }}
                        tabIndex={0}
                        onClick={() => handleCardClick(notification)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCardClick(notification);
                          }
                        }}
                        className="group flex items-center gap-[8px] cursor-pointer outline-none transition-all duration-150 shrink-0"
                        style={{
                          height: "58px",
                          padding: "8px",
                          borderRadius: "10px",
                          background: isDark
                            ? (notification.isRead ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.07)")
                            : (notification.isRead ? "#F9FAFB" : "#F3F4F6"),
                          border: isFocused ? "1px solid #FF6B00" : (isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)"),
                          boxSizing: "border-box",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0px)";
                          e.currentTarget.style.backgroundColor = isDark
                            ? (notification.isRead ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.07)")
                            : (notification.isRead ? "#F9FAFB" : "#F3F4F6");
                        }}
                      >
                        {getNotificationIcon(notification.title)}

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-1">
                            <p 
                              className="text-[13px] font-semibold leading-tight truncate"
                              style={{ color: isDark ? "#FFFFFF" : "#1F2937" }}
                            >
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                            )}
                          </div>

                          <p 
                            className="text-[11px] font-normal leading-snug truncate mt-0.5"
                            style={{ color: isDark ? "rgba(255, 255, 255, 0.7)" : "#4B5563" }}
                          >
                            {notification.message}
                          </p>

                          <span 
                            className="text-[10px] font-medium leading-none block mt-0.5"
                            style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "#9CA3AF" }}
                          >
                            {notification.timestamp}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Footer: Hidden when count = 0 */}
            {notifications.length > 0 && (
              <div 
                className="flex items-center justify-center border-t shrink-0 mt-1.5"
                style={{
                  height: "40px",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
                }}
              >
                <Link
                  href="/dashboard/tasks-audits"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1 text-[12px] font-semibold transition-all hover:gap-1.5 cursor-pointer py-1 px-2.5 rounded-full hover:bg-[#FF6B00]/10"
                  style={{ color: "#FF6B00" }}
                >
                  <span>View All Audit Tasks</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
