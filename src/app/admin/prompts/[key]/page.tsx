import Link from "next/link";
import { notFound } from "next/navigation";
import { DEFAULT_PROMPTS, getSavedPrompt, type PromptKey } from "@/lib/prompts";
import PromptEditor from "@/components/admin/PromptEditor";

export const dynamic = "force-dynamic";

export default async function PromptEditPage({ params }: { params: Promise<{ key: string }> }) {
 const { key } = await params;
 const promptKey = key as PromptKey;
 const def = DEFAULT_PROMPTS[promptKey];
 if (!def) notFound();

 const saved = await getSavedPrompt(promptKey);
 const currentTemplate = saved?.template ?? def.template;

 return (
 <div className="p-4 sm:p-8 max-w-5xl space-y-4 text-white">
 <div className="flex items-center gap-2 text-sm text-gray-500">
 <Link href="/admin/prompts" className="hover:text-gray-300">Prompts</Link>
 <span className="text-gray-600">/</span>
 <span className="text-white">{def.title}</span>
 </div>

 <div>
 <h1 className="text-xl font-semibold text-white">{def.title}</h1>
 <p className="text-xs text-gray-400 mt-1 leading-relaxed">{def.description}</p>
 </div>

 <PromptEditor
 promptKey={promptKey}
 title={def.title}
 defaultTemplate={def.template}
 currentTemplate={currentTemplate}
 variables={def.variables}
 outputFormat={def.outputFormat}
 isOverride={!!saved}
 />
 </div>
 );
}
