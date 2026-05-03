import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Review AI Tools",
  description:
    "Our editorial methodology for evaluating, comparing, and ranking AI tools — and how we keep affiliate revenue from corrupting the process.",
};

export default function HowWeReviewPage() {
  return (
    <article className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">How We Review AI Tools</h1>
      <p className="text-[color:var(--color-muted)]">
        Our editorial methodology, in detail.
      </p>

      <section className="space-y-4 text-[color:var(--color-muted)] leading-relaxed">
        <h2 className="text-2xl font-semibold text-white pt-4">Selection</h2>
        <p>
          A tool gets listed when it meets at least one of these criteria:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>It is the recognized leader in a category that readers ask about</li>
          <li>It has demonstrable, distinct positioning vs incumbents</li>
          <li>It has a viable free or trial tier so we can verify claims</li>
          <li>It has an active product team and recent shipping cadence</li>
        </ul>
        <p>
          Tools that are abandoned, scammy, undocumented, or duplicate an existing entry
          without differentiation are excluded.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Evaluation criteria</h2>
        <p>Every tool entry is built from the same six dimensions:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong className="text-white">Capabilities</strong> — what the tool actually does,
            not what its marketing claims.
          </li>
          <li>
            <strong className="text-white">Pricing transparency</strong> — published tiers, hidden
            limits, and total cost-of-ownership.
          </li>
          <li>
            <strong className="text-white">UX quality</strong> — speed, polish, and friction.
          </li>
          <li>
            <strong className="text-white">Ecosystem</strong> — integrations, API surface,
            community, and exportability.
          </li>
          <li>
            <strong className="text-white">Trust signals</strong> — funding, team transparency,
            terms of service, and data handling.
          </li>
          <li>
            <strong className="text-white">Best-fit use cases</strong> — who specifically should
            choose it.
          </li>
        </ol>

        <h2 className="text-2xl font-semibold text-white pt-4">Comparison structure</h2>
        <p>
          Comparison pages put two tools next to each other on the dimensions above. We do not
          declare a universal winner — most categories have several legitimate &ldquo;best&rdquo;
          tools depending on what you optimize for.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Ranking and ordering</h2>
        <p>
          When tools are listed in a category, the default order is curation-driven, not
          alphabetical or by affiliate payout. The most established or distinctly positioned
          tools appear first.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Updates and corrections</h2>
        <p>
          AI tools change pricing, ship features, and pivot positioning frequently. We
          re-validate listed tools regularly. If you spot an inaccuracy, please send it via the{" "}
          <a href="/contact" className="text-[color:var(--color-accent-2)] hover:underline">
            contact page
          </a>{" "}
          and we will correct or remove the entry promptly.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Conflict of interest</h2>
        <p>
          We earn affiliate commissions from some — not all — of the tools we list. This is
          fully disclosed on the{" "}
          <a
            href="/affiliate-disclosure"
            className="text-[color:var(--color-accent-2)] hover:underline"
          >
            affiliate disclosure page
          </a>
          .
        </p>
        <p>
          To prevent revenue from corrupting reviews, we follow these rules:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Whether a tool offers an affiliate program is never a listing criterion.</li>
          <li>Higher commissions never buy higher placement.</li>
          <li>
            We list non-affiliate tools (such as fully open-source projects) on equal footing.
          </li>
          <li>
            Negative coverage of an affiliate partner is published when warranted.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-white pt-4">Use of AI in this site</h2>
        <p>
          We use AI to help research, draft, translate, and summarize content. All published
          entries are human-reviewed for accuracy before going live. Entries that could not be
          adequately verified are not published.
        </p>
      </section>
    </article>
  );
}
