import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    number: "01",
    title: "Submit Data",
    description:
      "Send a customer's BVN, NIN or document via our REST API or no-code dashboard.",
  },
  {
    number: "02",
    title: "Verify Instantly",
    description:
      "We match against authoritative sources, run liveness checks and risk scoring.",
  },
  {
    number: "03",
    title: "Get Results",
    description:
      "Receive structured JSON with verification status, confidence score and metadata.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-subtle py-20 lg:py-24">
      <div className="container-x flex flex-col gap-16">
        <SectionHeading
          eyebrow="How it works"
          title="From data to decision in"
          accent="under a second"
        />

        <div className="relative">
          {/* Connecting line — visible through the gaps between cards */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-10 -z-0 hidden h-px bg-line lg:block"
          />
          <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map(({ number, title, description }) => (
              <li
                key={number}
                className="flex flex-col rounded-panel border border-line bg-white p-[29.33px] shadow-card"
              >
                <span className="mb-8 flex h-20 w-20 items-center justify-center rounded-panel bg-brand/10">
                  <span className="text-[32px] font-extrabold leading-none text-gradient">
                    {number}
                  </span>
                </span>
                <h3 className="mb-3 text-card-title font-bold text-ink">{title}</h3>
                <p className="text-base text-body">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
