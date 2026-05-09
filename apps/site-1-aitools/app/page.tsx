import Link from "next/link";
import { TOOLS } from "@/lib/data/tools";
import { CATEGORY_LABELS, type ToolCategory } from "@/lib/types";

export default function HomePage() {
  const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[];

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Find the right AI tool — fast.
        </h1>
        <p className="max-w-2xl text-[color:var(--color-muted)] md:text-lg">
          Honest, side-by-side comparisons of the AI tools that matter.
          Curated continuously across {TOOLS.length}+ products in {categories.length} categories.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/category/${c}`}
              className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-sm text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)] hover:text-white"
            >
              {CATEGORY_LABELS[c]}
            </Link>
          ))}
        </div>
      </section>

      {categories.map((category) => {
        const items = TOOLS.filter((t) => t.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold">{CATEGORY_LABELS[category]}</h2>
              <Link
                href={`/category/${category}`}
                className="text-sm text-[color:var(--color-muted)] hover:text-white"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {items.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="group flex flex-col rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-5 transition hover:border-[color:var(--color-accent)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold group-hover:text-[color:var(--color-accent-2)]">
                      {t.name}
                    </h3>
                    <span className="rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-xs uppercase tracking-wide text-[color:var(--color-muted)] shrink-0">
                      {t.pricingModel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--color-muted)] line-clamp-2">
                    {t.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
