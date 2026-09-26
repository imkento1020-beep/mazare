import PostPageClient from "./PostPageClient";
import { getServerGoogleMapsApiKey } from "@/lib/map/server-env";

export const metadata = {
  title: "投稿する | mazare",
  description: "今夜のお店の雰囲気をシェア",
};

export default function PostPage() {
  return <PostPageClient googleMapsApiKey={getServerGoogleMapsApiKey()} />;
}
