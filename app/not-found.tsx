import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "Arial, sans-serif", background: "#fffaf6", color: "#17271e" }}>
      <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "0 0 16px" }}>404</h1>
      <p style={{ fontSize: "18px", color: "#52645b", margin: "0 0 24px" }}>Page not found.</p>
      <Link href="/" style={{ padding: "12px 24px", background: "#173c2a", color: "white", borderRadius: "999px", textDecoration: "none", fontWeight: 800 }}>
        Return Home
      </Link>
    </main>
  );
}
