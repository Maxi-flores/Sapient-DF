import { CreditVaultCard } from "@/components/CreditVaultCard";
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "40px 16px",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "#00F0FF",
        }}
      >
        ◈ SAPIENT
      </h1>

      {/* Demo Credit Vault card */}
      <CreditVaultCard
        ownerName="Sapient Vault"
        paymentDetails="bitcoin:1A2b3C4d5E6f7G8h9I0j?amount=0.001&label=SapientKB"
      />

      {/* Navigation links to demonstrate the Fundance route transition */}
      <nav style={{ display: "flex", gap: 16 }}>
        <Link href="/" style={linkStyle}>
          Home
        </Link>
        <Link href="/vault" style={linkStyle}>
          Vault
        </Link>
      </nav>

      <p
        style={{
          fontSize: 11,
          opacity: 0.4,
          letterSpacing: "0.1em",
          textAlign: "center",
        }}
      >
        Click the links above to trigger the Fundance star-burst transition
      </p>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#00F0FF",
  textDecoration: "none",
  fontSize: 13,
  letterSpacing: "0.1em",
  border: "1px solid rgba(0, 240, 255, 0.35)",
  borderRadius: 6,
  padding: "6px 16px",
};
