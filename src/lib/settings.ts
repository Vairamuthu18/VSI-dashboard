import { createClient } from "@/lib/supabase/server";

export type SystemSettingKey =
  | "chatgpt_api_enabled"
  | "default_check_frequency"
  | "openai_chatgpt_model"
  | "openai_search_enabled"
  | "openai_reports_enabled"
  | "openai_summary_model"
  | "openai_tasks_model"
  | "openai_citation_enabled"
  | "openai_citation_model";

const DEFAULTS: Record<SystemSettingKey, unknown> = {
  chatgpt_api_enabled: true,
  default_check_frequency: "weekly",
  openai_chatgpt_model: "gpt-4o-mini",
  openai_search_enabled: false,
  // Master toggle for routing keyword reports through OpenAI directly
  // (instead of the free OpenRouter fallback chain). Model is then
  // chosen per report-type below — summary/detailed are short and don't
  // need a strong model; task lists do.
  openai_reports_enabled: false,
  openai_summary_model: "gpt-4o-mini", // Executive Summary + Detailed Strategy
  openai_tasks_model:   "gpt-4o",      // Task List — ticket quality matters
  // Citation Strategy is the blueprint everything else feeds off — use a
  // strong model when the OpenAI route is enabled.
  openai_citation_enabled: false,
  openai_citation_model:   "gpt-4o",
};

/**
 * Read a system setting. Falls back to a hard-coded default if the row is
 * missing or the read fails, so the pipeline never breaks because of a
 * misconfigured settings table.
 */
export async function getSetting<T = unknown>(key: SystemSettingKey): Promise<T> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (data && data.value !== undefined && data.value !== null) {
      return data.value as T;
    }
  } catch {
    // fall through
  }
  return DEFAULTS[key] as T;
}

export async function getAllSettings(): Promise<Record<SystemSettingKey, unknown>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("system_settings")
    .select("key, value");

  const out = { ...DEFAULTS };
  for (const row of data ?? []) {
    if ((row.key as string) in out) {
      out[row.key as SystemSettingKey] = row.value;
    }
  }
  return out;
}
