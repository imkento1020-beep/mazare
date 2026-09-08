import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  getSignupPathWithReturn,
  prepareAuthNavigation,
} from "@/lib/auth/authPaths";

export {
  getLoginPathWithReturn,
  getOwnerSignupPathWithReturn,
  getSignupPathWithReturn,
  prepareAuthNavigation,
} from "@/lib/auth/authPaths";

export function redirectToSignup(
  router: AppRouterInstance,
  returnPath?: string,
) {
  const path = prepareAuthNavigation(returnPath);
  router.push(getSignupPathWithReturn(path));
}

export function replaceWithSignup(
  router: AppRouterInstance,
  returnPath?: string,
) {
  const path = prepareAuthNavigation(returnPath);
  router.replace(getSignupPathWithReturn(path));
}
