import Link from "next/link";
import type { ReactNode } from "react";
import { SDKS } from "@/lib/docs/spec";
import Callout from "./Callout";
import CopyButton from "./CopyButton";
import JsonPanel from "./JsonPanel";
import MethodBadge from "./MethodBadge";
import Pager from "./Pager";
import { ExternalLink } from "@/components/icons";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

function GuideShell({
  slug,
  eyebrow,
  title,
  lead,
  meta,
  children,
}: {
  slug: string;
  eyebrow: string;
  title: string;
  lead: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-[820px]">
      <header className="mb-8">
        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-accent">
          {eyebrow}
        </p>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.5px] text-ink md:text-[30px]">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-body">{lead}</p>
        {meta}
      </header>
      <div className="flex flex-col gap-8">{children}</div>
      <Pager slug={slug} />
    </article>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
      {children}
    </h2>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-small leading-relaxed text-body">{children}</p>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-subtle px-1.5 py-0.5 font-mono text-[12px] text-ink">
      {children}
    </code>
  );
}

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-brand-accent underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

/** Dark code window for guide snippets (single block, copyable). */
function Snippet({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-white/10 bg-code-bg shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-code-bar px-3 py-2">
        <span className="truncate pl-1 font-mono text-[11px] text-code-comment">{title}</span>
        <CopyButton text={code} />
      </div>
      <pre className="no-scrollbar overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.7] text-code-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Version / registry / language chips shown under an SDK page title. */
function SdkMeta({ slug }: { slug: string }) {
  const sdk = SDKS.find((s) => s.slug === slug);
  if (!sdk) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="inline-flex h-6 items-center rounded-pill bg-brand/10 px-2.5 font-mono text-[11px] font-medium text-brand-accent">
        v{sdk.version}
      </span>
      <span className="inline-flex h-6 items-center rounded-pill bg-black/5 px-2.5 font-mono text-[11px] text-body dark:bg-white/10">
        {sdk.lang}
      </span>
      <code className="inline-flex h-6 items-center rounded-pill bg-black/5 px-2.5 font-mono text-[11px] text-body dark:bg-white/10">
        {sdk.pkg}
      </code>
      <a
        href={sdk.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-6 items-center gap-1 rounded-pill px-2 font-mono text-[11px] font-medium text-brand-accent transition-colors hover:bg-brand/10"
      >
        {sdk.registry} <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function SdkKeysCallout() {
  return (
    <Callout tone="info">
      The SDK needs your <Code>api_key</Code> and <Code>encryption_key</Code> — both are under{" "}
      <DocLink href="/dashboard">Developers in your dashboard</DocLink>. Every completed
      verification also lands on your <DocLink href="/docs/webhooks">webhook</DocLink> and in
      your dashboard's verification history.
    </Callout>
  );
}

/* ------------------------------------------------------------------ */
/* Guides                                                              */
/* ------------------------------------------------------------------ */

function AuthenticationGuide() {
  return (
    <GuideShell
      slug="authentication"
      eyebrow="Get started"
      title="Authentication"
      lead="SprintCheck has two credential types, one per API surface. Every request except registration, login and password recovery must carry one of them in the Authorization header."
    >
      <section className="flex flex-col gap-4">
        <H2>Credential types</H2>
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[560px] text-left text-small">
            <thead>
              <tr className="border-b border-line bg-subtle/70 font-mono text-[11px] uppercase tracking-[0.08em] text-body">
                <th className="px-4 py-2.5 font-semibold">Credential</th>
                <th className="px-4 py-2.5 font-semibold">Used by</th>
                <th className="px-4 py-2.5 font-semibold">Header</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body">
              <tr>
                <td className="px-4 py-3 font-medium text-brand-accent">API key</td>
                <td className="px-4 py-3">API request, SDK or Libraries</td>
                <td className="px-4 py-3 font-mono text-[12px]">Authorization: &lt;api_key&gt;</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-[#175cd3] dark:text-[#8ab6ff]">Encryption Key</td>
                <td className="px-4 py-3">API request, SDK or Libraries</td>
                <td className="px-4 py-3 font-mono text-[12px]">&lt;hmac value&gt;</td>
              </tr>
            </tbody>
          </table>
        </div>
        <P>
          Every reference page shows which credential it needs as a chip next to the title, and the
          sidebar sections carry a matching colour dot — purple for SDK, blue for merchant.
        </P>
      </section>

      <section className="flex flex-col gap-3">
        <H2>API keys</H2>
        <P>
          An API key and an encryption key are issued when your business account is created. Find
          them under <DocLink href="/dashboard">Developers in your dashboard</DocLink>, where you
          can also rotate them at any time.
        </P>
        <Callout tone="warn">
          Keys are secrets. Keep them server-side, never ship them in mobile or browser code, and
          rotate immediately if one leaks — regeneration invalidates the old pair at once.
        </Callout>
      </section>

      <section className="flex flex-col gap-3">
        <H2>Bearer tokens</H2>
        <P>
          Merchant tokens come from <DocLink href="/docs/login">Log in</DocLink>. Send them as{" "}
          <Code>Authorization: Bearer &lt;token&gt;</Code> on every request to the merchant surface.
        </P>
      </section>
    </GuideShell>
  );
}

function ErrorsGuide() {
  return (
    <GuideShell
      slug="errors"
      eyebrow="Get started"
      title="Errors"
      lead="Every response — success or failure — uses the same envelope, so one parser handles everything."
    >
      <section className="flex flex-col gap-4">
        <H2>The envelope</H2>
        <P>
          <Code>status</Code> is <Code>true</Code> when the call succeeded and <Code>false</Code>{" "}
          otherwise, <Code>message</Code> is human-readable, and <Code>data</Code> carries the
          payload (or validation details on errors).
        </P>
        <JsonPanel
          tone="error"
          title="Error · 422"
          json={JSON.stringify(
            {
              status: false,
              message: "The number field is required.",
              data: { errors: { number: ["The number field is required."] } },
            },
            null,
            2
          )}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>Status codes</H2>
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[520px] text-left text-small">
            <thead>
              <tr className="border-b border-line bg-subtle/70 font-mono text-[11px] uppercase tracking-[0.08em] text-body">
                <th className="px-4 py-2.5 font-semibold">Code</th>
                <th className="px-4 py-2.5 font-semibold">Meaning</th>
                <th className="px-4 py-2.5 font-semibold">What to do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body">
              {[
                ["200", "OK", "The request succeeded."],
                ["201", "Created", "The resource was created."],
                ["400", "Bad request", "Check the request shape against the reference."],
                ["401", "Unauthorized", "The credential is missing, wrong or revoked."],
                ["402", "Insufficient balance", "Top up the wallet before retrying."],
                ["404", "Not found", "The resource or route does not exist."],
                ["422", "Validation failed", "Fix the fields listed in data.errors."],
                ["429", "Too many requests", "Back off and retry with exponential delay."],
                ["500", "Server error", "Safe to retry; contact support if it persists."],
              ].map(([code, label, action]) => (
                <tr key={code}>
                  <td className="px-4 py-3 font-mono text-[12px] font-semibold text-ink">{code}</td>
                  <td className="px-4 py-3 font-medium text-ink">{label}</td>
                  <td className="px-4 py-3">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </GuideShell>
  );
}

function WebhooksGuide() {
  return (
    <GuideShell
      slug="webhooks"
      eyebrow="Get started"
      title="Webhooks"
      lead="Identity checks complete asynchronously — the customer still has to pass the selfie capture. Register a webhook and SprintCheck posts the result to your server the moment each verification finishes."
    >
      <section className="flex flex-col gap-3">
        <H2>Setup</H2>
        <P>
          Set your webhook to a publicly reachable HTTPS endpoint under{" "}
          <DocLink href="/dashboard">Developers in your dashboard</DocLink>. Respond with a 2xx
          quickly and do any heavy work after acknowledging.
        </P>
      </section>

      <section className="flex flex-col gap-4">
        <H2>Payload</H2>
        <P>
          Each event carries the same fields the SDK submits on completion — match it back to your
          records with <Code>identifier</Code> and <Code>reference</Code>.
        </P>
        <JsonPanel
          title="POST your-webhook-url · verification completed"
          json={JSON.stringify(
            {
              event: "verification.completed",
              data: {
                type: "bvn",
                reference: "36135803-0843-48d6-b8bf-5d47490a6ade",
                identifier: "samji@email.com",
                status: 1,
                verified: true,
                face_match: true,
                confidence: "80",
                completed_at: "2026-07-10T09:14:22Z",
              },
            },
            null,
            2
          )}
          footnote="Representative example — field values are illustrative."
        />
        <Callout tone="info">
          Treat webhook delivery as at-least-once: keep handlers idempotent by keying on{" "}
          <Code>reference</Code>, and fall back to your dashboard's verification history if your
          endpoint was down.
        </Callout>
      </section>
    </GuideShell>
  );
}

function SdkFlowGuide() {
  const steps = [
    {
      title: "Start the check",
      body: "Your server calls the check endpoint with the document number and your identifier. SprintCheck returns a pending verification with a reference.",
      method: "POST" as const,
      tag: "/sdk/bvn · /sdk/nin · /sdk/voters · /sdk/facial",
    },
    {
      title: "Capture the customer",
      body: "Launch the SprintCheck SDK in your app with the same identifier. It guides the customer through a liveness-checked selfie capture.",
      tag: "SprintCheck SDK · mobile or web",
    },
    {
      title: "The capture completes the check",
      body: "The SDK submits the selfie, liveness confidence and reference. SprintCheck matches the face against the document photo and finalises the result.",
      method: "PUT" as const,
      tag: "/sdk/bvn · /sdk/nin · /sdk/voters · /sdk/facial",
    },
    {
      title: "Receive the result",
      body: "The outcome lands on your webhook as verification.completed, and appears in your verification history and dashboard immediately.",
      tag: "Webhook · verification.completed",
    },
  ];

  return (
    <GuideShell
      slug="sdk-flow"
      eyebrow="SDK · Identity checks"
      title="How the SDK works"
      lead="Every identity check is a two-step handshake: your server starts it, the SprintCheck SDK finishes it with a face capture. Here is the full lifecycle."
    >
      <ol className="flex flex-col">
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-4 pb-8 last:pb-0">
            {i < steps.length - 1 ? (
              <span aria-hidden="true" className="absolute left-[15px] top-9 h-[calc(100%-36px)] w-px bg-line" />
            ) : null}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 font-mono text-[12px] font-semibold text-brand-accent">
              {i + 1}
            </span>
            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-ink">{s.title}</h3>
                {s.method ? <MethodBadge method={s.method} size="sm" /> : null}
              </div>
              <p className="mt-1 text-small leading-relaxed text-body">{s.body}</p>
              <p className="mt-1.5 font-mono text-[11px] text-body/70">{s.tag}</p>
            </div>
          </li>
        ))}
      </ol>

      <Callout tone="info">
        The <Code>confidence</Code> value on completed checks is the face-match score (0–100).
        Most teams accept at 75 and above, and route lower scores to manual review.
      </Callout>

      <section className="flex flex-col gap-3">
        <H2>Where to next</H2>
        <P>
          Start with <DocLink href="/docs/bvn-check">Start a BVN check</DocLink>, then wire up{" "}
          <DocLink href="/docs/webhooks">webhooks</DocLink> to receive results. For returning
          customers, <DocLink href="/docs/facial-check">facial re-verification</DocLink> skips the
          document number entirely. The capture step ships as ready-made libraries for{" "}
          <DocLink href="/docs/android-sdk">Android</DocLink>,{" "}
          <DocLink href="/docs/flutter-sdk">Flutter</DocLink>,{" "}
          <DocLink href="/docs/react-native-sdk">React Native</DocLink> and{" "}
          <DocLink href="/docs/expo-sdk">Expo</DocLink>.
        </P>
      </section>
    </GuideShell>
  );
}

/* ------------------------------------------------------------------ */
/* SDK libraries                                                       */
/* ------------------------------------------------------------------ */

function AndroidSdkGuide() {
  return (
    <GuideShell
      slug="android-sdk"
      eyebrow="SDK · Libraries"
      title="Android SDK"
      lead="A native Kotlin library that runs the full verification flow — document input, selfie capture, liveness — inside your Android app. Distributed through JitPack."
      meta={<SdkMeta slug="android-sdk" />}
    >
      <section className="flex flex-col gap-4">
        <H2>Install</H2>
        <P>
          Add JitPack and the Regula maven repository (used by the liveness engine) to{" "}
          <Code>settings.gradle.kts</Code>, then declare the dependency.
        </P>
        <Snippet
          title="settings.gradle.kts"
          code={`dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
        maven { url = uri("https://maven.regulaforensics.com/RegulaDocumentReader") }
    }
}`}
        />
        <Snippet
          title="app/build.gradle.kts"
          code={`dependencies {
    implementation("com.github.odejinmi:sprintcheckandroid:1.0.1")
}`}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>Initialize &amp; verify</H2>
        <P>
          <Code>KYCVerificationManager</Code> is a singleton: initialize it once with your keys,
          then launch a flow with a <Code>CheckoutMethod</Code> and the customer's identifier. The
          SDK opens its own activity and reports back through the callback.
        </P>
        <Snippet
          title="Kotlin"
          code={`import com.a5starcompany.sprintchecksdk.util.*

val kyc = KYCVerificationManager.getInstance()

// Once, e.g. in Application.onCreate
kyc.initialize(
    KYCConfig(
        apiKey = BuildConfig.SPRINTCHECK_API_KEY,
        encryptionkey = BuildConfig.SPRINTCHECK_ENCRYPTION_KEY,
    )
)

// Launch a verification flow from an Activity
kyc.startVerification(
    activity = this,
    type = CheckoutMethod.bvn, // bvn, nin, facial, documentreader, selectable
    identifier = "user@email.com",
    callback = object : KYCCallback {
        override fun onKYCSuccess(result: KYCResult.Success) {
            // result.reference, result.confidenceLevel, result.verify
        }

        override fun onKYCFailure(result: KYCResult.Failure) {
            // result.errorCode, result.errorMessage
        }

        override fun onKYCCancelled() {
            // customer backed out of the flow
        }
    },
)`}
        />
        <P>
          <Code>KYCResult.Success</Code> carries <Code>message</Code>, <Code>reference</Code>,{" "}
          <Code>name</Code>, masked <Code>bvn</Code>/<Code>nin</Code>,{" "}
          <Code>confidenceLevel</Code> and <Code>verify</Code> — the same fields your server
          receives on the <DocLink href="/docs/webhooks">webhook</DocLink>.
        </P>
      </section>

      <SdkKeysCallout />
    </GuideShell>
  );
}

function FlutterSdkGuide() {
  return (
    <GuideShell
      slug="flutter-sdk"
      eyebrow="SDK · Libraries"
      title="Flutter SDK"
      lead="The sprint_check plugin runs BVN and NIN verification with photo capture, face detection and liveness checking. Supports Android, iOS, Web, Linux, macOS and Windows."
      meta={<SdkMeta slug="flutter-sdk" />}
    >
      <section className="flex flex-col gap-4">
        <H2>Install</H2>
        <Snippet title="pubspec.yaml" code={`dependencies:\n  sprint_check: ^0.1.8`} />
        <Snippet title="Terminal" code={`flutter pub get`} />
        <P>
          On Android, add camera and storage permissions to{" "}
          <Code>android/app/src/main/AndroidManifest.xml</Code>:
        </P>
        <Snippet
          title="AndroidManifest.xml"
          code={`<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />`}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>Initialize &amp; verify</H2>
        <P>
          Create the plugin and initialize it with your keys — typically in{" "}
          <Code>initState</Code> — then call <Code>checkout()</Code> with a{" "}
          <Code>BuildContext</Code>, the method, and the customer's identifier.
        </P>
        <Snippet
          title="Dart"
          code={`import 'package:sprint_check/sprint_check.dart';

final SprintCheck plugin = SprintCheck();

@override
void initState() {
  super.initState();
  plugin.initialize(
    apiKey: sprintCheckApiKey,
    encryptionKey: sprintCheckEncryptionKey,
  );
}

Future<void> verifyBvn() async {
  final CheckoutResponse response = await plugin.checkout(
    context,
    CheckoutMethod.bvn,           // or CheckoutMethod.nin
    'user@example.com',           // identifier for this customer
    bvn: '12345678901',           // optional: skips the number input UI
  );

  if (response.status && response.verify) {
    print('Verified: \${response.message} (score \${response.score})');
  }
}`}
        />
        <P>
          <Code>CheckoutResponse</Code> includes <Code>message</Code>, <Code>reference</Code>,{" "}
          <Code>status</Code>, <Code>verify</Code>, a masked <Code>name</Code> and{" "}
          <Code>bvn</Code>/<Code>nin</Code>, and the confidence <Code>score</Code>.
        </P>
      </section>

      <SdkKeysCallout />
    </GuideShell>
  );
}

function ReactNativeSdkGuide() {
  return (
    <GuideShell
      slug="react-native-sdk"
      eyebrow="SDK · Libraries"
      title="React Native SDK"
      lead="sprintcheckrn wraps the native Android and iOS verification flows behind a promise-based JavaScript API — BVN, NIN and facial verification."
      meta={<SdkMeta slug="react-native-sdk" />}
    >
      <section className="flex flex-col gap-4">
        <H2>Install</H2>
        <Snippet title="Terminal" code={`npm install sprintcheckrn\n# or\nyarn add sprintcheckrn`} />
        <P>
          The package contains native code, so rebuild after installing. Autolinking covers React
          Native 0.60+; on iOS run <Code>npx pod-install</Code> first.
        </P>
        <Snippet
          title="Rebuild"
          code={`# iOS
npx pod-install
npx react-native run-ios

# Android
npx react-native run-android`}
        />
        <P>
          On Android, Gradle must be able to resolve the liveness engine — add these repositories
          to <Code>android/settings.gradle</Code>:
        </P>
        <Snippet
          title="android/settings.gradle"
          code={`dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
        maven { url = uri("https://maven.regulaforensics.com/RegulaDocumentReader") }
    }
}`}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>Initialize &amp; verify</H2>
        <Snippet
          title="JavaScript"
          code={`import SprintCheck from 'sprintcheckrn';

// Initialize once with your keys
await SprintCheck.initialize(SPRINTCHECK_API_KEY, SPRINTCHECK_ENCRYPTION_KEY);

// Launch a flow — each resolves with the verification result
const bvn = await SprintCheck.startBvnVerification('user@email.com');
const nin = await SprintCheck.startNinVerification('user@email.com');
const face = await SprintCheck.startFacialVerification('user@email.com');`}
        />
      </section>

      <SdkKeysCallout />
    </GuideShell>
  );
}

function ExpoSdkGuide() {
  return (
    <GuideShell
      slug="expo-sdk"
      eyebrow="SDK · Libraries"
      title="Expo SDK"
      lead="sprintcheck-expo brings the same BVN, NIN and facial flows to Expo projects, with TypeScript types included. Works with managed and bare workflows."
      meta={<SdkMeta slug="expo-sdk" />}
    >
      <Callout tone="warn">
        Android only for now — iOS support is on the way. Requires Expo SDK 49+, React Native
        0.70+ and Android API level 24+.
      </Callout>

      <section className="flex flex-col gap-4">
        <H2>Install &amp; configure</H2>
        <Snippet title="Terminal" code={`npm install sprintcheck-expo\n# or\nyarn add sprintcheck-expo`} />
        <P>
          The SDK uses native modules, so generate the native project, register the package, and
          run a development build:
        </P>
        <Snippet title="Terminal" code={`expo prebuild`} />
        <Snippet
          title="android/app/src/main/java/.../MainApplication.kt"
          code={`import com.sprintcheckrn.SprintCheckPackage

// inside getPackages()
packages.add(SprintCheckPackage())`}
        />
        <Snippet title="Terminal" code={`expo run:android`} />
      </section>

      <section className="flex flex-col gap-4">
        <H2>Initialize &amp; verify</H2>
        <Snippet
          title="TypeScript"
          code={`import SprintCheck from 'sprintcheck-expo';

const init = await SprintCheck.initialize({
  apiKey: SPRINTCHECK_API_KEY,
  encryptionKey: SPRINTCHECK_ENCRYPTION_KEY,
});
if (!init.success) throw new Error(init.error);

const result = await SprintCheck.startBvnVerification('user@email.com');
// also: startNinVerification(email), startFacialVerification(email)

if (result.success) {
  console.log(result.data);
}`}
        />
        <P>
          Every method resolves to a <Code>VerificationResult</Code> —{" "}
          <Code>{"{ success, message, data?, error? }"}</Code>. If the build complains that
          SprintCheck is not linked, re-run <Code>expo prebuild --clean</Code>.
        </P>
      </section>

      <SdkKeysCallout />
    </GuideShell>
  );
}

const GUIDE_COMPONENTS: Record<string, () => JSX.Element> = {
  authentication: AuthenticationGuide,
  errors: ErrorsGuide,
  webhooks: WebhooksGuide,
  "sdk-flow": SdkFlowGuide,
  "android-sdk": AndroidSdkGuide,
  "flutter-sdk": FlutterSdkGuide,
  "react-native-sdk": ReactNativeSdkGuide,
  "expo-sdk": ExpoSdkGuide,
};

export function renderGuide(slug: string) {
  const Guide = GUIDE_COMPONENTS[slug];
  return Guide ? <Guide /> : null;
}
