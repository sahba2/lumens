/**
 * LUMENS - GET /api/render/proxy
 * ------------------------------
 * Streams a generated render from the provider CDN through our own origin so
 * the board can display and download it without CORS issues, without exposing
 * signed provider URLs, and without leaking the API key to the browser.
 *
 *   /api/render/proxy?url=<encoded upstream url>
 *   /api/render/proxy?url=<encoded upstream url>&download=1
 *
 * Security: https only, an explicit host allow-list (extendable through
 * `IMAGE_PROXY_ALLOWED_HOSTS`), image content types only, 20 s timeout.
 */

import { NextResponse } from "next/server";

import { imageProviderConfig } from "@/lib/image-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_ALLOWED_HOSTS = [
  "fal.media",
  "fal.run",
  "replicate.delivery",
  "replicate.com",
  "oaidalleapiprodscus.blob.core.windows.net",
  "oaiusercontent.com",
  "storage.googleapis.com",
  "together.ai",
  "api.together.xyz",
  "avalai.ir",
  "api.avalai.ir",
  "openai.com",
  "huggingface.co",
  "hf.co",
  // Curated sample renders (used until a real provider key is configured).
  "images.unsplash.com",
  "plus.unsplash.com",
];

const PROXY_TIMEOUT_MS = 20_000;

function allowedHosts(): string[] {
  const extra = (process.env.IMAGE_PROXY_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  return [...DEFAULT_ALLOWED_HOSTS, ...extra].map((host) => host.toLowerCase());
}

function isAllowedHost(hostname: string, providerHost: string | null): boolean {
  const host = hostname.toLowerCase();
  const hosts = allowedHosts();

  if (providerHost && providerHost.toLowerCase() === host) {
    return true;
  }

  return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

function isSecureUrl(target: URL): boolean {
  if (target.protocol === "https:") return true;
  // Local development providers may serve over http://localhost.
  return target.protocol === "http:" && ["localhost", "127.0.0.1"].includes(target.hostname);
}

function extensionFor(contentType: string): string {
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("avif")) return "avif";
  return "png";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  const download = searchParams.get("download") === "1";

  if (!rawUrl) {
    return NextResponse.json({ error: "missing-url" }, { status: 400 });
  }

  let target: URL;

  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "invalid-url" }, { status: 400 });
  }

  if (target.username || target.password || !isSecureUrl(target)) {
    return NextResponse.json({ error: "invalid-url" }, { status: 400 });
  }

  if (!isAllowedHost(target.hostname, imageProviderConfig.baseUrlHost)) {
    return NextResponse.json({ error: "host-not-allowed" }, { status: 403 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const upstream = await fetch(target.toString(), {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "image/*" },
    });

    const contentType = upstream.headers.get("content-type") ?? "image/png";

    if (!upstream.ok || !upstream.body || !contentType.startsWith("image/")) {
      return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
    }

    const headers = new Headers({
      "Content-Type": contentType,
      // Provider URLs are already short-lived; cache briefly to avoid re-hits.
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });

    if (download) {
      headers.set(
        "Content-Disposition",
        `attachment; filename="lumens-render-${Date.now()}.${extensionFor(contentType)}"`,
      );
    }

    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "timeout" : "proxy-failed" },
      { status: aborted ? 504 : 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
