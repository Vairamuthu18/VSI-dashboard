"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const redirectPath = searchParams.get("redirect") ?? "/dashboard";

 // Instant redirect for bypass
 useEffect(() => {
 router.push(redirectPath);
 }, [router, redirectPath]);

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 setError(null);

 // ALways bypass
 router.push(redirectPath);
 router.refresh();
 return;

 try {
 const supabase = createClient();
 const { error: signInError } = await supabase.auth.signInWithPassword({
 email,
 password,
 });
 if (signInError) {
 setError(signInError?.message || "Authentication failed");
 setLoading(false);
 return;
 }
 // Successful sign‑in – redirect to the intended page
 router.push(redirectPath);
 router.refresh();
 } catch (err: any) {
 setError(err.message || "An error occurred during sign in.");
 setLoading(false);
 }
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-4 rounded-[20px] border border-gray-200 bg-card p-6">
 <p className="text-sm font-medium text-gray-900">Sign in to your account</p>
 {error && (
 <div className="rounded-lg bg-red-50 border border-red-300 px-3 py-2 text-sm text-red-700">
 {error}
 </div>
 )}
 <div>
 <label className="block text-xs text-gray-500 mb-1">Email</label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
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
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
 />
 </div>
 <button
 type="submit"
 disabled={loading}
 className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {loading ? "Signing in…" : "Sign in"}
 </button>
 </form>
 );
}

export default function LoginPage() {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
 <div className="w-full max-w-sm space-y-6">
 <div className="flex flex-col items-center gap-3">
 <Image src="/logo.png" alt="ValGrow" width={56} height={56} />
 <h1 className="text-lg font-bold tracking-widest text-amber-700 uppercase">VSI</h1>
 <p className="text-xs text-gray-500">Search Intelligence by ValGrow Labs</p>
 </div>
 <Suspense fallback={<div className="rounded-[20px] border border-gray-200 bg-card p-6 text-center text-sm text-gray-500">Loading form...</div>}>
 <LoginForm />
 </Suspense>
 <p className="text-center text-sm text-gray-500">
 Don’t have an account?{' '}
 <Link href="/auth/register" className="text-amber-700 hover:text-amber-600">
 Register
 </Link>
 </p>
 </div>
 </div>
 );
}
