"use client";

import { useEffect, useState } from "react";
import {
  buildStaffMembers,
  createStaffInvite,
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
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!isOwner || submitting) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: inviteError } = await createStaffInvite({
      shopId: shop.id,
      ownerId: user.id,
      email,
    });

    setSubmitting(false);

    if (inviteError) {
      setError(inviteError);
      return;
    }

    setEmail("");
    setMessage("招待を登録しました。相手がログインすると通知で確認できます");
    const { data } = await fetchShopStaffInvites(shop.id);
    setInvites(data);
  }

  async function handleRevoke(inviteId: string) {
    setError(null);
    const { error: revokeError } = await revokeStaffInvite(inviteId);
    if (revokeError) {
      setError(revokeError);
      return;
    }
    const { data } = await fetchShopStaffInvites(shop.id);
    setInvites(data);
  }

  async function handleRemoveStaff(staffUserId: string) {
    if (!isOwner || removingId) return;

    setRemovingId(staffUserId);
    setError(null);

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
        メールでスタッフを招待できます。相手が Mazare にログインすると通知が届き、マイページから承認できます。
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
                  <button
                    type="button"
                    onClick={() => handleRevoke(invite.id)}
                    className="shrink-0 text-xs text-[#9994a8] hover:text-[#ff3d00]"
                  >
                    取消
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className="mt-4 rounded-lg border border-[#00e87a]/30 bg-[#00e87a]/10 px-3 py-2 text-sm text-[#00e87a]">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
        </>
      )}
    </div>
  );
}
