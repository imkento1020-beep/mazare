import { formatNotificationTime } from "@/lib/notifications/types";

type ContactMessageBubbleProps = {
  body: string;
  createdAt: string;
  isMine: boolean;
  senderLabel?: string | null;
};

export default function ContactMessageBubble({
  body,
  createdAt,
  isMine,
  senderLabel,
}: ContactMessageBubbleProps) {
  return (
    <div
      className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
    >
      {!isMine && senderLabel ? (
        <span className="px-1 text-[10px] font-bold text-[#9994a8]">
          {senderLabel}
        </span>
      ) : null}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isMine
            ? "rounded-br-md bg-[#ff3d00] text-white"
            : "rounded-bl-md border border-white/10 bg-[#1a1a24] text-[#eeeaf4]"
        }`}
      >
        {body}
      </div>
      <time
        className="px-1 text-[10px] text-[#5a5668]"
        dateTime={createdAt}
      >
        {formatNotificationTime(createdAt)}
      </time>
    </div>
  );
}