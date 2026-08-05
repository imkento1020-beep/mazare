export type Shop = {
  id: string;
  name: string;
  address: string;
  genre: string | string[] | null;
  open_hours: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cover_image?: string | null;
  cover_images?: string[] | null;
  description?: string | null;
  owner_id?: string | null;
  staff_ids?: string[] | null;
  created_at?: string | null;
};

export type VibePost = {
  id: string;
  shop_id: string;
  comment: string;
  moods: string[] | null;
  images?: string[] | null;
  posted_at?: string | null;
  shops: Shop | null;
};

export type InterestRow = {
  id: string;
  user_id: string;
  shop_id: string;
  vibe_post_id: string;
  created_at: string;
  vibe_posts?: {
    comment: string;
    posted_at: string;
    shops?: { name: string; address?: string; open_hours?: string | null } | null;
  } | null;
};

export type TodayInterestRow = InterestRow;

export function formatGenre(genre: string | string[] | null | undefined) {
  if (!genre) return "—";
  if (Array.isArray(genre)) return genre.join(" · ");
  return genre;
}

export function formatOpenHours(hours: unknown) {
  if (typeof hours === "string") return hours;
  return "—";
}

export function normalizeMoods(moods: unknown): string[] {
  if (Array.isArray(moods)) return moods.map(String);
  return [];
}

export function formatPostedAt(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getShopCoverImages(
  shop: Pick<Shop, "cover_image" | "cover_images">,
): string[] {
  if (Array.isArray(shop.cover_images) && shop.cover_images.length > 0) {
    return shop.cover_images.filter(Boolean);
  }
  if (typeof shop.cover_image === "string" && shop.cover_image.startsWith("http")) {
    return [shop.cover_image];
  }
  return parseCoverImages(
    typeof shop.cover_image === "string" ? shop.cover_image : null,
  );
}

export function parseCoverImages(coverImage: string | null | undefined): string[] {
  if (!coverImage) return [];
  if (coverImage.startsWith("[")) {
    try {
      const parsed = JSON.parse(coverImage);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return [coverImage];
    }
  }
  return [coverImage];
}
