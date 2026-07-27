import { createClient } from "@/lib/supabase/server";
import type { AIOCitation, OrganicResult } from "@/types/search";

export type ChatScope =
  | { kind: "keyword"; clientId: string; keywordId: string }
  | { kind: "client"; clientId: string }
  | { kind: "global" };

// Hard cap — we keep the system prompt under ~8k tokens so free models work.
const MAX_AIO_CHARS = 2200;
const MAX_SERP_ITEMS = 10;
const MAX_CITATIONS = 20;
const MAX_KEYWORDS_PER_CLIENT = 30;
const MAX_CLIENTS_GLOBAL = 20;

function fmtSerp(serp: OrganicResult[] | null | undefined): string {
  if (!serp || serp.length === 0) return "(none)";
  return serp.slice(0, MAX_SERP_ITEMS).map((r) => {
    const snippet = r.snippet ? r.snippet.replace(/\s+/g, " ").slice(0, 160) : "";
    return `${r.position}. ${r.title} — ${r.domain}\n   ${snippet}`;
  }).join("\n");
}

function fmtCitations(c: AIOCitation[] | null | undefined): string {
  if (!c || c.length === 0) return "(none)";
  return c.slice(0, MAX_CITATIONS).map((x) => {
    const flag = x.isClient ? " ← CLIENT" : "";
    return `${x.position}. ${x.sourceName || x.domain}${flag} (${x.domain})`;
  }).join("\n");
}

export async function buildChatContext(opts: {
  agencyId: string;
  scope: ChatScope;
}): Promise<{ contextText: string; scopeLabel: string }> {
  const supabase = await createClient();
  const { scope, agencyId } = opts;

  // Open tasks (used by all scopes — adds the "execution" view to chat answers)
  async function fetchOpenTasksFor(scopeKey: { tracked_keyword_id?: string; client_id?: string }) {
    let q = supabase
      .from("tasks")
      .select("title, group_name, owner, status, effort, impact, due_date, tracked_keywords(keyword)")
      .eq("agency_id", agencyId)
      .in("status", ["todo", "in_progress"])
      .order("priority", { ascending: true })
      .limit(20);
    if (scopeKey.tracked_keyword_id) q = q.eq("tracked_keyword_id", scopeKey.tracked_keyword_id);
    else if (scopeKey.client_id) q = q.eq("client_id", scopeKey.client_id);
    const { data } = await q;
    if (!data || data.length === 0) return "(no open tasks)";
    return data.map((t) => {
      const kw = Array.isArray(t.tracked_keywords) ? t.tracked_keywords[0]?.keyword : (t.tracked_keywords as { keyword: string } | null)?.keyword;
      const due = t.due_date ? ` · due ${new Date(t.due_date).toISOString().slice(0, 10)}` : "";
      const owner = t.owner ? ` [${t.owner}]` : "";
      const kwBit = kw && !scopeKey.tracked_keyword_id ? ` ("${kw}")` : "";
      return `- ${t.status === "in_progress" ? "▶" : "○"} ${t.title}${owner} · ${t.group_name} · effort=${t.effort ?? "?"}${due}${kwBit}`;
    }).join("\n");
  }

  if (scope.kind === "keyword") {
    const { data: kw } = await supabase
      .from("tracked_keywords")
      .select("id, keyword, track_type, location, clients(name, brand_name, website, industry, country)")
      .eq("id", scope.keywordId)
      .eq("agency_id", agencyId)
      .maybeSingle();
    if (!kw) return { contextText: "(keyword not found)", scopeLabel: "Keyword" };

    const clientArr = kw.clients as unknown as Array<{ name: string; brand_name: string | null; website: string | null; industry: string | null; country: string | null }> | { name: string; brand_name: string | null; website: string | null; industry: string | null; country: string | null } | null;
    const client = Array.isArray(clientArr) ? clientArr[0] : clientArr;

    const { data: runs } = await supabase
      .from("search_results")
      .select("rank_position, aio_present, client_cited, mentioned_in_text, cited_domains, aio_full_text, aio_snippet, citations_json, serp_results_json, gap_label, created_at")
      .eq("tracked_keyword_id", scope.keywordId)
      .order("created_at", { ascending: false })
      .limit(5);

    const latest = runs?.[0];
    const previous = runs?.[1];

    if (!latest) {
      return {
        contextText: `Client: ${client?.brand_name ?? client?.name}\nKeyword: "${kw.keyword}"\nNo pipeline runs yet — no data to analyse.`,
        scopeLabel: kw.keyword as string,
      };
    }

    const aioText = (latest.aio_full_text ?? latest.aio_snippet ?? "") as string;
    const prevRank = previous?.rank_position ?? null;
    const rankDelta = latest.rank_position && prevRank ? prevRank - latest.rank_position : null;

    const context = [
      `# Keyword in scope`,
      `Client: ${client?.brand_name ?? client?.name} (${client?.website ?? ""})`,
      `Industry: ${client?.industry ?? "—"} · Country: ${client?.country ?? "—"}`,
      `Tracked keyword: "${kw.keyword}" · type: ${kw.track_type} · location: ${kw.location ?? "—"}`,
      ``,
      `# Latest snapshot (${new Date(latest.created_at).toISOString().slice(0, 10)})`,
      `- Google rank: ${latest.rank_position ?? "Not ranking"}${rankDelta != null ? ` (was #${prevRank}, ${rankDelta >= 0 ? "+" : ""}${rankDelta})` : ""}`,
      `- AI Mode triggered: ${latest.aio_present ? "Yes" : "No"}`,
      `- Client cited as source: ${latest.client_cited ? "Yes" : "No"}`,
      `- Client mentioned in AIO text: ${latest.mentioned_in_text ? "Yes" : "No"}`,
      `- Gap classification: ${(latest.gap_label as string).replace(/_/g, " ")}`,
      `- Cited competitor domains: ${(latest.cited_domains as string[] | null)?.slice(0, 10).join(", ") || "none"}`,
      ``,
      `## Google SERP — top 10 organic`,
      fmtSerp(latest.serp_results_json as OrganicResult[] | null),
      ``,
      `## AIO citations (ordered)`,
      fmtCitations(latest.citations_json as AIOCitation[] | null),
      ``,
      `## AIO answer text (verbatim from Google)`,
      aioText ? `"""\n${aioText.slice(0, MAX_AIO_CHARS)}\n"""` : "(none)",
      ``,
      `## Open tasks for this keyword`,
      await fetchOpenTasksFor({ tracked_keyword_id: scope.keywordId }),
    ].join("\n");

    return { contextText: context, scopeLabel: kw.keyword as string };
  }

  if (scope.kind === "client") {
    const { data: client } = await supabase
      .from("clients")
      .select("id, name, brand_name, website, industry, country, service_type")
      .eq("id", scope.clientId)
      .eq("agency_id", agencyId)
      .maybeSingle();
    if (!client) return { contextText: "(client not found)", scopeLabel: "Client" };

    const { data: results } = await supabase
      .from("search_results")
      .select("keyword, track_type, rank_position, aio_present, client_cited, mentioned_in_text, gap_label, cited_domains, created_at")
      .eq("client_id", scope.clientId)
      .order("created_at", { ascending: false })
      .limit(500);

    // dedupe to latest per (keyword, track_type)
    const seen = new Set<string>();
    const latestPerKw: NonNullable<typeof results> = [];
    for (const r of results ?? []) {
      const k = `${r.keyword}::${r.track_type}`;
      if (seen.has(k)) continue;
      seen.add(k);
      latestPerKw.push(r);
    }

    const slice = latestPerKw.slice(0, MAX_KEYWORDS_PER_CLIENT);

    const context = [
      `# Client in scope`,
      `${client.brand_name ?? client.name} (${client.website ?? ""})`,
      `Industry: ${client.industry ?? "—"} · Country: ${client.country ?? "—"} · Package: ${client.service_type}`,
      ``,
      `# Keyword portfolio — ${latestPerKw.length} unique keywords${latestPerKw.length > MAX_KEYWORDS_PER_CLIENT ? ` (showing latest ${MAX_KEYWORDS_PER_CLIENT})` : ""}`,
      ...slice.map((r) => {
        const rank = r.rank_position ? `#${r.rank_position}` : "—";
        const ai = r.client_cited ? "cited" : r.mentioned_in_text ? "mentioned" : r.aio_present ? "invisible" : "no AIO";
        const top3 = (r.cited_domains as string[] | null)?.slice(0, 3).join(", ") || "—";
        return `- "${r.keyword}" [${r.track_type}] rank ${rank} · AI: ${ai} · gap: ${(r.gap_label as string).replace(/_/g, " ")} · cited: ${top3}`;
      }),
      ``,
      `# Open tasks for this client`,
      await fetchOpenTasksFor({ client_id: scope.clientId }),
    ].join("\n");

    return { contextText: context, scopeLabel: client.brand_name ?? client.name as string };
  }

  // global
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, brand_name, website, industry, country, service_type")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: true })
    .limit(MAX_CLIENTS_GLOBAL);

  const { data: results } = await supabase
    .from("search_results")
    .select("client_id, keyword, track_type, gap_label, created_at")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })
    .limit(2000);

  // count gaps per client (latest snapshot per kw only)
  const seen = new Set<string>();
  const gapByClient = new Map<string, Record<string, number>>();
  for (const r of results ?? []) {
    const k = `${r.client_id}::${r.keyword}::${r.track_type}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const counts = gapByClient.get(r.client_id as string) ?? {};
    counts[r.gap_label as string] = (counts[r.gap_label as string] ?? 0) + 1;
    gapByClient.set(r.client_id as string, counts);
  }

  const context = [
    `# Agency portfolio — ${clients?.length ?? 0} clients`,
    ...(clients ?? []).map((c) => {
      const counts = gapByClient.get(c.id as string) ?? {};
      const summary = Object.entries(counts).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join(" · ");
      return `- ${c.brand_name ?? c.name} [${c.service_type}] (${c.industry ?? "—"} / ${c.country ?? "—"}) — ${summary || "no runs yet"}`;
    }),
    ``,
    `# Open tasks across all clients (top 20 by priority)`,
    await fetchOpenTasksFor({}),
  ].join("\n");

  return { contextText: context, scopeLabel: "All clients" };
}
