import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with WhichAITool — suggest tools, flag corrections, or partnership inquiries.",
};

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@whichaitool.com";

export default function ContactPage() {
  return (
    <article className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>

      <section className="space-y-4 text-[color:var(--color-muted)] leading-relaxed">
        <p>
          The best way to reach us is by email. We read every message and try to reply
          within a few business days.
        </p>

        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-6">
          <div className="text-sm text-[color:var(--color-muted)]">Email us</div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 block text-2xl font-semibold text-[color:var(--color-accent-2)] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <h2 className="text-2xl font-semibold text-white pt-4">What to write about</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong className="text-white">Suggest an AI tool</strong> we should cover. Include
            the URL and a one-line pitch.
          </li>
          <li>
            <strong className="text-white">Flag a correction</strong> — pricing change, feature
            update, or factual error.
          </li>
          <li>
            <strong className="text-white">Partnership inquiries</strong> — affiliate program
            onboarding, sponsorship, content collaborations.
          </li>
          <li>
            <strong className="text-white">Privacy requests</strong> — data deletion or
            disclosure requests under GDPR / CCPA.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-white pt-4">What not to write about</h2>
        <p>
          Please don&apos;t send pitches asking us to remove a competitor, manipulate rankings,
          or post sponsored content disguised as editorial. We won&apos;t respond to those.
        </p>
      </section>
    </article>
  );
}
