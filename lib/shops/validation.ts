import {
  ATMOSPHERE_TAG_OPTIONS,
  type AtmosphereTag,
  type ShopFormData,
  type ShopFormState,
} from "./types";

function isAtmosphereTag(value: string): value is AtmosphereTag {
  return (ATMOSPHERE_TAG_OPTIONS as readonly string[]).includes(value);
}

export function parseShopFormData(formData: FormData): ShopFormData {
  const atmosphereTags = formData
    .getAll("atmosphereTags")
    .map(String)
    .filter(isAtmosphereTag);

  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    atmosphere: String(formData.get("atmosphere") ?? "").trim(),
    atmosphereTags,
  };
}

export function validateShopFormData(data: ShopFormData): ShopFormState["errors"] {
  const errors: ShopFormState["errors"] = {};

  if (!data.name) {
    errors.name = "店舗名を入力してください";
  }

  if (data.atmosphere.length > 500) {
    errors.atmosphere = "雰囲気は500文字以内で入力してください";
  }

  if (data.description.length > 1000) {
    errors.description = "説明は1000文字以内で入力してください";
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}
