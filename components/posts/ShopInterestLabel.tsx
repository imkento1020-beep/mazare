import { FeedWaveIcon } from "@/components/icons/FeedActionIcons";

type ShopInterestLabelProps = {
  interested: boolean;
  loading?: boolean;
};

/** 店舗ページの「今夜行くかも」 */
export default function ShopInterestLabel({
  interested,
  loading = false,
}: ShopInterestLabelProps) {
  if (loading) {
    return <>送信中...</>;
  }

  const iconColor = interested ? "#00e87a" : "currentColor";

  return (
    <span className="inline-flex items-center justify-center gap-2">
      <FeedWaveIcon size={18} color={iconColor} />
      {interested ? "行くかも ✓" : "行くかも"}
    </span>
  );
}
