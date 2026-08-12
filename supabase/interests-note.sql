-- interests テーブルにメモ用カラムを追加
ALTER TABLE public.interests
  ADD COLUMN IF NOT EXISTS note TEXT;

COMMENT ON COLUMN public.interests.note IS 'ユーザーが「行くかも」リストに付けた一言メモ';

-- 自分の行くかもだけ note を更新できる
DROP POLICY IF EXISTS "interests_update_own" ON public.interests;
CREATE POLICY "interests_update_own" ON public.interests
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT UPDATE ON public.interests TO authenticated;
