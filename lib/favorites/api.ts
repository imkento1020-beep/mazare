import { supabase } from "@/lib/supabase";
import { notifyShopFavoritedCreated } from "@/lib/notifications/api";
import { isMissingTableError, missingTableMessage } from "@/lib/supabase/errors";
import type { Shop } from "@/lib/home/types";

export type FavoriteShop = {
  id: string;
  shop_id: string;
  created_at: string;
  shop: Shop;
};

export async function fetchUserFavorites(userId: string): Promise<{
  data: FavoriteShop[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("favorite_shops")
    .select(
      `
      id,
      shop_id,
      created_at,
      shops (
        id,
        name,
        address,
        genre,
        open_hours,
        cover_image,
        cover_images
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message, "favorite_shops")) {
      return { data: [], error: missingTableMessage("favorite_shops") };
    }
    return { data: [], error: error.message };
  }

  const rows: FavoriteShop[] = (data ?? [])
    .map((row) => {
      const shop = Array.isArray(row.shops) ? row.shops[0] : row.shops;
      if (!shop) return null;
      return {
        id: row.id,
        shop_id: row.shop_id,
        created_at: row.created_at,
        shop: shop as Shop,
      };
    })
    .filter((row): row is FavoriteShop => row !== null);

  return { data: rows, error: null };
}

export async function fetchUserFavoriteShopIds(userId: string) {
  const { data, error } = await supabase
    .from("favorite_shops")
    .select("shop_id")
    .eq("user_id", userId);

  if (error) return { data: new Set<string>(), error: error.message };
  return {
    data: new Set((data ?? []).map((row) => row.shop_id)),
    error: null,
  };
}

export async function isShopFavorited(userId: string, shopId: string) {
  const { data, error } = await supabase
    .from("favorite_shops")
    .select("id")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message, "favorite_shops")) {
      return { favorited: false, error: missingTableMessage("favorite_shops") };
    }
    return { favorited: false, error: error.message };
  }
  return { favorited: Boolean(data), error: null };
}

export async function addFavoriteShop(userId: string, shopId: string) {
  const { data, error } = await supabase
    .from("favorite_shops")
    .insert({
      user_id: userId,
      shop_id: shopId,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error.message, "favorite_shops")) {
      return { error: missingTableMessage("favorite_shops") };
    }
    if (error.code === "23505") return { error: null };
    return { error: error.message };
  }

  if (data?.id) {
    await notifyShopFavoritedCreated(data.id);
  }

  return { error: null };
}

export async function removeFavoriteShop(userId: string, shopId: string) {
  const { error } = await supabase
    .from("favorite_shops")
    .delete()
    .eq("user_id", userId)
    .eq("shop_id", shopId);

  if (error) {
    if (isMissingTableError(error.message, "favorite_shops")) {
      return { error: missingTableMessage("favorite_shops") };
    }
    return { error: error.message };
  }
  return { error: null };
}
