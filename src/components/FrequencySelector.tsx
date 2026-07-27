"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Frequency = "manual" | "daily" | "every_3_days" | "weekly";

const OPTIONS: Array<{ value: Frequency; label: string; desc: string }> = [
 { value: "manual", label: "Manual", desc: "Run only when you click Run Now" },
 { value: "daily", label: "Daily", desc: "Auto-run every 24 hours" },
 { value: "every_3_days",label: "Every 3 days",desc: "Auto-run every 72 hours" },
 { value: "weekly", label: "Weekly", desc: "Auto-run every 7 days" },
];

export default function FrequencySelector({ clientId, current }: { clientId: string; current: string }) {
 const [selected, setSelected] = useState<Frequency>((current as Frequency) ?? "manual");
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);

 async function handleChange(val: Frequency) {
 if (val === selected) return;
 setSelected(val);
 setSaving(true);
 setSaved(false);

 const supabase = createClient();
 await supabase
 .from("clients")
 .update({ check_frequency: val })
 .eq("id", clientId);

 setSaving(false);
 setSaved(true);
 setTimeout(() => setSaved(false), 2000);
 }

 return (
 <div className="rounded-[20px] border border-gray-200 bg-card p-5">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Check Frequency</h2>
 {saving && <span className="text-xs text-gray-500 animate-pulse">Saving...</span>}
 {saved && <span className="text-xs text-green-700">✓ Saved</span>}
 </div>

 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
 {OPTIONS.map((opt) => (
 <button
 key={opt.value}
 onClick={() => handleChange(opt.value)}
 className={`rounded-lg border p-3 text-left transition-all ${
 selected === opt.value
 ? "border-amber-500 bg-amber-50"
 : "border-gray-300 hover:border-gray-400"
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <p className="text-xs font-semibold text-gray-900">{opt.label}</p>
 {selected === opt.value && <span className="text-amber-700 text-xs">✓</span>}
 </div>
 <p className="text-xs text-gray-500 leading-tight">{opt.desc}</p>
 </button>
 ))}
 </div>

 {selected !== "manual" && (
 <p className="mt-3 text-xs text-gray-500">
 Auto-run requires the daily pipeline to be configured. For now, use <span className="text-amber-700">Run Now</span> to trigger manually.
 </p>
 )}
 </div>
 );
}
