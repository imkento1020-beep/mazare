import type { SvgIconProps } from "@/components/icons/iconProps";
import { FeedGlassIcon } from "@/components/icons/FeedActionIcons";
import {
  CocktailIcon,
  CoffeeIcon,
  DanceIcon,
  GuitarIcon,
  LanternIcon,
  MicIcon,
  MusicIcon,
  UtensilsIcon,
} from "@/components/icons/MazareIcons";

type GenreIconProps = SvgIconProps & {
  genre: string;
};

export default function GenreIcon({
  genre,
  size = 24,
  color = "currentColor",
}: GenreIconProps) {
  const g = genre.toLowerCase();

  if (g.includes("居酒屋")) {
    return <LanternIcon size={size} color={color} />;
  }
  if (g.includes("カラオケ") || g.includes("歌")) {
    return <MicIcon size={size} color={color} />;
  }
  if (g.includes("ライブ") || g.includes("音楽")) {
    return <MusicIcon size={size} color={color} />;
  }
  if (g.includes("バー") || g.includes("クラフト") || g.includes("パブ") || g.includes("クラブ")) {
    return <FeedGlassIcon size={size} color={color} />;
  }
  if (g.includes("カフェ")) {
    return <CoffeeIcon size={size} color={color} />;
  }
  if (g.includes("ラーメン") || g.includes("寿司") || g.includes("和食")) {
    return <UtensilsIcon size={size} color={color} />;
  }
  if (g.includes("ダイニング") || g.includes("レストラン")) {
    return <UtensilsIcon size={size} color={color} />;
  }
  if (g.includes("ギター")) {
    return <GuitarIcon size={size} color={color} />;
  }
  if (g.includes("踊")) {
    return <DanceIcon size={size} color={color} />;
  }
  if (g.includes("カクテル")) {
    return <CocktailIcon size={size} color={color} />;
  }

  return <FeedGlassIcon size={size} color={color} />;
}
