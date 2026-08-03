import { Suspense } from "react";
import ContactPageClient from "./ContactPageClient";
import LoadingScreen from "@/components/layout/LoadingScreen";

export const metadata = {
  title: "お問い合わせ | mazare",
  description: "mazareへのお問い合わせ",
};

export default function ContactPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ContactPageClient />
    </Suspense>
  );
}
