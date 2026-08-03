import { supabase } from "@/lib/supabase";
import {
  isMissingTableError,
  missingTableMessage,
} from "@/lib/supabase/errors";
import type { ContactCategory, InquirerType } from "./types";

export async function submitContactInquiry(input: {
  inquirerType: InquirerType;
  userId?: string | null;
  name: string;
  email: string;
  category: ContactCategory;
  message: string;
}) {
  const { error } = await supabase.from("contact_inquiries").insert({
    inquirer_type: input.inquirerType,
    user_id: input.userId ?? null,
    name: input.name.trim(),
    email: input.email.trim(),
    category: input.category,
    message: input.message.trim(),
  });

  if (error) {
    if (isMissingTableError(error.message, "contact_inquiries")) {
      return { error: missingTableMessage("contact_inquiries") };
    }
    return { error: error.message };
  }

  return { error: null };
}
