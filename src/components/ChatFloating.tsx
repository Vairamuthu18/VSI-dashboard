"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";

type Role = "user" | "assistant";
interface Msg { role: Role; content: string }
type Scope =
 | { kind: "keyword"; clientId: string; keywordId: string }
 | { kind: "client"; clientId: string }
 | { kind: "global" };

function scopeFromPath(pathname: string): { scope: Scope; label: string } {
 // /dashboard/clients/:id/keywords/:kid
 const kwMatch = pathname.match(/^\/dashboard\/clients\/([^/]+)\/keywords\/([^/]+)/);
 if (kwMatch) return { scope: { kind: "keyword", clientId: kwMatch[1], keywordId: kwMatch[2] }, label: "this keyword" };
 // /dashboard/clients/:id (but not /keywords/ already matched above)
 const clientMatch = pathname.match(/^\/dashboard\/clients\/([^/]+)/);
 if (clientMatch) return { scope: { kind: "client", clientId: clientMatch[1] }, label: "this client" };
 return { scope: { kind: "global" }, label: "all clients" };
}

const SESSION_KEY = "vsi.chat.session";

function loadSession(): Msg[] {
 if (typeof window === "undefined") return [];
 try {
 const raw = sessionStorage.getItem(SESSION_KEY);
 if (!raw) return [];
 const parsed = JSON.parse(raw);
 if (Array.isArray(parsed)) return parsed;
 } catch {}
 return [];
}

function saveSession(msgs: Msg[]) {
 try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(msgs)); } catch {}
}

function renderMarkdown(text: string): string {
 // Tiny inline markdown — bold, italics, code, list bullets.
 const escaped = text
 .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
 return escaped
 .replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="bg-gray-100 rounded p-2 my-2 text-xs whitespace-pre-wrap">${code}</pre>`)
 .replace(/`([^`]+)`/g, '<code class="bg-gray-100 rounded px-1 text-[12px]">$1</code>')
 .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
 .replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, "$1<em>$2</em>")
 .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold mt-2">$1</h3>')
 .replace(/^## (.+)$/gm, '<h2 class="text-sm font-bold mt-3">$1</h2>')
 .replace(/^# (.+)$/gm, '<h1 class="text-base font-bold mt-3">$1</h1>')
 .replace(/^[-•] (.+)$/gm, '<div class="flex gap-2 my-1"><span class="text-gray-400">•</span><span>$1</span></div>')
 .replace(/\n{2,}/g, '<div class="h-2"></div>')
 .replace(/\n/g, "<br/>");
}

function ChatThumbs({ scopeKind, messageIndex }: { scopeKind: string; messageIndex: number }) {
 const [voted, setVoted] = useState<"up" | "down" | null>(null);
 async function vote(v: "up" | "down") {
 if (voted) return;
 setVoted(v);
 try {
 await fetch("/api/chat/feedback", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ vote: v, scope_kind: scopeKind, message_index: messageIndex }),
 });
 } catch {}
 }
 return (
 <div className="mt-1 flex items-center gap-1.5 pl-1 text-[11px] text-gray-400">
 <button
 onClick={() => vote("up")}
 disabled={!!voted}
 title="Helpful"
 className={`h-5 w-5 rounded inline-flex items-center justify-center transition-colors ${
 voted === "up" ? "bg-green-100 text-green-700" : "hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
 }`}
 >👍</button>
 <button
 onClick={() => vote("down")}
 disabled={!!voted}
 title="Not useful"
 className={`h-5 w-5 rounded inline-flex items-center justify-center transition-colors ${
 voted === "down" ? "bg-red-100 text-red-700" : "hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
 }`}
 >👎</button>
 {voted && <span className="text-[10px]">Thanks — recorded.</span>}
 </div>
 );
}

export default function ChatFloating() {
 const pathname = usePathname();
 const [open, setOpen] = useState(false);
 const [messages, setMessages] = useState<Msg[]>(() => (typeof window === "undefined" ? [] : loadSession()));
 const [input, setInput] = useState("");
 const [streaming, setStreaming] = useState(false);
 const [streamBuffer, setStreamBuffer] = useState("");
 const scrollRef = useRef<HTMLDivElement>(null);
 const abortRef = useRef<AbortController | null>(null);

 const { scope, label } = useMemo(() => scopeFromPath(pathname), [pathname]);

 useEffect(() => { saveSession(messages); }, [messages]);

 useEffect(() => {
 if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
 }, [messages, streamBuffer]);

 function clearChat() {
 setMessages([]);
 try { sessionStorage.removeItem(SESSION_KEY); } catch {}
 }

 async function send() {
 const text = input.trim();
 if (!text || streaming) return;
 const next: Msg[] = [...messages, { role: "user", content: text }];
 setMessages(next);
 setInput("");
 setStreaming(true);
 setStreamBuffer("");

 const ac = new AbortController();
 abortRef.current = ac;

 try {
 const res = await fetch("/api/chat", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 signal: ac.signal,
 body: JSON.stringify({ scope, messages: next }),
 });
 if (!res.ok || !res.body) {
 setMessages((m) => [...m, { role: "assistant", content: "Couldn't reach the assistant. Try again." }]);
 return;
 }
 const reader = res.body.getReader();
 const decoder = new TextDecoder();
 let buffer = "";
 let assembled = "";

 while (true) {
 const { done, value } = await reader.read();
 if (done) break;
 buffer += decoder.decode(value, { stream: true });
 const lines = buffer.split("\n");
 buffer = lines.pop() ?? "";
 for (const line of lines) {
 const t = line.trim();
 if (!t.startsWith("data:")) continue;
 const payload = t.slice(5).trim();
 if (payload === "[DONE]") continue;
 try {
 const parsed = JSON.parse(payload);
 if (parsed.delta) {
 assembled += parsed.delta;
 setStreamBuffer(assembled);
 } else if (parsed.error) {
 assembled = parsed.error;
 setStreamBuffer(assembled);
 }
 } catch {}
 }
 }

 setMessages((m) => [...m, { role: "assistant", content: assembled || "The assistant didn't return a response. Please try again." }]);
 setStreamBuffer("");
 } catch {
 if (!ac.signal.aborted) {
 setMessages((m) => [...m, { role: "assistant", content: "Couldn't reach the assistant. Try again." }]);
 }
 } finally {
 setStreaming(false);
 abortRef.current = null;
 }
 }

 function stop() {
 abortRef.current?.abort();
 setStreaming(false);
 if (streamBuffer) {
 setMessages((m) => [...m, { role: "assistant", content: streamBuffer + " …(stopped)" }]);
 setStreamBuffer("");
 }
 }

 // Hide on /login, /qa, /r/[token]
 if (pathname.startsWith("/login") || pathname === "/qa" || pathname.startsWith("/r/")) return null;

 return (
 <>
 {/* Floating launcher — labeled pill so the team knows what it is */}
 {!open && (
 <button
 onClick={() => setOpen(true)}
 aria-label="Ask VSI Assistant"
 className="group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 rounded-full p-3 sm:pl-3 sm:pr-5 text-white shadow-lg hover:shadow-xl sm:hover:-translate-y-0.5 transition-all duration-200" style={{ backgroundColor: '#FF4500' }}
 >
 <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-card/20">
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
 </svg>
 </span>
 <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">Ask VSI Assistant</span>
 <span className="ml-1 hidden sm:inline-flex items-center gap-1 rounded-full bg-card/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
 <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
 Live
 </span>
 </button>
 )}

 {/* Panel */}
 {open && (
 <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] flex flex-col rounded-[20px] shadow-2xl overflow-hidden border border-border bg-card">
 {/* Header */}
 <div className="flex items-center justify-between px-4 py-3 border-b border-border text-white bg-amber-500">
 <div className="flex items-center gap-2 min-w-0">
 <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">VS</div>
 <div className="min-w-0">
 <p className="text-sm font-semibold leading-tight">VSI Assistant</p>
 <p className="text-[11px] text-white/80 truncate">Live data · {label}</p>
 </div>
 </div>
 <div className="flex items-center gap-1">
 {messages.length > 0 && (
 <button
 onClick={clearChat}
 className="text-xs px-2 py-1 rounded hover:bg-white/15 transition-colors"
 title="Clear conversation"
 >Clear</button>
 )}
 <button
 onClick={() => setOpen(false)}
 aria-label="Close"
 className="h-7 w-7 rounded hover:bg-white/15 transition-colors flex items-center justify-center"
 >✕</button>
 </div>
 </div>

 {/* Messages */}
 <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-background">
 {messages.length === 0 && !streaming && (
 <div className="space-y-3">
 <p className="text-sm text-muted-foreground">Ask anything about <strong className="text-foreground">{label}</strong>. I read your live SERP, AI Mode, and citation data and answer with current numbers — never generic advice.</p>
 <div className="space-y-1.5">
 {[
 "What's the biggest opportunity here right now?",
 "Why aren't we cited in AI Mode?",
 "Draft a Reddit post that could win citations for our top keyword.",
 ].map((s) => (
 <button
 key={s}
 onClick={() => setInput(s)}
 className="text-left w-full text-xs text-muted-foreground hover:text-foreground transition-colors rounded px-2.5 py-2 border border-border hover:border-amber-500 bg-card shadow-2xs"
 >→ {s}</button>
 ))}
 </div>
 </div>
 )}

 {messages.map((m, i) => (
 <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
 <div className="max-w-[88%]">
 <div
 className={`rounded-[20px] px-3.5 py-2.5 text-sm ${
 m.role === "user"
 ? "bg-amber-500 text-white rounded-br-sm shadow-2xs"
 : "bg-card text-foreground rounded-bl-sm border border-border shadow-2xs"
 }`}
 dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
 />
 {m.role === "assistant" && i > 0 && (
 <ChatThumbs scopeKind={scope.kind} messageIndex={i} />
 )}
 </div>
 </div>
 ))}

 {streaming && (
 <div className="flex justify-start">
 <div
 className="max-w-[88%] rounded-[20px] rounded-bl-sm px-3.5 py-2.5 text-sm text-foreground bg-card border border-border shadow-2xs"
 dangerouslySetInnerHTML={{ __html: streamBuffer ? renderMarkdown(streamBuffer) : '<span class="text-muted-foreground">Thinking…</span>' }}
 />
 </div>
 )}
 </div>

 {/* Input */}
 <div className="border-t border-border px-3 py-3 bg-card">
 <div className="flex items-end gap-2">
 <textarea
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
 }}
 placeholder={streaming ? "Streaming…" : "Ask about " + label + "…"}
 disabled={streaming}
 rows={1}
 className="flex-1 resize-none rounded-[20px] border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:opacity-50 max-h-32 shadow-2xs"
 />
 {streaming ? (
 <button
 onClick={stop}
 className="h-9 px-3 rounded-xl bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
 >Stop</button>
 ) : (
 <button
 onClick={send}
 disabled={!input.trim()}
 className="h-9 px-4 rounded-xl bg-amber-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-amber-600 shadow-2xs"
 >Send</button>
 )}
 </div>
 <p className="text-[10px] text-muted-foreground mt-1.5 px-1">Conversation resets when you close this tab.</p>
 </div>
 </div>
 )}
 </>
 );
}
