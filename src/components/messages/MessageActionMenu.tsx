"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  Mail,
  MailOpen,
  Star,
  StarOff,
  Archive,
  Inbox,
  Trash2,
  Trash,
  Download,
  Printer,
  Link,
  Copy,
  Share2,
  Tag,
  ShieldAlert,
  AlertTriangle,
  Info,
  X,
  Check,
  ExternalLink,
  LucideIcon
} from "lucide-react";
import { Message, MessageFolder } from "@/lib/types/messages";
import { useMessages } from "@/contexts/MessagesContext";

interface MessageActionMenuProps {
  message: Message;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  isDanger?: boolean;
  onClick: () => void;
}

export default function MessageActionMenu({ message }: MessageActionMenuProps) {
  const router = useRouter();
  const {
    markAsRead,
    markAsUnread,
    toggleStar,
    moveToFolder,
    deletePermanently,
    restoreMessage,
    updateMessageLabels,
    setToastMessage
  } = useMessages();

  // Component States
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    transformOrigin: string;
  }>({
    top: 0,
    left: 0,
    transformOrigin: "top right"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const availableLabels = ["Work", "Urgent", "Follow-up", "Client", "Important", "Personal"];

  // Toggle Menu
  const toggleMenu = () => {
    setIsOpen(prev => !prev);
    setFocusedIndex(-1);
  };

  // Close Menu
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  // Smart Auto Positioning & Viewport Clamping logic
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 220; // fixed width of dropdown menu: w-[220px]
    const padding = 12; // safe distance from viewport edges

    const menuHeight = menuRef.current?.offsetHeight || 460;

    // Horizontal placement calculation:
    // Default / Preferred: Open toward the LEFT of the 3-dot button (right-aligned to button)
    let leftPos = rect.right - menuWidth;
    let horizontalOrigin: "right" | "left" = "right";

    // Check if opening left causes left edge to overflow viewport
    if (leftPos < padding) {
      // Check if opening to the right fits
      if (rect.left + menuWidth <= viewportWidth - padding) {
        leftPos = rect.left;
        horizontalOrigin = "left";
      } else {
        // Clamp position within viewport
        leftPos = Math.max(padding, Math.min(leftPos, viewportWidth - menuWidth - padding));
      }
    }

    // Vertical placement calculation:
    let topPos = rect.bottom + 6;
    let verticalOrigin: "top" | "bottom" = "top";

    // Check if opening downwards causes bottom edge to overflow viewport
    if (topPos + menuHeight > viewportHeight - padding) {
      // Check if opening upwards (above button) fits better
      if (rect.top - menuHeight - 6 >= padding) {
        topPos = rect.top - menuHeight - 6;
        verticalOrigin = "bottom";
      } else {
        // Clamp top position inside viewport
        topPos = Math.max(padding, viewportHeight - menuHeight - padding);
      }
    }

    setMenuPosition({
      top: topPos,
      left: leftPos,
      transformOrigin: `${verticalOrigin} ${horizontalOrigin}`
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleResizeOrScroll = () => {
        updatePosition();
      };
      window.addEventListener("resize", handleResizeOrScroll);
      window.addEventListener("scroll", handleResizeOrScroll, true);
      return () => {
        window.removeEventListener("resize", handleResizeOrScroll);
        window.removeEventListener("scroll", handleResizeOrScroll, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  // Action Items Configuration (All 17 Items)
  const isStarred = message.isStarred;
  const isRead = message.status === "read";
  const currentFolder = message.folder;

  const menuSections: { id: string; items: MenuItem[] }[] = [
    {
      id: "status-star",
      items: [
        isRead
          ? {
              id: "mark-unread",
              label: "Mark as Unread",
              icon: Mail,
              onClick: () => {
                markAsUnread(message.id);
                setToastMessage("Marked as unread");
              }
            }
          : {
              id: "mark-read",
              label: "Mark as Read",
              icon: MailOpen,
              onClick: () => {
                markAsRead(message.id);
                setToastMessage("Marked as read");
              }
            },
        isStarred
          ? {
              id: "unstar",
              label: "Unstar Message",
              icon: StarOff,
              onClick: () => {
                toggleStar(message.id);
                setToastMessage("Message unstarred");
              }
            }
          : {
              id: "star",
              label: "Star Message",
              icon: Star,
              onClick: () => {
                toggleStar(message.id);
                setToastMessage("Message starred");
              }
            }
      ]
    },
    {
      id: "organize",
      items: ((): MenuItem[] => {
        const items: MenuItem[] = [];
        if (currentFolder !== "archived") {
          items.push({
            id: "archive",
            label: "Archive",
            icon: Archive,
            onClick: () => {
              moveToFolder(message.id, "archived");
              setToastMessage("Message moved to Archive");
              router.push("/dashboard/messages");
            }
          });
        } else {
          items.push({
            id: "move-inbox",
            label: "Move to Inbox",
            icon: Inbox,
            onClick: () => {
              moveToFolder(message.id, "inbox");
              setToastMessage("Message moved to Inbox");
            }
          });
        }
        if (currentFolder !== "trash") {
          items.push({
            id: "move-trash",
            label: "Move to Trash",
            icon: Trash2,
            onClick: () => {
              const prevFolder = message.folder;
              moveToFolder(message.id, "trash");
              setToastMessage({
                text: "Moved to Trash",
                actionText: "Undo",
                onAction: () => {
                  restoreMessage(message.id, prevFolder);
                }
              });
            }
          });
        }
        items.push({
          id: "add-label",
          label: "Add Label",
          icon: Tag,
          onClick: () => setShowLabelModal(true)
        });
        return items;
      })()
    },
    {
      id: "utility",
      items: [
        {
          id: "download-pdf",
          label: "Download as PDF",
          icon: Download,
          onClick: () => handleDownloadPDF()
        },
        {
          id: "print",
          label: "Print Message",
          icon: Printer,
          onClick: () => handlePrint()
        },
        {
          id: "copy-link",
          label: "Copy Link",
          icon: Link,
          onClick: () => handleCopyLink()
        },
        {
          id: "copy-message",
          label: "Copy Message",
          icon: Copy,
          onClick: () => handleCopyMessage()
        },
        {
          id: "share",
          label: "Share Message",
          icon: Share2,
          onClick: () => setShowShareModal(true)
        }
      ]
    },
    {
      id: "info-security",
      items: [
        {
          id: "view-details",
          label: "View Message Details",
          icon: Info,
          onClick: () => setShowDetailsModal(true)
        },
        {
          id: "report-spam",
          label: "Report Spam",
          icon: ShieldAlert,
          onClick: () => {
            moveToFolder(message.id, "trash");
            setToastMessage("Marked as Spam");
            router.push("/dashboard/messages");
          }
        },
        {
          id: "report-phishing",
          label: "Report Phishing",
          icon: AlertTriangle,
          onClick: () => {
            moveToFolder(message.id, "trash");
            setToastMessage("Reported as Phishing");
            router.push("/dashboard/messages");
          }
        }
      ]
    },
    {
      id: "danger",
      items: [
        {
          id: "delete-permanently",
          label: "Delete Permanently",
          icon: Trash,
          isDanger: true,
          onClick: () => setShowDeleteConfirm(true)
        }
      ]
    }
  ];

  // Flattened list for keyboard navigation
  const allActionItems = menuSections.flatMap(section => section.items).filter(Boolean) as {
    id: string;
    label: string;
    icon: React.ElementType;
    isDanger?: boolean;
    onClick: () => void;
  }[];

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % allActionItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => (prev - 1 + allActionItems.length) % allActionItems.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < allActionItems.length) {
        const item = allActionItems[focusedIndex];
        closeMenu();
        item.onClick();
      }
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Action Implementations
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setToastMessage("Link copied successfully");
    }).catch(() => {
      setToastMessage("Failed to copy link");
    });
  };

  const handleCopyMessage = () => {
    const textContent = `Subject: ${message.subject}\nFrom: ${message.sender.name} <${message.sender.email}>\nDate: ${new Date(message.timestamp).toLocaleString()}\n\n${message.preview || message.body.replace(/<[^>]+>/g, '')}`;
    navigator.clipboard.writeText(textContent).then(() => {
      setToastMessage("Message content copied to clipboard");
    }).catch(() => {
      setToastMessage("Failed to copy message content");
    });
  };

  const handlePrint = () => {
    setToastMessage("Opening browser print dialog...");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownloadPDF = () => {
    setToastMessage("Generating PDF document...");
    setTimeout(() => {
      const element = document.createElement("a");
      const plainBody = message.body.replace(/<[^>]+>/g, '\n');
      const content = `========================================================\nMESSAGE DETAILS\n========================================================\n\nSubject: ${message.subject}\nFrom: ${message.sender.name} (${message.sender.email})\nTo: ${message.recipient.name} (${message.recipient.email})\nDate: ${new Date(message.timestamp).toLocaleString()}\nFolder: ${message.folder.toUpperCase()}\nStatus: ${message.status.toUpperCase()}\n\n--------------------------------------------------------\nCONTENT:\n--------------------------------------------------------\n\n${plainBody}\n`;
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${message.subject.replace(/[^a-zA-Z0-9]/gi, '_')}_message.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setToastMessage("Message PDF/File downloaded successfully");
    }, 600);
  };

  const confirmDeletePermanently = () => {
    deletePermanently(message.id);
    setShowDeleteConfirm(false);
    setToastMessage("Message permanently deleted");
    router.push("/dashboard/messages");
  };

  const toggleLabel = (label: string) => {
    const currentLabels = message.labels || [];
    const updated = currentLabels.includes(label)
      ? currentLabels.filter(l => l !== label)
      : [...currentLabels, label];
    updateMessageLabels(message.id, updated);
    setToastMessage(`Updated label: ${label}`);
  };

  let globalIndexCounter = 0;

  return (
    <div className="relative inline-block text-left" onKeyDown={handleKeyDown}>
      {/* Three-dot Toggle Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="More Actions"
        className={`p-2 rounded-full transition-all duration-200 ${
          isOpen
            ? "bg-[#FF6B00]/10 text-[#FF6B00] ring-2 ring-[#FF6B00]/30"
            : "hover:bg-card text-muted-foreground hover:text-foreground"
        }`}
      >
        <MoreVertical size={18} />
      </button>

      {/* Enterprise Dropdown Menu */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: menuPosition.top,
                left: menuPosition.left,
                transformOrigin: menuPosition.transformOrigin,
                zIndex: 9999
              }}
              className="w-[220px] rounded-[12px] bg-white dark:bg-[#1E1E23] text-slate-900 dark:text-foreground border border-slate-200 dark:border-border/80 shadow-2xl backdrop-blur-xl overflow-hidden py-1.5 focus:outline-none"
              role="menu"
            >
              {menuSections.map((section, sIndex) => (
                <React.Fragment key={section.id}>
                  {sIndex > 0 && <div className="my-1 border-t border-slate-100 dark:border-border/50" />}
                  {section.items.map(item => {
                    if (!item) return null;
                    const itemIndex = globalIndexCounter++;
                    const Icon = item.icon;
                    const isDanger = item.isDanger;

                    return (
                      <button
                        key={item.id}
                        ref={el => { itemRefs.current[itemIndex] = el; }}
                        role="menuitem"
                        tabIndex={0}
                        onClick={() => {
                          closeMenu();
                          item.onClick();
                        }}
                        onMouseEnter={() => setFocusedIndex(itemIndex)}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors outline-none cursor-pointer ${
                          isDanger
                            ? "text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10"
                            : "text-slate-700 dark:text-foreground/90 hover:bg-slate-100 dark:hover:bg-card focus:bg-slate-100 dark:focus:bg-card hover:text-[#FF6B00]"
                        }`}
                      >
                        <Icon size={15} className={isDanger ? "text-rose-500 shrink-0" : "text-muted-foreground shrink-0 group-hover:text-[#FF6B00]"} />
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* CONFIRMATION DIALOG (Delete Permanently) */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-white dark:bg-[#1E1E23] rounded-[20px] border border-slate-200 dark:border-border shadow-2xl p-6 text-slate-900 dark:text-foreground relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <Trash size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Delete Message?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-full border border-slate-200 dark:border-border text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-card transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePermanently}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW MESSAGE DETAILS MODAL */}
      <AnimatePresence>
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#1E1E23] rounded-[24px] border border-slate-200 dark:border-border shadow-2xl p-6 text-slate-900 dark:text-foreground relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-border/50 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                    <Info size={18} />
                  </div>
                  <h3 className="text-base font-bold">Message Details</h3>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-card"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Message ID</span>
                  <span className="font-mono text-foreground font-semibold">{message.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Sender</span>
                  <span className="text-foreground font-semibold text-right">{message.sender.name} &lt;{message.sender.email}&gt;</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Receiver</span>
                  <span className="text-foreground font-semibold text-right">{message.recipient.name} &lt;{message.recipient.email}&gt;</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Subject</span>
                  <span className="text-foreground font-semibold text-right max-w-[200px] truncate">{message.subject}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Created Time</span>
                  <span className="text-foreground font-semibold">{new Date(message.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Updated Time</span>
                  <span className="text-foreground font-semibold">{new Date(message.updatedAt || message.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Status</span>
                  <span className="px-2 py-0.5 rounded bg-[#FF6B00]/10 text-[#FF6B00] font-bold uppercase text-[10px]">
                    {message.status}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Labels</span>
                  <span className="text-foreground font-semibold">
                    {message.labels && message.labels.length > 0 ? message.labels.join(", ") : "None"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-border/30">
                  <span className="text-muted-foreground font-medium">Priority</span>
                  <span className="text-foreground font-semibold capitalize">{message.priority}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground font-medium">Attachments</span>
                  <span className="text-foreground font-semibold">{message.attachments?.length || 0} file(s)</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARE MESSAGE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#1E1E23] rounded-[24px] border border-slate-200 dark:border-border shadow-2xl p-6 text-slate-900 dark:text-foreground relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-border/50 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                    <Share2 size={18} />
                  </div>
                  <h3 className="text-base font-bold">Share Message</h3>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-card"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Shareable Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? window.location.href : ""}
                      className="flex-1 bg-slate-100 dark:bg-card border border-slate-200 dark:border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-xl hover:bg-[#FF6B00]/90 transition-colors flex items-center gap-1"
                    >
                      <Copy size={14} /> Copy
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Quick Options
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        window.location.href = `mailto:?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(window.location.href)}`;
                        setToastMessage("Opening email app...");
                      }}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-border/60 hover:bg-slate-100 dark:hover:bg-card text-xs font-semibold transition-colors"
                    >
                      <Mail size={16} className="text-[#FF6B00]" /> Email Client
                    </button>
                    <button
                      onClick={handleCopyMessage}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-border/60 hover:bg-slate-100 dark:hover:bg-card text-xs font-semibold transition-colors"
                    >
                      <ExternalLink size={16} className="text-[#FF6B00]" /> Copy Content
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-5 py-2 text-xs font-bold rounded-full border border-slate-200 dark:border-border text-foreground hover:bg-slate-100 dark:hover:bg-card transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD LABEL MODAL */}
      <AnimatePresence>
        {showLabelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-[#1E1E23] rounded-[24px] border border-slate-200 dark:border-border shadow-2xl p-6 text-slate-900 dark:text-foreground relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-border/50 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                    <Tag size={18} />
                  </div>
                  <h3 className="text-base font-bold">Manage Labels</h3>
                </div>
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-card"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 my-4">
                {availableLabels.map(label => {
                  const isSelected = (message.labels || []).includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-[#FF6B00]/10 border border-[#FF6B00]/40 text-[#FF6B00]"
                          : "bg-slate-50 dark:bg-card border border-slate-200 dark:border-border/50 text-foreground hover:bg-slate-100 dark:hover:bg-card/80"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Tag size={14} /> {label}
                      </span>
                      {isSelected && <Check size={16} className="text-[#FF6B00]" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
