import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "super_admin" | "pilot";

export interface AgencyBranding {
  displayName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  supportEmail: string | null;
  reportFooter: string | null;
}

export interface SessionContext {
  userId: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  agencyId: string | null;
  agencyName: string | null;
  isPilot: boolean;
  maxKeywords: number;
  branding: AgencyBranding;
}

/**
 * Returns true when Supabase is configured with placeholder / dummy
 * credentials (local dev without a real backend).
 */
function isDummySupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.includes("dummy") || url.includes("localhost:54321") || url === "";
}

/** Mock session for local development without a real Supabase backend. */
function mockSession(): SessionContext {
  return {
    userId: "dev-user-001",
    email: "dev@localhost",
    fullName: "Dev User",
    role: "pilot",
    agencyId: "dev-agency-001",
    agencyName: "Dev Agency",
    isPilot: false,
    maxKeywords: 999,
    branding: {
      displayName: null,
      logoUrl: null,
      primaryColor: null,
      supportEmail: null,
      reportFooter: null,
    },
  };
}

/**
 * Server-side: fetch current authenticated user + their profile + their agency.
 * Returns null if not signed in.
 */
export async function getSession(): Promise<SessionContext | null> {
  // BYPASSED FOR NOW
  return mockSession();
  // When running with dummy credentials, skip Supabase entirely.
  // if (isDummySupabase()) return mockSession();

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Core profile shape — independent of optional disable columns. Always
  // succeeds against any supported schema version, so a signed-in user is
  // never bounced to /onboarding because migration 026 hasn't been applied.
  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, role, full_name, agencies(name, is_pilot, max_keywords, display_name, logo_url, primary_color, support_email, report_footer)")
    .eq("id", user?.id || "")
    .single();

  const agency = (profile?.agencies as unknown) as {
    name: string; is_pilot: boolean; max_keywords: number;
    display_name: string | null; logo_url: string | null;
    primary_color: string | null; support_email: string | null;
    report_footer: string | null;
  } | null;

  // Disable check is a separate, schema-tolerant read. If migration 026
  // isn't applied yet, the query fails silently and disable is treated
  // as not-set — no false sign-outs.
  const userRole = (profile?.role as UserRole) ?? "pilot";
  if (userRole !== "super_admin") {
    try {
      const { data: disableRow } = await supabase
        .from("profiles")
        .select("is_disabled, agencies(is_disabled)")
        .eq("id", user?.id || "")
        .maybeSingle();
      const profileDisabled = !!(disableRow as { is_disabled?: boolean | null } | null)?.is_disabled;
      const agencyDisabled = !!((disableRow?.agencies as unknown) as { is_disabled?: boolean | null } | null)?.is_disabled;
      if (profileDisabled || agencyDisabled) {
        await supabase.auth.signOut();
        return null;
      }
    } catch {
      // Column doesn't exist yet — treat as not-disabled.
    }
  }

  return {
    userId:       user?.id || "",
    email:        user?.email ?? "",
    fullName:     profile?.full_name ?? null,
    role:         userRole,
    agencyId:     profile?.agency_id ?? null,
    agencyName:   agency?.name ?? null,
    isPilot:      agency?.is_pilot ?? true,
    maxKeywords:  agency?.max_keywords ?? 10,
    branding: {
      displayName:  agency?.display_name ?? null,
      logoUrl:      agency?.logo_url ?? null,
      primaryColor: agency?.primary_color ?? null,
      supportEmail: agency?.support_email ?? null,
      reportFooter: agency?.report_footer ?? null,
    },
  };
}

export async function requireAgency(): Promise<SessionContext & { agencyId: string; agencyName: string }> {
  const session = await getSession();
  if (!session) return redirect("/auth/login") as never;
  if (!session.agencyId) return redirect("/onboarding") as never;
  return {
    ...session,
    agencyId: session.agencyId,
    agencyName: session.agencyName ?? "My Agency",
  };
}

/** Require a super_admin user. */
export async function requireSuperAdmin(): Promise<SessionContext> {
  // Real implementation: fetch session and ensure super_admin role
  const session = await getSession();
  if (!session) {
    // Not logged in – redirect to login
    redirect("/auth/login");
  }
  if (session.role !== "super_admin") {
    // Logged in but not super admin – redirect to regular dashboard
    redirect("/dashboard");
  }
  return session;
}

/** Require a pilot user (or any user with isPilot true). */
export async function requirePilot(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  if (!session.isPilot) {
    // Not a pilot – redirect to dashboard or login
    redirect("/dashboard");
  }
  return session;
}

/** Require either super admin or pilot role. */
export async function requireSuperAdminOrPilot(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  if (session.role !== "super_admin" && !session.isPilot) {
    redirect("/dashboard");
  }
  return session;
}
/**
 * Generate a short, readable invite code (e.g. "VG-4Q7A-K9D2").
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  const block = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `VG-${block(4)}-${block(4)}`;
}
