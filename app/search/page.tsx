import { Suspense } from "react";
import LoadingScreen from "@/components/layout/LoadingScreen";
import SearchPageClient from "./SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen
          message="探す画面を開いています"
          submessage="少々お待ちください"
        />
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
