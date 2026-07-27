"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationsContext";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Bell, AlertCircle, Zap, FileText, UserPlus, 
  Check, Trash2, Archive, Download, ExternalLink, ChevronRight 
} from "lucide-react";
import Link from "next/link";

export default function NotificationDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { getNotificationBySlug, markAsRead, deleteNotification } = useNotifications();
  
  const notification = getNotificationBySlug(slug);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (notification && !notification.isRead) {
      markAsRead(notification.id);
    }
  }, [notification, markAsRead]);

  if (!notification) {
    return (
      <div className="p-4 sm:p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-64px)] flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Bell className="text-muted-foreground w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Notification Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          The notification you're looking for might have been deleted or never existed.
        </p>
        <button 
          onClick={() => router.push("/dashboard/notifications")}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-lg"
        >
          Return to Notifications
        </button>
      </div>
    );
  }

  const handleNavigateBack = () => {
    setIsNavigating(true);
    router.push("/dashboard/notifications");
  };

  const handleDelete = () => {
    setIsNavigating(true);
    deleteNotification(notification.id);
    router.push("/dashboard/notifications");
  };

  const handleResolve = async () => {
    setIsNavigating(true);
    
    try {
      const response = await fetch("/api/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: notification.id,
          title: notification.title,
          message: notification.message,
          details: notification.fullDetails,
          apiKey: process.env.NEXT_PUBLIC_API_KEY || "YOUR_API_KEY"
        }),
      });
      
      const data = await response.json();
      
      if (data.resolution) {
        alert("AI Resolution: " + data.resolution);
      } else if (data.error) {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Failed to resolve:", error);
    }

    deleteNotification(notification.id);
    router.push("/dashboard/notifications");
  };

  const handleActionClick = (action: string) => {
    setIsNavigating(true);
    switch (action) {
      case "Open Visibility Analytics":
        router.push("/dashboard/analytics");
        break;
      case "Review Keyword Gap Analysis":
        router.push("/dashboard/analytics?tab=keyword-gap");
        break;
      case "Open Reports Module":
        router.push("/dashboard/reports");
        break;
      case "Download PDF Summary":
        // Simulate a download action, could point to an API endpoint later
        router.push("/dashboard/reports");
        break;
      case "Open System Status":
        router.push("/dashboard/system-status");
        break;
      case "Open Client Profile":
        const clientSlug = notification.relatedClient?.toLowerCase().replace(/\s+/g, '-') || '';
        router.push(`/dashboard/clients/${clientSlug}`);
        break;
      case "Open API Settings":
        router.push("/dashboard/settings");
        break;
      case "Open Competitor Benchmark":
        router.push("/dashboard/competitors");
        break;
      default:
        setIsNavigating(false);
        break;
    }
  };

  
  // Icon and Color mappings
  const getTypeConfig = (type: string) => {
    switch(type) {
      case 'alert': return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' };
      case 'system': return { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
      case 'report': return { icon: FileText, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' };
      case 'user': return { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      default: return { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'high': return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">High</span>;
      case 'medium': return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">Medium</span>;
      case 'low': return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">Low</span>;
      case 'info': return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">Info</span>;
      default: return null;
    }
  };

  const typeConfig = getTypeConfig(notification.type);
  const Icon = typeConfig.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.3 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1000px] mx-auto font-sans transition-colors bg-background min-h-[calc(100vh-64px)]">
      
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-foreground">Navigating...</p>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-6"
      >
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight size={14} />
        <Link href="/dashboard/notifications" className="hover:text-foreground transition-colors">Notifications</Link>
        <ChevronRight size={14} />
        <span className="text-foreground">Notification Details</span>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {/* Header Actions */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <button 
            onClick={handleNavigateBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted-bg text-muted-foreground hover:text-foreground transition-colors text-sm font-bold"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-full hover:bg-muted-bg text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
              title="Archive Notification"
            >
              <Archive size={16} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors border border-transparent hover:border-rose-500/20"
              title="Delete Notification"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </motion.div>

        {/* Hero Card */}
        <motion.div 
          variants={scaleVariants}
          className="relative bg-card border border-border/80 rounded-[24px] p-6 sm:p-8 shadow-sm overflow-hidden"
        >
          {/* Background Gradient Effect */}
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 blur-[100px] rounded-full ${typeConfig.bg.split(' ')[0]}`} />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6">
            <div className={`shrink-0 w-16 h-16 rounded-2xl border flex items-center justify-center shadow-inner ${typeConfig.bg}`}>
              <Icon size={28} className={typeConfig.color} />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {getSeverityBadge(notification.severity)}
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-muted-bg text-muted-foreground border border-border uppercase tracking-wider">
                  {notification.type}
                </span>
                <span className="text-xs font-semibold text-muted-foreground ml-auto">
                  {notification.timestamp}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3 leading-tight">
                {notification.title}
              </h1>
              
              <p className="text-base sm:text-lg text-foreground/80 font-medium mb-6 leading-relaxed">
                {notification.message}
              </p>
              
              <div className="p-4 rounded-xl bg-muted-bg border border-border/60 text-sm text-foreground/90 leading-relaxed shadow-inner">
                {notification.fullDetails}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details & Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metadata Sidebar */}
          <motion.div variants={itemVariants} className="col-span-1 flex flex-col gap-4">
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Metadata</h3>
              <div className="space-y-4">
                {notification.relatedClient && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Related Client</p>
                    <p className="text-sm font-bold text-foreground">{notification.relatedClient}</p>
                  </div>
                )}
                {notification.aiEngine && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">AI Engine</p>
                    <p className="text-sm font-bold text-foreground">{notification.aiEngine}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Status</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-bold text-emerald-500">Processed</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommended Actions */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 flex flex-col gap-4">
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm h-full flex flex-col">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Recommended Actions</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto mb-auto">
                {notification.recommendedActions.map((action, index) => {
                  // Determine icon and color based on action text (simulated logic)
                  const isPrimary = index === 0;
                  return (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group ${
                        isPrimary 
                          ? 'bg-amber-500 hover:bg-amber-600 border-amber-500 text-white shadow-md hover:shadow-lg'
                          : 'bg-muted-bg hover:bg-card border-border hover:border-amber-500/50 text-foreground shadow-sm hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm font-bold">{action}</span>
                      <ExternalLink size={16} className={`transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${isPrimary ? 'text-white' : 'text-muted-foreground'}`} />
                    </button>
                  );
                })}

                {/* Always provide a download report if it's a report */}
                {notification.type === 'report' && (
                  <button className="flex items-center justify-between p-3 rounded-xl border bg-muted-bg hover:bg-card border-border hover:border-primary/50 text-foreground transition-all duration-200 shadow-sm hover:shadow-md group">
                    <span className="text-sm font-bold">Download Report</span>
                    <Download size={16} className="text-muted-foreground transition-transform group-hover:translate-y-0.5" />
                  </button>
                )}

                {/* Always provide a resolve option if it's an alert */}
                {notification.type === 'alert' && (
                  <button 
                    onClick={handleResolve}
                    className="flex items-center justify-between p-3 rounded-xl border bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <span className="text-sm font-bold">Resolve Notification</span>
                    <Check size={16} className="transition-transform group-hover:scale-110" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
