import Link from "next/link";
import TaskCard from "@/components/TaskCard";
import NewTaskButton from "@/components/NewTaskButton";
import type { TaskRow, CurrentTaskSignals } from "@/lib/tasks";
import { isTaskStale } from "@/lib/tasks";

interface Props {
 clientId: string;
 trackedKeywordId: string;
 tasks: TaskRow[];
 currentSignals: CurrentTaskSignals | null;
}

export default function KeywordTasksPanel({ clientId, trackedKeywordId, tasks, currentSignals }: Props) {
 const open = tasks.filter((t) => t.status === "todo" || t.status === "in_progress");
 const closed = tasks.filter((t) => t.status === "done" || t.status === "skipped");

 function stale(t: TaskRow): boolean {
 return currentSignals ? isTaskStale(t.context_snapshot, currentSignals) : false;
 }

 return (
 <div className="rounded-[20px] border border-gray-200 bg-card p-5">
 <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
 <div>
 <h3 className="text-base font-semibold text-gray-900">Tasks</h3>
 <p className="text-xs text-gray-500 mt-0.5">
 {open.length} open · {closed.length} closed. Generate a Task List report and click <strong>Import to tracker</strong>, or add tasks manually.
 </p>
 </div>
 <div className="flex items-center gap-2">
 <NewTaskButton clientId={clientId} trackedKeywordId={trackedKeywordId} label="+ Add task" />
 <Link
 href={`/dashboard/clients/${clientId}/tasks?status=open`}
 className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
 >
 Client view →
 </Link>
 </div>
 </div>

 {tasks.length === 0 ? (
 <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-6 text-center">
 <p className="text-xs text-gray-500">No tasks yet for this keyword.</p>
 <p className="text-[11px] text-gray-400 mt-1">Generate a Task List report above and import it, or click <strong>+ Add task</strong>.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {open.length > 0 && (
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Open ({open.length})</p>
 <div className="space-y-2">
 {open.map((t) => (
 <TaskCard key={t.id} task={t} isStale={stale(t)} />
 ))}
 </div>
 </div>
 )}

 {closed.length > 0 && (
 <details className="group [&_summary::-webkit-details-marker]:hidden">
 <summary className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
 <span>Closed ({closed.length})</span>
 <svg
 className="h-3 w-3 transition-transform duration-200 group-open:rotate-180"
 viewBox="0 0 20 20" fill="currentColor" aria-hidden
 >
 <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
 </svg>
 </summary>
 <div className="mt-2 space-y-2">
 {closed.map((t) => (
 <TaskCard key={t.id} task={t} />
 ))}
 </div>
 </details>
 )}
 </div>
 )}
 </div>
 );
}
