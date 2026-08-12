const JST = "Asia/Tokyo";

type JSTParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function getJSTParts(date: Date): JSTParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** JST の日時を UTC Date に変換 */
export function jstDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Date {
  return new Date(
    `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+09:00`,
  );
}

function addDaysJST(parts: JSTParts, delta: number): JSTParts {
  const anchor = jstDateTimeToUtc(parts.year, parts.month, parts.day, 12);
  anchor.setUTCDate(anchor.getUTCDate() + delta);
  return getJSTParts(anchor);
}

/**
 * 「今夜」の時間帯（JST 17:00 〜 翌 6:00）
 * - 17:00〜23:59 → 当日17:00〜翌6:00
 * - 0:00〜5:59 → 前日17:00〜当日6:00
 * - 6:00〜16:59 → 当日17:00〜翌6:00（これから始まる今夜）
 */
export function getTonightWindowJST(now = new Date()): {
  start: Date;
  end: Date;
} {
  const parts = getJSTParts(now);

  if (parts.hour >= 17) {
    const tomorrow = addDaysJST(parts, 1);
    return {
      start: jstDateTimeToUtc(parts.year, parts.month, parts.day, 17),
      end: jstDateTimeToUtc(tomorrow.year, tomorrow.month, tomorrow.day, 6),
    };
  }

  if (parts.hour < 6) {
    const yesterday = addDaysJST(parts, -1);
    return {
      start: jstDateTimeToUtc(
        yesterday.year,
        yesterday.month,
        yesterday.day,
        17,
      ),
      end: jstDateTimeToUtc(parts.year, parts.month, parts.day, 6),
    };
  }

  const tomorrow = addDaysJST(parts, 1);
  return {
    start: jstDateTimeToUtc(parts.year, parts.month, parts.day, 17),
    end: jstDateTimeToUtc(tomorrow.year, tomorrow.month, tomorrow.day, 6),
  };
}

/**
 * 「今夜の行くかも」用（JST 17:00 〜 翌 5:00）
 * - 17:00〜23:59 → 当日17:00〜翌5:00
 * - 0:00〜4:59 → 前日17:00〜当日5:00
 * - 5:00〜16:59 → 前日17:00〜当日5:00（前夜のリストを日中も確認できる）
 */
export function getTonightInterestWindowJST(now = new Date()): {
  start: Date;
  end: Date;
} {
  const parts = getJSTParts(now);

  if (parts.hour >= 17) {
    const tomorrow = addDaysJST(parts, 1);
    return {
      start: jstDateTimeToUtc(parts.year, parts.month, parts.day, 17),
      end: jstDateTimeToUtc(tomorrow.year, tomorrow.month, tomorrow.day, 5),
    };
  }

  const yesterday = addDaysJST(parts, -1);
  return {
    start: jstDateTimeToUtc(yesterday.year, yesterday.month, yesterday.day, 17),
    end: jstDateTimeToUtc(parts.year, parts.month, parts.day, 5),
  };
}

/** いまが今夜の行くかも時間帯（17:00〜翌5:00）か */
export function isCurrentlyInTonightInterestHours(now = new Date()) {
  const parts = getJSTParts(now);
  return parts.hour >= 17 || parts.hour < 5;
}

/** 当日0時（JST） */
export function getTodayStartJST(now = new Date()): Date {
  const parts = getJSTParts(now);
  return jstDateTimeToUtc(parts.year, parts.month, parts.day, 0);
}

export function isPostPublished(
  iso: string | null | undefined,
  now = new Date(),
) {
  if (!iso) return false;
  return new Date(iso).getTime() <= now.getTime();
}

export function isPostScheduled(
  iso: string | null | undefined,
  now = new Date(),
) {
  if (!iso) return false;
  return new Date(iso).getTime() > now.getTime();
}

/** posted_at が「今夜」の時間帯（17:00〜翌6:00 JST）に入るか */
export function isPostedTonightJST(
  iso: string | null | undefined,
  now = new Date(),
) {
  if (!iso) return false;

  const posted = new Date(iso);
  const { start, end } = getTonightWindowJST(now);
  const time = posted.getTime();

  return time >= start.getTime() && time < end.getTime();
}

export function filterPublishedPosts<
  T extends { posted_at?: string | null },
>(posts: T[], now = new Date()) {
  return posts.filter((post) => isPostPublished(post.posted_at, now));
}

export function filterPostsPostedTonight<
  T extends { posted_at?: string | null },
>(posts: T[], now = new Date()) {
  return posts.filter((post) => isPostedTonightJST(post.posted_at, now));
}

/** @deprecated 今夜定義（17:00〜翌6:00）に統一 */
export function isPostedTodayJST(
  iso: string | null | undefined,
  now = new Date(),
) {
  return isPostedTonightJST(iso, now);
}

/** @deprecated filterPostsPostedTonight を使用 */
export function filterPostsPostedToday<
  T extends { posted_at?: string | null },
>(posts: T[], now = new Date()) {
  return filterPostsPostedTonight(posts, now);
}
