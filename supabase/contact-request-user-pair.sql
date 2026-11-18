-- 同一ユーザーへの連絡は1回のみ（投稿をまたいで再送不可）
-- 既存 DB: contact-requests.sql 適用済みの場合に実行
--
-- 旧制約 (from_user_id, vibe_post_id) のため同一ペアの重複行がある場合、
-- 先に1件だけ残して削除してからユニークインデックスを作成します。

ALTER TABLE public.contact_requests
  DROP CONSTRAINT IF EXISTS contact_requests_from_user_id_vibe_post_id_key;

DROP INDEX IF EXISTS public.contact_requests_from_user_id_vibe_post_id_key;

-- ペアごとに残す1件を選ぶ（DMスレッドあり > 承諾 > 承諾待ち > 辞退 > 古い送信順）
WITH ranked AS (
  SELECT
    cr.id,
    ROW_NUMBER() OVER (
      PARTITION BY cr.from_user_id, cr.to_user_id
      ORDER BY
        CASE
          WHEN to_regclass('public.contact_threads') IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM public.contact_threads t
              WHERE t.contact_request_id = cr.id
            )
          THEN 0
          ELSE 1
        END,
        CASE cr.status
          WHEN 'accepted' THEN 0
          WHEN 'pending' THEN 1
          ELSE 2
        END,
        cr.created_at ASC
    ) AS rn
  FROM public.contact_requests cr
),
dup_ids AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM public.contact_requests cr
WHERE cr.id IN (SELECT id FROM dup_ids);

CREATE UNIQUE INDEX IF NOT EXISTS contact_requests_from_to_user_unique
  ON public.contact_requests (from_user_id, to_user_id);