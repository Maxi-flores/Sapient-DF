export default function VaultPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "40px 16px",
        color: "#e8f0fe",
      }}
    >
      <h1 style={{ fontSize: 22, color: "#00F0FF", letterSpacing: "0.1em" }}>
        ◈ VAULT
      </h1>
      <p style={{ opacity: 0.6, fontSize: 13 }}>
        Your Obsidian notes will appear here via the symlinked{" "}
        <code
          style={{
            color: "#00F0FF",
            background: "rgba(0,240,255,0.08)",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          /content
        </code>{" "}
        directory.
      </p>
    </main>
  );
}
