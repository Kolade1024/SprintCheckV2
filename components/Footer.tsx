import Image from "next/image";

type FooterLink = { label: string; href: string };

const link = (label: string, href = "#"): FooterLink => ({ label, href });

/** Off-site links (e.g. the status page) open in a new tab. */
const externalProps = (href: string) =>
  href.startsWith("http")
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

const COLUMNS = [
  {
    heading: "Products",
    links: [
      link("BVN Verification", "/docs/bvn-check"),
      link("NIN Verification", "/docs/nin-check"),
      link("KYC", "/docs/sdk-flow"),
      link("KYB", "/docs/cac-name-search"),
      link("Voter's Card", "/docs/voters-check"),
      link("Facial Check", "/docs/facial-check"),
    ],
  },
  {
    heading: "Solutions",
    links: [link("Banking"), link("Lending"), link("Crypto"), link("Insurance"), link("Gig economy")],
  },
  {
    heading: "Developers",
    links: [
      link("Documentation", "/docs"),
      link("API Reference", "/docs"),
      link("Status", "https://stats.uptimerobot.com/x0HhHO47C5"),
      link("Changelog"),
      link("SDKs", "/docs/sdk-flow"),
    ],
  },
  {
    heading: "Company",
    links: [link("About"), link("Careers"), link("Press"), link("Partners"), link("Contact", "/contact")],
  },
];

const LEGAL: FooterLink[] = [
  link("Privacy", "/privacy"),
  link("Terms", "/terms"),
  link("Security", "/#security"),
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-4 md:col-span-3 lg:col-span-1">
            <Image
              src="/logo-sprintcheck.png"
              alt="SprintCheck"
              width={71}
              height={46}
              className="h-[46px] w-fit"
            />
            <p className="max-w-[320px] text-small text-body">
              Identity &amp; KYC infrastructure for modern fintech. Secure, fast,
              compliant.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading} className="flex flex-col gap-4">
              <h4 className="text-base font-semibold text-ink">{column.heading}</h4>
              <ul className="flex flex-col gap-3">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...externalProps(item.href)}
                      className="text-small text-body transition-colors hover:text-ink"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-stat-label text-body">
            © 2026 SprintCheck. All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            {LEGAL.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-stat-label text-body transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
