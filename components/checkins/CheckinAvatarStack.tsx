import type { CheckinUser } from "@/lib/checkins/api";

type CheckinAvatarStackProps = {
  users: CheckinUser[];
  label?: string;
  className?: string;
};

export default function CheckinAvatarStack({
  users,
  label = "今夜ここにいる人",
  className = "",
}: CheckinAvatarStackProps) {
  if (users.length === 0) return null;

  const visible = users.slice(0, 2);
  const overflow = users.length - visible.length;

  return (
    <div className={className}>
      <p className="text-[11px] font-medium text-[#5a5668]">{label}</p>
      <div className="mt-2 flex items-center">
        {visible.map((user, index) => (
          <div
            key={user.userId}
            className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-[#111118] bg-[#18181f] text-xs"
            style={{ marginLeft: index === 0 ? 0 : -6, zIndex: visible.length - index }}
          >
            {user.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
        ))}
        {overflow > 0 && (
          <span
            className="text-[11px] text-[#9994a8]"
            style={{ marginLeft: -6 }}
          >
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}
