import { ATMOSPHERE_TAG_OPTIONS } from "@/lib/shops/types";

type ShopAtmosphereFieldsProps = {
  defaultAtmosphere?: string;
  defaultTags?: string[];
  atmosphereError?: string;
};

export function ShopAtmosphereFields({
  defaultAtmosphere = "",
  defaultTags = [],
  atmosphereError,
}: ShopAtmosphereFieldsProps) {
  return (
    <section className="space-y-6 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          お店の雰囲気
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          店内の雰囲気や利用シーンが伝わる情報を登録できます。
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="atmosphere"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          雰囲気の説明
        </label>
        <textarea
          id="atmosphere"
          name="atmosphere"
          rows={4}
          defaultValue={defaultAtmosphere}
          placeholder="例: 木目調の内装で落ち着いた空間。デートや少人数の会食に向いています。"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
        />
        {atmosphereError ? (
          <p className="text-sm text-red-600">{atmosphereError}</p>
        ) : (
          <p className="text-xs text-zinc-500">500文字以内</p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          雰囲気タグ
        </legend>
        <p className="text-xs text-zinc-500">
          当てはまるものを複数選択できます
        </p>
        <div className="flex flex-wrap gap-2">
          {ATMOSPHERE_TAG_OPTIONS.map((tag) => {
            const checked = defaultTags.includes(tag);
            return (
              <label
                key={tag}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  checked
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-500"
                }`}
              >
                <input
                  type="checkbox"
                  name="atmosphereTags"
                  value={tag}
                  defaultChecked={checked}
                  className="sr-only"
                />
                {tag}
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
