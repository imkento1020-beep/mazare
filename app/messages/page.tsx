import MessagesInboxClient from "./MessagesInboxClient";

export const metadata = {
  title: "メッセージ | mazare",
  description: "承諾済みの連絡相手とのメッセージ",
};

export default function MessagesPage() {
  return <MessagesInboxClient />;
}