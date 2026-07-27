import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LanguageExplorer from "@/components/sdks/LanguageExplorer";
import { CodeBrackets, ShieldCheck, LayoutGrid, ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "SDKs — Official client libraries for every stack",
  description:
    "Battle-tested SprintCheck client libraries for the languages your team already uses. Install, import, and verify identity data in minutes.",
};

const FEATURES = [
  {
    title: "Type-safe",
    description: "Every SDK ships with first-class types and auto-completion.",
  },
  {
    title: "Retries & idempotency",
    description: "Built-in exponential backoff and request idempotency keys.",
  },
  {
    title: "Webhook helpers",
    description: "Verify HMAC signatures and parse events with one helper.",
  },
];

export default function SdksPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(55% 45% at 50% 0%, rgba(118,59,241,0.16) 0%, rgba(118,59,241,0) 60%)",
            }}
          />
          <div className="container-x pb-16 pt-32 text-center md:pt-40">
            <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-subtle px-[13.33px] py-[5.33px] shadow-glass">
              <CodeBrackets className="h-3.5 w-3.5 text-brand-accent" />
              <span className="text-stat-label font-semibold text-brand-accent">
                Developer Tools
              </span>
            </span>

            <h1 className="mx-auto mt-6 max-w-[820px] text-balance text-[40px] font-extrabold leading-[1.05] tracking-[-1.5px] text-ink md:text-h1">
              Official SDKs for <span className="text-gradient">every stack</span>
            </h1>

            <p className="mx-auto mt-5 max-w-[600px] text-base text-body md:text-lead">
              Battle-tested client libraries for the languages your team already
              uses. Install, import, and verify identity data in minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-btn bg-brand px-5 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
              >
                Get API keys
              </a>
              <a
                href="#choose-language"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-btn border border-line bg-white px-5 text-small font-medium text-ink shadow-btn transition-colors hover:bg-subtle"
              >
                <LayoutGrid className="h-4 w-4 text-body" />
                Browse SDKs
              </a>
            </div>
          </div>
        </section>

        {/* Language explorer */}
        <LanguageExplorer />

        {/* Feature strip */}
        <section className="bg-subtle py-16 lg:py-20">
          <div className="container-x grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map(({ title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-card border border-line bg-white p-6 shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand/10 text-brand-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-small text-body">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface py-20 lg:py-24">
          <div className="container-x text-center">
            <h2 className="text-balance text-[28px] font-extrabold leading-[1.15] tracking-[-0.5px] text-ink md:text-h2">
              Ready to integrate?
            </h2>
            <p className="mx-auto mt-3 max-w-prose text-base text-body md:text-lead">
              Grab your API keys and start building in the sandbox.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-btn bg-brand px-5 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
              >
                Get API keys
              </a>
              <a
                href="/sandbox"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-btn border border-line bg-white px-5 text-small font-medium text-ink shadow-btn transition-colors hover:bg-subtle"
              >
                Try the sandbox
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
