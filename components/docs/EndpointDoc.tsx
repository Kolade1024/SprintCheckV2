import {
  BASES,
  NAV,
  REALMS,
  endpointUrl,
  type Endpoint,
} from "@/lib/docs/spec";
import { LANGS, sampleFor } from "@/lib/docs/codegen";
import Callout from "./Callout";
import CodeSamples from "./CodeSamples";
import CopyButton from "./CopyButton";
import JsonPanel from "./JsonPanel";
import MethodBadge from "./MethodBadge";
import Pager from "./Pager";
import ParamTable from "./ParamTable";
import RealmChip from "./RealmChip";
import TryIt from "./TryIt";

export default function EndpointDoc({ ep }: { ep: Endpoint }) {
  const section = NAV.find((s) => s.items.some((i) => i.slug === ep.slug));
  const realm = REALMS[ep.realm];
  const displayUrl = `${BASES[ep.base]}${ep.path}`;
  const responseJson = JSON.stringify(ep.response, null, 2);
  const status = ep.responseStatus ?? 200;
  const samples = LANGS.map((l) => ({ id: l.id, label: l.label, code: sampleFor(ep, l.id) }));

  return (
    <article className="mx-auto max-w-[1200px]">
      {/* Header */}
      <header className="mb-8">
        {section ? (
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-accent">
            {section.label}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.5px] text-ink md:text-[30px]">
            {ep.name}
          </h1>
          <RealmChip realm={ep.realm} />
        </div>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-body">{ep.summary}</p>

        {/* Endpoint bar */}
        <div className="scan-sweep mt-5 flex items-center gap-3 overflow-hidden rounded-card border border-line bg-subtle/70 py-2.5 pl-3 pr-1.5">
          <MethodBadge method={ep.method} />
          <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-ink">
            {displayUrl}
          </code>
          <CopyButton text={displayUrl} variant="light" label="Copy endpoint URL" />
        </div>
      </header>

      {ep.note ? (
        <div className="mb-8 max-w-prose">
          <Callout tone={ep.note.tone}>{ep.note.text}</Callout>
        </div>
      ) : null}

      {/* Two-column: reference + code */}
      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div className="flex min-w-0 flex-col gap-8">
          <section aria-label="Authorization">
            <h2 className="mb-3 border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
              Authorization
            </h2>
            <p className="text-small leading-relaxed text-body">{realm.desc}</p>
            {realm.header ? (
              <code className="mt-2 inline-block rounded-md bg-subtle px-2.5 py-1.5 font-mono text-[12px] text-ink">
                {realm.header}
              </code>
            ) : null}
          </section>

          <section aria-label="Parameters">
            <h2 className="mb-3 border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
              Parameters
            </h2>
            <ParamTable params={ep.params} />
          </section>
        </div>

        {/* Code column */}
        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-[76px] xl:self-start">
          <CodeSamples title={`${ep.method} ${ep.path}`} samples={samples} />
          <JsonPanel
            title={`Response · ${status}`}
            json={responseJson}
            footnote={ep.authoredResponse ? "Representative example — field values are illustrative." : undefined}
          />
        </div>
      </div>

      {/* Try it */}
      <div className="mt-10">
        <TryIt
          method={ep.method}
          urlTemplate={endpointUrl(ep)}
          params={ep.params}
          responseJson={responseJson}
          responseStatus={status}
        />
      </div>

      <Pager slug={ep.slug} />
    </article>
  );
}
