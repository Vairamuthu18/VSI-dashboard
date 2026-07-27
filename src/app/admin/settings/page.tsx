import { getAllSettings } from "@/lib/settings";
import SettingsToggles from "@/components/admin/SettingsToggles";

export default async function AdminSettingsPage() {
 const settings = await getAllSettings();

 return (
 <div className="p-8 max-w-3xl text-white">
 <div className="mb-6">
 <h1 className="text-xl font-semibold text-white">System Settings</h1>
 <p className="text-xs text-gray-400 mt-1">Pipeline-wide toggles. Changes apply to all agencies on the next run.</p>
 </div>

 <SettingsToggles initial={settings as Record<string, boolean>} />
 </div>
 );
}
