import type { Metadata } from "next";

// Route-specific title so each auth page is distinct in the tab, to screen
// readers, and for search engines (the pages themselves are client components
// and cannot export metadata directly).
export const metadata: Metadata = {
  title: "Create account — SprintCheck",
  description: "Create a SprintCheck account and start verifying identities in minutes.",
};

export default function AuthSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
