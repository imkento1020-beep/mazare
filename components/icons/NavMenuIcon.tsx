import type { SvgIconProps } from "@/components/icons/iconProps";
import HomeIcon from "@/components/icons/HomeIcon";
import MapIcon from "@/components/icons/MapIcon";
import { FeedWaveIcon } from "@/components/icons/FeedActionIcons";
import {
  BroadcastIcon,
  ChartIcon,
  ClockIcon,
  HeartIcon,
  SettingsIcon,
} from "@/components/icons/MazareIcons";
import type { GuestSidebarIconId, OwnerNavIconId } from "@/lib/layout/nav";

type NavMenuIconProps = SvgIconProps & {
  icon: GuestSidebarIconId | OwnerNavIconId;
};

export default function NavMenuIcon({
  icon,
  size = 20,
  color = "currentColor",
}: NavMenuIconProps) {
  switch (icon) {
    case "home":
      return <HomeIcon size={size} color={color} />;
    case "map":
      return <MapIcon size={size} color={color} />;
    case "wave":
      return <FeedWaveIcon size={size} color={color} />;
    case "heart":
      return <HeartIcon size={size} color={color} />;
    case "history":
      return <ClockIcon size={size} color={color} />;
    case "chart":
      return <ChartIcon size={size} color={color} />;
    case "broadcast":
      return <BroadcastIcon size={size} color={color} />;
    case "settings":
      return <SettingsIcon size={size} color={color} />;
    default:
      return null;
  }
}
