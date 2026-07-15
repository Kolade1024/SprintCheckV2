import { Code, FlaskConical, BookOpen } from "./icons";
import type { SVGProps } from "react";

type Item = {
  title: string;
  description: string;
  Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
};

const ITEMS: Item[] = [
  { title: "REST API", description: "Predictable JSON, API-key auth & webhooks on every check.", Icon: Code },
  { title: "Sandbox Access", description: "Free test environment with realistic data.", Icon: FlaskConical },
  { title: "Developer Docs", description: "Full API reference with SDKs for Android, Flutter, React Native & Expo.", Icon: BookOpen },
];

/* Reusable token spans for the code window */
const K = ({ children }: { children: React.ReactNode }) => (
  <span className="text-code-keyword">{children}</span>
);
const S = ({ children }: { children: React.ReactNode }) => (
  <span className="text-code-string">{children}</span>
);
const F = ({ children }: { children: React.ReactNode }) => (
  <span className="text-code-fn">{children}</span>
);
const C = ({ children }: { children: React.ReactNode }) => (
  <span className="text-code-comment">{children}</span>
);

function CodeWindow() {
  return (
    <div className="relative">
      {/* Glow behind the window */}
      <div
        aria-hidden="true"
        className="absolute -inset-4 -z-10 rounded-panel bg-brand opacity-20 blur-2xl"
      />
      <div className="overflow-hidden rounded-panel border border-white/10 bg-code-bg shadow-glass">
        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-code-bar px-4 py-3">
          <span className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </span>
          <span className="font-mono text-[12px] text-code-comment">verify-bvn.ts</span>
        </div>

        {/* Code body */}
        <pre className="no-scrollbar overflow-x-auto px-6 py-6 font-mono text-[13px] leading-[1.7] text-code-text">
          <code>
            <C>{"// Start a BVN check"}</C>
            {"\n"}
            <K>const</K> res = <K>await</K> <F>fetch</F>(<S>{'"https://api.sprintcheck.megasprintlimited.com.ng/api/sdk/bvn"'}</S>, {"{"}
            {"\n"}
            {"  "}method: <S>{'"POST"'}</S>,
            {"\n"}
            {"  "}headers: {"{"}
            {"\n"}
            {"    "}<S>{'"Authorization"'}</S>: process.env.SPRINTCHECK_API_KEY,
            {"\n"}
            {"    "}<S>{'"Content-Type"'}</S>: <S>{'"application/json"'}</S>,
            {"\n"}
            {"  "}{"}"},
            {"\n"}
            {"  "}body: <F>JSON</F>.<F>stringify</F>({"{ "}number: <S>{'"22454670613"'}</S>, identifier: <S>{'"user@yourapp.com"'}</S>{" }"}),
            {"\n"}
            {"}"});
            {"\n\n"}
            <K>const</K> data = <K>await</K> res.<F>json</F>();
            {"\n"}
            <C>{'// { status: true, message: "BVN check initiated",'}</C>
            {"\n"}
            <C>{'//   data: { reference: "36135803-…", status: "pending", fee: 50 } }'}</C>
          </code>
        </pre>
      </div>
    </div>
  );
}

export default function DeveloperSection() {
  return (
    <section id="developers" className="bg-surface py-20 lg:py-24">
      <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col items-start gap-6">
          <span className="eyebrow">For developers</span>
          <h2 className="text-balance text-[32px] font-extrabold leading-[1.1] tracking-[-1px] text-ink md:text-h2">
            Integrate in minutes, <span className="text-gradient">not months</span>
          </h2>
          <p className="max-w-[512px] text-base text-body md:text-lead">
            A clean REST API, generous sandbox, idiomatic SDKs and docs your team
            will actually enjoy reading.
          </p>

          <ul className="flex w-full flex-col gap-4 pt-2">
            {ITEMS.map(({ title, description, Icon }) => (
              <li key={title} className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-brand/10 text-brand-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-semibold text-ink">{title}</p>
                  <p className="text-small text-body">{description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/docs"
              className="inline-flex h-9 items-center justify-center rounded-btn bg-brand px-4 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
            >
              Read the docs
            </a>
            <a
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-btn border border-line bg-white px-4 text-small font-medium text-ink shadow-btn transition-colors hover:bg-subtle"
            >
              Get API keys
            </a>
          </div>
        </div>

        {/* Right column — code window */}
        <CodeWindow />
      </div>
    </section>
  );
}
