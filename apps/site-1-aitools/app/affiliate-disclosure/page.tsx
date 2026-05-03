import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How WhichAITool earns money, and what that means for our reviews and recommendations.",
};

export default function AffiliateDisclosurePage() {
  return (
    <article className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Affiliate Disclosure</h1>
      <p className="text-sm text-[color:var(--color-muted)]">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
      </p>

      <section className="space-y-4 text-[color:var(--color-muted)] leading-relaxed">
        <p>
          <strong className="text-white">WhichAITool participates in affiliate programs.</strong>{" "}
          When you click an outbound link to a third-party AI tool from this site and
          subsequently make a purchase or sign up for a paid plan, we may receive a commission
          from that vendor at no additional cost to you.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">How this affects our reviews</h2>
        <p>
          Affiliate earnings do not influence which tools we list, the order in which they
          appear, or the content of our reviews. We rate tools based on documented features,
          public pricing, and hands-on testing where possible.
        </p>
        <p>
          Some tools we cover do not offer affiliate programs at all — we still list and review
          them on the same basis as those that do.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Programs we participate in</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Impact.com partner programs</li>
          <li>PartnerStack partner programs</li>
          <li>Direct affiliate programs operated by individual AI tool vendors</li>
          <li>Display advertising networks (where applicable)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white pt-4">FTC compliance</h2>
        <p>
          This disclosure is provided in compliance with the U.S. Federal Trade Commission&apos;s
          16 CFR Part 255: Guides Concerning the Use of Endorsements and Testimonials in
          Advertising, and equivalent regulations in the EU, UK, Canada, Australia, and Japan.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Questions?</h2>
        <p>
          If you have any questions about this disclosure, please reach us via the{" "}
          <a href="/contact" className="text-[color:var(--color-accent-2)] hover:underline">
            contact page
          </a>
          .
        </p>
      </section>
    </article>
  );
}
