import { Suspense } from "react";
import TrendingPageClient from "./TrendingPageClient";
import LoadingScreen from "@/components/layout/LoadingScreen";

export const metadata = {
  title: "トレンドタグ | mazare",
  description: "今夜使われているハッシュタグランキング",
};

export default function TrendingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TrendingPageClient />
    </Suspense>
  );
}
