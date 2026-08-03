"use client";

import { useState } from "react";
import Link from "next/link";

export type FaqEntry = {
  q: string;
  a: string;
  links?: { label: string; href: string }[];
};

function FaqItem({
  question,
  answer,
  links,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  links?: { label: string; href: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.07] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-[#eeeaf4]">{question}</span>
        <span className="shrink-0 text-[#5a5668]">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="pb-5 text-sm leading-relaxed text-[#9994a8]">
          <p>{answer}</p>
          {links && links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-semibold text-[#ff3d00] hover:underline"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FaqAccordion({
  sections,
}: {
  sections: { category: string; questions: FaqEntry[] }[];
}) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.category}>
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#ff3d00]">
            {section.category}
          </h2>
          <div className="mt-4 rounded-[14px] border border-white/[0.07] bg-[#111118] px-5">
            {section.questions.map((item, index) => (
              <FaqItem
                key={item.q}
                question={item.q}
                answer={item.a}
                links={item.links}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
