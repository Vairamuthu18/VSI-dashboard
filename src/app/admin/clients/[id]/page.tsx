import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import AdminClientEnginesForm from "@/components/AdminClientEnginesForm";
import ClientIdentityForm from "@/components/ClientIdentityForm";

export const dynamic = "force-dynamic";

export default async function AdminClientPage({ params }: { params: Promise<{ id: string }> }) {
 await requireSuperAdmin();
 const { id } = await params;
 const supabase = await createClient();

 const { data: client } = await supabase
 .from("clients")
 .select("id, name, brand_name, website, ai_mode_enabled, ai_overview_enabled, rank_tracking_enabled, chatgpt_enabled, llm_mentions_enabled, agency_id, agencies(name, display_name)")
 .eq("id", id)
 .maybeSingle();
 if (!client) notFound();

 type Agency = { name: string; display_name: string | null };
 const agencyArr = client.agencies as unknown as Agency | Agency[] | null;
 const agency = Array.isArray(agencyArr) ? agencyArr[0] ?? null : agencyArr;

 return (
 <div className="p-4 sm:p-8 max-w-3xl space-y-6 text-white">
 <div>
 <div className="flex items-center gap-2 mb-0.5 text-sm text-gray-500">
 <Link href="/admin/agencies" className="hover:text-gray-300">Agencies</Link>
 <span className="text-gray-600">/</span>
 {agency && (
 <>
 <span className="text-gray-400">{agency.display_name ?? agency.name}</span>
 <span className="text-gray-600">/</span>
 </>
 )}
 <span className="text-white">{client.brand_name ?? client.name}</span>
 </div>
 <h1 className="text-xl font-semibold text-white">{client.brand_name ?? client.name}</h1>
 <p className="text-xs text-gray-400 mt-1">
 Super-admin controls for this client. Agencies don&rsquo;t see these toggles in their own settings.
 </p>
 </div>

 <ClientIdentityForm
 clientId={id}
 scope="admin"
 initial={{
 website: client.website as string | null,
 brand_name: client.brand_name as string | null,
 }}
 />

 <AdminClientEnginesForm
 clientId={id}
 initial={{
 ai_mode_enabled: client.ai_mode_enabled,
 ai_overview_enabled: client.ai_overview_enabled,
 rank_tracking_enabled: client.rank_tracking_enabled,
 chatgpt_enabled: client.chatgpt_enabled,
 llm_mentions_enabled: client.llm_mentions_enabled,
 }}
 />

 <Link
 href={`/dashboard/clients/${id}`}
 className="inline-block text-xs text-[#FF4500] hover:text-[#E03E00] transition-colors"
 >
 Open this client&rsquo;s dashboard →
 </Link>
 </div>
 );
}
