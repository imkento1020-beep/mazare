import { extractAreaFromAddress } from "@/lib/geo/area";
import { createSupabaseAnonServerClient } from "@/lib/supabase/serverAnon";

export type LandingFeedPost = {
  id: string;
  shopName: string;
  area: string;
  interestCount: number;
  imageUrl: string | null;
  videoUrl: string | null;
};

type ShopJoin = { name: string; address: string | null } | null;

export async function fetchLandingFeedPosts(): Promise<LandingFeedPost[]> {
  try {
    const supabase = createSupabaseAnonServerClient();
    const nowIso = new Date().toISOString();

    const { data: posts, error } = await supabase
      .from("vibe_posts")
      .select("id, images, video_url, shop_id, shops(name, address)")
      .lte("posted_at", nowIso)
      .order("posted_at", { ascending: false })
      .limit(10);

    if (error || !posts?.length) {
      return [];
    }

    const postIds = posts.map((row) => String(row.id));
    const interestByPost = new Map<string, number>();

    const { data: interests } = await supabase
      .from("interests")
      .select("vibe_post_id")
      .in("vibe_post_id", postIds);

    for (const row of interests ?? []) {
      const id = String(row.vibe_post_id);
      interestByPost.set(id, (interestByPost.get(id) ?? 0) + 1);
    }

    return posts.map((row) => {
      const id = String(row.id);
      const shopRaw = row.shops as ShopJoin | ShopJoin[];
      const shop = Array.isArray(shopRaw) ? shopRaw[0] : shopRaw;
      const images = Array.isArray(row.images)
        ? row.images.filter((url): url is string => typeof url === "string" && url.length > 0)
        : [];
      const videoUrl =
        typeof row.video_url === "string" && row.video_url.length > 0
          ? row.video_url
          : null;

      return {
        id,
        shopName: shop?.name?.trim() || "お店",
        area: extractAreaFromAddress(shop?.address),
        interestCount: interestByPost.get(id) ?? 0,
        imageUrl: images[0] ?? null,
        videoUrl,
      };
    });
  } catch {
    return [];
  }
}
