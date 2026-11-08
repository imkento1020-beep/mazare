"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchIncomingContactRequests,
  respondToContactRequest,
  type ContactRequestRow,
} from "@/lib/matching/contactRequests";

type ContactInboxSectionProps = {
  userId: string;
};

export default function ContactInboxSection({ userId }: ContactInboxSectionProps) {
  const [items, setItems] = useState<ContactRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await fetchIncomingContactRequests(userId);
    setItems(data.filter((r) => r.status === "pending"));
    setError(err);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function respond(
    id: string,
    status: "accepted" | "declined",
  ) {
    setActingId(id);
    const { error: err } = await respondToContactRequest({
      requestId: id,
      recipientUserId: userId,
      status,
    });
    setActingId(null);
    if (err) {
      setError(err);
      return;
    }
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) {
    return (
      <p className="text-sm text-[#9994a8]">連絡を読み込んでいます…</p>
    );
  }

  return (
    <section id="contacts" className="scroll-mt-24 space-y-3">
      <h2 className="text-sm font-black text-[#eeeaf4]">届いた連絡</h2>
      <p className="text-xs text-[#9994a8]">
        あなたの投稿に送られた合流の申請です。承諾すると相手に通知されます（チャットは今後追加予定）。
      </p>
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : null}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-[#9994a8]">
          今夜はまだ届いていません
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-[#00e87a]/25 bg-[#00e87a]/[0.06] p-4"
            >
              <p className="text-sm font-bold text-[#eeeaf4]">
                {item.from_display_name ?? "ゲスト"}
                <span className="font-normal text-[#9994a8]">
                  {" "}
                  · {item.shop_name ?? "お店"}
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#ddd8e8]">
                {item.message}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={actingId === item.id}
                  onClick={() => void respond(item.id, "accepted")}
                  className="flex-1 rounded-xl bg-[#00e87a] py-2 text-xs font-black text-[#080810] disabled:opacity-50"
                >
                  承諾
                </button>
                <button
                  type="button"
                  disabled={actingId === item.id}
                  onClick={() => void respond(item.id, "declined")}
                  className="flex-1 rounded-xl border border-white/15 py-2 text-xs font-bold text-[#9994a8]"
                >
                  辞退
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
