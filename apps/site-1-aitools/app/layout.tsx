import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "WhichAITool";
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Find the Right AI Tool, Fast`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Compare AI tools across LLMs, code, image, video, voice, and automation. Honest pricing, real features, side-by-side comparisons.",
  openGraph: {
    title: `${SITE_NAME} — Find the Right AI Tool, Fast`,
    description:
      "Compare AI tools across every category — built and curated continuously.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: {
    google: "0BLdFRsVuMpE7VJc61LjG8z8Eovhi8fPGs-pcqYVh7E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <header className="border-b border-[color:var(--color-border)]">
          <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold tracking-tight">
              {SITE_NAME}
            </a>
            <nav className="flex gap-6 text-sm text-[color:var(--color-muted)]">
              <a href="/" className="hover:text-white">Tools</a>
              <a href="/compare" className="hover:text-white">Compare</a>
              <a href="/category" className="hover:text-white">Categories</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mt-20 border-t border-[color:var(--color-border)]">
          <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-[color:var(--color-muted)] space-y-4">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="/about" className="hover:text-white">About</a>
              <a href="/how-we-review" className="hover:text-white">How we review</a>
              <a href="/affiliate-disclosure" className="hover:text-white">Affiliate disclosure</a>
              <a href="/privacy" className="hover:text-white">Privacy</a>
              <a href="/contact" className="hover:text-white">Contact</a>
            </nav>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-4">
              <span>© {new Date().getFullYear()} {SITE_NAME}. Independent reviews. Some links earn affiliate commission.</span>
              <span className="opacity-60">Built with Next.js</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
