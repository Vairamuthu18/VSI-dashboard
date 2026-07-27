import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { SERVICE_TYPE_LABELS, TRACK_TYPE_CONFIG, LOCATIONS } from "@/types/search";
import type { ServiceType, TrackType, Location } from "@/types/search";
import { Plus, ArrowRight, Sparkles } from "lucide-react";

export default async function KeywordsPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const supabase = await createClient();
 const session = await requireAgency();

 const isSuperAdmin = session.role === "super_admin";
 const clientQ = supabase.from("clients").select("id, name, service_type, default_location").eq("id", id);
 const { data: client } = await (isSuperAdmin ? clientQ : clientQ.eq("agency_id", session.agencyId)).single();

 if (!client) notFound();

 const { data: keywords } = await supabase
 .from("tracked_keywords")
 .select("*")
 .eq("client_id", id)
 .order("created_at", { ascending: false });

 const kws = keywords ?? [];
 const svc = SERVICE_TYPE_LABELS[client.service_type as ServiceType];

 return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-muted-foreground">
            <Link href={`/dashboard/clients/${id}`} className="hover:text-amber-500 transition-colors font-medium">
              {client.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-bold">Keywords & Queries</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Tracked Keywords</h1>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
              {svc.short}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {kws.filter((k) => k.is_active).length} Active · {kws.length} Total
            </span>
          </div>
        </div>

        <Link
          href={`/dashboard/clients/${id}/keywords/new`}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
        >
          <Plus size={15} />
          <span>ADD KEYWORDS</span>
        </Link>
      </div>

      {kws.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border bg-card p-16 text-center shadow-xs">
          <Sparkles size={36} className="text-amber-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-foreground mb-1">No Keywords Tracked Yet</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
            Add target search terms or AI queries to start tracking visibility and AI answer citations.
          </p>
          <Link
            href={`/dashboard/clients/${id}/keywords/new`}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition-colors"
          >
            <Plus size={15} /> ADD KEYWORDS
          </Link>
        </div>
      ) : (
        <div className="rounded-[20px] border border-border bg-card overflow-hidden shadow-xs">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-muted-bg text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-5">Keyword / Query</div>
            <div className="col-span-2">Track Type</div>
            <div className="col-span-2">Target Location</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Inspect</div>
          </div>

          {kws.map((kw) => {
            const tt = TRACK_TYPE_CONFIG[kw.track_type as TrackType];
            return (
              <Link
                key={kw.id}
                href={`/dashboard/clients/${id}/keywords/${kw.id}`}
                className="group grid grid-cols-12 gap-3 px-6 py-4 border-t border-border items-center hover:bg-muted-bg/50 transition-all"
              >
                <div className="col-span-5 min-w-0">
                  <p className="text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors truncate">
                    {kw.keyword}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{kw.domain}</p>
                </div>
                <div className="col-span-2">
                  <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase">
                    {tt?.label ?? "AI Mode"}
                  </span>
                </div>
                <div className="col-span-2 text-xs font-medium text-muted-foreground">
                  {(LOCATIONS[kw.location as Location] ?? LOCATIONS.ae).label}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    kw.is_active
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-muted-bg text-muted-foreground border border-border"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${kw.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    {kw.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
 );
}
