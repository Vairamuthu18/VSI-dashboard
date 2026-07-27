"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
 const router = useRouter();
 const [inviteCode, setInviteCode] = useState("");
 const [fullName, setFullName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (password.length < 8) {
 setError("Password must be at least 8 characters.");
 return;
 }

 setLoading(true);
 setError(null);

 // If running in dummy mode (local dev without Supabase backend)
 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
 const isDummy = supabaseUrl.includes("dummy") || supabaseUrl.includes("localhost:54321") || supabaseUrl === "";
 
 if (isDummy) {
 router.push("/onboarding");
 router.refresh();
 return;
 }

 try {
 const supabase = createClient();
 const normalizedCode = inviteCode.trim().toUpperCase();

 // 1. Validate invite code exists, unused, active
 const { data: invite, error: inviteErr } = await supabase
 .from("invites")
 .select("id, code, email, role, max_keywords, is_active, used_by")
 .eq("code", normalizedCode)
 .maybeSingle();

 if (inviteErr || !invite) {
 setError("Invalid invite code. Ask your admin for a valid one.");
 setLoading(false);
 return;
 }
 if (!invite.is_active || invite.used_by) {
 setError("This invite code has already been used or disabled.");
 setLoading(false);
 return;
 }
 if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
 setError("This invite is reserved for a different email address.");
 setLoading(false);
 return;
 }

 // 2. Create account — stash invite code in user_metadata for onboarding to consume
 const { error: signUpErr } = await supabase.auth.signUp({
 email,
 password,
 options: { data: { full_name: fullName, invite_code: normalizedCode } },
 });

 if (signUpErr) {
 setError(signUpErr.message);
 setLoading(false);
 return;
 }

 router.push("/onboarding");
 router.refresh();
 } catch (err: any) {
 setError(err.message || "An error occurred during registration.");
 setLoading(false);
 }
 }

 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
 <div className="w-full max-w-sm space-y-6">
 <div className="flex flex-col items-center gap-3">
 <Image src="/logo.png" alt="ValGrow" width={56} height={56} />
 <div className="text-center">
 <h1 className="text-lg font-bold tracking-widest text-amber-700 uppercase">VSI</h1>
 <p className="text-xs text-gray-500">Search Intelligence by ValGrow Labs</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4 rounded-[20px] border border-gray-200 bg-card p-6">
 <p className="text-sm font-medium text-gray-900">Create your pilot account</p>
 <p className="text-xs text-gray-500 -mt-2">Registration is invite-only during pilot.</p>

 {error && (
 <div className="rounded-lg bg-red-50 border border-red-300 px-3 py-2 text-sm text-red-700">
 {error}
 </div>
 )}

 <div>
 <label className="block text-xs text-gray-500 mb-1">Invite Code</label>
 <input
 type="text"
 value={inviteCode}
 onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
 required
 placeholder="VG-XXXX-XXXX"
 autoComplete="off"
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none font-mono tracking-wider"
 />
 </div>

 <div>
 <label className="block text-xs text-gray-500 mb-1">Full Name</label>
 <input
 type="text"
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 required
 autoComplete="name"
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs text-gray-500 mb-1">Email</label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 autoComplete="email"
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs text-gray-500 mb-1">Password</label>
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 autoComplete="new-password"
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {loading ? "Creating account..." : "Create account"}
 </button>
 </form>

 <p className="text-center text-sm text-gray-500">
 Already have an account?{" "}
 <Link href="/auth/login" className="text-amber-700 hover:text-amber-600">
 Sign in
 </Link>
 </p>
 </div>
 </div>
 );
}
