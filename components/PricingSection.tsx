import SectionHeading from "./SectionHeading";
import { Check, IdCard, Fingerprint } from "./icons";
import type { SVGProps } from "react";

type Plan = {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  note: string;
  features: string[];
  href: string;
  badge?: string;
  featured?: boolean;
  Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
};

const PLANS: Plan[] = [
  {
    name: "BVN Verification",
    tagline: "Best for KYC onboarding at scale",
    price: "₦60",
    unit: "per verification",
    note: "Only successful checks are billed",
    features: [
      "Real-time verification",
      "Detailed BVN data",
      "Facial matching available",
      "API documentation",
      "Technical support",
    ],
    href: "/signup",
    badge: "Most popular",
    featured: true,
    Icon: IdCard,
  },
  {
    name: "NIN Verification",
    tagline: "Complete identity from a single number",
    price: "₦65",
    unit: "per verification",
    note: "Only successful checks are billed",
    features: [
      "Instant NIN validation",
      "Complete identity details",
      "Facial matching available",
      "API documentation",
      "Technical support",
    ],
    href: "/signup",
    Icon: Fingerprint,
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const { name, tagline, price, unit, note, features, href, badge, featured, Icon } = plan;
  return (
    <div className="relative">
      {/* Soft colour glow behind the featured card */}
      {featured ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 -z-10 rounded-[32px] opacity-70 blur-2xl"
          style={{
            background:
              "radial-gradient(60% 60% at 70% 20%, rgba(236,120,196,0.35) 0%, rgba(236,120,196,0) 70%), radial-gradient(60% 60% at 20% 80%, rgba(118,59,241,0.28) 0%, rgba(118,59,241,0) 70%)",
          }}
        />
      ) : null}

      <div
        className={`flex h-full flex-col rounded-hero bg-white p-6 md:p-7 ${
          featured
            ? "shadow-glass ring-1 ring-black/[0.04]"
            : "border border-line shadow-card"
        }`}
      >
        {/* Top row: icon + badge */}
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-subtle text-brand-accent">
            <Icon className="h-[22px] w-[22px]" />
          </span>
          {badge ? (
            <span className="inline-flex h-7 items-center rounded-pill border border-brand/25 bg-brand/[0.06] px-3 text-[12px] font-semibold text-brand-accent">
              {badge}
            </span>
          ) : null}
        </div>

        {/* Name + tagline */}
        <h3 className="mt-5 text-[22px] font-bold tracking-[-0.3px] text-ink">{name}</h3>
        <p className="mt-1 text-small text-body">{tagline}</p>

        {/* Price + note */}
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[44px] font-extrabold leading-none tracking-[-1.5px] text-ink">
              {price}
            </span>
            <span className="text-small text-body">/{unit.replace("per ", "")}</span>
          </div>
          <p className="max-w-[120px] text-right text-[12px] leading-tight text-body">
            {note}
          </p>
        </div>

        {/* Nested feature panel */}
        <div className="mt-6 flex flex-1 flex-col rounded-panel bg-subtle/70 p-5">
          <ul className="flex flex-col gap-3.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-small text-ink/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <a
          href={href}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-pill bg-brand text-base font-semibold text-offwhite shadow-glow transition-transform hover:-translate-y-px"
        >
          Get started
        </a>
      </div>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-subtle py-20 lg:py-24">
      <div className="container-x flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="Pricing"
          title="Pay per verification,"
          accent="nothing more"
          subtitle="No setup fees, no monthly minimums. You're only billed for successful verifications."
        />

        <div className="grid w-full max-w-[860px] grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="text-small text-body">
          Need higher volumes or custom pricing?{" "}
          <a
            href="/contact"
            className="font-medium text-brand-accent underline-offset-2 hover:underline"
          >
            Talk to sales
          </a>
        </p>
      </div>
    </section>
  );
}
