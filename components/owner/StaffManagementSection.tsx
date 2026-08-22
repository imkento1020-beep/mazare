"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ensureFreshSession } from "@/lib/auth/session";
import {
  buildStaffMembers,
  fetchShopStaffInvites,
  removeStaffMember,
  revokeStaffInvite,
  type StaffInvite,
  type StaffMember,
} from "@/lib/staff/api";
import { inputClassName, primaryButtonClassName } from "@/lib/ui/styles";
import type { Shop } from "@/lib/home/types";
import type { User } from "@supabase/supabase-js";

type StaffManagementSectionProps = {
  shop: Shop;
  user: User;
  isOwner: boolean;
  onStaffIdsChange: (staffIds: string[]) => void;
};

function inviteStatusLabel(status: StaffInvite["status"]) {
  if (status === "pending") return "招待中";
  if (status === "accepted") return "参加済み";
  return "取消済み";
}

async function sendStaffInviteRequest(shopId: string, email: string) {
  await ensureFreshSession();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      ok: false as const,
      message: "ログインが必要です。再度ログインしてからお試しください。",
    };
  }

  const response = await fetch("/api/staff/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      shopId,
      email: email.trim(),
    }),
  });

  const data = (await response.json()) as { message?: string };

  if (!response.ok) {
    return {
      ok: false as const,
      message: data.message ?? "招待メールの送信に失敗しました。",
    };
  }

  return {
    ok: true as const,
    message:
      data.message ??
      `${email.trim()} に招待メールを送信しました。相手がリンクから承認すると、店舗管理画面にアクセスできます。`,
  };
}

export default function StaffManagementSection({
  shop,
  user,
  isOwner,
  onStaffIdsChange,
}: StaffManagementSectionProps) {
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStaffData() {
      const inviteResult = await fetchShopStaffInvites(shop.id);

      if (cancelled) return;

      if (inviteResult.error) {
        setError(inviteResult.error);
      } else {
        setInvites(inviteResult.data);
      }

      setMembers(
        buildStaffMembers(shop, isOwner ? (user.email ?? null) : null),
      );
      setLoaded(true);
    }

    loadStaffData();

    return () => {
      cancelled = true;
    };
  }, [shop, user.email, isOwner]);

  async function refreshInvites() {
    const { data: inviteList } = await fetchShopStaffInvites(shop.id);
    setInvites(inviteList);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!isOwner || submitting) return;

    const targetEmail = email.trim();
    if (!targetEmail) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const result = await sendStaffInviteRequest(shop.id, targetEmail);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setEmail("");
    setSuccessMessage(result.message);
    await refreshInvites();
  }

  async function handleResendInvite(invite: StaffInvite) {
    if (!isOwner || resendingInviteId) return;

    setResendingInviteId(invite.id);
    setError(null);
    setSuccessMessage(null);

    const result = await sendStaffInviteRequest(shop.id, invite.email);

    setResendingInviteId(null);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccessMessage(
      `${invite.email} に招待メールを再送しました。相手がリンクから承認すると、店舗管理画面にアクセスできます。`,
    );
    await refreshInvites();
  }

  async function handleRevoke(inviteId: string) {
    setError(null);
    setSuccessMessage(null);
    const { error: revokeError } = await revokeStaffInvite(inviteId);
    if (revokeError) {
      setError(revokeError);
      return;
    }
    await refreshInvites();
  }

  async function handleRemoveStaff(staffUserId: string) {
    if (!isOwner || removingId) return;

    setRemovingId(staffUserId);
    setError(null);
    setSuccessMessage(null);

    const { staffIds, error: removeError } = await removeStaffMember({
      shopId: shop.id,
      staffUserId,
      currentStaffIds: shop.staff_ids ?? [],
    });

    setRemovingId(null);

    if (removeError) {
      setError(removeError);
      return;
    }

    onStaffIdsChange(staffIds);
    setMembers(buildStaffMembers({ ...shop, staff_ids: staffIds }, user.email));
  }

  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-4">
      {!loaded ? (
        <p className="text-sm text-[#9994a8]">読み込み中...</p>
      ) : (
        <>
      <p className="text-sm font-medium">スタッフ管理</p>
      <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
        招待したメールアドレスに招待メールを送信します。相手がリンクから承認すると、店舗管理画面にアクセスできます。
      </p>

      {isOwner && (
        <form onSubmit={handleInvite} className="mt-4 space-y-3">
          <label htmlFor="staff-email" className="block text-xs text-[#9994a8]">
            招待するメールアドレス
          </label>
          <input
            id="staff-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            className={inputClassName}
          />
          <button
            type="submit"
            disabled={submitting}
            className={`${primaryButtonClassName} w-full`}
          >
            {submitting ? "送信中..." : "スタッフを招待"}
          </button>

          {successMessage && (
            <p className="rounded-lg border border-[#00e87a]/30 bg-[#00e87a]/10 px-3 py-3 text-sm text-[#00e87a]">
              {successMessage}
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </form>
      )}

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5a5668]">
          メンバー
        </p>
        <div className="mt-2 space-y-2">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.05] bg-[#18181f] px-3 py-2.5"
            >
              <span className="text-sm text-[#eeeaf4]">{member.label}</span>
              {isOwner && member.source === "staff" && (
                <button
                  type="button"
                  onClick={() => handleRemoveStaff(member.userId)}
                  disabled={removingId === member.userId}
                  className="text-xs text-[#ff3d00] hover:underline disabled:opacity-60"
                >
                  {removingId === member.userId ? "削除中..." : "外す"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {invites.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5a5668]">
            招待履歴
          </p>
          <div className="mt-2 space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.05] bg-[#18181f] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#eeeaf4]">{invite.email}</p>
                  <p className="text-[10px] text-[#5a5668]">
                    {inviteStatusLabel(invite.status)}
                  </p>
                </div>
                {isOwner && invite.status === "pending" && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleResendInvite(invite)}
                      disabled={resendingInviteId === invite.id}
                      className="text-xs text-[#00e87a] hover:underline disabled:opacity-60"
                    >
                      {resendingInviteId === invite.id ? "再送中..." : "再送"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(invite.id)}
                      className="text-xs text-[#9994a8] hover:text-[#ff3d00]"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isOwner && error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
        </>
      )}
    </div>
  );
}
