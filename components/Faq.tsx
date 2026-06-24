"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { Plus, Minus } from "./icons";

/**
 * The Figma frame shows the last item expanded with its answer; the toggle is a
 * built-in interactive component (collapsed/expanded icon states). Only the last
 * answer's copy is present in the design — the other answers are written to match
 * so the accordion functions as intended.
 */
const FAQS = [
  {
    question: "How long does integration take?",
    answer:
      "Most teams are live in a day. Drop in our SDK or call the REST API directly, test against the sandbox, and switch to production keys when you're ready.",
  },
  {
    question: "Which data sources do you connect to?",
    answer:
      "We connect directly to authoritative sources, including the BVN and NIN databases, CAC, mobile carriers and global watchlists.",
  },
  {
    question: "Is SprintCheck NDPR & GDPR compliant?",
    answer:
      "Yes. SprintCheck is NDPR and GDPR compliant by default, with data residency options in Nigeria, the EU and the US.",
  },
  {
    question: "Do you offer custom enterprise contracts?",
    answer:
      "Absolutely. Enterprise plans include dedicated infrastructure, custom SLAs, SSO/RBAC, audit exports and a named customer success manager.",
  },
  {
    question: "What happens if a verification fails?",
    answer:
      "You only pay for successful verifications. Failed lookups (due to upstream source outage) are not billed and are automatically retried with circuit-breaker protection.",
  },
];

export default function Faq() {
  // Last item open by default, matching the Figma frame.
  const [openIndex, setOpenIndex] = useState<number | null>(FAQS.length - 1);

  return (
    <section id="faq" className="bg-surface py-20 lg:py-24">
      <div className="container-x flex flex-col items-center gap-12">
        <SectionHeading eyebrow="FAQ" title="Frequently asked" accent="questions" />

        <div className="w-full max-w-[768px] overflow-hidden rounded-card border border-line bg-white p-2 shadow-card">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <div
                key={faq.question}
                className={index < FAQS.length - 1 ? "border-b border-line" : ""}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  >
                    <span className="text-base font-semibold text-ink">
                      {faq.question}
                    </span>
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-brand-accent">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid overflow-hidden transition-all duration-300 ease-smooth ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <p className="px-4 pb-5 text-small leading-[1.6] text-body">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
