/**
 * SprintCheck API reference — data spec.
 *
 * Extracted from `SprintCheck.postman_collection(3).json` (SDK and Merchant
 * surfaces; the collection's Admin folder is internal and intentionally not
 * documented). Sample responses marked `authoredResponse` are representative
 * examples written for the docs; the CAC name search response comes from the
 * collection's saved example.
 *
 * Credentials shown anywhere in the docs are placeholders — the real
 * collection keys are intentionally not reproduced here.
 */

export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type Realm = "public" | "apikey" | "merchant";
export type ParamIn = "body" | "query" | "path";

export type Param = {
  name: string;
  type: string;
  in: ParamIn;
  required?: boolean;
  desc: string;
  example?: string;
};

export type Endpoint = {
  kind: "endpoint";
  slug: string;
  name: string;
  method: Method;
  base: keyof typeof BASES;
  path: string; // path params written as {param}
  realm: Realm;
  summary: string;
  note?: { tone: "info" | "warn"; text: string };
  params: Param[];
  body?: Record<string, unknown>;
  response: unknown;
  responseStatus?: number;
  /** true when the example response was authored for these docs */
  authoredResponse?: boolean;
};

export type GuidePage = {
  kind: "guide";
  slug: string;
  name: string;
  summary: string;
};

export type NavItem = { slug: string; label: string; method?: Method };
export type NavSection = { label: string; realm?: Realm; items: NavItem[] };

export const BASES = {
  api: "https://api.sprintcheck.megasprintlimited.com.ng/api/v1",
  sdk: "https://api.sprintcheck.megasprintlimited.com.ng/api/sdk",
} as const;

export const REALMS: Record<
  Realm,
  {
    label: string;
    short: string;
    header: string | null;
    envVar: string | null;
    desc: string;
    /** tailwind classes for the realm chip */
    chip: string;
  }
> = {
  public: {
    label: "No authentication",
    short: "Public",
    header: null,
    envVar: null,
    desc: "This endpoint is public and needs no credentials.",
    chip: "bg-black/5 text-body dark:bg-white/10",
  },
  apikey: {
    label: "API key",
    short: "API key",
    header: "Authorization: <api_key>",
    envVar: "SPRINTCHECK_API_KEY",
    desc: "Send your secret API key in the Authorization header. Keys are issued per business — find them under Developers in your dashboard.",
    chip: "bg-brand/10 text-brand-accent",
  },
  merchant: {
    label: "Merchant bearer token",
    short: "Merchant token",
    header: "Authorization: Bearer <token>",
    envVar: "SPRINTCHECK_TOKEN",
    desc: "Send the bearer token returned by POST /auth/login in the Authorization header.",
    chip: "bg-[#2e90fa]/10 text-[#175cd3] dark:bg-[#2e90fa]/15 dark:text-[#8ab6ff]",
  },
};

const ok = (message: string, data: unknown) => ({ status: true, message, data });

/* ------------------------------------------------------------------ */
/* SDK — identity checks                                               */
/* ------------------------------------------------------------------ */

const sdk: Endpoint[] = [
  {
    kind: "endpoint",
    slug: "bvn-check",
    name: "Start a BVN check",
    method: "POST",
    base: "sdk",
    path: "/bvn",
    realm: "apikey",
    summary:
      "Initiates a Bank Verification Number check for a customer. Creates a pending verification tied to your identifier and returns a reference — launch the SprintCheck SDK with the same identifier so the customer can complete the selfie capture.",
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The customer's 11-digit Bank Verification Number.", example: "22454670613" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "A unique reference for this customer in your system (email or username). The SDK capture is matched back to the check through this value.", example: "samji@email.com" },
    ],
    body: { number: "22454670613", identifier: "samji@email.com" },
    response: ok("BVN check initiated", {
      reference: "36135803-0843-48d6-b8bf-5d47490a6ade",
      identifier: "samji@email.com",
      type: "bvn",
      status: "pending",
      fee: 50,
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "bvn-sdk-response",
    name: "Submit BVN capture",
    method: "PUT",
    base: "sdk",
    path: "/bvn",
    realm: "apikey",
    summary:
      "Completes a pending BVN check with the selfie captured by the SprintCheck SDK. The face is matched against the photo on the BVN record and the verification is finalised.",
    note: {
      tone: "info",
      text: "The SDK calls this endpoint for you after the capture step. You only need it when building a custom capture flow.",
    },
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The BVN being verified — must match the initiating check.", example: "22454670613" },
      { name: "reference", type: "string", in: "body", required: true, desc: "The reference returned when the check was started.", example: "36135803-0843-48d6-b8bf-5d47490a6ade" },
      { name: "confidence", type: "string", in: "body", required: true, desc: "Liveness score from the capture step, 0–100.", example: "80" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "The identifier the check was started with.", example: "samjibaba_bvn" },
      { name: "image", type: "string", in: "body", required: true, desc: "Base64-encoded selfie image (PNG or JPEG, no data-URI prefix)." },
    ],
    body: {
      number: "22454670613",
      reference: "36135803-0843-48d6-b8bf-5d47490a6ade",
      confidence: "80",
      identifier: "samjibaba_bvn",
      image: "iVBORw0KGgoAAAANSUhEUgAA...",
    },
    response: ok("Verification completed", {
      reference: "36135803-0843-48d6-b8bf-5d47490a6ade",
      verified: true,
      face_match: true,
      confidence: "80",
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "nin-check",
    name: "Start a NIN check",
    method: "POST",
    base: "sdk",
    path: "/nin",
    realm: "apikey",
    summary:
      "Initiates a National Identification Number check. Works exactly like the BVN check: a pending verification is created and completed through the SDK's selfie capture.",
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The customer's 11-digit National Identification Number.", example: "52306459347" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "A unique reference for this customer in your system.", example: "samji@nin.com" },
    ],
    body: { number: "52306459347", identifier: "samji@nin.com" },
    response: ok("NIN check initiated", {
      reference: "fab0f22b-2948-4c75-9b4d-0f59687d5138",
      identifier: "samji@nin.com",
      type: "nin",
      status: "pending",
      fee: 50,
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "nin-sdk-response",
    name: "Submit NIN capture",
    method: "PUT",
    base: "sdk",
    path: "/nin",
    realm: "apikey",
    summary:
      "Completes a pending NIN check with the captured selfie. The face is matched against the photo on the NIN record.",
    note: {
      tone: "info",
      text: "The SDK calls this endpoint for you after the capture step. You only need it when building a custom capture flow.",
    },
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The NIN being verified — must match the initiating check.", example: "52306459347" },
      { name: "reference", type: "string", in: "body", required: true, desc: "The reference returned when the check was started.", example: "fab0f22b-2948-4c75-9b4d-0f59687d5138" },
      { name: "confidence", type: "string", in: "body", required: true, desc: "Liveness score from the capture step, 0–100.", example: "90" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "The identifier the check was started with.", example: "identifier_nin" },
      { name: "image", type: "string", in: "body", required: true, desc: "Base64-encoded selfie image (PNG or JPEG, no data-URI prefix)." },
    ],
    body: {
      number: "52306459347",
      reference: "fab0f22b-2948-4c75-9b4d-0f59687d5138",
      confidence: "90",
      identifier: "identifier_nin",
      image: "iVBORw0KGgoAAAANSUhEUgAA...",
    },
    response: ok("Verification completed", {
      reference: "fab0f22b-2948-4c75-9b4d-0f59687d5138",
      verified: true,
      face_match: true,
      confidence: "90",
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "voters-check",
    name: "Start a voter's card check",
    method: "POST",
    base: "sdk",
    path: "/voters",
    realm: "apikey",
    summary:
      "Initiates a voter's card check using the customer's Voter Identification Number (VIN). Completed through the SDK's selfie capture like the other document checks.",
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The 19-character Voter Identification Number on the customer's voter's card.", example: "90F5AE4625505997419" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "A unique reference for this customer in your system.", example: "samji@email.com" },
    ],
    body: { number: "90F5AE4625505997419", identifier: "samji@email.com" },
    response: ok("Voter's card check initiated", {
      reference: "2d9621d1-576c-41a7-8879-83a563d194c8",
      identifier: "samji@email.com",
      type: "voters",
      status: "pending",
      fee: 50,
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "voters-sdk-response",
    name: "Submit voter's card capture",
    method: "PUT",
    base: "sdk",
    path: "/voters",
    realm: "apikey",
    summary:
      "Completes a pending voter's card check with the captured selfie. The face is matched against the photo on the INEC record.",
    note: {
      tone: "info",
      text: "The SDK calls this endpoint for you after the capture step. You only need it when building a custom capture flow.",
    },
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The VIN being verified — must match the initiating check.", example: "90F5AE4625505997419" },
      { name: "reference", type: "string", in: "body", required: true, desc: "The reference returned when the check was started.", example: "2d9621d1-576c-41a7-8879-83a563d194c8" },
      { name: "confidence", type: "string", in: "body", required: true, desc: "Liveness score from the capture step, 0–100.", example: "80" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "The identifier the check was started with.", example: "samjibaba_voters" },
      { name: "image", type: "string", in: "body", required: true, desc: "Base64-encoded selfie image (PNG or JPEG, no data-URI prefix)." },
    ],
    body: {
      number: "90F5AE4625505997419",
      reference: "2d9621d1-576c-41a7-8879-83a563d194c8",
      confidence: "80",
      identifier: "samjibaba_voters",
      image: "iVBORw0KGgoAAAANSUhEUgAA...",
    },
    response: ok("Verification completed", {
      reference: "2d9621d1-576c-41a7-8879-83a563d194c8",
      verified: true,
      face_match: true,
      confidence: "80",
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "facial-check",
    name: "Start a facial check",
    method: "POST",
    base: "sdk",
    path: "/facial",
    realm: "apikey",
    summary:
      "Re-verifies a returning customer's face against the capture stored from an earlier successful check. Use it for step-up authentication without asking for the document number again.",
    params: [
      { name: "identifier", type: "string", in: "body", required: true, desc: "The identifier used on a previously completed check. The new capture is matched against the face stored for it.", example: "samjibaba_bvn" },
      { name: "reference", type: "string", in: "body", desc: "Optional reference of your own to tag this facial check with.", example: "optional_reference" },
    ],
    body: { identifier: "samjibaba_bvn", reference: "optional_reference" },
    response: ok("Facial check initiated", {
      reference: "optional_reference",
      identifier: "samjibaba_bvn",
      type: "facial",
      status: "pending",
      fee: 30,
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "facial-sdk-response",
    name: "Submit facial capture",
    method: "PUT",
    base: "sdk",
    path: "/facial",
    realm: "apikey",
    summary:
      "Completes a pending facial check with the new selfie. The face is matched against the stored capture for the identifier.",
    note: {
      tone: "info",
      text: "The SDK calls this endpoint for you after the capture step. You only need it when building a custom capture flow.",
    },
    params: [
      { name: "reference", type: "string", in: "body", required: true, desc: "The reference of the pending facial check.", example: "optional_reference" },
      { name: "confidence", type: "string", in: "body", required: true, desc: "Liveness score from the capture step, 0–100.", example: "90" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "The identifier the check was started with.", example: "samjibaba_bvn" },
      { name: "image", type: "string", in: "body", required: true, desc: "Base64-encoded selfie image (PNG or JPEG, no data-URI prefix)." },
    ],
    body: {
      reference: "optional_reference",
      confidence: "90",
      identifier: "samjibaba_bvn",
      image: "iVBORw0KGgoAAAANSUhEUgAA...",
    },
    response: ok("Verification completed", {
      reference: "optional_reference",
      verified: true,
      face_match: true,
      confidence: "90",
    }),
    authoredResponse: true,
  },
];

/* ------------------------------------------------------------------ */
/* Registry & navigation                                               */
/* ------------------------------------------------------------------ */

export const ENDPOINTS: Endpoint[] = [...sdk];

export const GUIDES: GuidePage[] = [
  { kind: "guide", slug: "authentication", name: "Authentication", summary: "API keys and request signing — the two credentials every request must carry." },
  { kind: "guide", slug: "errors", name: "Errors", summary: "The response envelope and the status codes the API returns." },
  { kind: "guide", slug: "webhooks", name: "Webhooks", summary: "Receive verification results on your server as they complete." },
  { kind: "guide", slug: "sdk-flow", name: "How the SDK works", summary: "The check → capture → result lifecycle behind every identity verification." },
  { kind: "guide", slug: "android-sdk", name: "Android SDK", summary: "Kotlin library via JitPack — KYCVerificationManager, BVN, NIN and facial flows in native Android apps." },
  { kind: "guide", slug: "flutter-sdk", name: "Flutter SDK", summary: "sprint_check plugin on pub.dev — BVN and NIN verification with photo capture for Flutter apps." },
  { kind: "guide", slug: "react-native-sdk", name: "React Native SDK", summary: "sprintcheckrn on npm — BVN, NIN and facial verification for React Native apps." },
  { kind: "guide", slug: "expo-sdk", name: "Expo SDK", summary: "sprintcheck-expo on npm — identity verification for React Native Expo projects." },
];

/** Client SDK packages — one docs page per platform. */
export const SDKS = [
  {
    slug: "android-sdk",
    platform: "Android",
    lang: "Kotlin",
    pkg: "com.github.odejinmi:sprintcheckandroid",
    version: "1.0.1",
    registry: "JitPack",
    url: "https://jitpack.io/#odejinmi/sprintcheckandroid/1.0.1",
    install: 'implementation("com.github.odejinmi:sprintcheckandroid:1.0.1")',
  },
  {
    slug: "flutter-sdk",
    platform: "Flutter",
    lang: "Dart",
    pkg: "sprint_check",
    version: "0.1.8",
    registry: "pub.dev",
    url: "https://pub.dev/packages/sprint_check",
    install: "flutter pub add sprint_check",
  },
  {
    slug: "react-native-sdk",
    platform: "React Native",
    lang: "TypeScript",
    pkg: "sprintcheckrn",
    version: "1.1.4",
    registry: "npm",
    url: "https://www.npmjs.com/package/sprintcheckrn",
    install: "npm install sprintcheckrn",
  },
  {
    slug: "expo-sdk",
    platform: "Expo",
    lang: "TypeScript",
    pkg: "sprintcheck-expo",
    version: "1.0.5",
    registry: "npm",
    url: "https://www.npmjs.com/package/sprintcheck-expo",
    install: "npm install sprintcheck-expo",
  },
] as const;

const item = (slug: string): NavItem => {
  const ep = ENDPOINTS.find((e) => e.slug === slug);
  if (ep) return { slug, label: ep.name, method: ep.method };
  const guide = GUIDES.find((g) => g.slug === slug);
  return { slug, label: guide ? guide.name : slug };
};

export const NAV: NavSection[] = [
  {
    label: "Get started",
    items: [
      { slug: "", label: "Introduction" },
      item("authentication"),
      item("errors"),
      item("webhooks"),
    ],
  },
  {
    label: "SDK · Identity checks",
    realm: "apikey",
    items: [
      item("sdk-flow"),
      ...sdk.map((e) => item(e.slug)),
    ],
  },
  {
    label: "SDK · Libraries",
    realm: "apikey",
    items: [
      item("android-sdk"),
      item("flutter-sdk"),
      item("react-native-sdk"),
      item("expo-sdk"),
    ],
  },
];

/** Flat ordered list of every nav slug — used for prev/next pagination. */
export const NAV_ORDER: NavItem[] = NAV.flatMap((s) => s.items);

export const getEndpoint = (slug: string) => ENDPOINTS.find((e) => e.slug === slug);
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);

/** Resolve an endpoint's display URL with path params filled from examples. */
export function endpointUrl(ep: Endpoint, opts?: { fillPath?: boolean }) {
  let path = ep.path;
  if (opts?.fillPath) {
    for (const p of ep.params.filter((p) => p.in === "path")) {
      path = path.replace(`{${p.name}}`, p.example ?? "1");
    }
  }
  return `${BASES[ep.base]}${path}`;
}

export function queryString(ep: Endpoint) {
  const qs = ep.params
    .filter((p) => p.in === "query" && p.example)
    .map((p) => `${p.name}=${encodeURIComponent(p.example as string)}`)
    .join("&");
  return qs ? `?${qs}` : "";
}
