import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SandboxSection from "@/components/SandboxSection";
import Footer from "@/components/Footer";

// Without this the page inherits the root layout's homepage title/description.
export const metadata: Metadata = {
  title: "Interactive API Sandbox — SprintCheck",
  description:
    "Try the SprintCheck verification endpoints in your browser. Build a request, see the response shape, and copy a ready-to-run curl command.",
};

export default function SandboxPage() {
  return (
    <>
      <Navbar />
      <main>
        <SandboxSection />
      </main>
      <Footer />
    </>
  );
}
