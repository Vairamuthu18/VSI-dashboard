"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function slugify(text: string): string {
 return text
 .toLowerCase()
 .replace(/[^a-z0-9\s-]/g, "")
 .trim()
 .replace(/\s+/g, "-")
 .slice(0, 50);
}

export default function OnboardingPage() {
 const router = useRouter();
 const [agencyName, setAgencyName] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [inviteInfo, setInviteInfo] = useState<{ role: string; max_keywords: number } | null>(null);

 // Resolve the invite code stashed in user_metadata at register time
 useEffect(() => {
 (async () => {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 router.push("/auth/login");
 return;
 }

 // If profile already has agency_id, skip
 const { data: profile } = await supabase
 .from("profiles").select("agency_id").eq("id", user.id).single();
 if (profile?.agency_id) {
 router.push("/dashboard");
 return;
 }

 const code = (user.user_metadata?.invite_code as string | undefined)?.toUpperCase();
 if (!code) {
 setError("No invite code on this account. Re-register with a valid invite.");
 return;
 }

 const { data: invite } = await supabase
 .from("invites")
 .select("role, max_keywords, is_active, used_by")
 .eq("code", code)
 .maybeSingle();

 if (!invite || !invite.is_active || invite.used_by) {
 setError("Your invite code is invalid or already used. Contact your admin.");
 return;
 }

 setInviteInfo({ role: invite.role, max_keywords: invite.max_keywords });
 })();
 }, [router]);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!agencyName.trim() || !inviteInfo) return;

 setLoading(true);
 setError(null);

 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 router.push("/auth/login");
 return;
 }

 const code = (user.user_metadata?.invite_code as string | undefined)?.toUpperCase();
 if (!code) {
 setError("Invite code missing — please re-register.");
 setLoading(false);
 return;
 }

 // SECURITY: atomically claim the invite BEFORE creating the agency.
 // The DB function locks the invite row + rejects if already consumed,
 // preventing two concurrent registrations from both succeeding on
 // the same code.
 const { data: claim, error: claimErr } = await supabase
 .rpc("claim_invite", { p_code: code, p_user: user.id });
 if (claimErr) {
 setError("Could not validate invite. Please contact support.");
 setLoading(false);
 return;
 }
 const claimRow = Array.isArray(claim) ? claim[0] : claim;
 if (!claimRow) {
 setError("This invite code has already been used. Each invite is single-use — request a new one from your admin.");
 setLoading(false);
 return;
 }

 const slug = slugify(agencyName);
 const isPilot = claimRow.role === "pilot";

 const { data: agency, error: agencyErr } = await supabase
 .from("agencies")
 .insert({
 name: agencyName.trim(),
 slug,
 max_keywords: claimRow.max_keywords,
 is_pilot: isPilot,
 })
 .select("id")
 .single();

 if (agencyErr) {
 setError("Could not create agency. Try a different name.");
 setLoading(false);
 return;
 }

 const { error: profileErr } = await supabase
 .from("profiles")
 .update({ agency_id: agency.id, role: claimRow.role })
 .eq("id", user.id);

 if (profileErr) {
 setError("Account setup failed. Please contact support.");
 setLoading(false);
 return;
 }

 router.push("/dashboard");
 router.refresh();
 }

 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
 <div className="w-full max-w-sm space-y-6">
 <div className="flex flex-col items-center gap-3">
 <Image src="/logo.png" alt="ValGrow" width={56} height={56} />
 <div className="text-center">
 <h1 className="text-lg font-bold tracking-widest text-amber-700 uppercase">VSI</h1>
 <p className="text-xs text-gray-500">One last step — name your agency</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4 rounded-[20px] border border-gray-200 bg-card p-6">
 <p className="text-sm font-medium text-gray-900">Set up your agency</p>

 {inviteInfo && (
 <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
 {inviteInfo.role === "super_admin"
 ? "Super admin access — unlimited keywords."
 : `Pilot access — up to ${inviteInfo.max_keywords} keywords.`}
 </div>
 )}

 {error && (
 <div className="rounded-lg bg-red-50 border border-red-300 px-3 py-2 text-sm text-red-700">
 {error}
 </div>
 )}

 <div>
 <label className="block text-xs text-gray-500 mb-1">Agency Name</label>
 <input
 type="text"
 value={agencyName}
 onChange={(e) => setAgencyName(e.target.value)}
 placeholder="e.g. ValGrow Digital"
 required
 autoFocus
 disabled={!inviteInfo}
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none disabled:opacity-50"
 />
 </div>

 <button
 type="submit"
 disabled={loading || !inviteInfo}
 className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {loading ? "Setting up..." : "Launch my dashboard →"}
 </button>
 </form>
 </div>
 </div>
 );
}
