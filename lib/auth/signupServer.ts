import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  getUserRoles,
  mergeRoles,
  rolesForSignup,
  rolesToMetadata,
  type AppRole,
} from "@/lib/auth/roles";
import { getAuthCallbackUrl } from "@/lib/site/url";
import { sendSignupConfirmationEmail } from "@/lib/email/signupConfirmation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isAlreadyRegisteredError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("user already exists") ||
    normalized.includes("email address has already been registered")
  );
}

async function findUserByEmail(admin: SupabaseClient, email: string) {
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (entry) => entry.email?.toLowerCase() === email.toLowerCase(),
    );

    if (user) {
      return user;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function generateConfirmationLink(input: {
  admin: SupabaseClient;
  email: string;
  password: string;
}) {
  const { data, error } = await input.admin.auth.admin.generateLink({
    type: "signup",
    email: input.email,
    password: input.password,
    options: {
      redirectTo: getAuthCallbackUrl(),
    },
  });

  if (error) {
    return { confirmUrl: null, error: error.message };
  }

  const confirmUrl = data.properties?.action_link ?? null;
  if (!confirmUrl) {
    return { confirmUrl: null, error: "確認リンクの生成に失敗しました" };
  }

  return { confirmUrl, error: null };
}

function metadataForSignup(userType: AppRole, existingUser?: User | null) {
  const signupRoles = rolesForSignup(userType);
  const mergedRoles = mergeRoles(getUserRoles(existingUser ?? null), signupRoles);
  return rolesToMetadata(mergedRoles);
}

export async function sendSignupConfirmation(input: {
  email: string;
  password: string;
  userType?: AppRole;
}): Promise<{ ok: true } | { ok: false; message: string; code?: string }> {
  const email = normalizeEmail(input.email);
  const password = input.password;
  const userType = input.userType ?? "guest";

  if (!email.includes("@")) {
    return { ok: false, message: "有効なメールアドレスを入力してください。" };
  }

  if (password.length < 6) {
    return { ok: false, message: "パスワードは6文字以上で入力してください。" };
  }

  try {
    const admin = createSupabaseAdminClient();
    const metadata = metadataForSignup(userType);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: metadata,
    });

    let existingUser: User | null = created.user ?? null;

    if (createError) {
      if (!isAlreadyRegisteredError(createError.message)) {
        return { ok: false, message: createError.message };
      }

      existingUser = await findUserByEmail(admin, email);

      if (!existingUser) {
        return {
          ok: false,
          message:
            "アカウントの作成に失敗しました。しばらく待ってから再度お試しください。",
        };
      }

      if (existingUser.email_confirmed_at) {
        return {
          ok: false,
          code: "ALREADY_REGISTERED",
          message:
            "このメールアドレスは既に登録されています。ログインしてください。",
        };
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
          user_metadata: metadataForSignup(userType, existingUser),
        },
      );

      if (updateError) {
        return { ok: false, message: updateError.message };
      }
    }

    const { confirmUrl, error: linkError } = await generateConfirmationLink({
      admin,
      email,
      password,
    });

    if (linkError || !confirmUrl) {
      return {
        ok: false,
        message: linkError ?? "確認リンクの生成に失敗しました。",
      };
    }

    await sendSignupConfirmationEmail({
      to: email,
      confirmUrl,
    });

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "確認メールの送信に失敗しました。";

    if (message.includes("SENDGRID")) {
      return {
        ok: false,
        message:
          "確認メールの送信に失敗しました。SendGrid の設定を確認してください。",
      };
    }

    if (message.includes("Supabase admin")) {
      return {
        ok: false,
        message:
          "サーバー設定が不完全です。SUPABASE_SERVICE_ROLE_KEY を確認してください。",
      };
    }

    return { ok: false, message };
  }
}
