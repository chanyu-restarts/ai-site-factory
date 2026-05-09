import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { TOOLS } from "@/lib/data/tools";
import { CATEGORY_LABELS, type ToolCategory } from "@/lib/types";
import {
  itemListSchema,
  breadcrumbSchema,
  jsonLdString,
  siteUrl,
} from "@/lib/schema";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.keys(CATEGORY_LABELS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = CATEGORY_LABELS[slug as ToolCategory];
  if (!label) return { title: "Category not found" };
  return {
    title: `Best ${label} Tools — Curated & Compared`,
    description: `Hand-picked ${label} tools with pricing, pros, cons, and side-by-side comparisons.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const category = slug as ToolCategory;
  const label = CATEGORY_LABELS[category];
  if (!label) notFound();

  const items = TOOLS.filter((t) => t.category === category);
  const url = `${siteUrl()}/category/${category}`;

  const jsonLd = jsonLdString(
    itemListSchema(`Best ${label} Tools`, url, items),
    breadcrumbSchema([
      { name: "Home", url: `${siteUrl()}/` },
      { name: label, url },
    ]),
  );

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <header className="space-y-3">
        <div className="text-sm text-[color:var(--color-muted)]">
          <Link href="/" className="hover:text-white">Tools</Link>
          <span className="mx-2">/</span>
          <span>Category</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Best {label} Tools</h1>
        <p className="max-w-2xl text-[color:var(--color-muted)]">
          {items.length} curated {label} tools with honest pricing, real features, and head-to-head comparisons.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {items.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="group flex flex-col rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-5 transition hover:border-[color:var(--color-accent)]"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold group-hover:text-[color:var(--color-accent-2)]">
                {t.name}
              </h2>
              <span className="rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-xs uppercase tracking-wide text-[color:var(--color-muted)] shrink-0">
                {t.pricingModel}
              </span>
            </div>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">{t.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
