import type { ReactNode } from "react";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-white/[0.07] py-8 last:border-b-0">
      <h2 className="text-lg font-bold text-[#eeeaf4]">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#9994a8]">
        {children}
      </div>
    </section>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalOrderedList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
