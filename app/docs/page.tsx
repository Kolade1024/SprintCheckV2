import Link from "next/link";
import CodeSamples from "@/components/docs/CodeSamples";
import MethodBadge from "@/components/docs/MethodBadge";
import Pager from "@/components/docs/Pager";
import { sampleFor, LANGS } from "@/lib/docs/codegen";
import { ENDPOINTS, SDKS, getEndpoint } from "@/lib/docs/spec";
import { ArrowRight, Fingerprint, Building } from "@/components/icons";

const SURFACES = [
  {
    title: "SDK · Identity checks",
    desc: "Verify BVN, NIN and voter's cards with a liveness-checked selfie, or re-verify a returning face.",
    href: "/docs/sdk-flow",
    Icon: Fingerprint,
    chip: "bg-brand/10 text-brand-accent",
    count: ENDPOINTS.filter((e) => e.base === "sdk").length,
  },
  {
    title: "Merchant API",
    desc: "Account access and business verification — auth, password recovery and CAC lookups.",
    href: "/docs/register",
    Icon: Building,
    chip: "bg-[#2e90fa]/10 text-[#175cd3] dark:bg-[#2e90fa]/15 dark:text-[#8ab6ff]",
    count: ENDPOINTS.filter((e) => e.base === "api").length,
  },
];

const QUICKSTART = [
  {
    title: "Get your API key",
    body: (
      <>
        <Link href="/signup" className="font-medium text-brand-accent underline-offset-2 hover:underline">
          Create an account
        </Link>{" "}
        — a key pair is issued instantly under Developers in your dashboard.
      </>
    ),
  },
  {
    title: "Start a check",
    body: <>Call an SDK endpoint with the document number and your own identifier for the customer.</>,
  },
  {
    title: "Receive the result",
    body: (
      <>
        The customer completes the selfie capture in the SDK, and the outcome lands on your{" "}
        <Link href="/docs/webhooks" className="font-medium text-brand-accent underline-offset-2 hover:underline">
          webhook
        </Link>
        .
      </>
    ),
  },
];

export default function DocsIntroPage() {
  const bvn = getEndpoint("bvn-check")!;
  const samples = LANGS.map((l) => ({ id: l.id, label: l.label, code: sampleFor(bvn, l.id) }));

  return (
    <article className="mx-auto max-w-[1100px]">
      <header className="mb-10">
        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-accent">
          SprintCheck API · v1
        </p>
        <h1 className="max-w-[640px] text-[30px] font-extrabold leading-[1.15] tracking-[-0.8px] text-ink md:text-[38px]">
          Verify identity and customer data <span className="text-gradient">in seconds</span>
        </h1>
        <p className="mt-4 max-w-prose text-lead text-body">
          One REST API for BVN, NIN, voter's card and facial verification, plus CAC business
          lookups. Predictable JSON, a consistent response envelope, and webhooks for every
          completed check.
        </p>
      </header>

      {/* Quickstart + first call */}
      <div className="mb-12 grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <section aria-label="Quickstart">
          <h2 className="mb-4 border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
            Quickstart
          </h2>
          <ol className="flex flex-col">
            {QUICKSTART.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                {i < QUICKSTART.length - 1 ? (
                  <span aria-hidden="true" className="absolute left-[15px] top-9 h-[calc(100%-36px)] w-px bg-line" />
                ) : null}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 font-mono text-[12px] font-semibold text-brand-accent">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-1">
                  <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-small leading-relaxed text-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/docs/bvn-check"
            className="mt-5 inline-flex items-center gap-1.5 text-small font-semibold text-brand-accent transition-colors hover:text-brand"
          >
            Make your first BVN check <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <CodeSamples title="Your first request — POST /bvn" samples={samples} />
      </div>

      {/* Surfaces */}
      <section aria-label="API surfaces" className="mb-12">
        <h2 className="mb-4 border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
          Two surfaces, one host
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SURFACES.map(({ title, desc, href, Icon, chip, count }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-3 rounded-card border border-line p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-glass"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${chip}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink group-hover:text-brand-accent">{title}</h3>
                <p className="mt-1 text-small leading-relaxed text-body">{desc}</p>
              </div>
              <p className="mt-auto font-mono text-[11px] text-body/70">{count} endpoints</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Client SDKs */}
      <section aria-label="Client SDKs" className="mb-12">
        <h2 className="mb-4 border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
          Client SDKs
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SDKS.map((sdk) => (
            <Link
              key={sdk.slug}
              href={`/docs/${sdk.slug}`}
              className="group flex flex-col gap-2 rounded-card border border-line p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-glass"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-small font-semibold text-ink group-hover:text-brand-accent">
                  {sdk.platform}
                </h3>
                <span className="font-mono text-[11px] text-body/70">v{sdk.version}</span>
              </div>
              <code className="truncate font-mono text-[11px] text-body">{sdk.pkg}</code>
              <p className="mt-auto truncate rounded-md bg-subtle px-2 py-1.5 font-mono text-[11px] text-ink/80">
                {sdk.install}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular endpoints */}
      <section aria-label="Popular endpoints">
        <h2 className="mb-4 border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
          Popular endpoints
        </h2>
        <ul className="divide-y divide-line rounded-card border border-line">
          {["bvn-check", "nin-check", "facial-check", "voters-check", "cac-name-search"].map((slug) => {
            const ep = getEndpoint(slug)!;
            return (
              <li key={slug}>
                <Link
                  href={`/docs/${slug}`}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand/[0.03]"
                >
                  <MethodBadge method={ep.method} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-small font-medium text-ink group-hover:text-brand-accent">
                      {ep.name}
                    </span>
                  </span>
                  <code className="hidden shrink-0 font-mono text-[11px] text-body/70 md:block">{ep.path}</code>
                  <ArrowRight className="h-4 w-4 shrink-0 text-body/40 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-accent" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Pager slug="" />
    </article>
  );
}
