"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normaliseDomain } from "@/lib/url-input";
import {
  SERVICE_TYPE_LABELS, TRACK_TYPE_CONFIG,
  INDUSTRIES, COUNTRIES, LOCATIONS,
} from "@/types/search";
import type { ServiceType, TrackType, Location } from "@/types/search";

// ─── Types ───────────────────────────────────────────────────
interface ClientDetails {
  name: string;
  website: string;
  brand_name: string;
  industry: string;
  country: string;
  default_location: Location;
}

interface KeywordRow {
  keyword: string;
  track_type: TrackType;
  location: Location;
}

// ─── Step indicator ──────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = ["Client Details", "Add Queries"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all border ${
                done ? "bg-amber-500 text-white border-amber-500 shadow-xs" :
                active ? "bg-amber-500 text-white border-amber-500 shadow-xs ring-4 ring-amber-500/20" :
                "bg-background text-muted-foreground border-border"
              }`}>
                {done ? "✓" : n}
              </div>
              <span className={`mt-1.5 text-xs font-semibold ${active || done ? "text-foreground font-bold" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 mx-3 mb-4 ${done ? "bg-amber-500" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main wizard ─────────────────────────────────────────────
export default function NewClientPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [details, setDetails] = useState<ClientDetails>({
    name: "", website: "", brand_name: "",
    industry: "", country: "United Arab Emirates",
    default_location: "ae",
  });

  const serviceType: ServiceType = "geo";

  // Step 2 state
  const [pasteInput, setPasteInput] = useState("");
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [parsed, setParsed] = useState(false);

  function handleDetailsChange(field: keyof ClientDetails, value: string) {
    setDetails((d) => ({ ...d, [field]: value }));
    if (field === "name" && !details.brand_name) {
      setDetails((d) => ({ ...d, name: value, brand_name: value }));
    }
  }

  function step1Valid() {
    return !!details.name.trim() && normaliseDomain(details.website) !== null;
  }

  const defaultTrackType: TrackType = "geo";

  function parseKeywords() {
    const lines = pasteInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const unique = [...new Set(lines)];
    setKeywords(unique.map((kw) => ({
      keyword: kw,
      track_type: defaultTrackType,
      location: details.default_location,
    })));
    setParsed(true);
  }

  function updateKeyword(i: number, field: keyof KeywordRow, value: string) {
    setKeywords((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function removeKeyword(i: number) {
    setKeywords((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();
      const agencyId = profile?.agency_id;
      if (!agencyId) throw new Error("Agency not configured — complete onboarding first");

      const normalised = normaliseDomain(details.website);
      if (!normalised) {
        throw new Error("Enter a valid website like example.com");
      }
      const cleanWebsite = normalised.domain;

      const { data: client, error: clientErr } = await supabase
        .from("clients")
        .insert({
          name: details.name.trim(),
          website: cleanWebsite,
          brand_name: details.brand_name.trim() || details.name.trim(),
          service_type: serviceType,
          country: details.country || null,
          industry: details.industry || null,
          default_location: details.default_location,
          agency_id: agencyId,
        })
        .select("id")
        .single();

      if (clientErr) {
        if (clientErr.message?.includes("AGENCY_CLIENT_CAP_REACHED")) {
          throw new Error(
            "Your plan only allows a limited number of clients. Contact your account manager to upgrade."
          );
        }
        throw new Error(clientErr.message);
      }

      if (keywords.length > 0) {
        const rows = keywords.map((kw) => ({
          client_id: client.id,
          agency_id: agencyId,
          keyword: kw.keyword,
          domain: cleanWebsite,
          brand: details.brand_name.trim() || details.name.trim(),
          track_type: kw.track_type,
          location: kw.location,
        }));

        const { error: kwErr } = await supabase
          .from("tracked_keywords")
          .insert(rows);

        if (kwErr) throw new Error(kwErr.message);
      }

      router.push(`/dashboard/clients/${client.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client");
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Add New Client</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Set up tracking for a new client in 2 steps</p>
      </div>

      <StepIndicator current={step} />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500 font-medium">
          {error}
        </div>
      )}

      {/* ── Step 1: Client Details ── */}
      {step === 1 && (
        <div className="rounded-[20px] border border-border bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Client Details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Client / Company Name *</label>
              <input
                type="text"
                value={details.name}
                onChange={(e) => handleDetailsChange("name", e.target.value)}
                placeholder="e.g. United SEO"
                className="w-full rounded-[14px] border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Website / Domain *</label>
              <input
                type="text"
                value={details.website}
                onChange={(e) => handleDetailsChange("website", e.target.value)}
                placeholder="e.g. unitedseo.ae"
                className={`w-full rounded-[14px] border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                  details.website.trim() && !normaliseDomain(details.website)
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-border focus:border-amber-500"
                }`}
              />
              {details.website.trim() && !normaliseDomain(details.website) && (
                <p className="mt-1 text-xs text-rose-500">
                  Enter a full domain like <span className="font-mono">example.com</span> — no need for <span className="font-mono">https://</span>.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Brand Name
                <span className="ml-1 text-muted-foreground font-normal">(for AIO text detection)</span>
              </label>
              <input
                type="text"
                value={details.brand_name}
                onChange={(e) => handleDetailsChange("brand_name", e.target.value)}
                placeholder="e.g. United SEO"
                className="w-full rounded-[14px] border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Industry</label>
              <select
                value={details.industry}
                onChange={(e) => handleDetailsChange("industry", e.target.value)}
                className="w-full rounded-[14px] border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none transition-colors"
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Country</label>
              <select
                value={details.country}
                onChange={(e) => handleDetailsChange("country", e.target.value)}
                className="w-full rounded-[14px] border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none transition-colors"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Default Search Location</label>
              <select
                value={details.default_location}
                onChange={(e) => handleDetailsChange("default_location", e.target.value)}
                className="w-full rounded-[14px] border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none transition-colors"
              >
                {(Object.entries(LOCATIONS) as [Location, typeof LOCATIONS[Location]][]).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid()}
              className="rounded-full bg-amber-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
            >
              Next: Add Queries →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Queries ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-[20px] border border-border bg-card p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-foreground">Queries to Track</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Paste search queries to monitor in AI Mode, one per line.
              </p>
            </div>

            <div>
              <textarea
                value={pasteInput}
                onChange={(e) => { setPasteInput(e.target.value); setParsed(false); }}
                rows={8}
                placeholder={"what are the best seo agencies in dubai?\nwho should I hire for seo in uae?\nbest digital marketing agency dubai 2026"}
                className="w-full rounded-[14px] border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none transition-colors font-mono"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground font-medium">
                  {pasteInput.split("\n").filter((l) => l.trim()).length} lines
                </p>
                <button
                  onClick={parseKeywords}
                  disabled={!pasteInput.trim()}
                  className="rounded-full bg-muted-bg border border-border px-3.5 py-1.5 text-xs font-bold text-foreground hover:border-amber-500/50 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Parse & Preview
                </button>
              </div>
            </div>

            {/* Parsed preview table */}
            {parsed && keywords.length > 0 && (
              <div>
                <p className="text-xs font-bold text-foreground mb-2">{keywords.length} keyword{keywords.length !== 1 ? "s" : ""} ready to import</p>
                <div className="rounded-[14px] border border-border overflow-hidden max-h-72 overflow-y-auto">
                  <div className="grid grid-cols-12 gap-2 px-3.5 py-2 bg-muted-bg text-xs text-muted-foreground font-bold uppercase sticky top-0 border-b border-border">
                    <div className="col-span-6">Keyword / Query</div>
                    <div className="col-span-3">Track Type</div>
                    <div className="col-span-2">Location</div>
                    <div className="col-span-1" />
                  </div>
                  {keywords.map((kw, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 px-3.5 py-2.5 border-b border-border items-center last:border-0 bg-card">
                      <div className="col-span-6 text-xs font-medium text-foreground truncate">{kw.keyword}</div>
                      <div className="col-span-3">
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-bold border bg-amber-500/10 text-amber-500 border-amber-500/20">
                          AI Mode
                        </span>
                      </div>
                      <div className="col-span-2">
                        <select
                          value={kw.location}
                          onChange={(e) => updateKeyword(i, "location", e.target.value)}
                          className="w-full rounded-[10px] border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-amber-500"
                        >
                          {(Object.entries(LOCATIONS) as [Location, typeof LOCATIONS[Location]][]).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => removeKeyword(i)} className="text-muted-foreground hover:text-rose-500 text-xs font-bold transition-colors">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="rounded-full border border-border bg-card px-5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors">
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full border border-border bg-muted-bg px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                {saving ? "Saving..." : "Skip queries for now"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || keywords.length === 0}
                className="rounded-full bg-amber-500 px-6 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                {saving ? "Saving..." : `Save Client + ${keywords.length} quer${keywords.length !== 1 ? "ies" : "y"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
