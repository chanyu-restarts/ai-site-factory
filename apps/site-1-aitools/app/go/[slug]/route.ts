import { redirect } from "next/navigation";
import { TOOLS_BY_SLUG } from "@/lib/data/tools";

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(TOOLS_BY_SLUG).map((slug) => ({ slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const tool = TOOLS_BY_SLUG[slug];
  if (!tool) {
    return new Response("Tool not found", { status: 404 });
  }

  const destination = tool.affiliateUrl ?? tool.websiteUrl;

  let url: URL;
  try {
    url = new URL(destination);
  } catch {
    return new Response("Invalid destination URL", { status: 500 });
  }

  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", "whichaitool");
  }
  if (!url.searchParams.has("utm_medium")) {
    url.searchParams.set("utm_medium", "directory");
  }
  if (!url.searchParams.has("utm_campaign")) {
    url.searchParams.set("utm_campaign", tool.category);
  }
  if (!url.searchParams.has("utm_content")) {
    url.searchParams.set("utm_content", tool.slug);
  }

  redirect(url.toString());
}
