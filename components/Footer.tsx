import Image from "next/image";

const COLUMNS = [
  {
    heading: "Products",
    links: ["BVN Verification", "NIN Verification", "KYC", "KYB", "Address", "Phone"],
  },
  {
    heading: "Solutions",
    links: ["Banking", "Lending", "Crypto", "Insurance", "Gig economy"],
  },
  {
    heading: "Developers",
    links: ["Documentation", "API Reference", "Status", "Changelog", "SDKs"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Press", "Partners", "Contact"],
  },
];

const LEGAL = ["Privacy", "Terms", "Security"];

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
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-small text-body transition-colors hover:text-ink"
                    >
                      {link}
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
              <li key={item}>
                <a
                  href="#"
                  className="text-stat-label text-body transition-colors hover:text-ink"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
