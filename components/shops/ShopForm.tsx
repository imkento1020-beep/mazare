"use client";

import { useActionState } from "react";
import { ShopAtmosphereFields } from "./ShopAtmosphereFields";
import type { Shop, ShopFormState } from "@/lib/shops/types";

type ShopFormProps = {
  action: (
    prevState: ShopFormState,
    formData: FormData,
  ) => Promise<ShopFormState>;
  submitLabel: string;
  defaultValues?: Partial<Shop>;
};

const initialState: ShopFormState = {
  success: false,
  message: "",
};

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
  placeholder,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function ShopForm({ action, submitLabel, defaultValues }: ShopFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          基本情報
        </h2>
        <Field
          label="店舗名"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="例: カフェ まざれ"
          required
          error={state.errors?.name}
        />
        <Field
          label="カテゴリ"
          name="category"
          defaultValue={defaultValues?.category}
          placeholder="例: カフェ、居酒屋、バー"
        />
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            説明
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={defaultValues?.description}
            placeholder="お店の特徴やおすすめポイントを入力してください"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          />
          {state.errors?.description ? (
            <p className="text-sm text-red-600">{state.errors.description}</p>
          ) : null}
        </div>
        <Field
          label="住所"
          name="address"
          defaultValue={defaultValues?.address}
          placeholder="例: 東京都渋谷区..."
        />
        <Field
          label="電話番号"
          name="phone"
          type="tel"
          defaultValue={defaultValues?.phone}
          placeholder="例: 03-1234-5678"
        />
      </section>

      <ShopAtmosphereFields
        defaultAtmosphere={defaultValues?.atmosphere}
        defaultTags={defaultValues?.atmosphereTags}
        atmosphereError={state.errors?.atmosphere}
      />

      {!state.success && state.message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pending ? "保存中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
