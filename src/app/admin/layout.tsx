import { requireSuperAdmin } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import ChatFloating from "@/components/ChatFloating";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
 await requireSuperAdmin();

 return (
 <div className="min-h-screen bg-[#111111] p-2 sm:p-5 font-sans text-gray-200" suppressHydrationWarning>
 <div className="max-w-[1400px] mx-auto bg-[#1C1C1E] rounded-[2.5rem] p-5 lg:p-7 shadow-2xl border border-white/5 min-h-[calc(100vh-2.5rem)]">
 <AdminNav />
 <main>{children}</main>
 </div>
 <ChatFloating />
 </div>
 );
}
