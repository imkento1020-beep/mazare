import { MOOD_OPTIONS } from "@/lib/owner/constants";

export function moodEmoji(mood: string) {
  return MOOD_OPTIONS.find((option) => option.id === mood)?.emoji ?? "✨";
}

export function moodTagClass(mood: string) {
  if (mood === "激熱") return "border-[#ff3d00]/30 bg-[#ff3d00]/10 text-[#ff3d00]";
  if (mood === "音楽あり") return "border-[#ffaa00]/30 bg-[#ffaa00]/10 text-[#ffaa00]";
  if (mood === "混ざり歓迎") return "border-[#00e87a]/30 bg-[#00e87a]/10 text-[#00e87a]";
  return "border-white/10 bg-[#18181f] text-[#9994a8]";
}

export function heatLevel(moods: string[] | null) {
  if (moods?.includes("激熱")) {
    return {
      filled: 5,
      percent: 85,
      label: "激熱",
      emoji: "🔥",
      color: "text-[#ffaa00]",
      barColor: "#ffaa00",
    };
  }
  if (moods?.includes("混ざり歓迎")) {
    return {
      filled: 3,
      percent: 55,
      label: "盛り上がり中",
      emoji: "🎉",
      color: "text-[#00e87a]",
      barColor: "#00e87a",
    };
  }
  return {
    filled: 2,
    percent: 30,
    label: "これから",
    emoji: "✨",
    color: "text-[#a855f7]",
    barColor: "#a855f7",
  };
}

export type HeatInfo = ReturnType<typeof heatLevel>;
