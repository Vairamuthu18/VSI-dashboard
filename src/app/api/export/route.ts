import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
 try {
 const { searchParams } = new URL(request.url);
 const format = searchParams.get("format") || "json";
 const agencyId = searchParams.get("agencyId");

 const supabase = await createClient();

 let query = supabase
 .from("search_results")
 .select("gap_label, client_id, keyword, track_type, rank_position, aio_present, client_cited, mentioned_in_text, created_at")
 .order("created_at", { ascending: false })
 .limit(1000);

 if (agencyId) {
 query = query.eq("agency_id", agencyId);
 }

 const { data: results, error } = await query;

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }

 if (format === "csv") {
 const headers = ["Keyword Query", "Client ID", "Track Type", "Google Rank Position", "AI Overview Present", "AI Classification", "Created At"];
 const csvRows = [
 headers.join(","),
 ...(results || []).map((r) => [
 `"${(r.keyword || "").replace(/"/g, '""')}"`,
 `"${(r.client_id || "").replace(/"/g, '""')}"`,
 `"${(r.track_type || "").replace(/"/g, '""')}"`,
 r.rank_position ? r.rank_position : "N/A",
 r.aio_present ? "Yes" : "No",
 `"${(r.gap_label || "").replace(/"/g, '""')}"`,
 `"${r.created_at}"`,
 ].join(","))
 ];

 return new NextResponse(csvRows.join("\n"), {
 headers: {
 "Content-Type": "text/csv",
 "Content-Disposition": `attachment; filename="searchintel_export_${Date.now()}.csv"`,
 },
 });
 }

 return NextResponse.json({
 success: true,
 count: results?.length || 0,
 timestamp: new Date().toISOString(),
 data: results || [],
 });
 } catch (err: unknown) {
 const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
 return NextResponse.json({ error: errorMessage }, { status: 500 });
 }
}
