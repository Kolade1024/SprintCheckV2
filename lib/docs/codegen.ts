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

/** Env var holding the encryption key used to sign request bodies. */
const SIGNING_ENV = "SPRINTCHECK_ENCRYPTION_KEY";

export function sampleFor(ep: Endpoint, lang: Lang): string {
  const url = endpointUrl(ep, { fillPath: true }) + queryString(ep);
  const body = ep.body ? JSON.stringify(ep.body, null, 2) : null;

  if (lang === "curl") {
    const request = [`curl -X ${ep.method} "${url}"`];
    const auth = authValue(ep, "curl");
    if (auth) request.push(`  -H "Authorization: ${auth}"`);
    if (body) request.push(`  -H "signature: $SIGNATURE"`);
    request.push(`  -H "Accept: application/json"`);
    if (body) {
      request.push(`  -H "Content-Type: application/json"`);
      request.push(`  -d "$PAYLOAD"`);
    }
    const call = request.join(" \\\n");
    if (!body) return call;
    // The API hashes the body with all whitespace stripped, so sign that same
    // form (tr -d) even though the readable body is what gets sent.
    return [
      `PAYLOAD='${body.replace(/'/g, "'\\''")}'`,
      `SIGNATURE=$(printf '%s' "$PAYLOAD" | tr -d '[:space:]' \\`,
      `  | openssl dgst -sha512 -hmac "$${SIGNING_ENV}" \\`,
      `  | awk '{print $NF}')`,
      ``,
      call,
    ].join("\n");
  }

  if (lang === "javascript") {
    const auth = authValue(ep, "js");
    const headers = [
      auth ? `    Authorization: \`${auth}\`,` : null,
      body ? `    signature,` : null,
      `    Accept: "application/json",`,
      body ? `    "Content-Type": "application/json",` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const preamble = body
      ? [
          `import crypto from "node:crypto";`,
          ``,
          `const payload = JSON.stringify(${body.replace(/\n/g, "\n")});`,
          ``,
          `// The API hashes the body with all whitespace stripped.`,
          `const signature = crypto`,
          `  .createHmac("sha512", process.env.${SIGNING_ENV})`,
          `  .update(payload.replace(/[\\n\\t\\s]/g, ""))`,
          `  .digest("hex");`,
          ``,
        ]
      : [];
    return [
      ...preamble,
      `const res = await fetch("${url}", {`,
      `  method: "${ep.method}",`,
      `  headers: {`,
      headers,
      `  },${body ? `\n  body: payload,` : ""}`,
      `});`,
      ``,
      `const data = await res.json();`,
    ].join("\n");
  }

  // python
  const auth = authValue(ep, "py");
  const headerLines = [
    auth ? `        "Authorization": f"${auth}",` : null,
    body ? `        "signature": signature,` : null,
    `        "Accept": "application/json",`,
    body ? `        "Content-Type": "application/json",` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const pyLiteral = body
    ? body
        .replace(/\btrue\b/g, "True")
        .replace(/\bfalse\b/g, "False")
        .replace(/\bnull\b/g, "None")
    : null;
  const lines = body
    ? [
        `import hashlib`,
        `import hmac`,
        `import json`,
        `import os`,
        `import re`,
        `import requests`,
        ``,
        `payload = json.dumps(${pyLiteral})`,
        ``,
        `# The API hashes the body with all whitespace stripped.`,
        `message = re.sub(r"[\\n\\t\\s]", "", payload)`,
        `signature = hmac.new(`,
        `    os.environ["${SIGNING_ENV}"].encode(),`,
        `    message.encode(),`,
        `    hashlib.sha512,`,
        `).hexdigest()`,
        ``,
      ]
    : [`import os`, `import requests`, ``];
  lines.push(
    `res = requests.${ep.method.toLowerCase()}(`,
    `    "${url}",`,
    `    headers={`,
    headerLines,
    `    },`,
  );
  // `data=` rather than `json=` so requests sends the signed bytes verbatim.
  if (body) lines.push(`    data=payload,`);
  lines.push(`)`, ``, `data = res.json()`);
  return lines.join("\n");
}

export { BASES };
