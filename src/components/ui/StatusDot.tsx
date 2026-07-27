type StatusColor = "green" | "yellow" | "red" | "blue" | "gray" | "amber" | "orange";

const DOT_COLORS: Record<StatusColor, string> = {
 green: "bg-green-500",
 yellow: "bg-yellow-500",
 red: "bg-red-500",
 blue: "bg-blue-500",
 gray: "bg-gray-400",
 amber: "bg-amber-500",
 orange: "bg-orange-500",
};

const RING_COLORS: Record<StatusColor, string> = {
 green: "ring-green-200",
 yellow: "ring-yellow-200",
 red: "ring-red-200",
 blue: "ring-blue-200",
 gray: "ring-gray-200",
 amber: "ring-amber-200",
 orange: "ring-orange-200",
};

interface Props {
 color: StatusColor;
 pulse?: boolean;
 size?: "sm" | "md";
}

export default function StatusDot({ color, pulse = false, size = "sm" }: Props) {
 const sizeClass = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";

 return (
 <span className={`relative inline-flex shrink-0 ${sizeClass}`}>
 {pulse && (
 <span className={`absolute inline-flex h-full w-full rounded-full ${DOT_COLORS[color]} opacity-50 animate-ping`} />
 )}
 <span className={`relative inline-flex ${sizeClass} rounded-full ${DOT_COLORS[color]} ring-2 ${RING_COLORS[color]}`} />
 </span>
 );
}
