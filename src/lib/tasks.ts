// Shared types + UI metadata for the built-in task tracker.

export type TaskStatus = "todo" | "in_progress" | "done" | "skipped";
export type TaskGroup = "Content" | "Technical" | "Off-page";
export type TaskOwner = "Writer" | "Developer" | "SEO" | "Outreach";
export type TaskEffort = "S" | "M" | "L";
export type TaskImpact = "low" | "medium" | "high";

export interface AcceptanceCriterion {
  text: string;
  done: boolean;
}

export type TaskOutcome = "verified" | "regressed" | "neutral";

export interface TaskContextSnapshot {
  rankPosition: number | null;
  gapLabel: string;
  aioPresent: boolean | null;
  clientCited: boolean | null;
  citedDomainCount: number;
  capturedAt: string;
}

export interface TaskRow {
  id: string;
  agency_id: string;
  client_id: string;
  tracked_keyword_id: string | null;
  source_report_id: string | null;
  group_name: TaskGroup;
  owner: TaskOwner | null;
  title: string;
  description: string | null;
  acceptance: AcceptanceCriterion[];
  effort: TaskEffort | null;
  impact: TaskImpact | null;
  status: TaskStatus;
  priority: number;
  due_date: string | null;
  notes: string | null;
  context_snapshot: TaskContextSnapshot | null;
  outcome_status: TaskOutcome | null;
  outcome_checked_at: string | null;
  outcome_note: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const STATUS_META: Record<TaskStatus, { label: string; chip: string; dot: string }> = {
  todo:         { label: "To do",        chip: "bg-gray-100 text-gray-700",   dot: "bg-gray-400"   },
  in_progress:  { label: "In progress",  chip: "bg-blue-100 text-blue-700",   dot: "bg-blue-500"   },
  done:         { label: "Done",         chip: "bg-green-100 text-green-700", dot: "bg-green-500"  },
  skipped:      { label: "Skipped",      chip: "bg-gray-100 text-gray-500",   dot: "bg-gray-300"   },
};

export const GROUP_META: Record<TaskGroup, { chip: string }> = {
  Content:     { chip: "bg-blue-50 text-blue-700 border-blue-200" },
  Technical:   { chip: "bg-purple-50 text-purple-700 border-purple-200" },
  "Off-page":  { chip: "bg-green-50 text-green-700 border-green-200" },
};

export const OWNER_META: Record<TaskOwner, { chip: string }> = {
  Writer:     { chip: "bg-indigo-100 text-indigo-700" },
  Developer:  { chip: "bg-purple-100 text-purple-700" },
  SEO:        { chip: "bg-amber-100 text-amber-700" },
  Outreach:   { chip: "bg-green-100 text-green-700" },
};

export const EFFORT_LABEL: Record<TaskEffort, string> = {
  S: "S · hours",
  M: "M · 1-2 days",
  L: "L · 3+ days",
};

export function acceptanceProgress(ac: AcceptanceCriterion[]): { done: number; total: number; pct: number } {
  const total = ac.length;
  const done = ac.filter((c) => c.done).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

// ── Stale detection ──────────────────────────────────────────
// Mirrors the brief-staleness thresholds so the same "context shifted"
// signal feels consistent across the app.
const RANK_DELTA_THRESHOLD = 3;
const CITED_DELTA_THRESHOLD = 2;

export interface CurrentTaskSignals {
  rankPosition: number | null;
  gapLabel: string;
  aioPresent: boolean | null;
  clientCited: boolean | null;
  citedDomainCount: number;
}

export function isTaskStale(snapshot: TaskContextSnapshot | null | undefined, current: CurrentTaskSignals): boolean {
  if (!snapshot) return false;
  if (snapshot.gapLabel !== current.gapLabel) return true;
  if (snapshot.clientCited !== current.clientCited) return true;
  if (snapshot.aioPresent !== current.aioPresent) return true;

  const a = snapshot.rankPosition, b = current.rankPosition;
  if (a == null && b != null) return true;
  if (a != null && b == null) return true;
  if (a != null && b != null && Math.abs(a - b) >= RANK_DELTA_THRESHOLD) return true;

  if (Math.abs(snapshot.citedDomainCount - current.citedDomainCount) >= CITED_DELTA_THRESHOLD) return true;

  return false;
}
