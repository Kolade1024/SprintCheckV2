import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Search } from "@/components/icons";

export const metadata: Metadata = {
  title: "404 — Page not found · SprintCheck",
  description:
    "The page you're looking for couldn't be found. Head back to SprintCheck.",
};

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main className="flex min-h-screen items-center justify-center px-5 pt-32 pb-24">
        <div className="flex flex-col items-center text-center">
          <span className="mb-7 flex h-16 w-16 animate-fade-up items-center justify-center rounded-full border border-line bg-white text-brand-accent shadow-glass [animation-delay:0ms] motion-reduce:animate-none">
            <Search className="h-7 w-7" />
          </span>

          <p className="animate-fade-up text-eyebrow font-semibold uppercase text-brand-accent [animation-delay:60ms] motion-reduce:animate-none">
            Error 404
          </p>

          <h1 className="mt-5 animate-fade-up text-[64px] font-extrabold leading-none tracking-[-2px] text-ink [animation-delay:140ms] motion-reduce:animate-none md:text-[96px]">
            Page not <span className="text-gradient">found</span>
          </h1>

          <p className="mt-6 max-w-md animate-fade-up text-lead text-body [animation-delay:240ms] motion-reduce:animate-none">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap items-center justify-center gap-3 [animation-delay:340ms] motion-reduce:animate-none">
            <a
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
            >
              Back to home
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/docs"
              className="inline-flex h-12 items-center justify-center rounded-btn border border-line bg-white px-6 text-base font-medium text-ink shadow-btn transition-colors hover:bg-subtle"
            >
              Read the docs
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
