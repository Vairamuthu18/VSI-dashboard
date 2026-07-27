"use client";

import React, { useState } from "react";
import { 
 Terminal, Sparkles, Cpu, Edit3, Save, Plus, Play, CheckCircle2, RefreshCw, Layers
} from "lucide-react";

interface PromptTemplate {
 id: string;
 engine: string;
 name: string;
 template: string;
 variables: string[];
 lastUpdated: string;
 version: string;
 isActive: boolean;
}

const defaultPrompts: PromptTemplate[] = [
 {
 id: "prompt-1",
 engine: "Google AIO",
 name: "Search Overview Diagnostic Prompt",
 template: "Act as an expert search evaluator. Analyze the SERP for the keyword query '{keyword}' in the region '{location}'. Determine if '{client_domain}' is recommended or cited in the AI Overview.",
 variables: ["keyword", "location", "client_domain"],
 lastUpdated: "2026-07-20",
 version: "v2.4",
 isActive: true,
 },
 {
 id: "prompt-2",
 engine: "ChatGPT (GPT-4o)",
 name: "Generative Citation & Sentiment Evaluator",
 template: "Prompt: What are the top providers for {keyword}? In your answer, analyze whether {client_domain} or its competitors ({competitors}) are cited.",
 variables: ["keyword", "client_domain", "competitors"],
 lastUpdated: "2026-07-19",
 version: "v1.8",
 isActive: true,
 },
 {
 id: "prompt-3",
 engine: "Gemini 1.5 Pro",
 name: "GEO Grounding & Source Citation Audit",
 template: "Perform a web grounding check for '{keyword}'. Extract all source URLs provided in the response and verify if '{client_domain}' is listed.",
 variables: ["keyword", "client_domain"],
 lastUpdated: "2026-07-18",
 version: "v3.1",
 isActive: true,
 },
 {
 id: "prompt-4",
 engine: "Perplexity AI",
 name: "Live Web Citation Audit",
 template: "Search for '{keyword}' and summarize top recommendations. List explicit citation links and note position of '{client_domain}'.",
 variables: ["keyword", "client_domain"],
 lastUpdated: "2026-07-15",
 version: "v1.2",
 isActive: true,
 },
];

export default function PromptsPage() {
 const [prompts, setPrompts] = useState<PromptTemplate[]>(defaultPrompts);
 const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate>(defaultPrompts[0]);
 const [editedTemplate, setEditedTemplate] = useState(defaultPrompts[0].template);
 const [savedSuccess, setSavedSuccess] = useState(false);

 const handleSelectPrompt = (prompt: PromptTemplate) => {
 setSelectedPrompt(prompt);
 setEditedTemplate(prompt.template);
 setSavedSuccess(false);
 };

 const handleSavePrompt = () => {
 setPrompts((prev) =>
 prev.map((p) =>
 p.id === selectedPrompt.id
 ? { ...p, template: editedTemplate, lastUpdated: new Date().toISOString().split("T")[0] }
 : p
 )
 );
 setSavedSuccess(true);
 setTimeout(() => setSavedSuccess(false), 3000);
 };

 return (
 <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
 <div>
 <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
 <Terminal className="text-primary" size={28} />
 <span>AI Prompt Management</span>
 </h1>
 <p className="text-sm text-[#666666] mt-1">
 Configure system prompts and evaluation templates for Google AIO, ChatGPT, Gemini, and Perplexity.
 </p>
 </div>

 <button
 onClick={handleSavePrompt}
 className="flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
 >
 <Save size={15} />
 <span>Save Changes</span>
 </button>
 </div>

 {savedSuccess && (
 <div className="rounded-[20px] bg-[#22C55E]/10 border border-[#22C55E]/20 p-3.5 flex items-center gap-2 text-[#22C55E] text-xs font-medium">
 <CheckCircle2 size={16} />
 <span>Prompt template successfully saved and updated to latest version!</span>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Prompts List Sidebar (4 Cols) */}
 <div className="lg:col-span-4 space-y-3">
 <h2 className="text-xs font-bold text-[#666666] uppercase tracking-widest px-1">
 Engine Templates
 </h2>

 <div className="space-y-2">
 {prompts.map((p) => {
 const active = p.id === selectedPrompt.id;
 return (
 <button
 key={p.id}
 onClick={() => handleSelectPrompt(p)}
 className={`w-full text-left p-4 rounded-[20px] border transition-all ${
 active
 ? "bg-amber-500 border-amber-500 text-white shadow-md"
 : "bg-white border-border hover:border-[#D1D5DB]"
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
 active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
 }`}>
 {p.engine}
 </span>
 <span className={`text-[10px] font-mono ${active ? "text-amber-100" : "text-slate-500"}`}>{p.version}</span>
 </div>
 <p className={`text-xs font-bold ${active ? "text-white" : "text-slate-900"}`}>{p.name}</p>
 <p className={`text-[11px] mt-1 line-clamp-2 ${active ? "text-amber-50" : "text-slate-500"}`}>
 {p.template}
 </p>
 </button>
 );
 })}
 </div>
 </div>

 {/* Prompt Editor & Simulator (8 Cols) */}
 <div className="lg:col-span-8 bg-card rounded-[20px] border border-border p-6 shadow-xs space-y-6">
 <div className="flex items-center justify-between border-b border-border pb-4">
 <div>
 <span className="text-xs font-bold text-primary uppercase tracking-wider">
 {selectedPrompt.engine}
 </span>
 <h2 className="text-lg font-bold text-foreground mt-0.5">
 {selectedPrompt.name}
 </h2>
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-mono text-muted-foreground bg-muted-bg px-2.5 py-1 rounded">
 Version: {selectedPrompt.version}
 </span>
 </div>
 </div>

 {/* Template Variables Pills */}
 <div>
 <label className="block text-xs font-bold text-[#666666] uppercase tracking-wider mb-2">
 Supported Prompt Variables
 </label>
 <div className="flex flex-wrap gap-2">
 {selectedPrompt.variables.map((v) => (
 <span
 key={v}
 className="bg-muted-bg text-foreground font-mono text-xs px-3 py-1 rounded-lg border border-border"
 >
 {`{${v}}`}
 </span>
 ))}
 </div>
 </div>

 {/* Code Textarea Editor */}
 <div>
 <label className="block text-xs font-bold text-[#666666] uppercase tracking-wider mb-2">
 Prompt Instructions & System Persona
 </label>
 <textarea
 rows={8}
 value={editedTemplate}
 onChange={(e) => setEditedTemplate(e.target.value)}
 className="w-full rounded-[20px] border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:border-amber-500 shadow-inner leading-relaxed"
 />
 </div>

 {/* Test Run Simulator */}
 <div className="p-4 rounded-[20px] bg-card border border-border flex items-center justify-between flex-wrap gap-3">
 <div>
 <p className="text-xs font-bold text-foreground">Run Prompt Test Diagnostic</p>
 <p className="text-[11px] text-[#666666]">Simulate this prompt against a test keyword query</p>
 </div>

 <button
 onClick={() => alert("Prompt test diagnostic executed cleanly!")}
 className="flex items-center gap-2 rounded-full bg-card border border-border hover:border-[#D1D5DB] text-foreground px-4 py-2 text-xs font-semibold transition-colors"
 >
 <Play size={14} />
 <span>Simulate Run</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
