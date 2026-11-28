"use client";

import dynamic from "next/dynamic";

function NativeWelcomeLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#080810]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
    </div>
  );
}

const NativeWelcomeClient = dynamic(
  () => import("./NativeWelcomeClient"),
  {
    ssr: false,
    loading: () => <NativeWelcomeLoading />,
  },
);

export default function NativeWelcomeGate() {
  return <NativeWelcomeClient />;
}