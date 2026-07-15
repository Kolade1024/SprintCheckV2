import type { Metadata } from "next";

// Route-specific title so each auth page is distinct in the tab, to screen
// readers, and for search engines (the pages themselves are client components
// and cannot export metadata directly).
export const metadata: Metadata = {
  title: "Reset password — SprintCheck",
  description: "Reset the password for your SprintCheck account.",
};

export default function AuthSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
