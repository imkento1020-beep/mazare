import MoodIcon from "@/components/icons/MoodIcon";
import { moodTagClass } from "@/lib/home/moods";

export default function MoodTag({ mood }: { mood: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${moodTagClass(mood)}`}
    >
      <MoodIcon mood={mood} size={12} color="currentColor" />
      {mood}
    </span>
  );
}
