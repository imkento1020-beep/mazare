import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { normalizeDisplayName } from "@/lib/auth/displayName";

export async function syncProfileAfterAuth(user: User) {
  const displayName = normalizeDisplayName(
    String(user.user_metadata?.display_name ?? ""),
  );
  const userType =
    user.user_metadata?.user_type === "owner" ? "owner" : "guest";

  const row: {
    id: string;
    user_type: string;
    display_name?: string;
  } = {
    id: user.id,
    user_type: userType,
  };

  if (displayName) {
    row.display_name = displayName;
  }

  const { error } = await supabase.from("profiles").upsert(row, {
    onConflict: "id",
  });

  if (error) {
    console.warn("syncProfileAfterAuth:", error.message);
  }
}
