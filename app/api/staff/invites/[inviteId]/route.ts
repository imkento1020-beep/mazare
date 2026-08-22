import { fetchStaffInvitePreview } from "@/lib/staff/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ inviteId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { inviteId } = await context.params;

  if (!inviteId) {
    return Response.json(
      { error: "INVALID_REQUEST", message: "招待 ID が必要です。" },
      { status: 400 },
    );
  }

  const { data, error } = await fetchStaffInvitePreview(inviteId);

  if (error || !data) {
    return Response.json(
      { error: "NOT_FOUND", message: error ?? "招待が見つかりません。" },
      { status: 404 },
    );
  }

  return Response.json({ invite: data });
}
