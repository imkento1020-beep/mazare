export type PostComposeStep = "shop" | "media" | "finish";

export type SelectedPostShop = {
  id: string;
  name: string;
  address: string;
};

export function postComposeStepOrder(shopPreselected: boolean): PostComposeStep[] {
  if (shopPreselected) return ["media", "finish"];
  return ["shop", "media", "finish"];
}

export function postComposeStepIndex(
  step: PostComposeStep,
  shopPreselected: boolean,
): number {
  return postComposeStepOrder(shopPreselected).indexOf(step);
}

export function postComposeStepLabel(step: PostComposeStep): string {
  switch (step) {
    case "shop":
      return "お店";
    case "media":
      return "写真・動画";
    case "finish":
      return "仕上げ";
  }
}
