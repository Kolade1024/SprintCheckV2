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

const ok = (message: string, data: unknown) => ({ success: 1, message, data });

/* ------------------------------------------------------------------ */
/* Identity verification — one-shot direct checks                      */
/* ------------------------------------------------------------------ */

const sdk: Endpoint[] = [
  {
    kind: "endpoint",
    slug: "bvn-check",
    name: "Verify BVN",
    method: "POST",
    base: "api",
    path: "/bvn",
    realm: "apikey",
    summary:
      "Validates a customer's Bank Verification Number and returns the identity record held against it — names, date of birth, gender and the enrolment photo. Useful for onboarding, fraud prevention and KYC compliance.",
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The customer's 11-digit Bank Verification Number.", example: "22454670613" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "A unique reference for this request in your system.", example: "samji@email.com" },
    ],
    body: { number: "22454670613", identifier: "samji@email.com" },
    response: ok("Verified Successfully", {
      firstName: "SA*****",
      lastName: "OD*****",
      middleName: "AD*****",
      dateOfBirth: "12-Dec-1996",
      phoneNumber1: "0816*******",
      email: null,
      gender: "Male",
      stateOfOrigin: "Osun State",
      bvn: "2245********",
      nin: null,
      registrationDate: "2017-11-28",
      lgaOfOrigin: "Irewole",
      maritalStatus: "Single",
      watchListed: "False",
      base64Image: "/9j/4AAQSkZJRgABAQEAYABgAAD...",
      nationality: "",
      phoneNumber2: "",
      title: "",
      enrollmentBank: "",
      enrollmentBranch: "",
      lgaOfResidence: "",
      stateOfResidence: "",
      nameOnCard: "",
      residentialAddress: "",
      levelOfAccount: "",
      number: "2245********",
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "nin-check",
    name: "Verify NIN",
    method: "POST",
    base: "api",
    path: "/nin",
    realm: "apikey",
    summary:
      "Validates a customer's National Identification Number and returns the NIMC identity record, including names, date of birth and the enrolment photo.",
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The customer's 11-digit National Identification Number.", example: "52306459347" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "A unique reference for this request in your system.", example: "samji@nin.com" },
    ],
    body: { number: "52306459347", identifier: "samji@nin.com" },
    response: ok("Verified Successfully", {
      title: "MR",
      firstname: "SA*****",
      middlename: "AD*****",
      surname: "OD*****",
      email: null,
      telephoneno: "0816*******",
      residence_AdressLine1: null,
      residence_Town: null,
      residence_lga: null,
      residence_state: null,
      nin: "5230********",
      photo: "/9j/4AAQSkZJRgABAQEAYABgAAD...",
      signature: null,
      religion: null,
      profession: "STUDENT",
      gender: "m",
      maiden_name: null,
      maritalstatus: "SINGLE",
      employmentstatus: null,
      state_of_origin: "Osun",
      lga_origin: null,
      birthcountry: "nigeria",
      birthdate: "12-12-1996",
      birthlga: "Ife East Osun",
      birthstate: null,
      educationallevel: null,
      nok_address1: null,
      nok_address2: null,
      nok_lga: null,
      nok_state: null,
      nok_surname: null,
      nok_firstname: null,
      nok_middlename: null,
      nok_postalcode: null,
      nok_town: null,
      nspokenlang: null,
      ospokenlang: null,
      pfirstname: null,
      pmiddlename: null,
      psurname: null,
      residence_address: null,
      residencestatus: null,
      self_origin_lga: null,
      self_origin_place: null,
      self_origin_state: null,
      spoken_language: null,
      userid: null,
      vnin: "5230********",
      central_iD: null,
      tracking_id: null,
      heigth: null,
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "voters-check",
    name: "Verify Voter's Card",
    method: "POST",
    base: "api",
    path: "/voters",
    realm: "apikey",
    summary:
      "Validates a customer's voter identification details as issued by INEC (Independent National Electoral Commission) and returns the record on file.",
    params: [
      { name: "number", type: "string", in: "body", required: true, desc: "The 19-character Voter Identification Number (VIN) on the customer's voter's card.", example: "90F5AE4625505997419" },
      { name: "identifier", type: "string", in: "body", required: true, desc: "A unique reference for this request in your system.", example: "samji@email.com" },
    ],
    body: { number: "90F5AE4625505997419", identifier: "samji@email.com" },
    response: ok("Verified Successfully", {
      fullName: "Bl****** Aanuoluwapo Afolabi",
      gender: "F",
      occupation: "STUDENT",
      photo: "/9j/4AAQSkZJRgABAQEAYABgAAD...",
      state: "OYO",
      lga: "IBADAN NORTH EAST",
      address: "E7/1207 YI**, IBADAN, IBADAN NORTH EAST, OYO",
      vin: "90F5A***************",
      country: "NG",
      date_of_birth: "",
      pollingUnit: "",
      registrationAreaWard: "",
      timeOfRegistration: "",
      pollingUnitCode: "",
      phone_number: "",
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "facial-check",
    name: "Face Detection",
    method: "POST",
    base: "api",
    path: "/face",
    realm: "apikey",
    summary:
      "Analyses a single facial image and returns detected facial attributes — estimated age, gender, race and emotion probabilities — along with the region of each detected face.",
    params: [
      { name: "image", type: "string", in: "body", required: true, desc: "The facial image, Base64-encoded (JPEG or PNG).", example: "base64_encoded_image" },
    ],
    body: { image: "base64_encoded_image" },
    response: ok("Face Detected Successfully", {
      face_locations: [
        {
          age: 31,
          race: {
            asian: 25.71,
            black: 26.19,
            white: 23.01,
            indian: 4.88,
            "middle eastern": 9.98,
            "latino hispanic": 10.2,
          },
          gender: { Man: 70.27, Woman: 29.72 },
          region: { h: 1028, w: 719, x: 0, y: 0, left_eye: null, right_eye: null },
          emotion: {
            sad: 0.85,
            fear: 0.0,
            angry: 0.0,
            happy: 99.14,
            disgust: 0.0,
            neutral: 0.0,
            surprise: 0.0,
          },
          dominant_race: "black",
          dominant_gender: "Man",
          face_confidence: 0.99,
          dominant_emotion: "happy",
        },
      ],
      faces_detected: 1,
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "face-liveness",
    name: "Face Liveness",
    method: "POST",
    base: "api",
    path: "/face-liveness",
    realm: "apikey",
    summary:
      "Determines whether the face in the submitted image belongs to a real, present person or a spoof — a photo of a photo, a mask or a screen.",
    params: [
      { name: "image", type: "string", in: "body", required: true, desc: "The facial image, Base64-encoded (JPEG or PNG).", example: "base64_encoded_image" },
    ],
    body: { image: "base64_encoded_image" },
    response: ok("Face Liveness Detected Successfully", {
      face_locations: [
        {
          age: 31,
          dominant_race: "black",
          dominant_gender: "Man",
          dominant_emotion: "happy",
          face_confidence: 0.99,
        },
      ],
      faces_detected: 1,
    }),
    authoredResponse: true,
  },
  {
    kind: "endpoint",
    slug: "face-compare",
    name: "Compare Faces",
    method: "POST",
    base: "api",
    path: "/compare-face",
    realm: "apikey",
    summary:
      "Compares two facial images to confirm they belong to the same person — typically a live capture against the photo on an identity record. Returns a match verdict and the distance between the two faces.",
    params: [
      { name: "image1", type: "string", in: "body", required: true, desc: "The first face image, Base64-encoded (JPEG or PNG).", example: "base64_encoded_image_1" },
      { name: "image2", type: "string", in: "body", required: true, desc: "The second face image, Base64-encoded (JPEG or PNG).", example: "base64_encoded_image_2" },
    ],
    body: { image1: "base64_encoded_image_1", image2: "base64_encoded_image_2" },
    response: ok("Matched Successfully", {
      distance: 0,
      verified: true,
      threshold: 0.4,
      facial_areas: {
        img1: { h: 935, w: 707, x: 172, y: 376, left_eye: [687, 713], right_eye: [346, 721] },
        img2: { h: 935, w: 707, x: 172, y: 376, left_eye: [687, 713], right_eye: [346, 721] },
      },
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
  { kind: "guide", slug: "sdk-flow", name: "How the SDKs work", summary: "The initialize → capture → result lifecycle behind the client SDKs." },
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
    label: "Identity verification",
    realm: "apikey",
    items: [
      item("bvn-check"),
      item("nin-check"),
      item("voters-check"),
    ],
  },
  {
    label: "Facial verification",
    realm: "apikey",
    items: [
      item("facial-check"),
      item("face-liveness"),
      item("face-compare"),
    ],
  },
  {
    label: "Client SDKs",
    realm: "apikey",
    items: [
      item("sdk-flow"),
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
