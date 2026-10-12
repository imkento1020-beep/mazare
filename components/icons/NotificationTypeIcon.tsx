import type { SvgIconProps } from "@/components/icons/iconProps";
import BellIcon from "@/components/icons/BellIcon";
import { FeedWaveIcon } from "@/components/icons/FeedActionIcons";
import {
  FireIcon,
  HeartIcon,
  StarIcon,
  StorefrontIcon,
} from "@/components/icons/MazareIcons";

type NotificationTypeIconProps = SvgIconProps & {
  type: string;
};

export default function NotificationTypeIcon({
  type,
  size = 24,
  color = "currentColor",
}: NotificationTypeIconProps) {
  switch (type) {
    case "favorite_shop_posted":
      return <HeartIcon size={size} color={color} filled />;
    case "shop_reposted":
      return <FeedWaveIcon size={size} color={color} />;
    case "post_interest":
    case "guest_post_interest":
      return <FireIcon size={size} color={color} />;
    case "shop_favorited":
      return <StarIcon size={size} color={color} />;
    case "staff_invite":
      return <StorefrontIcon size={size} color={color} />;
    default:
      return <BellIcon size={size} color={color} />;
  }
}
