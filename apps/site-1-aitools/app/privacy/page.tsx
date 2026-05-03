import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WhichAITool collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-[color:var(--color-muted)]">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
      </p>

      <section className="space-y-4 text-[color:var(--color-muted)] leading-relaxed">
        <p>
          This Privacy Policy describes how WhichAITool (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) handles information when you visit our website.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Information we collect</h2>
        <p>
          We collect minimal information needed to operate the site and improve content:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong className="text-white">Anonymous analytics</strong>: aggregated page views,
            referrers, and country-level location via Cloudflare Web Analytics. No personal
            identifiers, cookies, or fingerprinting.
          </li>
          <li>
            <strong className="text-white">Affiliate click tracking</strong>: when you click an
            outbound affiliate link, the destination vendor may set their own cookies; we receive
            only an anonymous attribution signal.
          </li>
          <li>
            <strong className="text-white">Contact submissions</strong>: if you email us, we
            store your message and email address solely to reply.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-white pt-4">What we do not do</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>We do not sell your personal information to third parties.</li>
          <li>We do not use behavioral advertising trackers (no Google Analytics).</li>
          <li>We do not require accounts or sign-ups to read content.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white pt-4">Third-party links</h2>
        <p>
          When you click outbound links to AI tools, you leave our site. The destination
          vendor&apos;s privacy policy then applies. We are not responsible for their data
          practices.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Your rights (GDPR / CCPA)</h2>
        <p>
          Because we do not collect personally identifying information from passive site
          visitors, there is generally nothing for us to delete or export. If you have emailed
          us, you may request deletion of that record at any time via the{" "}
          <a href="/contact" className="text-[color:var(--color-accent-2)] hover:underline">
            contact page
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Changes</h2>
        <p>
          We may update this policy. The &quot;Last updated&quot; date at the top reflects the
          most recent revision.
        </p>
      </section>
    </article>
  );
}
