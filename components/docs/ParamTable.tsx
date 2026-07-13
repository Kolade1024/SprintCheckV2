import type { Param, ParamIn } from "@/lib/docs/spec";

const GROUP_LABEL: Record<ParamIn, string> = {
  path: "Path parameters",
  query: "Query parameters",
  body: "Body parameters",
};

function Rows({ params }: { params: Param[] }) {
  return (
    <ul className="divide-y divide-line">
      {params.map((p) => (
        <li key={p.name} className="flex flex-col gap-1 py-3.5">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <code className="font-mono text-[13px] font-semibold text-ink">{p.name}</code>
            <span className="font-mono text-[11px] text-body">{p.type}</span>
            {p.required ? (
              <span className="font-mono text-[11px] font-medium text-[#b54708] dark:text-[#f5b169]">required</span>
            ) : (
              <span className="font-mono text-[11px] text-body/70">optional</span>
            )}
          </div>
          <p className="text-small text-body">{p.desc}</p>
          {p.example ? (
            <p className="font-mono text-[11px] text-body/70">
              Example: <span className="text-ink/80">{p.example}</span>
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function ParamTable({ params }: { params: Param[] }) {
  if (params.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line px-4 py-3 text-small text-body">
        This endpoint takes no parameters — send the request with just your credentials.
      </p>
    );
  }

  const groups = (["path", "query", "body"] as ParamIn[])
    .map((loc) => ({ loc, items: params.filter((p) => p.in === loc) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.loc}>
          <h4 className="border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
            {GROUP_LABEL[g.loc]}
          </h4>
          <Rows params={g.items} />
        </div>
      ))}
    </div>
  );
}
