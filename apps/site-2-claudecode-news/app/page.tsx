export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <span className="inline-block rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] px-3 py-1 text-xs uppercase tracking-wide text-[color:var(--color-muted)]">
          Coming soon
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Claude Code, agent harnesses,<br />
          and the AI engineering stack — distilled.
        </h1>
        <p className="text-lg text-[color:var(--color-muted)] max-w-2xl">
          A weekly digest of Claude Code releases, agent harness patterns, MCP servers, and the
          tooling shaping how AI engineers actually ship.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 pt-6">
        <FeatureCard title="Releases" body="Anthropic, Claude Code, MCP — only what changed." />
        <FeatureCard title="Patterns" body="Agent harness designs, hook recipes, eval setups." />
        <FeatureCard title="Field reports" body="Real builds, real numbers, real failures." />
      </div>
    </section>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-5">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[color:var(--color-muted)]">{body}</p>
    </div>
  );
}
