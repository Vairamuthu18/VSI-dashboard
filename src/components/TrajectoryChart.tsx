"use client";

import React, { useState } from "react";
import { TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";

interface TrajectoryChartProps {
 totalKeywords: number;
 winningRate: number;
 currentRate: number;
}

const timeTabs = ["1D", "7D", "1M", "3M", "6M", "1Y", "ALL"];

export default function TrajectoryChart({ totalKeywords, winningRate, currentRate }: TrajectoryChartProps) {
 const [activeTab, setActiveTab] = useState("1D");

 const baseRate = currentRate > 0 ? currentRate : 76.4;
 const points = React.useMemo(() => {
 const variations: Record<string, number[]> = {
 "1D": [baseRate - 12, baseRate - 8, baseRate - 14, baseRate - 5, baseRate - 7, baseRate - 2, baseRate],
 "7D": [baseRate - 18, baseRate - 14, baseRate - 10, baseRate - 12, baseRate - 6, baseRate - 4, baseRate],
 "1M": [baseRate - 25, baseRate - 20, baseRate - 22, baseRate - 16, baseRate - 12, baseRate - 8, baseRate],
 "3M": [baseRate - 30, baseRate - 24, baseRate - 18, baseRate - 22, baseRate - 14, baseRate - 10, baseRate],
 "6M": [baseRate - 35, baseRate - 28, baseRate - 20, baseRate - 18, baseRate - 12, baseRate - 6, baseRate],
 "1Y": [baseRate - 40, baseRate - 32, baseRate - 26, baseRate - 20, baseRate - 15, baseRate - 8, baseRate],
 "ALL": [baseRate - 45, baseRate - 38, baseRate - 30, baseRate - 22, baseRate - 16, baseRate - 9, baseRate],
 };
 return variations[activeTab] || variations["1D"];
 }, [activeTab, baseRate]);

 const chartWidth = 800;
 const chartHeight = 220;
 const minVal = Math.min(...points) - 5;
 const maxVal = Math.max(...points) + 5;

 const svgCoords = points.map((val, idx) => {
 const x = (idx / (points.length - 1)) * chartWidth;
 const y = chartHeight - ((val - minVal) / (maxVal - minVal)) * (chartHeight - 40) - 20;
 return { x, y, val };
 });

 const polylinePoints = svgCoords.map((c) => `${c.x},${c.y}`).join(" ");
 const polygonPoints = `0,${chartHeight} ${polylinePoints} ${chartWidth},${chartHeight}`;
 const latestPoint = svgCoords[svgCoords.length - 1];

 return (
 <div className="bg-card rounded-[20px] p-6 border border-border/80 shadow-[0_15px_40px_rgba(0,0,0,0.35)] transition-all duration-250 ease hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(255,90,31,0.15)] relative overflow-hidden transition-all">
 {/* Header & Controls */}
 <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
 <div>
 <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
 <span>AI Visibility Trajectory</span>
 <span className="text-xs text-primary bg-primary/10 border border-[#FFD5C8] rounded-full px-[14px] py-[6px] px-2.5 py-0.5 font-semibold flex items-center gap-1">
 <Sparkles size={12} /> Live Index
 </span>
 </h2>
 <p className="text-xs text-muted-foreground mt-0.5">
 Aggregate AI citation rate across all tracked client answers over time
 </p>
 </div>

 {/* Time Filter Pills */}
 <div className="flex items-center gap-1 bg-muted-bg/50 border border-border p-1 rounded-[20px]">
 {timeTabs.map((tab) => {
 const active = activeTab === tab;
 return (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 type="button"
 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
 active
 ? "bg-card text-foreground border border-border shadow-xs"
 : "text-muted-foreground hover:text-foreground hover:bg-card"
 }`}
 >
 {tab}
 </button>
 );
 })}
 </div>
 </div>

 {/* Chart Canvas Area */}
 <div className="mt-6 relative z-10">
 {/* Floating Tooltip */}
 <div 
 className="absolute z-20 transition-all duration-300 pointer-events-none"
 style={{
 left: `${Math.min(chartWidth - 190, Math.max(20, (latestPoint.x / chartWidth) * 100 - 15))}%`,
 top: `${Math.max(10, (latestPoint.y / chartHeight) * 100 - 32)}%`,
 }}
 >
 <div className="bg-card border border-border px-3.5 py-2 rounded-[20px] shadow-md flex flex-col items-center">
 <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">AI Citation Share</span>
 <div className="flex items-baseline gap-1.5 mt-0.5">
 <span className="text-base font-extrabold text-foreground">{baseRate.toFixed(1)}%</span>
 <span className="text-xs font-bold text-[#22C55E] flex items-center">
 +4.1% <ArrowUpRight size={12} />
 </span>
 </div>
 </div>
 </div>

 <div className="w-full overflow-hidden">
 <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 sm:h-64 overflow-visible">
 <defs>
 <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#F56A3D" stopOpacity="0.25" />
 <stop offset="70%" stopColor="#F56A3D" stopOpacity="0.04" />
 <stop offset="100%" stopColor="#F56A3D" stopOpacity="0" />
 </linearGradient>
 </defs>

 {/* Horizontal Grid lines */}
 {[0.2, 0.5, 0.8].map((ratio, idx) => (
 <line
 key={idx}
 x1="0"
 y1={chartHeight * ratio}
 x2={chartWidth}
 y2={chartHeight * ratio}
 stroke="var(--border)"
 strokeDasharray="4 4"
 />
 ))}

 {/* Area under curve */}
 <polygon points={polygonPoints} fill="url(#orangeGradient)" />

 {/* Line */}
 <polyline
 points={polylinePoints}
 fill="none"
 stroke="#F56A3D"
 strokeWidth="2.5"
 strokeLinecap="round"
 strokeLinejoin="round"
 />

 {/* Data points */}
 {svgCoords.map((c, i) => (
 <circle
 key={i}
 cx={c.x}
 cy={c.y}
 r={i === svgCoords.length - 1 ? "5" : "3"}
 className={
 i === svgCoords.length - 1
 ? "fill-[#F56A3D] stroke-card stroke-2"
 : "fill-card stroke-[#F56A3D] stroke-2 hover:r-4 transition-all"
 }
 />
 ))}

 {/* Vertical indicator line */}
 <line
 x1={latestPoint.x}
 y1={latestPoint.y}
 x2={latestPoint.x}
 y2={chartHeight}
 stroke="#F56A3D"
 strokeDasharray="3 3"
 strokeWidth="1.5"
 opacity="0.5"
 />
 </svg>
 </div>

 {/* X-axis time labels */}
 <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mt-2 pt-2 border-t border-border px-2">
 <span>04:00</span>
 <span>09:00</span>
 <span>14:00</span>
 <span>19:00</span>
 <span className="text-primary font-bold">00:00 (Live)</span>
 </div>
 </div>
 </div>
 );
}

