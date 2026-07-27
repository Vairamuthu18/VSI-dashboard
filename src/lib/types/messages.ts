export type MessageStatus = "read" | "unread";
export type MessagePriority = "high" | "normal" | "low";
export type MessageFolder = "inbox" | "unread" | "sent" | "drafts" | "starred" | "archived" | "trash";

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
  };
  subject: string;
  preview: string;
  body: string;
  timestamp: string; // ISO format or relative string for mock
  status: MessageStatus;
  priority: MessagePriority;
  attachments?: MessageAttachment[];
  folder: MessageFolder;
  isStarred: boolean;
  relatedClient?: string;
  aiSummary?: string;
}

export interface ComposeDraft {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachments: File[];
}
