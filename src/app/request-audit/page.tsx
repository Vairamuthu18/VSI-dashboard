import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Request Free Audit — VSI",
 description: "Get your free AI search visibility report and see where your brand is invisible.",
};

export default function RequestAuditPage() {
 return (
 <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-cyan-500/30">
 {/* ── Aurora Mesh Gradient Background ── */}
 <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen" />
 <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen" />
 <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen" />
 <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
 </div>

 {/* ── Navigation ── */}
 <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
 <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
 <Link href="/" className="flex items-center gap-3 group">
 <div className="relative h-9 w-9 rounded-[20px] bg-card/5 border border-white/10 p-1.5 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
 <Image src="/logo.png" alt="VSI" width={24} height={24} className="object-contain" unoptimized />
 </div>
 <div className="leading-tight">
 <p className="font-heading font-black text-white tracking-widest text-sm">VSI</p>
 </div>
 </Link>
 <Link href="/auth/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
 Log in
 </Link>
 </div>
 </header>

 {/* ── Main Content Split ── */}
 <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-4rem)]">
 
 {/* Left Column: Copy & Proof */}
 <div className="max-w-xl">
 <div className="inline-flex items-center gap-2 rounded-full bg-card/5 border border-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-6 backdrop-blur-md">
 <Sparkles size={14} /> Free AI Visibility Audit
 </div>
 
 <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight leading-[1.05] mb-6">
 Get found where customers <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">actually decide.</span>
 </h1>
 
 <p className="text-lg text-gray-400 leading-relaxed mb-8">
 AI search engines are answering the queries that used to be clicks. We&rsquo;ll scan the major AI platforms and show you exactly where your brand is invisible, and why competitors are winning.
 </p>

 <div className="space-y-4 mb-10">
 {[
 "See your visibility score on ChatGPT, Gemini, and Perplexity.",
 "Identify which competitors AI recommends instead of you.",
 "Get actionable steps to win the AI answer box."
 ].map((item, i) => (
 <div key={i} className="flex items-start gap-3">
 <CheckCircle2 size={20} className="text-cyan-500 shrink-0 mt-0.5" />
 <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
 </div>
 ))}
 </div>

 <div className="pt-8 border-t border-white/10">
 <div className="flex items-center gap-1 text-amber-400 mb-2">
 {[1, 2, 3, 4, 5].map((star) => (
 <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
 ))}
 </div>
 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trusted by over 500+ growing brands</p>
 </div>
 </div>

 {/* Right Column: Form Card */}
 <div className="relative">
 {/* Decorative glow behind card */}
 <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-[2rem] blur-xl opacity-50" />
 
 <div className="relative rounded-[2rem] bg-card/[0.02] border border-white/10 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
 <h2 className="text-2xl font-heading font-bold text-white mb-2">Run your free audit</h2>
 <p className="text-sm text-gray-400 mb-8">Enter your details and we&rsquo;ll generate your comprehensive AI Search Visibility Report within 24 hours.</p>
 
 <form className="space-y-5">
 <div className="grid sm:grid-cols-2 gap-5">
 <div className="space-y-1.5">
 <label htmlFor="firstName" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">First Name</label>
 <input type="text" id="firstName" required className="w-full bg-card/5 border border-white/10 rounded-[20px] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="Jane" />
 </div>
 <div className="space-y-1.5">
 <label htmlFor="lastName" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Last Name</label>
 <input type="text" id="lastName" required className="w-full bg-card/5 border border-white/10 rounded-[20px] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="Doe" />
 </div>
 </div>
 
 <div className="space-y-1.5">
 <label htmlFor="email" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Work Email</label>
 <input type="email" id="email" required className="w-full bg-card/5 border border-white/10 rounded-[20px] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="jane@company.com" />
 </div>

 <div className="space-y-1.5">
 <label htmlFor="brand" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Brand / Company Name</label>
 <input type="text" id="brand" required className="w-full bg-card/5 border border-white/10 rounded-[20px] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="Acme Corp" />
 </div>

 <div className="space-y-1.5">
 <label htmlFor="keywords" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Main target keyword (Optional)</label>
 <input type="text" id="keywords" className="w-full bg-card/5 border border-white/10 rounded-[20px] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all" placeholder="e.g. 'best CRM software'" />
 </div>

 <button type="submit" className="w-full mt-4 bg-card text-black font-bold rounded-[20px] px-4 py-3.5 text-sm hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
 Generate My Free Report <ArrowRight size={16} />
 </button>
 
 <p className="text-center text-[10px] text-gray-500 pt-2">
 By submitting this form, you agree to our privacy policy.
 </p>
 </form>
 </div>
 </div>

 </main>
 </div>
 );
}
