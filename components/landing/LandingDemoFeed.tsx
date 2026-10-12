import LandingDemoPostCard from "@/components/landing/LandingDemoPostCard";
import { LANDING_DEMO_POSTS } from "@/lib/landing/demoPosts";

export default function LandingDemoFeed() {
  return (
    <section
      className="border-b border-white/[0.06] bg-[#0a0910] pt-20 pb-8 sm:pb-10"
      aria-label="投稿のイメージ"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <p className="mb-4 text-center text-[11px] font-bold tracking-[0.12em] text-[#5a5668]">
          今夜の街の投稿イメージ
        </p>
        <div className="scrollbar-hidden -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:gap-4">
          {LANDING_DEMO_POSTS.map((post, index) => (
            <LandingDemoPostCard
              key={post.id}
              post={post}
              priorityImage={index === 0}
              className="w-[72vw] max-w-[280px] snap-center sm:w-auto sm:max-w-none"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
