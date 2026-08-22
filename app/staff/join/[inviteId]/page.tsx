"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { acceptStaffInviteWithRole } from "@/lib/staff/api";
import { storePendingStaffInvite } from "@/lib/staff/pendingInvite";
import { setStoredAppMode } from "@/lib/auth/mode";
import AuthLayout from "@/components/auth/AuthLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { primaryButtonClassName } from "@/lib/ui/styles";

type InvitePreview = {
  id: string;
  email: string;
  status: "pending" | "accepted" | "revoked";
  shopName: string;
};

export default function StaffJoinPage() {
  const router = useRouter();
  const params = useParams<{ inviteId: string }>();
  const inviteId = params.inviteId;

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  useEffect(() => {
    storePendingStaffInvite(inviteId);
  }, [inviteId]);

  useEffect(() => {
    async function load() {
      const [inviteResponse, sessionResult] = await Promise.all([
        fetch(`/api/staff/invites/${inviteId}`),
        supabase.auth.getSession(),
      ]);

      const inviteData = (await inviteResponse.json()) as {
        invite?: InvitePreview;
        message?: string;
      };

      if (!inviteResponse.ok || !inviteData.invite) {
        setError(inviteData.message ?? "招待が見つかりません");
        setLoading(false);
        return;
      }

      setInvite(inviteData.invite);
      setCurrentEmail(sessionResult.data.session?.user.email ?? null);
      setLoading(false);
    }

    load();
  }, [inviteId]);

  async function handleAccept() {
    if (!invite || accepting) return;

    setAccepting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAccepting(false);
      setError("ログインが必要です");
      return;
    }

    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      setAccepting(false);
      setError("この招待は別のメールアドレス向けです。招待されたメールアドレスでログインしてください。");
      return;
    }

    const { error: acceptError } = await acceptStaffInviteWithRole(invite.id, user);

    setAccepting(false);

    if (acceptError) {
      setError(acceptError);
      return;
    }

    setStoredAppMode("owner");
    router.replace("/owner/dashboard");
  }

  if (loading) return <LoadingScreen />;

  if (!invite) {
    return (
      <AuthLayout>
        <h2 className="text-2xl font-semibold text-[#eeeaf4]">招待が見つかりません</h2>
        <p className="mt-3 text-sm text-[#9994a8]">
          {error ?? "リンクの有効期限が切れているか、既に処理済みの可能性があります。"}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-[#ff3d00] hover:underline"
        >
          ログインへ →
        </Link>
      </AuthLayout>
    );
  }

  if (invite.status === "accepted") {
    return (
      <AuthLayout>
        <h2 className="text-2xl font-semibold text-[#eeeaf4]">参加済みの招待です</h2>
        <p className="mt-3 text-sm text-[#9994a8]">
          {invite.shopName} のスタッフとして既に参加しています。
        </p>
        <Link href="/owner/dashboard" className={`${primaryButtonClassName} mt-6 inline-block text-center`}>
          店舗ダッシュボードへ
        </Link>
      </AuthLayout>
    );
  }

  if (invite.status === "revoked") {
    return (
      <AuthLayout>
        <h2 className="text-2xl font-semibold text-[#eeeaf4]">招待は取消されています</h2>
        <p className="mt-3 text-sm text-[#9994a8]">
          オーナーにより招待が取消されました。再度招待が必要な場合は店舗オーナーにお問い合わせください。
        </p>
      </AuthLayout>
    );
  }

  const signupHref = `/signup?invite=${invite.id}&email=${encodeURIComponent(invite.email)}`;
  const loginHref = `/login?invite=${invite.id}`;

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-[#eeeaf4]">スタッフ招待</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
        <span className="font-semibold text-[#eeeaf4]">{invite.shopName}</span>
        から mazare のスタッフとして招待されています。
      </p>
      <p className="mt-2 text-sm text-[#9994a8]">
        招待先メール: <span className="text-[#eeeaf4]">{invite.email}</span>
      </p>

      {currentEmail && currentEmail.toLowerCase() === invite.email.toLowerCase() ? (
        <button
          type="button"
          onClick={handleAccept}
          disabled={accepting}
          className={`${primaryButtonClassName} mt-8`}
        >
          {accepting ? "承認中..." : "招待を承認して店舗管理へ"}
        </button>
      ) : (
        <div className="mt-8 space-y-3">
          <Link href={signupHref} className={`${primaryButtonClassName} block text-center`}>
            アカウントを作成する
          </Link>
          <Link
            href={loginHref}
            className="block rounded-[13px] border border-white/12 bg-[#111118] py-3.5 text-center text-sm font-bold text-[#9994a8]"
          >
            すでにアカウントがある方はログイン
          </Link>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </AuthLayout>
  );
}
