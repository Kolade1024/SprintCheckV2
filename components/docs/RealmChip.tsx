import { REALMS, type Realm } from "@/lib/docs/spec";
import { Lock } from "@/components/icons";

export default function RealmChip({ realm }: { realm: Realm }) {
  const r = REALMS[realm];
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-pill px-2.5 font-mono text-[11px] font-medium ${r.chip}`}
      title={r.desc}
    >
      {realm !== "public" ? <Lock className="h-3 w-3" /> : null}
      {r.short}
    </span>
  );
}
