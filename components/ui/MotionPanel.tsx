"use client";

import type { ReactNode } from "react";

type MotionPanelProps = {
  panelKey: string;
  children: ReactNode;
  className?: string;
};

/** Cross-fade / slide-in when `panelKey` changes (tabs, toggles). */
export default function MotionPanel({
  panelKey,
  children,
  className = "",
}: MotionPanelProps) {
  return (
    <div key={panelKey} className={`mazare-panel-enter ${className}`.trim()}>
      {children}
    </div>
  );
}
