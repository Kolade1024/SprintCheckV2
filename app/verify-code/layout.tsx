import type { Metadata } from "next";

// Route-specific title so each auth page is distinct in the tab, to screen
// readers, and for search engines (the pages themselves are client components
// and cannot export metadata directly).
export const metadata: Metadata = {
  title: "Verify code — SprintCheck",
  description: "Enter the verification code sent to your email.",
};

export default function AuthSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
