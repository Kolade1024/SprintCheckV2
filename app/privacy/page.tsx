import type { Metadata } from "next";
import LegalPage, { Section, List } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — SprintCheck",
  description:
    "How SprintCheck collects, uses, protects and shares personal data across its identity verification services.",
};

const EMAIL = "info@megasprintlimited.com.ng";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 15, 2026"
      intro="This Privacy Policy explains how SprintCheck, operated by Mega Sprint Limited (“SprintCheck”, “we”, “us”), collects, uses, shares and protects personal data when you use our websites, dashboard and identity verification APIs (the “Services”)."
    >
      <Section title="1. Who this policy applies to">
        <p>
          This policy covers two groups. First, our <strong>merchants</strong> — the
          businesses that hold a SprintCheck account. Second, the{" "}
          <strong>end users</strong> whose identity our merchants verify through the
          Services. For end-user data, the merchant is the data controller and
          SprintCheck acts as a data processor on their behalf.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <List
          items={[
            <>
              <strong>Account data:</strong> name, business name, email address, phone
              number and password when a merchant registers.
            </>,
            <>
              <strong>Verification data:</strong> identifiers submitted for a check —
              such as BVN, NIN, voter&apos;s card numbers, a selfie image and liveness
              score — and the results returned by authoritative sources.
            </>,
            <>
              <strong>Business data:</strong> registration numbers, directors and
              related records retrieved during CAC/KYB lookups.
            </>,
            <>
              <strong>Usage and technical data:</strong> API request logs, IP address,
              device and browser information, and wallet or billing activity.
            </>,
          ]}
        />
      </Section>

      <Section title="3. How we use information">
        <List
          items={[
            "Perform identity and business verifications requested by merchants.",
            "Operate, secure and improve the Services, including fraud prevention.",
            "Bill for successful verifications and maintain wallet balances.",
            "Provide support and send service-related communications.",
            "Meet legal, regulatory and audit obligations.",
          ]}
        />
      </Section>

      <Section title="4. Legal bases for processing">
        <p>
          Where NDPR, GDPR or similar laws apply, we process personal data on the
          basis of the performance of a contract, our legitimate interests in
          operating and securing the Services, compliance with legal obligations, and
          — where required — consent obtained by the merchant from the end user.
        </p>
      </Section>

      <Section title="5. Sharing and disclosure">
        <p>
          We do not sell personal data. We share it only as needed to run the
          Services:
        </p>
        <List
          items={[
            "Authoritative verification sources and regulators (e.g. NIBSS, NIMC, INEC, CAC) to complete a check.",
            "Infrastructure and payment providers acting as our sub-processors under contract.",
            "Authorities where disclosure is required by law or to protect against fraud.",
          ]}
        />
      </Section>

      <Section title="6. Data retention">
        <p>
          We retain personal data for as long as needed to provide the Services, meet
          legal and regulatory requirements, resolve disputes and enforce our
          agreements. Verification records are retained in line with applicable KYC
          record-keeping obligations, after which they are deleted or anonymised.
        </p>
      </Section>

      <Section title="7. Data security">
        <p>
          We apply enterprise-grade safeguards including encryption in transit and at
          rest, access controls, audit logging and signed webhooks. No method of
          transmission or storage is completely secure, but we work to protect your
          data using industry-standard measures.
        </p>
      </Section>

      <Section title="8. International transfers & data residency">
        <p>
          We offer data residency options across Nigeria, the EU and the US. Where
          data is transferred across borders, we rely on appropriate safeguards
          consistent with NDPR and GDPR requirements.
        </p>
      </Section>

      <Section title="9. Your rights">
        <p>
          Subject to applicable law, you may request access to, correction of, or
          deletion of your personal data, object to or restrict certain processing,
          and request data portability. Because SprintCheck processes end-user data on
          behalf of merchants, end users should direct requests to the merchant that
          collected their data; we will assist that merchant in responding.
        </p>
      </Section>

      <Section title="10. Cookies">
        <p>
          Our website uses essential cookies to operate and, where enabled, analytics
          cookies to understand usage. You can control cookies through your browser
          settings.
        </p>
      </Section>

      <Section title="11. Children">
        <p>
          The Services are intended for businesses and are not directed to children.
          We do not knowingly collect personal data from children except where a
          merchant lawfully verifies a minor as part of its own regulated process.
        </p>
      </Section>

      <Section title="12. Changes to this policy">
        <p>
          We may update this policy from time to time. Material changes will be posted
          on this page with a revised “Last updated” date.
        </p>
      </Section>

      <Section title="13. Contact us">
        <p>
          For privacy questions or to exercise your rights, contact us at{" "}
          <a
            href={`mailto:${EMAIL}`}
            className="font-medium text-brand-accent underline-offset-2 hover:underline"
          >
            {EMAIL}
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
