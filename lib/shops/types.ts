export const ATMOSPHERE_TAG_OPTIONS = [
  "落ち着いた",
  "にぎやか",
  "カジュアル",
  "デート向き",
  "おしゃれ",
  "家庭的",
  "静か",
  "アットホーム",
] as const;

export type AtmosphereTag = (typeof ATMOSPHERE_TAG_OPTIONS)[number];

export type Shop = {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  category: string;
  atmosphere: string;
  atmosphereTags: AtmosphereTag[];
  createdAt: string;
  updatedAt: string;
};

export type ShopFormData = {
  name: string;
  description: string;
  address: string;
  phone: string;
  category: string;
  atmosphere: string;
  atmosphereTags: AtmosphereTag[];
};

export type ShopFormState = {
  success: boolean;
  message: string;
  shopId?: string;
  errors?: Partial<Record<keyof ShopFormData, string>>;
};
