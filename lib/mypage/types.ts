import type { TonightSocialMoodId } from "@/lib/profile/tonightSocialMood";

export type GuestProfile = {
  id: string;
  user_type: string;
  profile_image: string | null;
  created_at: string | null;
  display_name: string;
  email: string;
  tonight_social_mood: TonightSocialMoodId | null;
};
