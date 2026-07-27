import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { SERVICE_TYPE_LABELS, LOCATIONS } from "@/types/search";
import type { ServiceType, Location } from "@/types/search";
import RunButton from "@/components/RunButton";
import OpportunityPanel from "@/components/OpportunityPanel";
import { Sparkles, Globe, MapPin, Briefcase, Calendar, Plus, ExternalLink, ArrowRight, Activity, ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const supabase = await createClient();
 const session = await requireAgency();

 const isSuperAdmin = session.role === "super_admin";
 const client = {
 id,
 name: "Acme Corp",
 service_type: "seo",
 website: "https://acme.com",
 agency_id: session.agencyId,
 brand_name: "Acme",
 default_location: "us",
 industry: "Tech",
 country: "USA",
 created_at: new Date().toISOString()
 };
 /*
 const clientQuery = supabase.from("clients").select("*").eq("id", id);
 const { data: client } = await (isSuperAdmin ? clientQuery : clientQuery.eq("agency_id", session.agencyId)).single();
 */
 if (!client) notFound();

 const svc = SERVICE_TYPE_LABELS[client.service_type as ServiceType];

 const keywords: any[] = [];
 /*
 const { data: keywords } = await supabase
 .from("tracked_keywords")
 .select("id, keyword, domain, brand, location, track_type, is_active, ai_brief, ai_brief_at")
 .eq("client_id", id);
 */
 const kwAll = keywords ?? [];
 const kwActive = kwAll.filter((k) => k.is_active);
 const kwSEO = kwActive.filter((k) => k.track_type === "seo" || k.track_type === "both");
 const kwGEO = kwActive.filter((k) => k.track_type === "geo" || k.track_type === "both");
 const kwBoth = kwActive.filter((k) => k.track_type === "both");

 const latestResults: any[] = [];
 /*
 const { data: latestResults } = await supabase
 .from("search_results")
 .select("id, tracked_keyword_id, keyword, domain, track_type, rank_position, aio_present, client_cited, mentioned_in_text, cited_domains, gap_label, created_at")
 .eq("client_id", id)
 .order("created_at", { ascending: false })
 .limit(200);
 */
 const seenKeywords = new Set<string>();
 const latestPerKeyword = (latestResults ?? []).filter((r) => {
 const key = `${r.keyword}::${r.track_type}`;
 if (seenKeywords.has(key)) return false;
 seenKeywords.add(key);
 return true;
 });

 const results = latestPerKeyword;
 const gapCounts = results.reduce((acc, r) => {
 acc[r.gap_label] = (acc[r.gap_label] ?? 0) + 1;
 return acc;
 }, {} as Record<string, number>);

 const stats = [
    { label: "Active Keywords", value: kwActive.length, sub: `${kwAll.length} total tracked`, color: "text-foreground" },
    ...(client.service_type !== "geo" ? [
      { label: "SEO Tracked", value: kwSEO.length, sub: "rank tracking", color: "text-amber-500" },
    ] : []),
    ...(client.service_type !== "seo" ? [
      { label: "GEO Tracked", value: kwGEO.length, sub: "AIO tracking", color: "text-emerald-500" },
    ] : []),
    ...(client.service_type === "seo_geo" ? [
      { label: "Both Pipelines", value: kwBoth.length, sub: "full intelligence", color: "text-purple-400" },
    ] : []),
  ];

  const gapStats = [
    { label: "Aligned", key: "aligned", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { label: "Ranked & Cited, Unnamed", key: "aligned_no_mention", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    { label: "AI-Mentioned", key: "ai_mentioned", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" },
    { label: "AI-Invisible", key: "search_strong_ai_invisible", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
    { label: "Double Loss", key: "weak_double_loss", color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
    { label: "GEO Cited & Named", key: "geo_cited", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { label: "GEO Cited, Unnamed", key: "geo_cited_no_mention", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    { label: "GEO Mentioned", key: "geo_mentioned", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" },
    { label: "GEO Invisible", key: "geo_invisible", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
    { label: "No AIO Trigger", key: "geo_no_aio", color: "text-muted-foreground border-border bg-muted-bg" },
    { label: "SEO Ranked", key: "seo_ranked", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { label: "Ranked, No AIO", key: "seo_ranked_no_aio", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { label: "SEO Not Ranked", key: "seo_not_ranked", color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
  ].filter((g) => (gapCounts[g.key] ?? 0) > 0);

 return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans bg-background min-h-screen">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 border-b border-border pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight truncate">
              {client.name}
            </h1>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
              {svc.short}
            </span>
            {isSuperAdmin && (
              <span className="rounded-full bg-muted-bg border border-border text-muted-foreground px-2.5 py-0.5 text-[10px] font-mono">
                ID: {id.slice(0, 8)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {client.website && (
              <a 
                href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-amber-500 hover:underline font-semibold"
              >
                <Globe size={13} />
                <span>{client.website}</span>
                <ExternalLink size={11} />
              </a>
            )}
            {client.industry && (
              <span className="flex items-center gap-1.5">
                <Briefcase size={13} className="text-muted-foreground" />
                <span>{client.industry}</span>
              </span>
            )}
            {client.country && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-muted-foreground" />
                <span>{client.country}</span>
              </span>
            )}
          </div>

          {(client as unknown as { last_auto_run_at?: string }).last_auto_run_at && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" />
              <span>Last Scan: <strong className="text-foreground">{new Date((client as unknown as { last_auto_run_at: string }).last_auto_run_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</strong></span>
              <span>· Frequency: <strong className="text-foreground capitalize">{((client as unknown as { check_frequency?: string }).check_frequency ?? "manual").replace(/_/g, " ")}</strong></span>
            </p>
          )}
        </div>

        {/* Action Tabs Bar + Run Scan Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-card border border-border p-1.5 rounded-[20px] flex items-center gap-1.5 flex-wrap shadow-xs">
            <Link
              href={`/dashboard/clients/${id}/keywords/new`}
              className="inline-flex items-center gap-1.5 rounded-[20px] bg-amber-500 hover:bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
            >
              <Plus size={13} />
              <span>ADD KEYWORDS</span>
            </Link>
            <Link
              href={`/dashboard/clients/${id}/keywords`}
              className="inline-flex items-center rounded-[20px] px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors"
            >
              Keywords
            </Link>
            <Link
              href={`/dashboard/clients/${id}/tasks`}
              className="inline-flex items-center rounded-[20px] px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors"
            >
              Tasks
            </Link>
            <Link
              href={`/dashboard/clients/${id}/reports`}
              className="inline-flex items-center rounded-[20px] px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors"
            >
              Reports
            </Link>
            <Link
              href={`/dashboard/clients/${id}/settings`}
              className="inline-flex items-center rounded-[20px] px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors"
            >
              Settings
            </Link>
          </div>

          <RunButton clientId={id} keywordCount={kwActive.length} />
        </div>
      </div>

      {/* ── Section 1: Metric Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-[20px] p-6 border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                {s.label}
              </span>
              <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>
                {s.value}
              </p>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground mt-4 pt-3 border-t border-border uppercase tracking-wider">
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Section 2: Gap Breakdown Grid ── */}
      {gapStats.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <span>Gap Breakdown — {results.length} Keyword{results.length !== 1 ? "s" : ""} (Latest Snapshot Each)</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gapStats.map((g) => (
              <div
                key={g.key}
                className="bg-card border border-border rounded-[20px] p-4 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{gapCounts[g.key]}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{g.label}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${g.color}`}>
                  {g.key.includes("loss") || g.key.includes("not_ranked") ? "ACTION" : "LOGGED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {kwActive.length === 0 && (
        <div className="rounded-[20px] border border-dashed border-border bg-card p-12 text-center shadow-xs">
          <Sparkles size={36} className="text-amber-500 mx-auto mb-3" />
          <p className="text-base font-bold text-foreground mb-1">No Active Keywords Tracked</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
            Add target search queries to trigger automated answer box audits and competitor visibility mapping.
          </p>
          <Link
            href={`/dashboard/clients/${id}/keywords/new`}
            className="inline-flex items-center gap-2 rounded-[20px] bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            <Plus size={15} /> ADD KEYWORDS
          </Link>
        </div>
      )}

      {/* ── Section 3: Opportunity Intelligence Panel ── */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <span>Keyword Opportunities</span>
                <span className="text-xs font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
                  Ranked by Priority
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate an AI brief or open a keyword diagnosis to view your battle plan against competitors.
              </p>
            </div>
            <Link
              href={`/dashboard/clients/${id}/results`}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:underline bg-card border border-border px-3.5 py-1.5 rounded-[20px] shadow-xs"
            >
              <span>View All Diagnostics</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <OpportunityPanel
            results={results}
            clientId={id}
            briefsByKeywordId={Object.fromEntries(
              kwAll
                .filter((k) => k.ai_brief)
                .map((k) => [k.id, k.ai_brief])
            )}
          />
        </div>
      )}

      {/* ── Section 4: Client Configuration Details Card ── */}
      <div className="rounded-[20px] border border-border bg-card p-6 shadow-xs">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
          <ShieldCheck size={16} className="text-amber-500" />
          <span>Client Architecture & Configuration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "Brand Anchor Name", value: client.brand_name },
            { label: "Target Location", value: (LOCATIONS[client.default_location as Location] ?? LOCATIONS.ae).label },
            { label: "Service Package", value: svc.label },
            { label: "Industry Category", value: client.industry },
            { label: "Operating Country", value: client.country },
            { label: "Onboarding Date", value: new Date(client.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} className="bg-muted-bg border border-border p-4 rounded-[20px]">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{row.label}</p>
              <p className="text-sm font-bold text-foreground mt-1">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
 );
}
