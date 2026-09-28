import EditPostPageClient from "./EditPostPageClient";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "投稿を編集 | mazare",
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  return <EditPostPageClient postId={id} />;
}
