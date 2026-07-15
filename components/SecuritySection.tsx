import { CheckCircle, ShieldCheck, BadgeCheck, Lock, FileCheck, SOC2, ISO2700, WorldIcon, PCI } from "./icons";
import type { SVGProps } from "react";

const CHECKLIST = [
  "Data residency in Nigeria, EU & US",
  "Role-based access, SSO/SAML, audit trails",
  "Independent penetration testing every quarter",
  "Signed webhooks with HMAC verification",
];

const BADGES: {
  title: string;
  description: string;
  Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
}[] = [
    { title: "SOC 2 Type II", description: "Independently audited security & availability.", Icon: SOC2 },
    { title: "ISO 27001", description: "Information security management aligned.", Icon: ISO2700 },
    { title: "NDPR / GDPR", description: "Privacy-first data handling across regions.", Icon: WorldIcon },
    { title: "PCI DSS Ready", description: "Tokenized data and zero card-data storage.", Icon: PCI },
  ];

export default function SecuritySection() {
  return (
    <section id="security" className="bg-surface py-20 lg:py-24">
      <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        {/* Left column */}
        <div className="flex flex-col items-start gap-6">
          <span className="eyebrow">Security &amp; Compliance</span>
          <h2 className="text-balance text-[32px] font-extrabold leading-[1.1] tracking-[-1px] text-ink md:text-h2">
            Trust isn&apos;t a feature —{" "}
            <span className="text-gradient">it&apos;s the foundation</span>
          </h2>
          <p className="max-w-[576px] text-base text-body md:text-lead">
            Customer data is encrypted at rest with AES-256 and in transit with
            TLS 1.3. Access is least-privilege, every action is logged, and our
            infrastructure is continuously monitored for threats.
          </p>
          <ul className="flex flex-col gap-3 pt-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-success" />
                <span className="text-base text-ink">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — compliance badges */}
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          {BADGES.map(({ title, description, Icon }) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-card border border-line bg-subtle p-[21.33px]"
            >
              <span className="text-brand-accent">
                <Icon className="h-6 w-6" />
              </span>
              <p className="text-base font-semibold text-ink">{title}</p>
              <p className="text-small text-body">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
