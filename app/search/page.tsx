import { Suspense } from "react";
import LoadingScreen from "@/components/layout/LoadingScreen";
import SearchPageClient from "./SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SearchPageClient />
    </Suspense>
  );
}
