/**
 * Baseline security response headers.
 *
 * Content-Security-Policy is deliberately absent: Next.js injects inline
 * bootstrap scripts and the marketing pages use inline styles, so a policy
 * loose enough to work would need 'unsafe-inline' and give little real
 * protection. Add it as Report-Only first when someone can own the rollout.
 *
 * `camera`/`microphone` are denied because nothing in this app captures media
 * — facial verification happens through the API and SDK on customer sites, not
 * here. Relax the relevant directive if browser-side capture is ever added.
 */
const securityHeaders = [
  // No page here is meant to be framed, so refuse it outright (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the full URL same-origin, bare origin cross-origin, nothing to http.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
