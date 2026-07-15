"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { Plus, Minus } from "./icons";

const FAQS = [
  {
    question: "What is SprintCheck used for?",
    answer:
      "SprintCheck helps you verify customer and business identities in real time so you can onboard faster, reduce fraud, and stay compliant. It combines multiple checks (BVN, NIN, voter's card, facial, and business verification) in one platform and API.",
  },
  {
    question: "Which verification checks are available?",
    answer:
      "You can run BVN verification, NIN verification, voter's card verification, identity checks with selfie liveness, facial re-verification, and business (CAC/KYB) verification. This lets teams cover both individual KYC and business onboarding from one integration.",
  },
  {
    question: "How long does integration take?",
    answer:
      "Most teams can start in hours and go live quickly. Use the sandbox to test flows, integrate via REST API or SDK-friendly patterns, and switch to production keys when your compliance and risk rules are ready.",
  },
  {
    question: "Do you provide a sandbox for testing?",
    answer:
      "Yes. SprintCheck includes a sandbox environment so your team can validate requests, responses, and workflow logic before production rollout.",
  },
  {
    question: "Is SprintCheck compliant with NDPR and GDPR?",
    answer:
      "Yes. SprintCheck is built for privacy and regulatory readiness, including NDPR/GDPR-aligned handling and data residency options across Nigeria, EU, and US regions.",
  },
  {
    question: "How secure is customer data on SprintCheck?",
    answer:
      "SprintCheck uses enterprise-grade security controls such as encryption in transit and at rest, access control, audit logging, and signed webhooks. The platform is designed for high-trust, regulated use cases.",
  },
  {
    question: "What happens when a verification request fails?",
    answer:
      "If a data source is temporarily unavailable, SprintCheck can retry intelligently and return structured status responses so your system can take the right next step (retry, queue, or manual review) without breaking onboarding flows.",
  },
  {
    question: "Can non-engineering teams manage verification rules?",
    answer:
      "Yes. Risk and compliance teams can use workflow tools and dashboard controls to adjust decision logic, escalation paths, and review processes without waiting for code changes each time.",
  },
  {
    question: "Can SprintCheck scale for high-volume onboarding?",
    answer:
      "Yes. SprintCheck is designed for high-throughput verification workloads with low-latency responses, so teams can support growth without stitching together multiple providers.",
  },
  {
    question: "Do you offer enterprise plans and custom contracts?",
    answer:
      "Yes. Enterprise options can include custom SLAs, dedicated support, advanced access controls, and tailored deployment/compliance requirements for larger organizations.",
  },
];

export default function Faq() {
  // First item open by default so the section opens with a sensible answer.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
