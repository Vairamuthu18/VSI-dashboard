"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, TrendingUp, Award, Eye, Globe, AlertTriangle, Download, 
  Calendar, Filter, CheckCircle2, ShieldCheck, Cpu, MessageSquare, 
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, RefreshCw, Activity,
  FileText, Search, Zap, Layers, Server, AlertCircle, ChevronRight, Check,
  Home, SlidersHorizontal, Terminal, ShieldAlert, ArrowRight
} from "lucide-react";
import ServiceFilterDropdown from "@/components/ServiceFilterDropdown";
import { Dropdown } from "@/components/Dropdown";
import { downloadCSV, exportPrintablePDF, ExportDataRow } from "@/utils/export";

interface ServiceModuleViewProps {
  moduleType: "all-services" | "seo-tracked" | "geo-tracked" | "all" | "seo" | "geo";
}

export default function ServiceModuleView({ moduleType }: ServiceModuleViewProps) {
  // Normalize module key
  let normalizedType: "all-services" | "seo-tracked" | "geo-tracked" = "all-services";
  if (moduleType === "seo" || moduleType === "seo-tracked") {
    normalizedType = "seo-tracked";
  } else if (moduleType === "geo" || moduleType === "geo-tracked") {
    normalizedType = "geo-tracked";
  } else {
    normalizedType = "all-services";
  }

  const [dateRange, setDateRange] = useState("30d");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 250ms smooth transition
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [normalizedType, dateRange]);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 250);
  };

  const handleExportCSV = () => {
    const rows: ExportDataRow[] = [
      {
        keyword: normalizedType === "seo-tracked" ? "enterprise seo platform" : "ai search citation tracker",
        clientName: "SearchIntel Enterprise",
        trackType: normalizedType.toUpperCase(),
        rankPosition: 1,
        aioPresent: true,
        classification: "aligned",
        createdAt: new Date().toISOString(),
      }
    ];
    downloadCSV(`${normalizedType.toUpperCase()}_Report`, rows);
  };

  const handleExportPDF = () => {
    const rows: ExportDataRow[] = [
      {
        keyword: normalizedType === "seo-tracked" ? "enterprise seo platform" : "ai search citation tracker",
        clientName: "SearchIntel Enterprise",
        trackType: normalizedType.toUpperCase(),
        rankPosition: 1,
        aioPresent: true,
        classification: "aligned",
        createdAt: new Date().toISOString(),
      }
    ];
    exportPrintablePDF(`${normalizedType.toUpperCase()} Performance Report`, rows);
  };

  // Dynamic Header Titles
  const getHeaderTitle = () => {
    switch (normalizedType) {
      case "seo-tracked":
        return "SEO Tracking Dashboard";
      case "geo-tracked":
        return "GEO Tracking Dashboard";
      case "all-services":
      default:
        return "Services Overview Dashboard";
    }
  };

  // Breadcrumb Label
  const getBreadcrumbLabel = () => {
    switch (normalizedType) {
      case "seo-tracked":
        return "SEO Tracked";
      case "geo-tracked":
        return "GEO Tracked";
      case "all-services":
      default:
        return "All Services";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans transition-colors bg-background min-h-screen">
      
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home size={14} />
          <span>Dashboard</span>
        </Link>
        <ChevronRight size={12} className="text-muted-foreground/60" />
        <span className="hover:text-foreground transition-colors">Services</span>
        <ChevronRight size={12} className="text-muted-foreground/60" />
        <span className="text-foreground font-bold">{getBreadcrumbLabel()}</span>
      </nav>

      {/* ── TOP HEADER & GLOBAL TOOLBAR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {getHeaderTitle()}
            </h1>
            <span className="rounded-full px-[14px] py-[6px] bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              {normalizedType === "all-services" ? "Enterprise Overview" : normalizedType === "seo-tracked" ? "SEO Module" : "GEO Module"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            {normalizedType === "all-services" && "Complete management and metrics across all organic SEO and Generative Engine Optimization campaigns."}
            {normalizedType === "seo-tracked" && "Deep organic search monitoring, Google index status, rank positions, and technical site audits."}
            {normalizedType === "geo-tracked" && "Real-time Generative Engine Optimization monitoring across ChatGPT, Gemini, Claude, and Perplexity."}
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Dropdown */}
          <Dropdown
            variant="date-range"
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: "30d", label: "Last 30 Days" },
              { value: "7d", label: "Last 7 Days" },
              { value: "90d", label: "Last 90 Days" },
              { value: "all", label: "All Time" }
            ]}
            trigger={
              <div className="flex items-center gap-2 bg-card border border-border/80 rounded-full px-[14px] py-[6px] text-xs font-semibold text-foreground shadow-sm transition-all hover:border-primary/50 outline-none cursor-pointer">
                <Calendar size={14} className="text-muted-foreground" />
                <span>Date Range:</span>
                <span className="font-bold text-foreground">
                  {dateRange === "30d" ? "Last 30 Days" : dateRange === "7d" ? "Last 7 Days" : dateRange === "90d" ? "Last 90 Days" : "All Time"}
                </span>
              </div>
            }
          />

          {/* Active Route Filter Dropdown */}
          <ServiceFilterDropdown currentValue={normalizedType} />

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              type="button"
              className="flex items-center gap-2 rounded-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              type="button"
              className="flex items-center gap-2 rounded-full px-4 py-2 bg-card border border-border text-foreground hover:bg-muted text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Download size={14} />
              <span>PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT VIEW (250ms Fade, Slide & Scale Transition) ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.99, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-6 py-6"
          >
            {/* Loading Indicator */}
            <div className="flex items-center justify-center py-12 bg-card border border-border/80 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <RefreshCw size={22} className="animate-spin text-primary" />
                <span className="text-sm font-semibold">Loading {getHeaderTitle()} data...</span>
              </div>
            </div>

            {/* Skeleton Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-card border border-border/80 rounded-2xl p-5 animate-pulse space-y-3">
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                  <div className="h-8 w-3/4 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : hasError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center p-12 bg-card border border-rose-500/20 rounded-2xl text-center space-y-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Unable to load module data.</h3>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                We encountered an error loading {getHeaderTitle()}. Please retry.
              </p>
            </div>
            <button
              onClick={handleRetry}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-full shadow-sm transition-all"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`content-${normalizedType}`}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-8"
          >
            {normalizedType === "all-services" && (
              <AllServicesDashboard 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                filterCategory={filterCategory} 
                setFilterCategory={setFilterCategory} 
              />
            )}
            {normalizedType === "seo-tracked" && <SeoTrackingDashboard />}
            {normalizedType === "geo-tracked" && <GeoTrackingDashboard />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

{/* ─────────────────────────────────────────────────────────────
    ALL SERVICES DASHBOARD
   ───────────────────────────────────────────────────────────── */}
function AllServicesDashboard({ searchQuery, setSearchQuery, filterCategory, setFilterCategory }: any) {
  const servicesList = [
    { client: "Acme Corp", service: "Enterprise SEO + GEO", type: "seo-tracked", campaigns: 8, perf: "96/100", status: "Active" },
    { client: "Apex Logistics", service: "Organic Rank Tracking", type: "seo-tracked", campaigns: 4, perf: "91/100", status: "Active" },
    { client: "HealthPlus Systems", service: "AI Citation Monitor", type: "geo-tracked", campaigns: 6, perf: "94/100", status: "Active" },
    { client: "FintechWave", service: "Multi-Engine GEO", type: "geo-tracked", campaigns: 5, perf: "89/100", status: "Active" },
    { client: "CloudScale Inc", service: "Technical SEO Audit", type: "seo-tracked", campaigns: 3, perf: "98/100", status: "Active" },
  ];

  const filtered = servicesList.filter((s) => {
    const matchesSearch = s.client.toLowerCase().includes(searchQuery.toLowerCase()) || s.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || s.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Services</span>
            <Layers size={18} className="text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">32 Active</p>
          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <ArrowUpRight size={14} /> +4 services added this quarter
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Services</span>
            <Globe size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">28 Live</p>
          <p className="text-xs text-muted-foreground font-semibold">
            SEO: 16 | GEO: 12
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Running Campaigns</span>
            <Zap size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">148 Campaigns</p>
          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <CheckCircle2 size={14} /> 99.4% Uptime
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Performance Score</span>
            <Award size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-500">94 / 100</p>
          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <TrendingUp size={14} /> Outstanding Health
          </p>
        </div>
      </div>

      {/* Toolbar: Search Bar & Filters */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services or client domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/30 border border-border/60 rounded-full pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
            <SlidersHorizontal size={14} /> Type:
          </span>
          {[
            { id: "all", label: "All Types" },
            { id: "seo-tracked", label: "SEO Tracked" },
            { id: "geo-tracked", label: "GEO Tracked" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Server size={18} className="text-primary" />
          <span>Active Services Overview</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-bold">
                <th className="pb-3">Client Domain</th>
                <th className="pb-3">Service Name</th>
                <th className="pb-3">Running Campaigns</th>
                <th className="pb-3">Performance Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 font-bold text-foreground">{row.client}</td>
                  <td className="py-3.5 text-muted-foreground">{row.service}</td>
                  <td className="py-3.5 font-extrabold text-foreground">{row.campaigns} campaigns</td>
                  <td className="py-3.5 font-bold text-emerald-500">{row.perf}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={row.type === "seo-tracked" ? "/dashboard/services/seo-tracked" : "/dashboard/services/geo-tracked"}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      View Module <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

{/* ─────────────────────────────────────────────────────────────
    SEO TRACKING DASHBOARD
   ───────────────────────────────────────────────────────────── */}
function SeoTrackingDashboard() {
  return (
    <div className="space-y-8">
      {/* Overview Cards: Organic Traffic, Clicks, Impressions, CTR, Avg Position */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organic Traffic</span>
          <p className="text-2xl font-black text-foreground">142.8K</p>
          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <ArrowUpRight size={14} /> +14.2% vs last month
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Clicks</span>
          <p className="text-2xl font-black text-foreground">128.4K</p>
          <p className="text-xs text-blue-500 font-bold flex items-center gap-1">
            <TrendingUp size={14} /> High Search Demand
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Impressions</span>
          <p className="text-2xl font-black text-foreground">1.84M</p>
          <p className="text-xs text-indigo-500 font-bold">Search Visibility</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average CTR</span>
          <p className="text-2xl font-black text-emerald-500">7.76%</p>
          <p className="text-xs text-emerald-500 font-bold">+0.8% CTR Growth</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Position</span>
          <p className="text-2xl font-black text-primary">4.2</p>
          <p className="text-xs text-emerald-500 font-bold">Top 5 Page 1 Rank</p>
        </div>
      </div>

      {/* Ranking Trend Graph & Top Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            <span>Keyword Ranking Distribution & Trend</span>
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center py-2">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Positions #1 - #3</p>
              <p className="text-2xl font-black text-emerald-500 mt-1">482 Keywords</p>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Positions #4 - #10</p>
              <p className="text-2xl font-black text-blue-500 mt-1">620 Keywords</p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Positions #11 - #20</p>
              <p className="text-2xl font-black text-amber-500 mt-1">138 Keywords</p>
            </div>
          </div>

          <div className="h-40 bg-muted/20 border border-border/40 rounded-xl p-4 flex items-end justify-between gap-2">
            {[40, 55, 65, 70, 85, 92, 98, 105, 120, 142].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all" style={{ height: `${height}px` }} />
                <span className="text-[10px] text-muted-foreground font-semibold">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Issues & SEO Opportunities */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-500" />
            <span>Technical SEO & Audit Issues</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between">
              <span className="font-bold text-rose-600 dark:text-rose-400">3 Broken 404 Links</span>
              <span className="px-2 py-0.5 bg-rose-500 text-white font-extrabold rounded-md text-[10px]">High</span>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
              <span className="font-bold text-amber-600 dark:text-amber-400">12 Missing Meta Descriptions</span>
              <span className="px-2 py-0.5 bg-amber-500 text-white font-extrabold rounded-md text-[10px]">Medium</span>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
              <span className="font-bold text-blue-600 dark:text-blue-400">Low Image Alt Coverage</span>
              <span className="px-2 py-0.5 bg-blue-500 text-white font-extrabold rounded-md text-[10px]">Notice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Keywords Table */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Search size={18} className="text-primary" />
          <span>Top Keywords & SERP Features</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-bold">
                <th className="pb-3">Keyword Query</th>
                <th className="pb-3">Position</th>
                <th className="pb-3">Monthly Clicks</th>
                <th className="pb-3">CTR</th>
                <th className="pb-3">SERP Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {[
                { kw: "enterprise seo platform", pos: "#1", clicks: "18,420", ctr: "14.2%", serp: "Featured Snippet" },
                { kw: "best AI rank tracker", pos: "#2", clicks: "14,100", ctr: "11.8%", serp: "AI Overview" },
                { kw: "generative engine optimization", pos: "#3", clicks: "9,850", ctr: "9.4%", serp: "AI Overview + SGE" },
                { kw: "search citation analytics", pos: "#4", clicks: "7,200", ctr: "8.1%", serp: "Knowledge Graph" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-bold text-foreground">{row.kw}</td>
                  <td className="py-3 font-extrabold text-foreground">{row.pos}</td>
                  <td className="py-3 text-foreground">{row.clicks}</td>
                  <td className="py-3 font-bold text-emerald-500">{row.ctr}</td>
                  <td className="py-3 text-muted-foreground">{row.serp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

{/* ─────────────────────────────────────────────────────────────
    GEO TRACKING DASHBOARD
   ───────────────────────────────────────────────────────────── */}
function GeoTrackingDashboard() {
  return (
    <div className="space-y-8">
      {/* AI Citation & Engine Visibility Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">ChatGPT Visibility</span>
            <Sparkles size={18} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-foreground">88% Score</p>
          <p className="text-xs text-muted-foreground font-semibold">1,420 Prompts Cited</p>
        </div>

        <div className="bg-card border border-blue-500/30 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Gemini Visibility</span>
            <Cpu size={18} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-foreground">82% Score</p>
          <p className="text-xs text-muted-foreground font-semibold">1,180 Prompts Cited</p>
        </div>

        <div className="bg-card border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Claude Visibility</span>
            <MessageSquare size={18} className="text-amber-500" />
          </div>
          <p className="text-3xl font-black text-foreground">85% Score</p>
          <p className="text-xs text-muted-foreground font-semibold">890 Prompts Cited</p>
        </div>

        <div className="bg-card border border-indigo-500/30 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Perplexity Visibility</span>
            <Globe size={18} className="text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-foreground">92% Score</p>
          <p className="text-xs text-muted-foreground font-semibold">1,540 Prompts Cited</p>
        </div>
      </div>

      {/* Brand Visibility & Citation Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span>AI Citation Trend & Brand Visibility</span>
          </h2>
          <div className="p-4 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Brand Sentiment Index</p>
              <p className="text-xl font-black text-emerald-500 mt-0.5">91% Positive / Neutral</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full">
              3,890 Total AI Citations
            </span>
          </div>

          <div className="h-44 bg-muted/20 border border-border/40 rounded-xl p-4 flex items-end justify-between gap-2">
            {[60, 75, 80, 95, 110, 130, 145, 160, 175, 190].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-500/80 hover:bg-emerald-500 rounded-t transition-all" style={{ height: `${h}px` }} />
                <span className="text-[10px] text-muted-foreground font-semibold">M{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor GEO Comparison */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            <span>Competitor GEO Share of Voice</span>
          </h2>
          <div className="space-y-4 text-xs">
            {[
              { brand: "SearchIntel (Your Brand)", share: "48.5%", color: "bg-emerald-500" },
              { brand: "Competitor Alpha", share: "24.2%", color: "bg-blue-500" },
              { brand: "Competitor Beta", share: "18.1%", color: "bg-amber-500" },
              { brand: "Others", share: "9.2%", color: "bg-muted-foreground" },
            ].map((b, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-foreground">{b.brand}</span>
                  <span className="text-primary">{b.share}</span>
                </div>
                <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div className={`h-full ${b.color}`} style={{ width: b.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Tracking & Citation Sources */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Terminal size={18} className="text-primary" />
          <span>Tracked AI Prompts & Citation Sources</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-bold">
                <th className="pb-3">Prompt Query</th>
                <th className="pb-3">Engine Presence</th>
                <th className="pb-3">Citation Source</th>
                <th className="pb-3">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {[
                { prompt: "What is the top AI search citation tool?", engines: "ChatGPT, Perplexity, Gemini", source: "wikipedia.org", sentiment: "Positive" },
                { prompt: "Best platform for Generative Engine Optimization", engines: "ChatGPT, Claude, Gemini", source: "techcrunch.com", sentiment: "Positive" },
                { prompt: "How to monitor AI overview mentions?", engines: "Perplexity, ChatGPT", source: "forbes.com", sentiment: "Positive" },
                { prompt: "Enterprise SEO vs GEO software comparison", engines: "ChatGPT, Perplexity, Claude", source: "github.com", sentiment: "Neutral" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 font-bold text-foreground">{row.prompt}</td>
                  <td className="py-3.5 text-muted-foreground font-semibold">{row.engines}</td>
                  <td className="py-3.5 font-bold text-blue-500">{row.source}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                      {row.sentiment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
