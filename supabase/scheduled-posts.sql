-- 予約投稿: posted_at に未来日時を設定可能（スキーマ変更なし）
-- ゲスト向け表示は posted_at <= now() でフィルタ（アプリ側）
-- オーナーは予約中の投稿もダッシュボードで確認・編集・削除可能

-- 参考: 公開済みのみゲストに見せる RLS（任意・将来適用）
-- DROP POLICY IF EXISTS "vibe_posts_select_all" ON public.vibe_posts;
-- CREATE POLICY "vibe_posts_select_published" ON public.vibe_posts
--   FOR SELECT TO anon, authenticated
--   USING (posted_at <= NOW());
