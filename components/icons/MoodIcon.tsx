import type { SvgIconProps } from "@/components/icons/iconProps";
import { FeedGlassIcon } from "@/components/icons/FeedActionIcons";
import {
  DanceIcon,
  FireIcon,
  HandshakeIcon,
  MicIcon,
  MusicIcon,
  SparkleIcon,
} from "@/components/icons/MazareIcons";

type MoodIconProps = SvgIconProps & {
  mood: string;
};

export default function MoodIcon({
  mood,
  size = 16,
  color = "currentColor",
}: MoodIconProps) {
  switch (mood) {
    case "激熱":
      return <FireIcon size={size} color={color} />;
    case "音楽あり":
      return <MusicIcon size={size} color={color} />;
    case "混ざり歓迎":
      return <HandshakeIcon size={size} color={color} />;
    case "飲み放題":
      return <FeedGlassIcon size={size} color={color} />;
    case "踊れる":
      return <DanceIcon size={size} color={color} />;
    case "歌える":
      return <MicIcon size={size} color={color} />;
    default:
      return <SparkleIcon size={size} color={color} />;
  }
}
