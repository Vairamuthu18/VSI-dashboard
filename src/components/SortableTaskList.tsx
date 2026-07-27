"use client";

import { useState } from "react";
import {
 DndContext, closestCenter, KeyboardSensor, PointerSensor,
 useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
 SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "@/components/TaskCard";
import type { TaskRow } from "@/lib/tasks";

interface DisplayRow {
 task: TaskRow;
 isStale?: boolean;
 keywordLabel?: string | null;
 keywordHref?: string | null;
}

interface Props {
 rows: DisplayRow[];
}

function SortableRow({ row }: { row: DisplayRow }) {
 const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.task.id });
 const style = {
 transform: CSS.Transform.toString(transform),
 transition,
 opacity: isDragging ? 0.5 : 1,
 };
 return (
 <div ref={setNodeRef} style={style} className="flex items-stretch gap-2">
 <button
 {...attributes}
 {...listeners}
 aria-label="Drag to reorder"
 className="shrink-0 self-stretch rounded-md px-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-colors flex items-center"
 >
 <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
 <circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/>
 <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
 <circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/>
 </svg>
 </button>
 <div className="flex-1 min-w-0">
 <TaskCard
 task={row.task}
 keywordLabel={row.keywordLabel}
 keywordHref={row.keywordHref}
 isStale={row.isStale}
 />
 </div>
 </div>
 );
}

export default function SortableTaskList({ rows: initial }: Props) {
 const [rows, setRows] = useState(initial);
 const sensors = useSensors(
 useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
 useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
 );

 async function onDragEnd(e: DragEndEvent) {
 const { active, over } = e;
 if (!over || active.id === over.id) return;
 const oldIdx = rows.findIndex((r) => r.task.id === active.id);
 const newIdx = rows.findIndex((r) => r.task.id === over.id);
 if (oldIdx < 0 || newIdx < 0) return;
 const next = rows.slice();
 const [moved] = next.splice(oldIdx, 1);
 next.splice(newIdx, 0, moved);
 setRows(next); // optimistic

 try {
 await fetch("/api/tasks/reorder", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ order: next.map((r) => r.task.id) }),
 });
 } catch {
 // If the network fails, the next page load will reflect the server's order.
 }
 }

 return (
 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
 <SortableContext items={rows.map((r) => r.task.id)} strategy={verticalListSortingStrategy}>
 <div className="space-y-2">
 {rows.map((r) => <SortableRow key={r.task.id} row={r} />)}
 </div>
 </SortableContext>
 </DndContext>
 );
}
