import type { Metadata } from "next";
import LegalPage, { Section, List } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — SprintCheck",
  description:
    "The terms that govern your access to and use of the SprintCheck identity verification platform and APIs.",
};

const EMAIL = "info@megasprintlimited.com.ng";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 15, 2026"
      intro="These Terms of Service (“Terms”) govern your access to and use of the SprintCheck platform, dashboard and APIs (the “Services”), operated by Mega Sprint Limited (“SprintCheck”, “we”, “us”). By creating an account or using the Services, you agree to these Terms."
    >
      <Section title="1. Eligibility and accounts">
        <p>
          You must be a business or an authorised representative of a business, and at
          least 18 years old, to use the Services. You are responsible for the
          accuracy of your account information, for safeguarding your API keys and
          credentials, and for all activity that occurs under your account.
        </p>
      </Section>

      <Section title="2. The Services">
        <p>
          SprintCheck provides identity and business verification, including BVN, NIN,
          voter&apos;s card and facial checks, and CAC/KYB lookups, delivered through
          our APIs and dashboard. We may add, modify or discontinue features from time
          to time.
        </p>
      </Section>

      <Section title="3. Acceptable use">
        <p>You agree not to:</p>
        <List
          items={[
            "Use the Services without a valid legal basis and the necessary consent to verify an individual.",
            "Submit data you are not authorised to process, or use results for any unlawful or discriminatory purpose.",
            "Attempt to reverse engineer, resell or misuse the Services or circumvent usage limits and security controls.",
            "Interfere with the integrity or performance of the Services.",
          ]}
        />
      </Section>

      <Section title="4. Your compliance obligations">
        <p>
          As the controller of the end-user data you submit, you are responsible for
          obtaining all required consents and notices, and for complying with the
          NDPR, GDPR and other laws applicable to your use of the Services. You will
          only use verification results for legitimate KYC, onboarding and fraud-
          prevention purposes.
        </p>
      </Section>

      <Section title="5. Fees and billing">
        <p>
          The Services are billed per verification. You are charged only for
          successful verifications; failed lookups caused by upstream source outages
          are not billed. Fees are deducted from your wallet balance, which you fund in
          advance. Current pricing is shown on our website and may be updated on
          notice. All fees are exclusive of applicable taxes.
        </p>
      </Section>

      <Section title="6. Sandbox">
        <p>
          The sandbox environment is provided for testing only. It returns mocked data,
          does not contact upstream sources, and must not be used to make real
          onboarding or risk decisions.
        </p>
      </Section>

      <Section title="7. Intellectual property">
        <p>
          SprintCheck and its licensors own all rights in the Services, including the
          software, APIs, documentation and brand. We grant you a limited, non-
          exclusive, non-transferable right to use the Services in accordance with
          these Terms. You retain ownership of the data you submit.
        </p>
      </Section>

      <Section title="8. Service availability">
        <p>
          We work to keep the Services available and performant but do not guarantee
          uninterrupted access. Verifications depend on third-party sources whose
          availability is outside our control. Any service-level commitments will be
          set out in a separate agreement.
        </p>
      </Section>

      <Section title="9. Disclaimers">
        <p>
          The Services are provided “as is” and “as available”. To the fullest extent
          permitted by law, we disclaim all warranties, express or implied, including
          fitness for a particular purpose and non-infringement. Verification results
          are provided to support, not replace, your own decision-making.
        </p>
      </Section>

      <Section title="10. Limitation of liability">
        <p>
          To the fullest extent permitted by law, SprintCheck will not be liable for
          indirect, incidental, special or consequential damages, or for lost profits
          or data. Our total liability arising out of or relating to the Services will
          not exceed the fees you paid to us in the three months preceding the event
          giving rise to the claim.
        </p>
      </Section>

      <Section title="11. Indemnification">
        <p>
          You agree to indemnify and hold SprintCheck harmless from claims, losses and
          expenses arising from your use of the Services, your data, or your breach of
          these Terms or applicable law.
        </p>
      </Section>

      <Section title="12. Suspension and termination">
        <p>
          You may stop using the Services at any time. We may suspend or terminate
          access if you breach these Terms, fail to pay fees, or use the Services in a
          way that poses legal or security risk. On termination, your right to use the
          Services ends and outstanding fees become due.
        </p>
      </Section>

      <Section title="13. Governing law">
        <p>
          These Terms are governed by the laws of the Federal Republic of Nigeria, and
          the courts of Nigeria will have jurisdiction over any dispute, without
          affecting mandatory rights you may have under local law.
        </p>
      </Section>

      <Section title="14. Changes to these Terms">
        <p>
          We may update these Terms from time to time. Material changes will be posted
          on this page with a revised “Last updated” date, and your continued use of
          the Services constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="15. Contact us">
        <p>
          Questions about these Terms? Contact us at{" "}
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
