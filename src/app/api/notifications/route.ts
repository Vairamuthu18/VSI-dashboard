import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export interface ServerNotification {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  message: string;
  type: 'alert' | 'system' | 'report' | 'user';
  priority: 'high' | 'medium' | 'low' | 'info';
  severity: 'high' | 'medium' | 'low' | 'info';
  status: 'unread' | 'read' | 'cleared';
  isRead: boolean;
  slug?: string;
  fullDetails?: string;
  relatedClient?: string;
  aiEngine?: string;
  recommendedActions?: string[];
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent store for development/fallback when Supabase is unconfigured
let fallbackStore: Record<string, ServerNotification[]> = {};
let clearedUsers: Record<string, boolean> = {};

function getUserKey(userId?: string | null): string {
  return userId || "global_user";
}

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const userKey = getUserKey(userId);

    // Try Supabase first if available
    try {
      let query = supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (userId) {
        query = query.eq("user_id", userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        const mapped: ServerNotification[] = data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          description: item.description || item.message,
          message: item.message,
          type: item.type || 'system',
          priority: item.priority || 'info',
          severity: item.severity || item.priority || 'info',
          status: item.is_read ? 'read' : 'unread',
          isRead: item.is_read || false,
          slug: item.slug || '',
          fullDetails: item.full_details || '',
          relatedClient: item.related_client || '',
          aiEngine: item.ai_engine || '',
          recommendedActions: item.recommended_actions || [],
          createdAt: item.created_at,
          updatedAt: item.updated_at || item.created_at,
        }));
        return NextResponse.json({ success: true, notifications: mapped });
      }
    } catch {
      // Ignore Supabase error and use fallback
    }

    // Fallback store handling (starts with [] for new users or after clear)
    if (!fallbackStore[userKey] || clearedUsers[userKey]) {
      fallbackStore[userKey] = [];
    }

    return NextResponse.json({ 
      success: true, 
      notifications: fallbackStore[userKey] || [] 
    });
  } catch (e) {
    return NextResponse.json({ 
      success: false, 
      notifications: [],
      error: e instanceof Error ? e.message : "Failed to fetch notifications" 
    });
  }
}

// DELETE /api/notifications - Permanent Clear All from Database
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const userKey = getUserKey(userId);

    // Delete from Supabase DB
    try {
      let query = supabase.from("notifications").delete();
      if (userId) {
        query = query.eq("user_id", userId);
      } else {
        query = query.neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows
      }
      await query;
    } catch {
      // Ignore DB errors
    }

    // Clear fallback store
    fallbackStore[userKey] = [];
    clearedUsers[userKey] = true;

    return NextResponse.json({ success: true, message: "All notifications deleted permanently" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Failed to delete notifications" }, { status: 500 });
  }
}

// POST /api/notifications - Create a New Notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const userKey = getUserKey(userId);

    const now = new Date().toISOString();
    const newNotification: ServerNotification = {
      id: body.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || undefined,
      title: body.title || "New Notification",
      description: body.description || body.message || "",
      message: body.message || body.description || "",
      type: body.type || 'system',
      priority: body.priority || body.severity || 'info',
      severity: body.severity || body.priority || 'info',
      status: 'unread',
      isRead: false,
      slug: body.slug || `notification-${Date.now()}`,
      fullDetails: body.fullDetails || body.message || "",
      relatedClient: body.relatedClient || "",
      aiEngine: body.aiEngine || "",
      recommendedActions: body.recommendedActions || [],
      createdAt: now,
      updatedAt: now,
    };

    // Unmark cleared flag since user received a new notification
    clearedUsers[userKey] = false;

    // Try Supabase insert
    try {
      await supabase.from("notifications").insert({
        id: newNotification.id,
        user_id: userId || null,
        title: newNotification.title,
        description: newNotification.description,
        message: newNotification.message,
        type: newNotification.type,
        priority: newNotification.priority,
        severity: newNotification.severity,
        status: 'unread',
        is_read: false,
        slug: newNotification.slug,
        full_details: newNotification.fullDetails,
        related_client: newNotification.relatedClient,
        ai_engine: newNotification.aiEngine,
        recommended_actions: newNotification.recommendedActions,
      });
    } catch {
      // Ignore Supabase error
    }

    // Add to top of fallback store (newest first)
    if (!fallbackStore[userKey]) {
      fallbackStore[userKey] = [];
    }
    fallbackStore[userKey].unshift(newNotification);

    return NextResponse.json({ success: true, notification: newNotification }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Failed to create notification" }, { status: 500 });
  }
}

// PATCH /api/notifications - Update Notification Status / Mark Read
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const userKey = getUserKey(userId);

    if (body.action === "mark-all-read") {
      try {
        let query = supabase.from("notifications").update({ is_read: true, status: 'read' });
        if (userId) query = query.eq("user_id", userId);
        await query;
      } catch {}

      if (fallbackStore[userKey]) {
        fallbackStore[userKey] = fallbackStore[userKey].map(n => ({ ...n, isRead: true, status: 'read' }));
      }
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (body.id) {
      try {
        await supabase.from("notifications").update({ is_read: body.isRead ?? true, status: body.isRead ? 'read' : 'unread' }).eq("id", body.id);
      } catch {}

      if (fallbackStore[userKey]) {
        fallbackStore[userKey] = fallbackStore[userKey].map(n => n.id === body.id ? { ...n, isRead: body.isRead ?? true, status: body.isRead ? 'read' : 'unread' } : n);
      }
      return NextResponse.json({ success: true, message: "Notification updated" });
    }

    return NextResponse.json({ success: false, error: "Invalid patch request" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Failed to update" }, { status: 500 });
  }
}
