import { notFound } from "next/navigation";
import { isPlatformAdminFeatureEnabled } from "@/lib/auth/platformAdmin";
import StoryImportPageClient from "./StoryImportPageClient";

export default function DevStoryImportPage() {
  if (!isPlatformAdminFeatureEnabled()) {
    notFound();
  }

  return <StoryImportPageClient />;
}
