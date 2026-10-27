import { Suspense } from "react";
import PostPageClient from "./PostPageClient";
import LoadingScreen from "@/components/layout/LoadingScreen";

export const metadata = {
  title: "投稿する | mazare",
  description: "今夜のお店の雰囲気をシェア",
};

export default function PostPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PostPageClient />
    </Suspense>
  );
}
