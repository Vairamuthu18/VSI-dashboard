"use client";

export default function PrintButton({ color }: { color: string }) {
 return (
 <button
 type="button"
 onClick={() => window.print()}
 className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
 style={{ backgroundColor: color }}
 >
 Save as PDF
 </button>
 );
}
