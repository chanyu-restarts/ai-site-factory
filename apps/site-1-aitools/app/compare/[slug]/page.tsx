import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { TOOLS, TOOLS_BY_SLUG } from "@/lib/data/tools";
import type { Tool } from "@/lib/types";
import {
  articleSchema,
  breadcrumbSchema,
  jsonLdString,
  siteUrl,
} from "@/lib/schema";

type Params = { slug: string };

export const dynamicParams = false;

function parsePair(slug: string): [string, string] | null {
  const match = slug.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  return [match[1]!, match[2]!];
}

export function generateStaticParams(): Params[] {
  const params: Params[] = [];
  for (const a of TOOLS) {
    for (const b of TOOLS) {
      if (a.slug !== b.slug && a.category === b.category) {
        params.push({ slug: `${a.slug}-vs-${b.slug}` });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pair = parsePair(slug);
  if (!pair) return { title: "Compare not found" };
  const [aSlug, bSlug] = pair;
  const a = TOOLS_BY_SLUG[aSlug];
  const b = TOOLS_BY_SLUG[bSlug];
  if (!a || !b) return { title: "Compare not found" };
  return {
    title: `${a.name} vs ${b.name} — Side-by-Side Comparison`,
    description: `Compare ${a.name} and ${b.name}: features, pricing, pros, and cons. Pick the right tool for your use case.`,
  };
}

function lowestPaidTier(tool: Tool): string {
  const numeric = tool.pricing
    .map((t) => t.priceUsd)
    .filter((p): p is number => typeof p === "number");
  if (numeric.length === 0) {
    if (tool.pricing.some((t) => t.priceUsd === "free")) return "Free";
    return "Custom";
  }
  return `$${Math.min(...numeric)}/mo`;
}

export default async function ComparePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const pair = parsePair(slug);
  if (!pair) notFound();
  const [aSlug, bSlug] = pair;
  const a = TOOLS_BY_SLUG[aSlug];
  const b = TOOLS_BY_SLUG[bSlug];
  if (!a || !b) notFound();

  const aCta = `/go/${a.slug}`;
  const bCta = `/go/${b.slug}`;
  const url = `${siteUrl()}/compare/${slug}`;
  const headline = `${a.name} vs ${b.name} — Side-by-Side Comparison`;
  const description = `Compare ${a.name} and ${b.name}: features, pricing, pros, and cons. Pick the right tool for your use case.`;

  const jsonLd = jsonLdString(
    articleSchema({
      url,
      headline,
      description,
      datePublished: new Date().toISOString(),
    }),
    breadcrumbSchema([
      { name: "Home", url: `${siteUrl()}/` },
      { name: `${a.name} vs ${b.name}`, url },
    ]),
  );

  const rows: Array<[string, string, string]> = [
    ["Tagline", a.tagline, b.tagline],
    ["Pricing model", a.pricingModel, b.pricingModel],
    ["Lowest paid tier", lowestPaidTier(a), lowestPaidTier(b)],
    ["Launched", String(a.launchYear), String(b.launchYear)],
    ["Best for", a.bestFor.join(", "), b.bestFor.join(", ")],
    ["Top features", a.features.slice(0, 3).join(", "), b.features.slice(0, 3).join(", ")],
  ];

  return (
    <article className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <header className="space-y-2">
        <div className="text-sm text-[color:var(--color-muted)]">
          <Link href="/" className="hover:text-white">Tools</Link>
          <span className="mx-2">/</span>
          <span>Compare</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          {a.name} <span className="text-[color:var(--color-muted)]">vs</span> {b.name}
        </h1>
        <p className="text-[color:var(--color-muted)]">
          Side-by-side comparison of {a.name} and {b.name} — features, pricing, and trade-offs.
        </p>
      </header>

      <section className="overflow-x-auto rounded-lg border border-[color:var(--color-border)]">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-[color:var(--color-bg-2)]">
            <tr>
              <th className="p-3 text-left font-medium w-40"></th>
              <th className="p-3 text-left font-semibold">
                <Link href={`/tools/${a.slug}`} className="hover:text-[color:var(--color-accent-2)]">
                  {a.name}
                </Link>
              </th>
              <th className="p-3 text-left font-semibold">
                <Link href={`/tools/${b.slug}`} className="hover:text-[color:var(--color-accent-2)]">
                  {b.name}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, av, bv]) => (
              <tr key={label} className="border-t border-[color:var(--color-border)]">
                <th className="p-3 text-left font-medium text-[color:var(--color-muted)]">{label}</th>
                <td className="p-3">{av}</td>
                <td className="p-3">{bv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {[a, b].map((t) => {
          const cta = t === a ? aCta : bCta;
          return (
            <div
              key={t.slug}
              className="space-y-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-6"
            >
              <h2 className="text-xl font-semibold">{t.name}</h2>
              <p className="text-sm text-[color:var(--color-muted)]">{t.tagline}</p>
              <ul className="space-y-1 text-sm">
                {t.pros.slice(0, 3).map((p) => (
                  <li key={p} className="text-[color:var(--color-muted)]">
                    <span className="text-[color:var(--color-accent-2)]">+ </span>{p}
                  </li>
                ))}
                {t.cons.slice(0, 2).map((c) => (
                  <li key={c} className="text-[color:var(--color-muted)]">
                    <span className="text-rose-400">− </span>{c}
                  </li>
                ))}
              </ul>
              <a
                href={cta}
                target="_blank"
                rel="noopener sponsored"
                className="mt-2 inline-flex items-center rounded-md bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Visit {t.name} →
              </a>
            </div>
          );
        })}
      </section>
    </article>
  );
}
