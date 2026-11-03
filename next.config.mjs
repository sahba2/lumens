/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // The site ships its own SVG render artwork in /public, so the image
    // optimizer must be allowed to serve SVG sources. The CSP below keeps
    // SVG payloads inert (no scripts) and forces them to download safely.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1240, 1600],
    imageSizes: [96, 160, 256, 384],
  },
};

export default nextConfig;
