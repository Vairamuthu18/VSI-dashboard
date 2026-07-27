"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, Star, ThumbsUp, Filter, Search } from "lucide-react";

interface FeedbackItem {
 id: string;
 category: "Feature Request" | "Bug Report" | "UX Improvement";
 subject: string;
 message: string;
 author: string;
 createdAt: string;
 status: "Open" | "In Review" | "Resolved";
 upvotes: number;
}

const initialFeedback: FeedbackItem[] = [
 {
 id: "fb-1",
 category: "Feature Request",
 subject: "Add Claude 3.5 Sonnet Citations",
 message: "Would love to track citation links returned in Claude 3.5 Sonnet generative answers alongside ChatGPT.",
 author: "agency@valgrow.com",
 createdAt: "2026-07-21",
 status: "In Review",
 upvotes: 24,
 },
 {
 id: "fb-2",
 category: "UX Improvement",
 subject: "Dark Mode Contrast for Trajectory Chart",
 message: "The trajectory chart looks great in dark mode! Could we increase line width for winning citations?",
 author: "client@acme.com",
 createdAt: "2026-07-20",
 status: "Resolved",
 upvotes: 12,
 },
 {
 id: "fb-3",
 category: "Bug Report",
 subject: "PDF Report Title Overflow",
 message: "When exporting PDF for clients with long company names, title wraps onto second page.",
 author: "support@agency.org",
 createdAt: "2026-07-18",
 status: "Open",
 upvotes: 7,
 },
];

export default function FeedbackPage() {
 const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(initialFeedback);
 const [subject, setSubject] = useState("");
 const [message, setMessage] = useState("");
 const [category, setCategory] = useState<FeedbackItem["category"]>("Feature Request");
 const [submitted, setSubmitted] = useState(false);

 const handleSubmitFeedback = (e: React.FormEvent) => {
 e.preventDefault();
 if (!subject.trim() || !message.trim()) return;

 const newItem: FeedbackItem = {
 id: `fb-${Date.now()}`,
 category,
 subject: subject.trim(),
 message: message.trim(),
 author: "you@agency.com",
 createdAt: new Date().toISOString().split("T")[0],
 status: "Open",
 upvotes: 1,
 };

 setFeedbackList([newItem, ...feedbackList]);
 setSubject("");
 setMessage("");
 setSubmitted(true);
 setTimeout(() => setSubmitted(false), 4000);
 };

 const handleUpvote = (id: string) => {
 setFeedbackList((prev) =>
 prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
 );
 };

 return (
 <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
 {/* Page Header */}
 <div className="pb-6 border-b border-border">
 <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
 <MessageSquare className="text-primary" size={28} />
 <span>Feedback & Product Requests</span>
 </h1>
 <p className="text-sm text-[#666666] mt-1">
 Submit product feedback, request new AI engine integrations, and upvote agency feature suggestions.
 </p>
 </div>

 {submitted && (
 <div className="rounded-[20px] bg-[#22C55E]/10 border border-[#22C55E]/20 p-3.5 flex items-center gap-2 text-[#22C55E] text-xs font-medium">
 <CheckCircle2 size={16} />
 <span>Thank you! Your feedback has been submitted to the product team.</span>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Submit Form (5 Cols) */}
 <div className="lg:col-span-5 bg-card rounded-[20px] border border-border p-6 shadow-xs space-y-4">
 <h2 className="text-base font-bold text-foreground">Submit New Feedback</h2>

 <form onSubmit={handleSubmitFeedback} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 Category
 </label>
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value as FeedbackItem["category"])}
 className="w-full rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
 >
 <option value="Feature Request">Feature Request</option>
 <option value="Bug Report">Bug Report</option>
 <option value="UX Improvement">UX Improvement</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 Subject Title
 </label>
 <input
 type="text"
 required
 placeholder="Brief summary of your feedback..."
 value={subject}
 onChange={(e) => setSubject(e.target.value)}
 className="w-full rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 Detailed Explanation
 </label>
 <textarea
 rows={5}
 required
 placeholder="Describe how this feature will improve your workflow..."
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 className="w-full rounded-[20px] border border-border bg-background p-3.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
 />
 </div>

 <button
 type="submit"
 className="w-full flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-colors"
 >
 <Send size={14} />
 <span>Submit Feedback</span>
 </button>
 </form>
 </div>

 {/* Existing Feedback Board (7 Cols) */}
 <div className="lg:col-span-7 space-y-4">
 <h2 className="text-base font-bold text-foreground">Community & Agency Requests</h2>

 <div className="space-y-3">
 {feedbackList.map((item) => (
 <div
 key={item.id}
 className="bg-card rounded-[20px] border border-border p-5 shadow-xs flex items-start gap-4"
 >
 <button
 onClick={() => handleUpvote(item.id)}
 className="flex flex-col items-center justify-center rounded-[20px] bg-muted-bg hover:bg-amber-500/10 hover:text-amber-500 border border-border px-3 py-2 text-muted-foreground transition-colors shrink-0"
 >
 <ThumbsUp size={14} />
 <span className="text-xs font-bold mt-1">{item.upvotes}</span>
 </button>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap mb-1">
 <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border-primary/20">
 {item.category}
 </span>
 <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
 item.status === "Resolved" ? "bg-[#22C55E]/10 text-[#22C55E]" :
 item.status === "In Review" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
 "bg-[#F5F5F3] text-[#666666]"
 }`}>
 {item.status}
 </span>
 </div>

 <h3 className="text-sm font-bold text-foreground">{item.subject}</h3>
 <p className="text-xs text-[#666666] mt-1">{item.message}</p>

 <div className="mt-3 flex items-center justify-between text-[11px] text-[#666666]">
 <span>Submitted by {item.author}</span>
 <span>{item.createdAt}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
