"use client";

type StepIndicatorProps = {
  step: number;
  total?: number;
};

export default function StepIndicator({ step, total = 3 }: StepIndicatorProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < step ? "bg-[#ff3d00]" : "bg-[#18181f]"
            }`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm font-medium text-[#ff3d00]">
        STEP {step} / {total}
      </p>
    </div>
  );
}
