import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { Mail, MessageSquare, Clock, ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact — SprintCheck",
  description:
    "Talk to the SprintCheck team about identity verification, pricing, integration or partnerships.",
};

const CONTACT_EMAIL = "info@megasprintlimited.com.ng";

const METHODS = [
  {
    title: "Email us",
    description: "The fastest way to reach the team.",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    Icon: Mail,
  },
  {
    title: "Sales & pricing",
    description: "Higher volumes or custom rates.",
    value: "Book a walkthrough",
    href: `mailto:${CONTACT_EMAIL}?subject=Sales%20enquiry`,
    Icon: MessageSquare,
  },
  {
    title: "Response time",
    description: "We reply to every enquiry.",
    value: "Within one business day",
    href: null,
    Icon: Clock,
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-surface">
        {/* Background glow — mirrors the hero/sandbox treatment */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
          style={{
            background:
              "radial-gradient(50% 60% at 80% 15%, rgba(166,114,255,0.16) 0%, rgba(166,114,255,0) 60%), radial-gradient(40% 50% at 8% 10%, rgba(75,72,238,0.10) 0%, rgba(75,72,238,0) 60%)",
          }}
        />

        <div className="container-x pt-32 md:pt-36 lg:pt-40">
          {/* Header */}
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-5 text-center">
            <span className="eyebrow">Contact</span>
            <h1 className="text-balance text-[36px] font-extrabold leading-[1.05] tracking-[-1.5px] text-ink md:text-[56px]">
              Let&apos;s build trust <span className="text-gradient">together</span>
            </h1>
            <p className="max-w-[560px] text-lead text-body">
              Questions about verification, pricing or going live? Send us a note
              and the right person will get back to you.
            </p>
          </div>

          {/* Two columns: methods + form */}
          <div className="mx-auto mt-14 grid max-w-[1040px] grid-cols-1 gap-8 pb-24 lg:grid-cols-[minmax(0,360px)_1fr]">
            {/* Contact methods */}
            <div className="flex flex-col gap-4">
              {METHODS.map(({ title, description, value, href, Icon }) => {
                const inner = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-brand/10 text-brand-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-ink">{title}</p>
                      <p className="text-small text-body">{description}</p>
                      <p className="mt-1 flex items-center gap-1 break-all text-small font-medium text-brand-accent">
                        {value}
                        {href ? <ArrowRight className="h-3.5 w-3.5 shrink-0" /> : null}
                      </p>
                    </div>
                  </>
                );
                const cls =
                  "flex items-start gap-4 rounded-card border border-line bg-white p-5 shadow-card";
                return href ? (
                  <a
                    key={title}
                    href={href}
                    className={`${cls} transition-shadow hover:shadow-glass`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={title} className={cls}>
                    {inner}
                  </div>
                );
              })}

              {/* Self-serve links */}
              <div className="rounded-card border border-line bg-subtle p-5">
                <p className="text-small font-semibold text-ink">Prefer to explore first?</p>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="/docs"
                    className="inline-flex items-center gap-1 text-small font-medium text-brand-accent transition-colors hover:text-brand"
                  >
                    Read the API docs <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="/sandbox"
                    className="inline-flex items-center gap-1 text-small font-medium text-brand-accent transition-colors hover:text-brand"
                  >
                    Try the sandbox <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
