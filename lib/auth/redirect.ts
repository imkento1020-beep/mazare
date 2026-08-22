export {
  getAuthCallbackUrl,
  getLoginUrl,
  getPasswordResetUrl,
  getSignupUrl,
  getSiteUrl,
  getStaffJoinUrl,
} from "@/lib/site/url";

import { getSiteUrl } from "@/lib/site/url";

export function getAuthRedirectOrigin() {
  return getSiteUrl();
}
