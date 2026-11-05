import type {
  MergeAttitude,
  VibeScale,
} from "@/lib/profile/tonightSocialContext";

export type GuestProfile = {
  id: string;
  user_type: string;
  profile_image: string | null;
  created_at: string | null;
  display_name: string;
  email: string;
  mergeAttitude: MergeAttitude | null;
  vibeScale: VibeScale | null;
  bio: string | null;
};
