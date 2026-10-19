import CheckinPageClient from "./CheckinPageClient";
import { getServerGoogleMapsApiKey } from "@/lib/map/server-env";

export const metadata = {
  title: "チェックイン | mazare",
  description: "写真なしで今夜のお店を記録",
};

export default function CheckinPage() {
  return <CheckinPageClient googleMapsApiKey={getServerGoogleMapsApiKey()} />;
}
