"use client";

type MyPostGridVideoThumbProps = {
  src: string;
};

/** Grid cell: first frame from remote video (metadata preload). */
export default function MyPostGridVideoThumb({ src }: MyPostGridVideoThumbProps) {
  const withTime = src.includes("#") ? src : `${src}#t=0.001`;

  return (
    <div className="relative h-full w-full bg-[#0a0a10]">
      <video
        src={withTime}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-[8px] text-white"
        aria-hidden
      >
        ▶
      </span>
    </div>
  );
}
