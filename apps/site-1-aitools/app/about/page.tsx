import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "What WhichAITool is, who runs it, and how we keep AI tool reviews honest.",
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">About WhichAITool</h1>

      <section className="space-y-4 text-[color:var(--color-muted)] leading-relaxed">
        <p>
          WhichAITool is an independent directory and comparison site for AI tools — covering
          LLMs, code assistants, image and video generators, voice tools, automation, and more.
        </p>
        <p>
          We exist because the AI space moves so fast that picking the right tool now requires
          either constant industry attention or a trustworthy reference. We aim to be that
          reference.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">What we do</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Curate AI tools across all major categories</li>
          <li>Document each tool&apos;s features, pricing tiers, strengths, and weaknesses</li>
          <li>Publish side-by-side comparisons grounded in public data and hands-on use</li>
          <li>Update continuously as tools launch, change pricing, or shift positioning</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white pt-4">How we stay honest</h2>
        <p>
          We earn money via affiliate commissions when readers sign up for tools through our
          outbound links. This funding lets us cover the site without paywalls or sponsored
          rankings.
        </p>
        <p>
          To prevent that funding model from corrupting our reviews, we follow the editorial
          principles documented on{" "}
          <a href="/how-we-review" className="text-[color:var(--color-accent-2)] hover:underline">
            our review methodology page
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Who runs the site</h2>
        <p>
          WhichAITool is operated by an independent publisher. Editorial direction, ranking
          decisions, and tool selection are not influenced by any vendor or partner.
        </p>

        <h2 className="text-2xl font-semibold text-white pt-4">Get in touch</h2>
        <p>
          Suggest a tool, flag inaccurate information, or just say hi via our{" "}
          <a href="/contact" className="text-[color:var(--color-accent-2)] hover:underline">
            contact page
          </a>
          .
        </p>
      </section>
    </article>
  );
}
