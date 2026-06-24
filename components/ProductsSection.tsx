import SectionHeading from "./SectionHeading";
import { IdCard, Fingerprint, ScanFace, Smartphone, MapPin, Building, ArrowRight } from "./icons";
import type { SVGProps } from "react";

type Product = {
  title: string;
  description: string;
  Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
};

const PRODUCTS: Product[] = [
  {
    title: "BVN Verification",
    description:
      "Validate Bank Verification Numbers against the central database in real time.",
    Icon: IdCard,
  },
  {
    title: "NIN Verification",
    description:
      "Confirm National Identification Numbers with biometric-grade accuracy.",
    Icon: Fingerprint,
  },
  {
    title: "Identity Check",
    description: "Cross-reference government IDs with selfie liveness detection.",
    Icon: ScanFace,
  },
  {
    title: "Phone Validation",
    description: "Verify ownership, carrier and risk score for any mobile number.",
    Icon: Smartphone,
  },
  {
    title: "Address Verification",
    description: "Validate physical addresses with agent-led field verification.",
    Icon: MapPin,
  },
  {
    title: "Business Verification",
    description: "CAC lookups, directors, beneficial owners and compliance status.",
    Icon: Building,
  },
];

export default function ProductsSection() {
  return (
    <section id="products" className="bg-surface py-20 lg:py-24">
      <div className="container-x flex flex-col gap-14">
        <SectionHeading
          eyebrow="Products"
          title="Every verification you need,"
          accent="one API"
          subtitle="From individual KYC to enterprise KYB — built for scale, latency and compliance."
        />

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map(({ title, description, Icon }) => (
            <li
              key={title}
              className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white p-[29.33px] shadow-card transition-shadow hover:shadow-glass"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line to-transparent"
              />
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-[12px] bg-brand text-white shadow-glow">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mb-3 text-card-title font-bold text-ink">{title}</h3>
              <p className="mb-6 text-base text-body">{description}</p>
              <a
                href="#"
                className="mt-auto inline-flex items-center gap-1 text-small font-medium text-brand-accent transition-transform group-hover:translate-x-0.5"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
