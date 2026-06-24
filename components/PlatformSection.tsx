import SectionHeading from "./SectionHeading";
import { ShieldCheck, Gauge, Workflow, FileCheck, Webhook, Users, ShieldCheckTest } from "./icons";
import type { SVGProps } from "react";

type Feature = {
  title: string;
  description: string;
  Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
};

const FEATURES: Feature[] = [
  {
    title: "Bank-grade security",
    description:
      "End-to-end encryption, SOC 2 Type II controls, ISO 27001 aligned and NDPR/GDPR compliant by default.",
    Icon: ShieldCheckTest,
  },
  {
    title: "Built for scale",
    description:
      "Multi-region infrastructure auto-scales to millions of verifications per day with sub-second latency.",
    Icon: Gauge,
  },
  {
    title: "No-code workflows",
    description:
      "Drag-and-drop decision flows let risk teams ship verification logic without engineering tickets.",
    Icon: Workflow,
  },
  {
    title: "Audit-ready logs",
    description:
      "Every request, decision and reviewer action is signed, timestamped and exportable for compliance.",
    Icon: FileCheck,
  },
  {
    title: "Real-time webhooks",
    description:
      "Stream verification events into your stack — Slack, Sentry, BI tools and your own back office.",
    Icon: Webhook,
  },
  {
    title: "Team & role controls",
    description:
      "Granular RBAC, SSO/SAML, IP allowlists and approval queues for reviewer workflows.",
    Icon: Users,
  },
];

export default function PlatformSection() {
  return (
    <section className="bg-subtle py-20 lg:py-24">
      <div className="container-x flex flex-col gap-14">
        <SectionHeading
          eyebrow="Platform"
          title="Everything compliance, risk & engineering need in"
          accent="one place"
          subtitle="One platform replacing the patchwork of vendors, spreadsheets and manual reviews you use today."
        />

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, description, Icon }) => (
            <li
              key={title}
              className="flex flex-col rounded-card border border-line bg-white p-[29.33px] shadow-card"
            >
              <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-[12px] bg-brand/10 text-brand-accent">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mb-3 text-card-title font-bold text-ink">{title}</h3>
              <p className="text-base text-body">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
