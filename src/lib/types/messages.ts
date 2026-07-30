export type MessageStatus = "read" | "unread" | "draft" | "sent";
export type MessagePriority = "high" | "normal" | "low";
export type MessageFolder = "inbox" | "unread" | "sent" | "drafts" | "starred" | "archived" | "trash" | "spam";

export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface Message {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  recipient: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  updatedAt?: string;
  status: MessageStatus;
  priority: MessagePriority;
  attachments?: MessageAttachment[];
  folder: MessageFolder;
  isStarred: boolean;
  labels?: string[];
  relatedClient?: string;
  aiSummary?: string;
}

export interface ComposeDraft {
  id?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  attachments?: MessageAttachment[];
}

export type ToastPayload = {
  text: string;
  actionText?: string;
  onAction?: () => void;
} | string | null;

