"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/data/faq";
import { cn } from "@/lib/utils/cn";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="ajuda" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Perguntas frequentes
        </h2>
        <div className="mt-8 divide-y divide-border">
          {faqItems.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-medium text-ink">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-ink-muted transition-transform",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                {open && <p className="pb-5 text-sm leading-relaxed text-ink-secondary">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
