export type ShopApplicationFormInput = {
  shopName: string;
  address: string;
  phone: string;
  contactName: string;
  email: string;
  instagramUrl: string;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateShopApplicationInput(
  input: ShopApplicationFormInput,
): { ok: true; value: ShopApplicationFormInput } | { ok: false; message: string } {
  const shopName = input.shopName.trim();
  const address = input.address.trim();
  const phone = input.phone.trim();
  const contactName = input.contactName.trim();
  const email = input.email.trim().toLowerCase();
  const instagramUrl = input.instagramUrl.trim();
  const message = input.message.trim();

  if (!shopName) return { ok: false, message: "店舗名を入力してください。" };
  if (!address) return { ok: false, message: "住所を入力してください。" };
  if (!phone) return { ok: false, message: "電話番号を入力してください。" };
  if (!contactName) return { ok: false, message: "担当者名を入力してください。" };
  if (!email) return { ok: false, message: "メールアドレスを入力してください。" };
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "メールアドレスの形式が正しくありません。" };
  }
  if (message.length > 200) {
    return { ok: false, message: "メッセージは200文字以内で入力してください。" };
  }

  return {
    ok: true,
    value: {
      shopName,
      address,
      phone,
      contactName,
      email,
      instagramUrl,
      message,
    },
  };
}
