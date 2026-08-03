import { Suspense } from "react";
import LoadingScreen from "@/components/layout/LoadingScreen";
import SignupPageClient from "./SignupPageClient";

export default function SignUpPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SignupPageClient />
    </Suspense>
  );
}
