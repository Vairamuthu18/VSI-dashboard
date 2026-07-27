import TestSerpApiClient from "@/components/admin/TestSerpApiClient";

export default async function TestSerpApiPage() {
 return (
 <div className="p-4 sm:p-8 max-w-5xl text-white">
 <div className="mb-6">
 <h1 className="text-xl font-semibold text-white">SerpApi Diagnostic</h1>
 <p className="text-xs text-gray-400 mt-1">
 Fire a single AI Mode query (engine=google_ai_mode) and inspect the raw response. Useful for previewing what a snapshot will look like before adding a keyword to a client. ~1 credit per test.
 </p>
 </div>
 <TestSerpApiClient />
 </div>
 );
}
