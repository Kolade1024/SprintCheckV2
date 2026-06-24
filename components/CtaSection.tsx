import { Sparkles, ArrowRight } from "./icons";

export default function CtaSection() {
  return (
    <section id="sandbox" className="bg-surface py-12 lg:py-16">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-hero bg-brand px-8 py-16 shadow-glow md:px-16">
          {/* Decorative blurred circles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-[#4b48ee]/40 blur-3xl"
          />

          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* Left content */}
            <div className="flex flex-col items-start gap-5">
              <span className="inline-flex items-center gap-2 rounded-pill border border-white/30 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-white" />
                <span className="text-stat-label font-medium text-white">
                  Production-ready in minutes
                </span>
              </span>
              <h2 className="text-balance text-[32px] font-extrabold leading-[1.1] tracking-[-1px] text-white md:text-[40px]">
                Start verifying today
              </h2>
              <p className="max-w-[512px] text-base text-white/80 md:text-lead">
                Spin up a sandbox key, send your first request and ship to
                production this week.
              </p>
            </div>

            {/* Right actions */}
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href="#"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-white px-6 text-base font-medium text-ink shadow-btn transition-transform hover:-translate-y-px"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex h-12 items-center justify-center rounded-btn border border-white/30 bg-white/10 px-6 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
