import ContactThreadClient from "../ContactThreadClient";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { threadId } = await params;
  return {
    title: `会話 | mazare`,
    description: `メッセージスレッド ${threadId}`,
  };
}

export default async function ContactThreadPage({ params }: PageProps) {
  const { threadId } = await params;
  return <ContactThreadClient threadId={threadId} />;
}