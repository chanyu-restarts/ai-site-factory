import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Claude Code Weekly";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Claude Code, agent harnesses, and AI dev workflows`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Curated news, releases, and deep-dives on Claude Code, agent harnesses, MCP servers, and the AI engineering stack.",
  openGraph: {
    title: `${SITE_NAME} — Claude Code & agent harness news`,
    description:
      "Curated news on Claude Code, agent harnesses, MCP, and the AI engineering stack.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <header className="border-b border-[color:var(--color-border)]">
          <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold tracking-tight">
              {SITE_NAME}
            </a>
            <nav className="flex gap-6 text-sm text-[color:var(--color-muted)]">
              <a href="/" className="hover:text-white">Latest</a>
              <a href="/topics" className="hover:text-white">Topics</a>
              <a href="/about" className="hover:text-white">About</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mt-20 border-t border-[color:var(--color-border)]">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-[color:var(--color-muted)] flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} {SITE_NAME}. Independent. Not affiliated with Anthropic.</span>
            <span className="opacity-60">Built with Next.js</span>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
