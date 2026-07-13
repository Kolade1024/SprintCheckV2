import { BASES, REALMS, endpointUrl, queryString, type Endpoint } from "./spec";

export type Lang = "curl" | "javascript" | "python";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
];

const authValue = (ep: Endpoint, shellStyle: "curl" | "js" | "py") => {
  const realm = REALMS[ep.realm];
  if (!realm.envVar) return null;
  const bearer = ep.realm !== "apikey";
  const ref =
    shellStyle === "curl"
      ? `$${realm.envVar}`
      : shellStyle === "js"
        ? `\${process.env.${realm.envVar}}`
        : `{os.environ['${realm.envVar}']}`;
  return bearer ? `Bearer ${ref}` : ref;
};

export function sampleFor(ep: Endpoint, lang: Lang): string {
  const url = endpointUrl(ep, { fillPath: true }) + queryString(ep);
  const body = ep.body ? JSON.stringify(ep.body, null, 2) : null;

  if (lang === "curl") {
    const lines = [`curl -X ${ep.method} "${url}"`];
    const auth = authValue(ep, "curl");
    if (auth) lines.push(`  -H "Authorization: ${auth}"`);
    lines.push(`  -H "Accept: application/json"`);
    if (body) {
      lines.push(`  -H "Content-Type: application/json"`);
      lines.push(`  -d '${body.replace(/'/g, "'\\''")}'`);
    }
    return lines.join(" \\\n");
  }

  if (lang === "javascript") {
    const auth = authValue(ep, "js");
    const headers = [
      auth ? `    Authorization: \`${auth}\`,` : null,
      `    Accept: "application/json",`,
      body ? `    "Content-Type": "application/json",` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const bodyLine = body
      ? `\n  body: JSON.stringify(${JSON.stringify(ep.body, null, 2).replace(/\n/g, "\n  ")}),`
      : "";
    return [
      `const res = await fetch("${url}", {`,
      `  method: "${ep.method}",`,
      `  headers: {`,
      headers,
      `  },${bodyLine}`,
      `});`,
      ``,
      `const data = await res.json();`,
    ].join("\n");
  }

  // python
  const auth = authValue(ep, "py");
  const headerLines = [
    auth ? `        "Authorization": f"${auth}",` : null,
    `        "Accept": "application/json",`,
  ]
    .filter(Boolean)
    .join("\n");
  const lines = [
    `import os`,
    `import requests`,
    ``,
    `res = requests.${ep.method.toLowerCase()}(`,
    `    "${url}",`,
    `    headers={`,
    headerLines,
    `    },`,
  ];
  if (body) {
    const pyLiteral = body
      .replace(/\btrue\b/g, "True")
      .replace(/\bfalse\b/g, "False")
      .replace(/\bnull\b/g, "None")
      .replace(/\n/g, "\n    ");
    lines.push(`    json=${pyLiteral},`);
  }
  lines.push(`)`, ``, `data = res.json()`);
  return lines.join("\n");
}

export { BASES };
