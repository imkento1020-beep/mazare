import { supabase } from "@/lib/supabase";
import { isMissingTableError } from "@/lib/supabase/errors";

export type ContactMessageRow = {
  id: string;
  thread_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
  sender_display_name?: string | null;
};

export type ContactThreadSummary = {
  thread_id: string;
  contact_request_id: string;
  other_user_id: string;
  other_display_name: string | null;
  shop_id: string;
  shop_name: string | null;
  last_message_body: string | null;
  last_message_at: string | null;
  thread_created_at: string;
};

export type ContactThreadDetail = ContactThreadSummary & {
  viewer_user_id: string;
  can_message: boolean;
};

function missingThreadsError() {
  return "メッセージ機能の準備ができていません。Supabase で contact-threads.sql を実行してください。";
}

export async function ensureContactThread(
  contactRequestId: string,
): Promise<{ threadId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("ensure_contact_thread", {
    p_request_id: contactRequestId,
  });

  if (error) {
    if (
      isMissingTableError(error.message, "contact_threads") ||
      isMissingTableError(error.message, "contact_messages") ||
      error.message.includes("Could not find the function")
    ) {
      return { threadId: null, error: missingThreadsError() };
    }
    return { threadId: null, error: error.message };
  }

  return { threadId: typeof data === "string" ? data : null, error: null };
}

export async function fetchContactThreadsForUser(
  userId: string,
  limit = 40,
): Promise<{ data: ContactThreadSummary[]; error: string | null }> {
  const { data: requests, error: reqError } = await supabase
    .from("contact_requests")
    .select("id, from_user_id, to_user_id, shop_id, status, created_at")
    .eq("status", "accepted")
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order("responded_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (reqError) {
    if (isMissingTableError(reqError.message, "contact_requests")) {
      return { data: [], error: null };
    }
    return { data: [], error: reqError.message };
  }

  const accepted = requests ?? [];
  if (accepted.length === 0) return { data: [], error: null };

  const requestIds = accepted.map((r) => r.id);

  const { data: threads, error: threadError } = await supabase
    .from("contact_threads")
    .select("id, contact_request_id, created_at")
    .in("contact_request_id", requestIds);

  if (threadError) {
    if (isMissingTableError(threadError.message, "contact_threads")) {
      return { data: [], error: missingThreadsError() };
    }
    return { data: [], error: threadError.message };
  }

  const threadRows = threads ?? [];
  const threadByRequest = new Map(
    threadRows.map((t) => [t.contact_request_id, t]),
  );

  const threadIds = threadRows.map((t) => t.id);
  const lastByThread = new Map<
    string,
    { body: string; created_at: string }
  >();

  if (threadIds.length > 0) {
    const { data: messages, error: msgError } = await supabase
      .from("contact_messages")
      .select("thread_id, body, created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false });

    if (msgError && !isMissingTableError(msgError.message, "contact_messages")) {
      return { data: [], error: msgError.message };
    }

    for (const row of messages ?? []) {
      const tid = String(row.thread_id);
      if (!lastByThread.has(tid)) {
        lastByThread.set(tid, {
          body: String(row.body),
          created_at: String(row.created_at),
        });
      }
    }
  }

  const otherIds = [
    ...new Set(
      accepted.map((r) =>
        r.from_user_id === userId ? r.to_user_id : r.from_user_id,
      ),
    ),
  ];
  const shopIds = [...new Set(accepted.map((r) => r.shop_id))];

  const [profiles, shops] = await Promise.all([
    otherIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", otherIds)
      : Promise.resolve({
          data: [] as { id: string; display_name: string | null }[],
        }),
    shopIds.length
      ? supabase.from("shops").select("id, name").in("id", shopIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const nameById = new Map(
    (profiles.data ?? []).map((p) => [p.id, p.display_name]),
  );
  const shopById = new Map((shops.data ?? []).map((s) => [s.id, s.name]));

  const summaries: ContactThreadSummary[] = [];

  for (const req of accepted) {
    const thread = threadByRequest.get(req.id);
    if (!thread) continue;

    const otherUserId =
      req.from_user_id === userId ? req.to_user_id : req.from_user_id;
    const last = lastByThread.get(thread.id);

    summaries.push({
      thread_id: thread.id,
      contact_request_id: req.id,
      other_user_id: otherUserId,
      other_display_name: nameById.get(otherUserId) ?? null,
      shop_id: req.shop_id,
      shop_name: shopById.get(req.shop_id) ?? null,
      last_message_body: last?.body ?? null,
      last_message_at: last?.created_at ?? null,
      thread_created_at: thread.created_at,
    });
  }

  summaries.sort((a, b) => {
    const aT = a.last_message_at ?? a.thread_created_at;
    const bT = b.last_message_at ?? b.thread_created_at;
    return bT.localeCompare(aT);
  });

  return { data: summaries, error: null };
}

export async function fetchContactThreadDetail(
  threadId: string,
  viewerUserId: string,
): Promise<{ data: ContactThreadDetail | null; error: string | null }> {
  const { data: thread, error: threadError } = await supabase
    .from("contact_threads")
    .select("id, contact_request_id, created_at")
    .eq("id", threadId)
    .maybeSingle();

  if (threadError) {
    if (isMissingTableError(threadError.message, "contact_threads")) {
      return { data: null, error: missingThreadsError() };
    }
    return { data: null, error: threadError.message };
  }
  if (!thread) return { data: null, error: "会話が見つかりません" };

  const { data: request, error: reqError } = await supabase
    .from("contact_requests")
    .select("id, from_user_id, to_user_id, shop_id, status")
    .eq("id", thread.contact_request_id)
    .maybeSingle();

  if (reqError || !request) {
    return { data: null, error: reqError?.message ?? "連絡が見つかりません" };
  }

  const isParticipant =
    request.from_user_id === viewerUserId ||
    request.to_user_id === viewerUserId;

  if (!isParticipant) {
    return { data: null, error: "この会話を開く権限がありません" };
  }

  if (request.status !== "accepted") {
    return { data: null, error: "承諾されるまでメッセージは送れません" };
  }

  const otherUserId =
    request.from_user_id === viewerUserId
      ? request.to_user_id
      : request.from_user_id;

  const [profile, shop, lastMsg] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", otherUserId)
      .maybeSingle(),
    supabase.from("shops").select("name").eq("id", request.shop_id).maybeSingle(),
    supabase
      .from("contact_messages")
      .select("body, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    data: {
      thread_id: thread.id,
      contact_request_id: request.id,
      other_user_id: otherUserId,
      other_display_name: profile.data?.display_name ?? null,
      shop_id: request.shop_id,
      shop_name: shop.data?.name ?? null,
      last_message_body: lastMsg.data?.body ?? null,
      last_message_at: lastMsg.data?.created_at ?? null,
      thread_created_at: thread.created_at,
      viewer_user_id: viewerUserId,
      can_message: true,
    },
    error: null,
  };
}

export async function fetchContactMessages(
  threadId: string,
  limit = 200,
): Promise<{ data: ContactMessageRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, thread_id, sender_user_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message, "contact_messages")) {
      return { data: [], error: missingThreadsError() };
    }
    return { data: [], error: error.message };
  }

  const rows = (data ?? []) as ContactMessageRow[];
  const senderIds = [...new Set(rows.map((r) => r.sender_user_id))];

  const { data: profiles } = senderIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", senderIds)
    : { data: [] as { id: string; display_name: string | null }[] };

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.display_name]),
  );

  return {
    data: rows.map((r) => ({
      ...r,
      sender_display_name: nameById.get(r.sender_user_id) ?? null,
    })),
    error: null,
  };
}

export async function sendContactMessage(input: {
  threadId: string;
  senderUserId: string;
  body: string;
}): Promise<{ id: string | null; error: string | null }> {
  const body = input.body.trim().slice(0, 2000);
  if (!body) return { id: null, error: "メッセージを入力してください" };

  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      thread_id: input.threadId,
      sender_user_id: input.senderUserId,
      body,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error.message, "contact_messages")) {
      return { id: null, error: missingThreadsError() };
    }
    if (error.code === "42501" || error.message.includes("policy")) {
      return { id: null, error: "承諾後のみメッセージを送れます" };
    }
    return { id: null, error: error.message };
  }

  return { id: data?.id ?? null, error: null };
}