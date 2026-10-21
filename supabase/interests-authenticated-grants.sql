-- 「行くかも」が logged-in ユーザーで保存できない場合
GRANT SELECT ON public.interests TO anon;
GRANT SELECT, INSERT, DELETE, UPDATE ON public.interests TO authenticated;
