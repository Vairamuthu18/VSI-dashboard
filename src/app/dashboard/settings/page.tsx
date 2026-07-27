"use client";

import React, { useState } from "react";
import { 
 Settings, User, Moon, Sun, Shield, Key, Bell, Save, CheckCircle2, Building2 
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
 const { theme, setTheme } = useTheme();
 const [agencyName, setAgencyName] = useState("ValGrow Intelligence");
 const [contactEmail, setContactEmail] = useState("agency@valgrow.com");
 const [serpApiKey, setSerpApiKey] = useState("••••••••••••••••••••");
 const [saved, setSaved] = useState(false);

 const handleSaveSettings = (e: React.FormEvent) => {
 e.preventDefault();
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 };

 return (
 <div className="p-4 sm:p-8 space-y-8 max-w-[1200px] mx-auto font-sans">
 {/* Header */}
 <div className="pb-6 border-b border-border">
 <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
 <Settings className="text-primary" size={28} />
 <span>Account & Platform Settings</span>
 </h1>
 <p className="text-sm text-muted-foreground mt-1">
 Manage your theme appearance, agency white-label branding, security credentials, and API connections.
 </p>
 </div>

 {saved && (
 <div className="rounded-[20px] bg-[#22C55E]/10 border border-[#22C55E]/20 p-3.5 flex items-center gap-2 text-[#22C55E] text-xs font-medium">
 <CheckCircle2 size={16} />
 <span>Settings successfully updated!</span>
 </div>
 )}

 <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Appearance & Theme Section */}
        <div className="bg-card rounded-[24px] border border-border p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Sun size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground leading-tight">Interface Theme</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select your visual appearance preference across SearchIntel
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-muted-bg border border-border text-muted-foreground uppercase tracking-wider">
              {theme.toUpperCase()} MODE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Light Option */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`group relative p-5 rounded-[20px] border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                theme === "light"
                  ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30 scale-[1.01]"
                  : "bg-muted-bg/50 border-border text-foreground hover:border-amber-500/40 hover:bg-muted-bg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${theme === "light" ? "bg-white/20 text-white" : "bg-card border border-border text-amber-500"}`}>
                  <Sun size={22} />
                </div>
                {theme === "light" && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Light Mode</h3>
                <p className={`text-xs mt-0.5 font-medium ${theme === "light" ? "text-white/80" : "text-muted-foreground"}`}>
                  Clean light background interface
                </p>
              </div>
            </button>

            {/* Dark Option */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`group relative p-5 rounded-[20px] border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                theme === "dark"
                  ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30 scale-[1.01]"
                  : "bg-muted-bg/50 border-border text-foreground hover:border-amber-500/40 hover:bg-muted-bg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-white/20 text-white" : "bg-card border border-border text-amber-500"}`}>
                  <Moon size={22} />
                </div>
                {theme === "dark" && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Dark Mode</h3>
                <p className={`text-xs mt-0.5 font-medium ${theme === "dark" ? "text-white/80" : "text-muted-foreground"}`}>
                  Sleek dark background interface
                </p>
              </div>
            </button>
          </div>
        </div>

 {/* Agency Profile & Branding */}
 <div className="bg-card rounded-[20px] border border-border p-6 shadow-xs space-y-4">
 <div className="flex items-center gap-3 border-b border-border pb-3">
 <Building2 size={20} className="text-primary" />
 <h2 className="text-base font-bold text-foreground">Agency White-Label Profile</h2>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 Agency Display Name
 </label>
 <input
 type="text"
 value={agencyName}
 onChange={(e) => setAgencyName(e.target.value)}
 className="w-full rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 Primary Contact Email
 </label>
 <input
 type="email"
 value={contactEmail}
 onChange={(e) => setContactEmail(e.target.value)}
 className="w-full rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
 />
 </div>
 </div>
 </div>

 {/* API Credentials */}
 <div className="bg-card rounded-[20px] border border-border p-6 shadow-xs space-y-4">
 <div className="flex items-center gap-3 border-b border-border pb-3">
 <Key size={20} className="text-primary" />
 <h2 className="text-base font-bold text-foreground">API Keys & Engine Access</h2>
 </div>

 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 SerpAPI / Serper API Key
 </label>
 <input
 type="password"
 value={serpApiKey}
 onChange={(e) => setSerpApiKey(e.target.value)}
 className="w-full sm:w-96 rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500 font-mono"
 />
 </div>
 </div>

 <button
 type="submit"
 className="flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-colors"
 >
 <Save size={15} />
 <span>Save Preferences</span>
 </button>
 </form>
 </div>
 );
}
