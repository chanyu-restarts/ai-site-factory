import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { TOOLS, TOOLS_BY_SLUG } from "@/lib/data/tools";
import { CATEGORY_LABELS } from "@/lib/types";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS_BY_SLUG[slug];
  if (!tool) return { title: "Tool not found" };
  return {
    title: `${tool.name} — Review, Pricing & Alternatives`,
    description: tool.tagline,
    openGraph: {
      title: `${tool.name} — Review, Pricing & Alternatives`,
      description: tool.tagline,
      type: "article",
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tool = TOOLS_BY_SLUG[slug];
  if (!tool) notFound();

  const otherInCategory = TOOLS.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug,
  ).slice(0, 6);

  const ctaUrl = tool.affiliateUrl ?? tool.websiteUrl;

  return (
    <article className="space-y-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)]">
          <Link href="/" className="hover:text-white">Tools</Link>
          <span>/</span>
          <Link
            href={`/category/${tool.category}`}
            className="hover:text-white"
          >
            {CATEGORY_LABELS[tool.category]}
          </Link>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">{tool.name}</h1>
        <p className="text-lg text-[color:var(--color-muted)]">{tool.tagline}</p>
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center rounded-md bg-[color:var(--color-accent)] px-5 py-2.5 text-sm font-medium hover:opacity-90"
          >
            Visit {tool.name} →
          </a>
          <span className="text-sm text-[color:var(--color-muted)]">
            Launched {tool.launchYear} · {tool.pricingModel}
          </span>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-[color:var(--color-muted)] leading-relaxed">
          {tool.description}
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Pros</h2>
          <ul className="space-y-2 text-[color:var(--color-muted)]">
            {tool.pros.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-[color:var(--color-accent-2)]">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Cons</h2>
          <ul className="space-y-2 text-[color:var(--color-muted)]">
            {tool.cons.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-rose-400">−</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tool.pricing.map((tier) => (
            <div
              key={tier.name}
              className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-4"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">{tier.name}</h3>
                <span className="text-lg font-semibold">
                  {tier.priceUsd === "free"
                    ? "Free"
                    : tier.priceUsd === "custom"
                      ? "Custom"
                      : `$${tier.priceUsd}`}
                  {tier.perMonth && tier.priceUsd !== "free" && tier.priceUsd !== "custom" && (
                    <span className="text-sm text-[color:var(--color-muted)]">/mo</span>
                  )}
                </span>
              </div>
              {tier.notes && (
                <p className="mt-1 text-xs text-[color:var(--color-muted)]">{tier.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Key Features</h2>
        <div className="flex flex-wrap gap-2">
          {tool.features.map((f) => (
            <span
              key={f}
              className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] px-3 py-1 text-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Best For</h2>
        <div className="flex flex-wrap gap-2">
          {tool.bestFor.map((b) => (
            <span
              key={b}
              className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-sm text-[color:var(--color-muted)]"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {otherInCategory.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Alternatives in {CATEGORY_LABELS[tool.category]}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {otherInCategory.map((alt) => (
              <Link
                key={alt.slug}
                href={`/compare/${tool.slug}-vs-${alt.slug}`}
                className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-4 hover:border-[color:var(--color-accent)]"
              >
                <div className="text-sm text-[color:var(--color-muted)]">Compare</div>
                <div className="font-medium">
                  {tool.name} vs {alt.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-6">
        <h2 className="text-xl font-semibold">Try {tool.name}</h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Visit the official site to start. We may earn a commission on links — pricing is unchanged for you.
        </p>
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener sponsored"
          className="mt-4 inline-flex items-center rounded-md bg-[color:var(--color-accent)] px-5 py-2.5 text-sm font-medium hover:opacity-90"
        >
          Go to {tool.name} →
        </a>
      </section>
    </article>
  );
}
