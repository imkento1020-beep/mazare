import type { BottomNavIconId } from "@/lib/layout/nav";
import BellIcon from "@/components/icons/BellIcon";
import CameraIcon from "@/components/icons/CameraIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import MapIcon from "@/components/icons/MapIcon";
import SearchIcon from "@/components/icons/SearchIcon";
import ShopIcon from "@/components/icons/ShopIcon";
import UserIcon from "@/components/icons/UserIcon";

type BottomNavIconProps = {
  icon: BottomNavIconId;
  color: string;
  size?: number;
};

export default function BottomNavIcon({
  icon,
  color,
  size = 24,
}: BottomNavIconProps) {
  switch (icon) {
    case "home":
      return <HomeIcon size={size} color={color} />;
    case "map":
      return <MapIcon size={size} color={color} />;
    case "camera":
      return <CameraIcon size={size} color={color} />;
    case "search":
      return <SearchIcon size={size} color={color} />;
    case "shop":
      return <ShopIcon size={size} color={color} />;
    case "user":
      return <UserIcon size={size} color={color} />;
    case "bell":
      return <BellIcon size={size} color={color} />;
    default:
      return null;
  }
}
