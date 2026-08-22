import { sendSignupConfirmation } from "@/lib/auth/signupServer";
import type { AppRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; userType?: AppRole };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "INVALID_REQUEST", message: "リクエストが不正です。" },
      { status: 400 },
    );
  }

  const result = await sendSignupConfirmation({
    email: body.email ?? "",
    password: body.password ?? "",
    userType: body.userType === "owner" ? "owner" : "guest",
  });

  if (!result.ok) {
    return Response.json(
      {
        error: result.code ?? "RESEND_FAILED",
        message: result.message,
      },
      { status: result.code === "ALREADY_REGISTERED" ? 409 : 400 },
    );
  }

  return Response.json({
    ok: true,
    message: "確認メールを再送しました。",
  });
}
