import Image from "next/image";
import { Sparkles, ArrowRight, CheckCircle } from "./icons";

const TRUST_ITEMS = ["No credit card", "Sandbox in minutes", "GDPR & NDPR ready"];

function FloatingStat({
  label,
  value,
  dotClass,
  className,
}: {
  label: string;
  value: string;
  dotClass: string;
  className: string;
}) {
  return (
    <div
      className={`absolute flex animate-float flex-col gap-1 rounded-panel border border-white/60 bg-white/70 px-[17.33px] py-[13.33px] shadow-glass backdrop-blur-md motion-reduce:animate-none ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
        <span className="text-stat-label text-body">{label}</span>
      </div>
      <span className="text-stat-value font-bold text-ink">{value}</span>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden ">
      {/* Background radial glows over white */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 "
        style={{
          background:
            "radial-gradient(60% 50% at 80% 20%, rgba(166,114,255,0.25) 0%, rgba(166,114,255,0) 60%), radial-gradient(50% 40% at 10% 80%, rgba(75,72,238,0.18) 0%, rgba(75,72,238,0) 60%)",
        }}
      />

      <div className="container-x py-16 md:py-24 lg:py-28 md:mt-[3rem] mt-15">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-white/60 px-[13.33px] py-[5.33px] shadow-glass backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
              <span className="text-stat-label font-medium text-body">
                Trusted identity infrastructure for Africa
              </span>
            </span>

            <h1 className="text-balance text-[44px] font-extrabold leading-[1.05] tracking-[-1.5px] text-ink sm:text-[56px] lg:text-h1">
              Verify identity &amp; customer data in{" "}
              <span className="text-gradient">seconds</span>
            </h1>

            <p className="max-w-[576px] text-lead text-body">
              Secure identity verification, BVN validation, NIN checks, KYC
              compliance, and fraud prevention for modern businesses.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/sandbox"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
              >
                Start Verification
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex h-12 items-center justify-center rounded-btn border border-line bg-white px-6 text-base font-medium text-ink shadow-btn transition-colors hover:bg-subtle"
              >
                Book a Demo
              </a>
            </div>

            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
              {TRUST_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-brand-accent" />
                  <span className="text-small text-body">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column — dashboard preview */}
          <div className="relative mx-auto w-full max-w-[550px]">
            {/* Glow behind the card */}
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[32px] bg-brand opacity-20 blur-3xl"
            />
            <div className="rounded-hero border border-white/60 bg-white/70 p-[13.33px] shadow-glass backdrop-blur-md">
              <Image
                src="/hero-dashboard.png"
                alt="SprintCheck verification dashboard preview"
                width={1024}
                height={1024}
                priority
                className="aspect-square w-full rounded-panel object-cover"
              />
            </div>

            <FloatingStat
              label="Verifications today"
              value="48,231"
              dotClass="bg-success"
              className="-left-3 top-10 md:-left-6"
            />
            <FloatingStat
              label="Avg. response"
              value="312ms"
              dotClass="bg-brand"
              className="-right-2 bottom-12 [animation-delay:-2.5s] md:-right-4"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
