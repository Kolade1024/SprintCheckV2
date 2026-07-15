import { Activity, Lock, BadgeCheck, WorldIcon, ShieldCheckTest } from "./icons";
import type { SVGProps } from "react";

const BADGES: { label: string; Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element }[] = [
  { label: "99.9% Uptime", Icon: Activity },
  { label: "Secure API", Icon: Lock },
  { label: "GDPR Compliant", Icon: WorldIcon },
  { label: "Millions of verifications", Icon: ShieldCheckTest },
];

const BRANDS: { name: string; href: string }[] = [
  { name: "Honour World", href: "https://honourworld.com/" },
  { name: "Osusupay", href: "https://osusupay.com" },
  { name: "Cashonrails", href: "https://cashonrails.com/" },
  { name: "Mega Cheap Data", href: "https://megacheapdata.5starcompany.com.ng/" },
  { name: "PlanetF", href: "https://www.planetf.ng/" },
  { name: "Paylony", href: "https://paylony.com/" },
];

export default function TrustStrip() {
  return (
    <section className="bg-surface py-12">
      <div className="container-x flex flex-col gap-12">
        {/* Badge cards */}
        <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {BADGES.map(({ label, Icon }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-card border border-line bg-white p-4 shadow-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-brand/10 text-brand-accent">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-ink">{label}</span>
            </li>
          ))}
        </ul>

        {/* Brand wordmarks */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-small text-body">
            Powering verification for industry leaders
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {BRANDS.map(({ name, href }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm text-xl font-bold text-ink/30 transition-colors hover:text-ink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
