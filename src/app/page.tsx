"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
 ArrowRight, Menu, X, ChevronDown, Search, Target,
 Activity, CheckCircle2, Sparkles, Layers, Globe,
 Shield, Zap, MapPin, Clock, History, Bot, FileText,
 BarChart3, Eye, MessageSquare, ListChecks, BadgeCheck
} from "lucide-react";
import Hls from "hls.js";

/* ────────────────────────────────────────────────────────────────── */
/* HLS Background Video */
/* ────────────────────────────────────────────────────────────────── */
function BackgroundVideo() {
 const videoRef = useRef<HTMLVideoElement>(null);

 useEffect(() => {
 const video = videoRef.current;
 if (!video) return;

 const src =
 "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

 if (Hls.isSupported()) {
 const hls = new Hls({ enableWorker: false });
 hls.loadSource(src);
 hls.attachMedia(video);
 hls.on(Hls.Events.MANIFEST_PARSED, () => {
 video.play().catch(() => {});
 });
 return () => hls.destroy();
 } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
 video.src = src;
 video.addEventListener("loadedmetadata", () => {
 video.play().catch(() => {});
 });
 }
 }, []);

 return (
 <video
 ref={videoRef}
 className="absolute inset-0 w-full h-full object-cover"
 style={{ opacity: 0.6 }}
 muted
 loop
 playsInline
 autoPlay
 />
 );
}

/* ────────────────────────────────────────────────────────────────── */
/* SVG Central Glow */
/* ────────────────────────────────────────────────────────────────── */
function CentralGlow() {
 return (
 <svg
 className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 pointer-events-none"
 width="1200"
 height="500"
 viewBox="0 0 1200 500"
 fill="none"
 >
 <defs>
 <filter id="glow-blur">
 <feGaussianBlur stdDeviation="25" />
 </filter>
 <radialGradient id="glow-gradient" cx="50%" cy="50%" r="50%">
 <stop offset="0%" stopColor="#5ed29c" stopOpacity="0.4" />
 <stop offset="50%" stopColor="#1a6b4a" stopOpacity="0.2" />
 <stop offset="100%" stopColor="#070b0a" stopOpacity="0" />
 </radialGradient>
 </defs>
 <ellipse
 cx="600"
 cy="250"
 rx="500"
 ry="180"
 fill="url(#glow-gradient)"
 filter="url(#glow-blur)"
 opacity="0.45"
 />
 </svg>
 );
}

/* ────────────────────────────────────────────────────────────────── */
/* Grid Lines (Desktop) */
/* ────────────────────────────────────────────────────────────────── */
function GridLines() {
 return (
 <div className="absolute inset-0 pointer-events-none hidden lg:block">
 {[25, 50, 75].map((pct) => (
 <div
 key={pct}
 className="absolute top-0 bottom-0 w-px"
 style={{ left: `${pct}%`, background: "rgba(255,255,255,0.10)" }}
 />
 ))}
 </div>
 );
}

/* ────────────────────────────────────────────────────────────────── */
/* Liquid Glass Card */
/* ────────────────────────────────────────────────────────────────── */
function LiquidGlassCard() {
 return (
 <div
 className="liquid-glass-card w-[200px] h-[200px] rounded-[20px] p-5 flex flex-col justify-between"
 style={{ transform: "translateY(-50px)" }}
 >
 <span className="font-sans text-white/50 tracking-widest" style={{ fontSize: "14px" }}>
 [ 2025 ]
 </span>
 <div>
 <h3 className="text-white leading-snug" style={{ fontSize: "18px" }}>
 Powered by{" "}
 <span className="font-serif-instrument italic text-white/90">Intelligent</span>{" "}
 Analysis
 </h3>
 </div>
 <p className="text-white/40 leading-relaxed" style={{ fontSize: "11px" }}>
 Live AI answer tracking built for modern search strategists.
 </p>
 </div>
 );
}

/* ────────────────────────────────────────────────────────────────── */
/* Mobile Navigation Overlay */
/* ────────────────────────────────────────────────────────────────── */
function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
 if (!isOpen) return null;

 const links = [
 { label: "THE PROBLEM", href: "#the-problem" },
 { label: "WHAT CHANGES", href: "#what-changes" },
 { label: "FAQ", href: "#faq" },
 ];

 return (
 <div className="fixed inset-0 z-[100] bg-[#070b0a]/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8">
 <button
 onClick={onClose}
 className="absolute top-8 right-6 text-white/70 hover:text-white transition-colors"
 aria-label="Close menu"
 >
 <X className="w-7 h-7" />
 </button>

 {links.map((item) => (
 <Link
 key={item.label}
 href={item.href}
 onClick={onClose}
 className="text-2xl font-sans font-semibold text-white/80 hover:text-accent tracking-wide transition-colors"
 >
 {item.label}
 </Link>
 ))}

 <Link
 href="/dashboard"
 onClick={onClose}
 className="mt-4 bg-accent text-dark font-bold uppercase text-sm rounded-full px-8 py-3 flex items-center gap-2 transition-transform hover:scale-105"
 >
 Dashboard <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 );
}

/* ────────────────────────────────────────────────────────────────── */
/* Section Divider Glow */
/* ────────────────────────────────────────────────────────────────── */
function SectionGlow() {
 return (
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
 );
}

/* ────────────────────────────────────────────────────────────────── */
/* LANDING PAGE */
/* ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
 const [mobileNavOpen, setMobileNavOpen] = useState(false);
 const [activeFaq, setActiveFaq] = useState<number | null>(null);

 const navLinks = [
 { label: "The problem", href: "#the-problem" },
 { label: "What changes", href: "#what-changes" },
 { label: "FAQ", href: "#faq" },
 ];

 const faqs = [
 {
 q: "Will my team have to change how they work?",
 a: "No. The workflow is the same one your strategists already run mentally — audit, plan, ship, verify — just consolidated into one screen. New users complete their first real client audit on day one. We onboard the whole team in a single 45-minute session, recorded, with templated playbooks for the five most common gap types."
 },
 {
 q: "How is this different from the SEO tools I already pay for?",
 a: "The big suites track positions on the classic results page. They don't read the AI answer itself, don't extract the cited sources, and don't tell you which entity or schema gap caused the omission. VSI is built for the surface that's eating your clicks, not the one your reports still measure."
 },
 {
 q: "Is the pilot really free?",
 a: "Yes. Bring one keyword into VSI and see what the AI is actually saying about you. No card, no strings. Decide if the rest of your portfolio belongs here after you've seen the data."
 },
 {
 q: "What happens to my data?",
 a: "Your data stays yours. We don't share it, sell it, or use it to train models. Every snapshot is stored securely and only visible to your workspace members."
 },
 {
 q: "Can my clients see the same insights?",
 a: "Yes — branded reports your clients actually open. Proof of outcomes the same day the pipeline runs. One workspace, one story."
 },
 {
 q: "Does it work for non-English / non-Google markets?",
 a: "Yes — that's why we were built in the GCC. We track AI answers in Arabic and English in parallel, handle right-to-left content audits, and flag entity mismatches between language variants of the same brand. Most Western-built tools treat these markets as an afterthought. We treat them as the home market."
 }
 ];

 return (
 <div className="min-h-screen bg-dark text-white font-sans antialiased selection:bg-accent/30 selection:text-white">
 <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* NAVIGATION */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <header className="absolute top-0 inset-x-0 z-50">
 <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
 <Link href="/" className="flex items-center gap-3 group">
 <div className="w-10 h-10 rounded-[20px] bg-card/10 backdrop-blur-sm border border-white/10 flex items-center justify-center relative overflow-hidden transition-all group-hover:bg-card/15">
 <Image src="/vg-logo.png" alt="VSI Logo" fill className="object-contain p-1.5 brightness-0 invert" />
 </div>
 <div className="flex flex-col">
 <span className="font-extrabold text-[17px] text-white tracking-tight leading-none">VSI</span>
 <span className="text-[8px] font-medium text-white/40 tracking-[0.2em] uppercase leading-none mt-0.5">Search Intelligence</span>
 </div>
 </Link>

 <nav className="hidden md:flex items-center gap-8">
 {navLinks.map((item) => (
 <a key={item.label} href={item.href} className="text-[15px] font-sans font-medium text-white/60 hover:text-accent transition-colors">
 {item.label}
 </a>
 ))}
 <Link href="/dashboard" className="bg-accent text-dark font-bold uppercase text-[13px] rounded-full px-6 py-2.5 flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02]">
 Dashboard <ArrowRight className="w-4 h-4" />
 </Link>
 </nav>

 <button onClick={() => setMobileNavOpen(true)} className="md:hidden text-white/70 hover:text-white transition-colors" aria-label="Open menu">
 <Menu className="w-6 h-6" />
 </button>
 </div>
 </header>

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* HERO SECTION */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <section className="relative min-h-screen flex items-center overflow-hidden">
 <BackgroundVideo />
 <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, #070b0a 0%, #070b0acc 30%, transparent 70%)" }} />
 <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, #070b0a 0%, #070b0acc 15%, transparent 50%)" }} />
 <GridLines />
 <CentralGlow />

 <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32 pb-20 md:pt-40 md:pb-28">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

 {/* ── Left: Hero Content ── */}
 <div className="flex flex-col items-start">
 {/* LiquidGlassCard removed */}

 <h1 className="font-sans font-extrabold tracking-tighter leading-[1.05] mb-6" style={{ fontSize: "clamp(40px, 5.5vw, 64px)" }}>
 See yourself the<br />
 way <span className="text-accent">AI</span> <span className="text-[#5ed29c]">sees you.</span>
 </h1>

 <p className="font-sans text-white/70 leading-relaxed max-w-[512px] mb-10" style={{ fontSize: "16px" }}>
 AI is now answering the queries that used to be clicks. If your brand isn&apos;t in the answer, traffic disappears — quietly. VSI shows you where you&apos;re invisible, why competitors win, and exactly what to ship next.
 </p>

 <div className="flex gap-4 mb-2">
 <Link href="/auth/login?redirect=%2Fdashboard" className="group bg-accent text-dark font-bold uppercase text-[14px] rounded-full px-8 py-4 flex items-center gap-2.5 transition-all hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.03] active:scale-[0.98]">
 Open your dashboard
 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
 </Link>
 <Link href="/dashboard" className="group bg-orange-600 text-dark font-bold uppercase text-[14px] rounded-full px-8 py-4 flex items-center gap-2.5 transition-all hover:shadow-xl hover:shadow-orange-600/30 hover:scale-[1.03] active:scale-[0.98]">
 Get your free visibility audit
 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
 </Link>
 </div>

 <div className="flex flex-wrap items-center gap-6 mt-10 text-[12px] text-white/40 font-medium">
 <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-accent/60" /> No card required</div>
 <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-accent/60" /> Free pilot on launch</div>
 <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-accent/60" /> Built in the GCC, works worldwide</div>
 </div>
 </div>

 {/* ── Right: Mockup Card ── */}
 <div className="relative hidden lg:block -mt-12">
 <div className="liquid-glass-card rounded-[28px] p-7 md:p-8">
 {/* Window chrome */}
 <div className="flex items-center gap-2 mb-6">
 <div className="flex gap-1.5">
 <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
 <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
 <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
 </div>
 <div className="flex-1 text-center font-mono text-[11px] text-white/30">
 your-brand <span className="mx-1.5 text-white/15">·</span> the AI answer for your money keyword
 </div>
 </div>

 {/* What AI is saying */}
 <div className="mb-5">
 <h3 className="text-[11px] font-bold text-red-400/80 tracking-widest uppercase mb-3">
 What AI is saying right now
 </h3>
 <div className="bg-card/[0.03] border border-white/[0.06] rounded-[20px] p-5">
 <p className="text-[14px] leading-relaxed text-white/60">
 &quot;The top agencies in this category are{" "}
 <span className="bg-accent/10 text-accent/90 px-1.5 rounded">Competitor A</span>,{" "}
 <span className="bg-accent/10 text-accent/90 px-1.5 rounded">Competitor B</span>, and{" "}
 <span className="bg-accent/10 text-accent/90 px-1.5 rounded">Competitor C</span>
 — each known for…&quot;
 </p>
 </div>
 </div>

 {/* Data Pills */}
 <div className="grid grid-cols-3 gap-3 mb-5">
 <div className="bg-card/[0.03] border border-white/[0.06] rounded-[20px] p-4 flex flex-col items-center text-center">
 <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">Your rank</span>
 <span className="text-[26px] font-extrabold text-blue-400">#5</span>
 </div>
 <div className="bg-card/[0.03] border border-white/[0.06] rounded-[20px] p-4 flex flex-col items-center text-center">
 <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">AI cited</span>
 <span className="text-[26px] font-extrabold text-red-400">No</span>
 </div>
 <div className="bg-card/[0.03] border border-white/[0.06] rounded-[20px] p-4 flex flex-col items-center text-center">
 <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">Lost clicks</span>
 <span className="text-[26px] font-extrabold text-red-400">~70%</span>
 </div>
 </div>

 <p className="text-[12px] text-white/35 font-medium text-center px-2">
 You rank well. The AI still answers without you. That gap is what VSI closes.
 </p>
 </div>
 </div>

 </div>
 </div>

 <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
 </section>

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* THE PROBLEM */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <section id="the-problem" className="relative bg-dark py-28 overflow-hidden">
 <SectionGlow />
 <div className="max-w-6xl mx-auto px-6 relative z-10">
 <div className="max-w-3xl mx-auto text-center mb-16 space-y-5">
 <p className="font-jakarta font-bold text-accent tracking-[0.15em] uppercase" style={{ fontSize: "11px" }}>
 The new reality
 </p>
 <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
 Most clicks have already moved.<br />
 <span className="text-white/60">Your rank tracker doesn&apos;t know.</span>
 </h2>
 <p className="text-white/45 text-[15px] max-w-2xl mx-auto leading-relaxed">
 AI search is now built into Google&apos;s answer surface, Chrome, and ChatGPT. When a buyer asks &quot;best X for Y&quot;, an AI usually answers — and the user often never scrolls to your link. Your rank report says everything is fine. Your inbox says traffic is down. They&apos;re both right.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {[
 {
 icon: <Eye className="w-5 h-5" />,
 title: "You can't see what AI sees",
 desc: "Your tools report rank #4. Inside the AI answer, you don't exist. Two different stories, both invisible to the dashboards your team checks every Monday.",
 },
 {
 icon: <Search className="w-5 h-5" />,
 title: "You don't know why you're missing",
 desc: "The AI cites someone else. Why? You can't tell from rankings alone — and weekly client decks don't answer it either.",
 },
 {
 icon: <ListChecks className="w-5 h-5" />,
 title: "Insights don't become work",
 desc: "Recommendations sit in slides. Writers and developers wait for clarification. By the time the work ships, the snapshot is stale.",
 },
 {
 icon: <BadgeCheck className="w-5 h-5" />,
 title: "Outcomes never get measured",
 desc: "You shipped the listicle. Did it earn the citation it was supposed to? Most teams have no idea. The proof is the missing part.",
 },
 ].map((item, i) => (
 <div key={i} className="liquid-glass-card rounded-[20px] p-7 group hover:bg-card/[0.03] transition-all duration-300">
 <div className="w-10 h-10 rounded-[20px] bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
 {item.icon}
 </div>
 <h3 className="text-white font-bold text-[17px] mb-2 tracking-tight">{item.title}</h3>
 <p className="text-white/40 text-[13px] leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* WHAT CHANGES WITH VSI */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <section id="what-changes" className="relative py-28 overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-b from-dark via-[#060d09] to-dark" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-accent/[0.04] rounded-full blur-[150px] pointer-events-none" />

 <div className="max-w-6xl mx-auto px-6 relative z-10">
 <div className="max-w-3xl mx-auto text-center mb-16 space-y-5">
 <p className="font-jakarta font-bold text-accent tracking-[0.15em] uppercase" style={{ fontSize: "11px" }}>
 What changes with VSI
 </p>
 <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
 From chasing rankings<br />
 <span className="text-accent">to winning the answer.</span>
 </h2>
 <p className="text-white/45 text-[15px] max-w-2xl mx-auto leading-relaxed">
 VSI doesn&apos;t add another dashboard to your stack. It replaces the bottom half of your workflow — diagnose to ship — with one that ends in measurable outcomes.
 </p>
 </div>

 <div className="space-y-6">
 {[
 {
 num: "1",
 title: "You see exactly where you're losing",
 without: "Generic visibility scores. Vanity AI mention counts. No idea which queries actually matter for the business.",
 withVsi: "A keyword-by-keyword view of who the AI is citing, which competitors win, and where the gap is — for every brand you track.",
 },
 {
 num: "2",
 title: "You know exactly why competitors win",
 without: "You guess: maybe their content is longer, maybe their domain is older, maybe their backlinks are better. You ship something and hope.",
 withVsi: "A specific read of the pages the AI is pulling from — what they share, what your page is missing, what to add to be considered. Local intent? You see the Google Business signals winning too.",
 },
 {
 num: "3",
 title: "Your team ships work that maps to the insight",
 without: "The strategist hands a deck to the writer. The writer asks questions. Two weeks later something ships — usually not what was intended.",
 withVsi: "One workflow turns the insight into ready-to-assign tickets with owners, effort, acceptance criteria. The writer picks up the ticket; the strategist doesn't have to translate.",
 },
 {
 num: "4",
 title: "You can prove the work moved the needle",
 without: "You shipped a piece. Did it earn the citation? You guess again — until the client asks and you don't have a clean answer.",
 withVsi: "When the next snapshot shows the brand was cited or rank improved after a task closed, the work is auto-marked as outcome-verified. Proof attached to the ticket itself.",
 },
 ].map((item, i) => (
 <div key={i} className="liquid-glass-card rounded-[20px] p-7 md:p-8">
 <div className="flex items-start gap-5 mb-6">
 <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-extrabold text-[16px] shrink-0">
 {item.num}
 </div>
 <h3 className="text-white font-bold text-[19px] tracking-tight pt-1.5">{item.title}</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-0 md:pl-[60px]">
 <div className="bg-card/[0.02] border border-white/[0.05] rounded-[20px] p-5">
 <p className="text-[11px] font-bold text-red-400/70 tracking-widest uppercase mb-2">Without VSI</p>
 <p className="text-white/40 text-[13px] leading-relaxed">{item.without}</p>
 </div>
 <div className="bg-accent/[0.04] border border-accent/10 rounded-[20px] p-5">
 <p className="text-[11px] font-bold text-accent/80 tracking-widest uppercase mb-2">With VSI</p>
 <p className="text-white/55 text-[13px] leading-relaxed">{item.withVsi}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* WHAT'S INSIDE */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <section className="relative bg-dark py-28 overflow-hidden">
 <SectionGlow />
 <div className="max-w-6xl mx-auto px-6 relative z-10">
 <div className="max-w-3xl mx-auto text-center mb-16 space-y-5">
 <p className="font-jakarta font-bold text-accent tracking-[0.15em] uppercase" style={{ fontSize: "11px" }}>
 What&apos;s inside
 </p>
 <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
 The building blocks that make it work
 </h2>
 <p className="text-white/45 text-[15px] max-w-2xl mx-auto leading-relaxed">
 Each block is designed to remove one specific moment of friction from your week.
 </p>
 </div>

 {/* Pillar 1: Search visibility tracking */}
 <div className="mb-12">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
 <Layers className="w-4 h-4" />
 </div>
 <h3 className="text-white font-bold text-[16px] tracking-tight">Search visibility tracking</h3>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { icon: <BarChart3 className="w-4 h-4" />, title: "SERP rankings", desc: "Per-keyword position monitoring across the search results that matter." },
 { icon: <Eye className="w-4 h-4" />, title: "AI Mode citations", desc: "See exactly what the AI is saying about your category — and which competitors are inside the answer." },
 { icon: <Sparkles className="w-4 h-4" />, title: "AI Overview", desc: "Optional second AI surface for clients who want it tracked." },
 { icon: <Bot className="w-4 h-4" />, title: "LLM mentions", desc: "Know whether AI assistants cite your brand for buying-intent queries — and which alternatives they suggest instead." },
 { icon: <Target className="w-4 h-4" />, title: "Gap classification", desc: "Every snapshot triaged for you so you know where to focus, not just where you rank." },
 { icon: <MapPin className="w-4 h-4" />, title: "Multi-location", desc: "Track the same brand across markets without losing accuracy on local queries." },
 { icon: <Clock className="w-4 h-4" />, title: "Scheduled auto-runs", desc: "Per-client cadence that runs in the background — no manual button-mashing every Monday." },
 { icon: <History className="w-4 h-4" />, title: "Snapshot history", desc: "See exactly how a brand has moved over time — no hand-stitching reports." },
 ].map((item, i) => (
 <div key={i} className="liquid-glass-card rounded-[20px] p-5 group hover:bg-card/[0.03] transition-all duration-300">
 <div className="text-accent/60 mb-3 group-hover:text-accent transition-colors">{item.icon}</div>
 <h4 className="text-white/90 font-semibold text-[13px] mb-1.5 tracking-tight">{item.title}</h4>
 <p className="text-white/35 text-[12px] leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Pillar 2: From insight to execution */}
 <div>
 <div className="flex items-center gap-3 mb-6">
 <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
 <Activity className="w-4 h-4" />
 </div>
 <h3 className="text-white font-bold text-[16px] tracking-tight">From insight to execution</h3>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {[
 { icon: <FileText className="w-4 h-4" />, title: "AI diagnosis brief", desc: "A grounded read of what's happening for this brand — not generic SEO advice." },
 { icon: <Search className="w-4 h-4" />, title: "Competitor page analysis", desc: "We read the pages the AI is actually citing and compare them to yours — so you know what to change." },
 { icon: <MapPin className="w-4 h-4" />, title: "Local-intent playbook", desc: "Local queries get a local playbook — different from a content-only play." },
 { icon: <ListChecks className="w-4 h-4" />, title: "Built-in task tracker", desc: "Tickets land where your team can pick them up and finish them." },
 { icon: <CheckCircle2 className="w-4 h-4" />, title: "Outcome verification", desc: "When the work moves the needle, we attach the proof to the ticket automatically." },
 { icon: <MessageSquare className="w-4 h-4" />, title: "Live-data assistant", desc: "Ask anything about your portfolio. Answers grounded in your real data." },
 ].map((item, i) => (
 <div key={i} className="liquid-glass-card rounded-[20px] p-5 group hover:bg-card/[0.03] transition-all duration-300">
 <div className="text-accent/60 mb-3 group-hover:text-accent transition-colors">{item.icon}</div>
 <h4 className="text-white/90 font-semibold text-[13px] mb-1.5 tracking-tight">{item.title}</h4>
 <p className="text-white/35 text-[12px] leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* BUILT BY PEOPLE WHO'VE BEEN IN THE ROOM */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <section className="relative py-28 overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-b from-dark via-[#060d09] to-dark" />
 <div className="max-w-6xl mx-auto px-6 relative z-10">
 <div className="max-w-3xl mx-auto text-center mb-16 space-y-5">
 <p className="font-jakarta font-bold text-accent tracking-[0.15em] uppercase" style={{ fontSize: "11px" }}>
 We&apos;ve been the SEO in the room
 </p>
 <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
 Built by people who&apos;ve sat through<br />
 <span className="text-white/60">the &quot;why is traffic down&quot; meeting.</span>
 </h2>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[
 {
 role: "For the strategist",
 desc: "Skip the manual research. Read the diagnosis in 60 seconds. Hand the team something they can actually execute.",
 icon: <Target className="w-5 h-5" />,
 },
 {
 role: "For the executor",
 desc: "Pick up a ticket with acceptance criteria. Ship it. Move to the next. No more translating slides into ClickUp.",
 icon: <Activity className="w-5 h-5" />,
 },
 {
 role: "For the agency owner",
 desc: "Branded reports your clients actually open. Proof of outcomes the same day the pipeline runs. One workspace, one story.",
 icon: <Sparkles className="w-5 h-5" />,
 },
 ].map((item, i) => (
 <div key={i} className="liquid-glass-card rounded-[20px] p-7 group hover:bg-card/[0.03] transition-all duration-300 flex flex-col">
 <div className="w-10 h-10 rounded-[20px] bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors">
 {item.icon}
 </div>
 <h3 className="text-accent font-bold text-[13px] tracking-widest uppercase mb-3">{item.role}</h3>
 <p className="text-white/50 text-[14px] leading-relaxed flex-1">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* FAQ */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <section id="faq" className="relative bg-dark py-28 overflow-hidden">
 <SectionGlow />
 <div className="max-w-3xl mx-auto px-6 relative z-10">
 <div className="text-center mb-14 space-y-4">
 <p className="font-jakarta font-bold text-accent tracking-[0.15em] uppercase" style={{ fontSize: "11px" }}>
 If you&apos;re wondering
 </p>
 <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">FAQ</h2>
 </div>

 <div className="border-t border-white/[0.06] divide-y divide-white/[0.06]">
 {faqs.map((faq, i) => (
 <div key={i} className="py-5">
 <button
 onClick={() => setActiveFaq(activeFaq === i ? null : i)}
 className="w-full flex items-center justify-between text-left font-semibold text-[15px] text-white/80 hover:text-accent transition-colors gap-4"
 >
 <span>{faq.q}</span>
 <ChevronDown className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-200 ${activeFaq === i ? "rotate-180 text-accent" : ""}`} />
 </button>
 <div
 className="overflow-hidden transition-all duration-300"
 style={{
 maxHeight: activeFaq === i ? "300px" : "0px",
 opacity: activeFaq === i ? 1 : 0,
 }}
 >
 <p className="mt-3 text-[14px] text-white/40 leading-relaxed pl-1">
 {faq.a}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* FINAL CTA */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <section className="relative py-32 overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-b from-dark via-[#0a1510] to-dark" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/[0.08] rounded-full blur-[150px] pointer-events-none" />

 <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
 <div className="w-14 h-14 rounded-[20px] bg-card/5 border border-white/10 flex items-center justify-center mb-8 relative overflow-hidden">
 <Image src="/vg-logo.png" alt="VSI Logo" fill className="object-contain p-2 brightness-0 invert" />
 </div>

 <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6 text-white">
 Stop reporting on rankings<span className="text-accent">.</span><br />
 Start winning the answer<span className="text-accent">.</span>
 </h2>

 <p className="text-white/50 text-[16px] md:text-[18px] leading-relaxed max-w-2xl mx-auto mb-4">
 Bring one keyword into VSI. See what the AI is actually saying about you. Decide if the rest of your portfolio belongs here too.
 </p>
 <p className="text-white/35 text-[14px] mb-10">Free pilot, no card.</p>

 <Link href="/dashboard" className="group bg-accent text-dark font-bold uppercase text-[14px] rounded-full px-10 py-4 flex items-center gap-2.5 transition-all hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.03] active:scale-[0.98]">
 Open your dashboard
 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
 </Link>
 </div>
 </section>

 {/* ═══════════════════════════════════════════════════════════ */}
 {/* FOOTER */}
 {/* ═══════════════════════════════════════════════════════════ */}
 <footer className="bg-[#030705] border-t border-white/5 py-16 text-[14px]">
 <div className="max-w-6xl mx-auto px-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-12 mb-8">
 <div className="md:col-span-2 space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-card/5 flex items-center justify-center relative overflow-hidden">
 <Image src="/vg-logo.png" alt="VSI Logo" fill className="object-contain p-0.5 brightness-0 invert" />
 </div>
 <div>
 <div className="font-bold text-white tracking-tight leading-none mb-1">VSI</div>
 <div className="text-[10px] text-white/30 font-semibold tracking-widest uppercase leading-none">Search Intelligence</div>
 </div>
 </div>
 <p className="text-white/30 text-[14px] max-w-sm pt-2">
 The visibility command centre for AI-era search.
 </p>
 </div>

 <div className="space-y-4">
 <h4 className="text-white/60 font-bold text-[12px] tracking-widest uppercase">Learn</h4>
 <div className="flex flex-col gap-3 text-white/35">
 <a href="#the-problem" className="hover:text-accent transition-colors">The problem</a>
 <a href="#what-changes" className="hover:text-accent transition-colors">What changes</a>
 <a href="#faq" className="hover:text-accent transition-colors">FAQ</a>
 </div>
 </div>

 <div className="space-y-4">
 <h4 className="text-white/60 font-bold text-[12px] tracking-widest uppercase">Get started</h4>
 <div className="flex flex-col gap-3 text-white/35">
 <Link href="/dashboard" className="hover:text-accent transition-colors">Open dashboard</Link>
 <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
 <a href="mailto:contact@valgrow.com" className="hover:text-accent transition-colors">Contact</a>
 </div>
 </div>
 </div>

 <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-white/25">
 <p>© 2026 ValGrow Labs. All rights reserved.</p>
 <p>For teams who&apos;d rather ship than report.</p>
 </div>
 </div>
 </footer>
 </div>
 );
}
