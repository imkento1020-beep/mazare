import StaticPageLayout from "@/components/layout/StaticPageLayout";
import PwaInstallPanel from "@/components/pwa/PwaInstallPanel";

export const metadata = {
  title: "アプリとして追加 | mazare",
  description:
    "mazare をスマホのホーム画面に追加して、ネイティブアプリのように使う方法",
};

export default function InstallPage() {
  return (
    <StaticPageLayout
      title="アプリとして追加"
      subtitle="ホーム画面に mazare を置いて、今夜のお店探しをもっと手軽に"
    >
      <PwaInstallPanel />
    </StaticPageLayout>
  );
}
