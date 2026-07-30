"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
 Users, ShieldAlert, ArrowUpRight, TrendingUp, Search, Plus, 
 ChevronRight, Award, BarChart3, AlertCircle, ExternalLink, Filter
} from "lucide-react";

interface CompetitorData {
 id: string;
 name: string;
 domain: string;
 visibilityScore: number;
 aiMentionsCount: number;
 topEngine: string;
 gapStatus: "Leading" | "Tied" | "Lagging";
 sentiment: string;
}

const mockCompetitors: CompetitorData[] = [
 {
 id: "comp-1",
 name: "Apex Search Corp",
 domain: "apexsearch.com",
 visibilityScore: 84.2,
 aiMentionsCount: 342,
 topEngine: "Google AIO",
 gapStatus: "Leading",
 sentiment: "96% Positive",
 },
 {
 id: "comp-2",
 name: "BrightPulse AI",
 domain: "brightpulse.io",
 visibilityScore: 71.8,
 aiMentionsCount: 289,
 topEngine: "ChatGPT (GPT-4o)",
 gapStatus: "Tied",
 sentiment: "91% Positive",
 },
 {
 id: "comp-3",
 name: "VectorRank Labs",
 domain: "vectorrank.ai",
 visibilityScore: 58.4,
 aiMentionsCount: 194,
 topEngine: "Gemini 1.5 Pro",
 gapStatus: "Lagging",
 sentiment: "88% Neutral",
 },
 {
 id: "comp-4",
 name: "Synthetix Growth",
 domain: "synthetixgrowth.com",
 visibilityScore: 42.1,
 aiMentionsCount: 112,
 topEngine: "Perplexity AI",
 gapStatus: "Lagging",
 sentiment: "82% Neutral",
 },
];

export default function CompetitorsPage() {
 const [searchQuery, setSearchQuery] = useState("");
 const [competitors, setCompetitors] = useState<CompetitorData[]>(mockCompetitors);
 const [newCompetitorDomain, setNewCompetitorDomain] = useState("");
 const [showAddModal, setShowAddModal] = useState(false);

 const handleAddCompetitor = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newCompetitorDomain.trim()) return;

 const domainName = newCompetitorDomain.trim().replace(/^https?:\/\//, "");
 const newComp: CompetitorData = {
 id: `comp-${Date.now()}`,
 name: domainName.split(".")[0].toUpperCase() + " Intelligence",
 domain: domainName,
 visibilityScore: Math.floor(Math.random() * 40) + 40,
 aiMentionsCount: Math.floor(Math.random() * 200) + 50,
 topEngine: "ChatGPT (GPT-4o)",
 gapStatus: "Tied",
 sentiment: "90% Positive",
 };

 setCompetitors([newComp, ...competitors]);
 setNewCompetitorDomain("");
 setShowAddModal(false);
 };

 const filteredCompetitors = competitors.filter(
 (c) =>
 c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 c.domain.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Users className="text-amber-500" size={28} />
            <span>Competitor Citation Benchmark</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor rival brand mentions, AI share-of-voice gaps, and prompt dominance across generative search engines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Track New Competitor</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Your Brand AI Share
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-2">
            0.0%
          </p>
          <p className="text-[11px] text-[#22C55E] font-semibold mt-1">+14.2% higher than industry avg</p>
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Tracked Competitors
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
            {competitors.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Active domain profiles</p>
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Top Rival Domain
          </p>
          <p className="text-xl font-bold text-foreground mt-2 truncate">
            apexsearch.com
          </p>
          <p className="text-[11px] text-[#EF4444] font-semibold mt-1">84.2% AI Visibility</p>
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Citation Gap Advantage
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#22C55E] mt-2">
            +18.0%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Net positive share of citations</p>
        </div>
      </div>

      {/* Competitors List Table */}
      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 text-muted-foreground" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search competitor domain..."
              className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Showing {filteredCompetitors.length} competitors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted-bg/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Competitor Name</th>
                <th className="px-6 py-3.5">Domain</th>
                <th className="px-6 py-3.5">AI Visibility Score</th>
                <th className="px-6 py-3.5">Total Mentions</th>
                <th className="px-6 py-3.5">Primary AI Engine</th>
                <th className="px-6 py-3.5">Gap Benchmark</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredCompetitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No competitor domains found for "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredCompetitors.map((comp) => (
                  <tr key={comp.id} className="hover:bg-muted-bg/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{comp.name}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">{comp.domain}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-500">{comp.visibilityScore}%</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">{comp.aiMentionsCount}</td>
                    <td className="px-6 py-4">
                      <span className="bg-muted-bg text-foreground px-2.5 py-1 rounded-md font-mono text-[10px] border border-border font-bold">
                        {comp.topEngine}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        comp.gapStatus === "Leading" ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20" :
                        comp.gapStatus === "Tied" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                      }`}>
                        {comp.gapStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`https://${comp.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-500 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Visit</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card rounded-[24px] border border-border max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Track Competitor Domain</h3>
            <p className="text-xs text-muted-foreground">
              Enter the domain of a competitor to initiate real-time AI citation benchmarking.
            </p>

            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Competitor Website Domain
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. competitor.com"
                  value={newCompetitorDomain}
                  onChange={(e) => setNewCompetitorDomain(e.target.value)}
                  className="w-full rounded-[14px] border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
 );
}
