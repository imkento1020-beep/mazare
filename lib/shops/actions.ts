"use server";

import { redirect } from "next/navigation";
import { createShop, updateShop } from "./store";
import { parseShopFormData, validateShopFormData } from "./validation";
import type { ShopFormState } from "./types";

export async function createShopAction(
  _prevState: ShopFormState,
  formData: FormData,
): Promise<ShopFormState> {
  const data = parseShopFormData(formData);
  const errors = validateShopFormData(data);

  if (errors) {
    return {
      success: false,
      message: "入力内容を確認してください",
      errors,
    };
  }

  const shop = createShop(data);
  redirect(`/shops/${shop.id}`);
}

export async function updateShopAction(
  shopId: string,
  _prevState: ShopFormState,
  formData: FormData,
): Promise<ShopFormState> {
  const data = parseShopFormData(formData);
  const errors = validateShopFormData(data);

  if (errors) {
    return {
      success: false,
      message: "入力内容を確認してください",
      errors,
    };
  }

  const shop = updateShop(shopId, data);
  if (!shop) {
    return {
      success: false,
      message: "店舗が見つかりませんでした",
    };
  }

  redirect(`/shops/${shop.id}`);
}
