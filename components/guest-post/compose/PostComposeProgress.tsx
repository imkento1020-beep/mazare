"use client";

import type { PostComposeStep } from "@/lib/guest-post/postComposeSteps";
import {
  postComposeStepIndex,
  postComposeStepLabel,
  postComposeStepOrder,
} from "@/lib/guest-post/postComposeSteps";

type PostComposeProgressProps = {
  current: PostComposeStep;
  shopPreselected: boolean;
};

export default function PostComposeProgress({
  current,
  shopPreselected,
}: PostComposeProgressProps) {
  const steps = postComposeStepOrder(shopPreselected);
  const currentIndex = postComposeStepIndex(current, shopPreselected);

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((step, index) => {
        const active = index === currentIndex;
        const done = index < currentIndex;
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                active
                  ? "bg-[#ff3d00] text-white"
                  : done
                    ? "bg-[#ff3d00]/20 text-[#ff3d00]"
                    : "bg-white/[0.06] text-[#5a5668]"
              }`}
            >
              {postComposeStepLabel(step)}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={`h-px w-4 ${done ? "bg-[#ff3d00]/50" : "bg-white/10"}`}
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
