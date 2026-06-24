import SectionHeading from "./SectionHeading";
import { Star } from "./icons";

const TESTIMONIALS = [
  {
    quote:
      "SprintCheck cut our onboarding time from days to seconds. The BVN and NIN APIs just work — and the dashboard makes ops self-serve.",
    initials: "AO",
    name: "Adaeze Okafor",
    role: "Head of Risk, Kora Pay",
  },
  {
    quote:
      "We replaced three vendors with SprintCheck. Better latency, cleaner data, and the docs are genuinely the best we've used.",
    initials: "TA",
    name: "Tunde Adebayo",
    role: "CTO, Lendly",
  },
  {
    quote:
      "From sandbox to production in a weekend. Fraud rates dropped 38% in the first quarter.",
    initials: "SM",
    name: "Sarah Mensah",
    role: "VP Engineering, Tola",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-subtle py-20 lg:py-24">
      <div className="container-x flex flex-col gap-14">
        <SectionHeading
          eyebrow="Customers"
          title="Loved by"
          accent="risk & engineering teams"
        />

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map(({ quote, initials, name, role }) => (
            <li
              key={name}
              className="flex flex-col rounded-card border border-line bg-white p-[29.33px] shadow-card"
            >
              <div className="mb-4 flex gap-1 text-star">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="mb-6 flex-1 text-base leading-[1.6] text-ink/80">
                {quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-small font-semibold text-offwhite">
                  {initials}
                </span>
                <div>
                  <p className="text-base font-semibold text-ink">{name}</p>
                  <p className="text-stat-label text-body">{role}</p>
                </div>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
