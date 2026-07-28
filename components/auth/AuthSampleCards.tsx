const sampleCards = [
  {
    emoji: "🎵",
    name: "島唄酒場 ゆんたく",
    area: "渋谷",
    hours: "17:00–24:00",
    comment: "カラオケ開放中！知らない人たちと大合唱になってます🎤",
    moods: ["激熱", "混ざり歓迎"],
    going: 24,
    heat: 5,
  },
  {
    emoji: "🍻",
    name: "クラフトビール ROOTS",
    area: "恵比寿",
    hours: "18:00–02:00",
    comment: "DJセット始まりました。一人でも歓迎！",
    moods: ["音楽あり", "混ざり歓迎"],
    going: 11,
    heat: 3,
  },
];

function moodClass(mood: string) {
  if (mood === "激熱") return "border-[#ff3d00]/30 bg-[#ff3d00]/10 text-[#ff3d00]";
  if (mood === "混ざり歓迎") return "border-[#00e87a]/30 bg-[#00e87a]/10 text-[#00e87a]";
  return "border-[#ffaa00]/30 bg-[#ffaa00]/10 text-[#ffaa00]";
}

function SampleCard({
  emoji,
  name,
  area,
  hours,
  comment,
  moods,
  going,
  heat,
}: (typeof sampleCards)[0]) {
  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-[#111118]/90 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <div className="relative h-16 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-2xl">
          {emoji}
        </div>
        <span className="absolute left-1.5 top-1.5 rounded bg-[#ff3d00] px-1 py-0.5 text-[8px] font-extrabold uppercase text-white">
          LIVE
        </span>
        <div className="absolute right-1.5 top-1.5 flex gap-0.5 rounded-full border border-white/10 bg-[#080810]/80 px-1.5 py-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full ${i <= heat ? "bg-[#ff3d00]" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1">
          <h3 className="line-clamp-1 text-xs font-extrabold text-[#eeeaf4]">
            {name}
          </h3>
          <span className="shrink-0 rounded-full border border-[#00e87a]/25 bg-[#00e87a]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#00e87a]">
            {going}
          </span>
        </div>
        <p className="mt-0.5 text-[9px] text-[#5a5668]">
          📍 {area} · 🕙 {hours}
        </p>
        <p className="mt-1.5 line-clamp-2 rounded border-l-2 border-[#ff3d00] bg-[#18181f]/80 pl-2 text-[10px] leading-relaxed text-[#9994a8]">
          {comment}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {moods.map((mood) => (
            <span
              key={mood}
              className={`rounded-full border px-1.5 py-0.5 text-[8px] font-medium ${moodClass(mood)}`}
            >
              {mood}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function AuthSampleCards() {
  return (
    <div className="relative z-10 mt-8 w-full max-w-md lg:max-w-lg">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
        今夜ホットな場所
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {sampleCards.map((card) => (
          <SampleCard key={card.name} {...card} />
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[#5a5668]/80">
        ※ サンプル表示です
      </p>
    </div>
  );
}
