import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Shared shell for long-form legal pages (Terms, Privacy). Renders the marketing
 * chrome around a single readable prose column with consistent heading styles.
 */
export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="bg-surface">
        <div className="container-x pt-32 md:pt-36 lg:pt-40">
          <div className="mx-auto max-w-[760px] pb-24">
            {/* Header */}
            <header className="border-b border-line pb-8">
              <span className="eyebrow">Legal</span>
              <h1 className="mt-4 text-[36px] font-extrabold leading-[1.05] tracking-[-1px] text-ink md:text-[48px]">
                {title}
              </h1>
              <p className="mt-4 text-small text-body">Last updated: {updated}</p>
              <p className="mt-4 text-base leading-relaxed text-body">{intro}</p>
            </header>

            {/* Body */}
            <div className="legal-prose mt-10">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* Section building blocks — keep the two policy pages visually identical. */

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="text-card-title font-bold text-ink">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-body">
        {children}
      </div>
    </section>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
