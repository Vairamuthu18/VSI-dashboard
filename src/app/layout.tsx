import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
 variable: "--font-inter",
 subsets: ["latin"],
 display: "swap",
});

const outfit = Outfit({
 variable: "--font-outfit",
 subsets: ["latin"],
 display: "swap",
});

const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
 display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
 variable: "--font-plus-jakarta",
 subsets: ["latin"],
 display: "swap",
});

const instrumentSerif = Instrument_Serif({
 variable: "--font-instrument-serif",
 weight: "400",
 style: "italic",
 subsets: ["latin"],
 display: "swap",
});

export const metadata: Metadata = {
 title: { default: "SearchIntel — Enterprise AI Search Intelligence", template: "%s | SearchIntel" },
 description: "Enterprise AI Search Intelligence & Citation Analytics Platform",
 icons: { icon: "/logo.png" },
 robots: {
 index: false,
 follow: false,
 nocache: true,
 googleBot: { index: false, follow: false, noimageindex: true },
 },
 referrer: "strict-origin-when-cross-origin",
 generator: "SearchIntel",
 applicationName: "SearchIntel",
 authors: [{ name: "SearchIntel" }],
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="en"
 className={`${inter.variable} ${outfit.variable} ${geistMono.variable} ${plusJakarta.variable} ${instrumentSerif.variable} h-full antialiased`}
 suppressHydrationWarning
 >
 <body className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-200" suppressHydrationWarning>
 <ThemeProvider>
 {children}
 </ThemeProvider>
 </body>
 </html>
 );
}
