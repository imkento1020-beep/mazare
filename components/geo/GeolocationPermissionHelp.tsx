type GeolocationPermissionHelpProps = {
  className?: string;
};

export default function GeolocationPermissionHelp({
  className = "",
}: GeolocationPermissionHelpProps) {
  return (
    <div
      className={`rounded-[12px] border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs leading-relaxed text-[#eeeaf4] ${className}`}
    >
      <p className="font-bold text-[#ffaa00]">位置情報を許可してください</p>
      <p className="mt-2 text-[#9994a8]">
        ブラウザは、一度「許可しない」を選ぶと同じ画面で許可ダイアログを出せません。サイト側からダイアログを強制表示することはできないため、次の操作が必要です。
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-4 text-[#9994a8]">
        <li>
          <span className="text-[#eeeaf4]">iPhone（Safari）</span>
          ：アドレスバー左の <strong className="text-[#eeeaf4]">aA</strong>{" "}
          →「Webサイト設定」→ 位置情報を「許可」
        </li>
        <li>
          <span className="text-[#eeeaf4]">Android（Chrome）</span>
          ：アドレスバーの鍵アイコン → 権限 → 位置情報を「許可」
        </li>
        <li>
          設定を変更したあと、もう一度{" "}
          <strong className="text-[#eeeaf4]">「現在地から近くのお店を表示」</strong>
          をタップしてください（未設定の場合はここで許可ダイアログが出ます）。
        </li>
      </ol>
      <p className="mt-3 text-[#9994a8]">
        位置情報を使わない場合は、上の検索欄からお店を選べます。
      </p>
    </div>
  );
}
