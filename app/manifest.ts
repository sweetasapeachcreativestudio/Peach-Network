import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Peach Network",
    short_name: "Peach",
    description: "Vetted creative work, project support and creative career growth.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf4",
    theme_color: "#0d2f24",
    orientation: "portrait",
    icons: [
      { src: "/icons/peach-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/peach-512.png", sizes: "512x512", type: "image/png" }
    ]
  };
}
