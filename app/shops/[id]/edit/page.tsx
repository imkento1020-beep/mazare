import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopForm } from "@/components/shops/ShopForm";
import { updateShopAction } from "@/lib/shops/actions";
import { getShop } from "@/lib/shops/store";

type EditShopPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditShopPage({ params }: EditShopPageProps) {
  const { id } = await params;
  const shop = getShop(id);

  if (!shop) {
    notFound();
  }

  const updateAction = updateShopAction.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <Link
          href={`/shops/${shop.id}`}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← 店舗詳細に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          お店の詳細を編集
        </h1>
      </div>

      <ShopForm
        action={updateAction}
        submitLabel="変更を保存する"
        defaultValues={shop}
      />
    </div>
  );
}
