"use client";

import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { Check, BookOpen, ArrowRight } from "@/components/icons";
import CopyButton from "@/components/docs/CopyButton";
import {
  NodeLogo,
  PythonLogo,
  PhpLogo,
  RubyLogo,
  GoLogo,
  JavaLogo,
} from "@/components/sdks/logos";

/* Reusable token spans for the code windows (mirrors DeveloperSection). */
const K = ({ children }: { children: ReactNode }) => (
  <span className="text-code-keyword">{children}</span>
);
const S = ({ children }: { children: ReactNode }) => (
  <span className="text-code-string">{children}</span>
);
const F = ({ children }: { children: ReactNode }) => (
  <span className="text-code-fn">{children}</span>
);
const C = ({ children }: { children: ReactNode }) => (
  <span className="text-code-comment">{children}</span>
);

type Language = {
  id: string;
  name: string;
  /** Package-manager one-liner shown on the card. */
  install: string;
  /** Brand hue — tints the tile and colours the logo. */
  tile: string;
  Logo: ComponentType<SVGProps<SVGSVGElement>>;
  /** Copyable plain-text version of the quickstart (install + snippet). */
  raw: string;
  code: ReactNode;
};

const LANGUAGES: Language[] = [
  {
    id: "node",
    name: "Node.js",
    install: "npm install @sprintcheck/node",
    tile: "#3c873a",
    Logo: NodeLogo,
    raw: `npm install @sprintcheck/node

import { SprintCheck } from "@sprintcheck/node";

const client = new SprintCheck({ apiKey: process.env.SPRINTCHECK_KEY });

const identity = await client.verify.bvn({ bvn: "22212345678" });
console.log(identity.status); // "verified"`,
    code: (
      <>
        <K>import</K> {"{ SprintCheck } "}
        <K>from</K> <S>{'"@sprintcheck/node"'}</S>;{"\n\n"}
        <K>const</K> client = <K>new</K> <F>SprintCheck</F>({"{ "}apiKey: process.env.
        SPRINTCHECK_KEY{" }"});{"\n\n"}
        <K>const</K> identity = <K>await</K> client.verify.<F>bvn</F>({"{ "}bvn:{" "}
        <S>{'"22212345678"'}</S>
        {" }"});{"\n"}
        console.<F>log</F>(identity.status); <C>{'// "verified"'}</C>
      </>
    ),
  },
  {
    id: "python",
    name: "Python",
    install: "pip install sprintcheck",
    tile: "#3776ab",
    Logo: PythonLogo,
    raw: `pip install sprintcheck

import os
from sprintcheck import SprintCheck

client = SprintCheck(api_key=os.environ["SPRINTCHECK_KEY"])

identity = client.verify.bvn(bvn="22212345678")
print(identity.status)  # "verified"`,
    code: (
      <>
        <K>import</K> os{"\n"}
        <K>from</K> sprintcheck <K>import</K> SprintCheck{"\n\n"}
        client = <F>SprintCheck</F>(api_key=os.environ[<S>{'"SPRINTCHECK_KEY"'}</S>]){"\n\n"}
        identity = client.verify.<F>bvn</F>(bvn=<S>{'"22212345678"'}</S>){"\n"}
        <F>print</F>(identity.status)  <C>{'# "verified"'}</C>
      </>
    ),
  },
  {
    id: "php",
    name: "PHP",
    install: "composer require sprintcheck/sprintcheck-php",
    tile: "#777bb4",
    Logo: PhpLogo,
    raw: `composer require sprintcheck/sprintcheck-php

<?php
$client = new SprintCheck\\Client(getenv('SPRINTCHECK_KEY'));

$identity = $client->verify->bvn(['bvn' => '22212345678']);

echo $identity->status; // "verified"`,
    code: (
      <>
        <C>{"<?php"}</C>
        {"\n"}
        $client = <K>new</K> <F>SprintCheck\Client</F>(<F>getenv</F>(
        <S>{"'SPRINTCHECK_KEY'"}</S>));{"\n\n"}
        $identity = $client-&gt;verify-&gt;<F>bvn</F>([<S>{"'bvn'"}</S> =&gt;{" "}
        <S>{"'22212345678'"}</S>]);{"\n\n"}
        <K>echo</K> $identity-&gt;status; <C>{'// "verified"'}</C>
      </>
    ),
  },
  {
    id: "ruby",
    name: "Ruby",
    install: "gem install sprintcheck",
    tile: "#cc342d",
    Logo: RubyLogo,
    raw: `gem install sprintcheck

require "sprintcheck"

client = SprintCheck::Client.new(api_key: ENV["SPRINTCHECK_KEY"])

identity = client.verify.bvn(bvn: "22212345678")
puts identity.status # => "verified"`,
    code: (
      <>
        <K>require</K> <S>{'"sprintcheck"'}</S>
        {"\n\n"}
        client = <F>SprintCheck::Client</F>.<F>new</F>(api_key: ENV[
        <S>{'"SPRINTCHECK_KEY"'}</S>]){"\n\n"}
        identity = client.verify.<F>bvn</F>(bvn: <S>{'"22212345678"'}</S>){"\n"}
        <F>puts</F> identity.status <C>{'# => "verified"'}</C>
      </>
    ),
  },
  {
    id: "go",
    name: "Go",
    install: "go get github.com/sprintcheck/sprintcheck-go",
    tile: "#00acd7",
    Logo: GoLogo,
    raw: `go get github.com/sprintcheck/sprintcheck-go

client := sprintcheck.New(os.Getenv("SPRINTCHECK_KEY"))

identity, err := client.Verify.BVN(ctx, &sprintcheck.BVNParams{
    BVN: "22212345678",
})

fmt.Println(identity.Status) // "verified"`,
    code: (
      <>
        client := sprintcheck.<F>New</F>(os.<F>Getenv</F>(<S>{'"SPRINTCHECK_KEY"'}</S>)){"\n\n"}
        identity, err := client.Verify.<F>BVN</F>(ctx, &amp;sprintcheck.BVNParams{"{"}
        {"\n"}
        {"    "}BVN: <S>{'"22212345678"'}</S>,{"\n"}
        {"}"}){"\n\n"}
        fmt.<F>Println</F>(identity.Status) <C>{'// "verified"'}</C>
      </>
    ),
  },
  {
    id: "java",
    name: "Java",
    install: "implementation 'com.sprintcheck:sprintcheck-java:1.0.0'",
    tile: "#e76f00",
    Logo: JavaLogo,
    raw: `gradle implementation 'com.sprintcheck:sprintcheck-java:1.0.0'

SprintCheck client = new SprintCheck(System.getenv("SPRINTCHECK_KEY"));

Identity identity = client.verify().bvn(
    BvnParams.builder().bvn("22212345678").build());

System.out.println(identity.status()); // "verified"`,
    code: (
      <>
        <F>SprintCheck</F> client = <K>new</K> <F>SprintCheck</F>(System.
        <F>getenv</F>(<S>{'"SPRINTCHECK_KEY"'}</S>));{"\n\n"}
        <F>Identity</F> identity = client.<F>verify</F>().<F>bvn</F>({"\n"}
        {"    "}BvnParams.<F>builder</F>().<F>bvn</F>(<S>{'"22212345678"'}</S>).
        <F>build</F>());{"\n\n"}
        System.out.<F>println</F>(identity.<F>status</F>()); <C>{'// "verified"'}</C>
      </>
    ),
  },
];

function LanguageTile({ lang }: { lang: Language }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
      style={{ backgroundColor: `${lang.tile}1a`, color: lang.tile }}
    >
      <lang.Logo className="h-[22px] w-[22px]" />
    </span>
  );
}

export default function LanguageExplorer() {
  const [activeId, setActiveId] = useState(LANGUAGES[0].id);
  const active = LANGUAGES.find((l) => l.id === activeId) ?? LANGUAGES[0];

  return (
    <section id="choose-language" className="bg-surface py-20 lg:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-prose text-center">
          <h2 className="text-balance text-[28px] font-extrabold leading-[1.15] tracking-[-0.5px] text-ink md:text-h2">
            Choose your language
          </h2>
          <p className="mt-3 text-base text-body md:text-lead">
            All SDKs share the same predictable API and sandbox environment.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {/* Language picker */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {LANGUAGES.map((lang) => {
              const selected = lang.id === active.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setActiveId(lang.id)}
                  aria-pressed={selected}
                  className={`flex items-center gap-4 rounded-card border p-4 text-left transition-all ${
                    selected
                      ? "border-brand/40 bg-white shadow-glass ring-1 ring-brand/20"
                      : "border-line bg-white/60 hover:border-brand/30 hover:bg-white"
                  }`}
                >
                  <LanguageTile lang={lang} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-ink">
                      {lang.name}
                    </span>
                    <span className="mt-0.5 block break-words font-mono text-[12px] leading-[1.5] text-body">
                      {lang.install}
                    </span>
                  </span>
                  {selected && (
                    <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quickstart code window */}
          <div className="overflow-hidden rounded-panel border border-white/10 bg-code-bg shadow-glass">
            {/* Title bar */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-code-bar px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="font-mono text-[13px] text-code-text">
                  {active.name} quickstart
                </span>
              </div>
              <CopyButton
                text={active.raw}
                variant="dark"
                className="bg-white/5 hover:bg-white/10"
              />
            </div>

            {/* Code body */}
            <pre className="no-scrollbar overflow-x-auto px-6 py-6 font-mono text-[13px] leading-[1.7] text-code-text">
              <code>
                <span className="text-code-fn">&gt;_</span>{" "}
                <span className="text-code-string">{active.install}</span>
                {"\n\n"}
                {active.code}
              </code>
            </pre>

            {/* Footer */}
            <a
              href="/docs/sdk-flow"
              className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4 text-code-text transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2 text-small">
                <BookOpen className="h-4 w-4" />
                Read {active.name} documentation
              </span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
