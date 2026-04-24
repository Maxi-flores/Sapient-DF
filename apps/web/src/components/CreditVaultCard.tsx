"use client";

/**
 * CreditVaultCard
 *
 * A "Credit Vault" card component with:
 *   • IP geolocation powered by ipapi.co (rendered in Crystal-Clear mono font)
 *   • A QR code that encodes configurable payment details (responsive, aspect-square)
 *   • Copy-to-clipboard on the IP address with a "Coordinates Copied" stardust tooltip
 *   • A Claude-style aesthetic: #00F0FF accents, blurred-glass background
 *
 * Usage:
 *   <CreditVaultCard
 *     paymentDetails="bitcoin:1A2b3C...?amount=0.001"
 *     ownerName="Sapient"
 *   />
 */

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IpLocation {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
  org: string;
}

interface CreditVaultCardProps {
  /** Any string you want encoded in the QR code (e.g. a payment URI). */
  paymentDetails: string;
  /** Display name shown at the top of the card. */
  ownerName?: string;
}

// ---------------------------------------------------------------------------
// Hook: IP location
// ---------------------------------------------------------------------------

function useIpLocation() {
  const [location, setLocation] = useState<IpLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLocation(attempt = 1): Promise<void> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8_000);
      try {
        const res = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // Respect rate-limit header: wait and retry once.
        if (res.status === 429 && attempt === 1) {
          const retryAfter = Number(res.headers.get("Retry-After") ?? 2);
          await new Promise((r) => setTimeout(r, retryAfter * 1_000));
          if (!cancelled) return fetchLocation(2);
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: IpLocation = await res.json();
        if (!cancelled) setLocation(data);
      } catch (err) {
        clearTimeout(timeoutId);
        if (!cancelled) {
          // Check for AbortError (both DOMException name and message variants)
          const isAbort =
            (err instanceof Error && err.name === "AbortError") ||
            (err instanceof Error && err.message === "signal timed out");
          const message = isAbort
            ? "Request timed out"
            : err instanceof Error
            ? err.message
            : "Unknown error";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  return { location, loading, error };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreditVaultCard({
  paymentDetails,
  ownerName = "Vault Owner",
}: CreditVaultCardProps) {
  const { location, loading, error } = useIpLocation();

  return (
    <article style={styles.card}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={styles.header}>
        <span style={styles.badge}>◈ CREDIT VAULT</span>
        <h2 style={styles.ownerName}>{ownerName}</h2>
      </header>

      {/* ── IP Location ───────────────────────────────────────────────── */}
      <section style={styles.locationSection}>
        <p style={styles.sectionLabel}>NETWORK LOCATION</p>
        {loading && <p style={styles.mono}>Locating…</p>}
        {error && <p style={{ ...styles.mono, color: "#ff4d4d" }}>⚠ {error}</p>}
        {location && (
          <div style={styles.locationGrid}>
            {/* IP row — clickable copy with stardust tooltip */}
            <CopyableRow label="IP" value={location.ip} />
            <LocationRow
              label="CITY"
              value={`${location.city}, ${location.region}`}
            />
            <LocationRow label="COUNTRY" value={location.country_name} />
            <LocationRow
              label="COORDS"
              value={`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            />
            <LocationRow label="ORG" value={location.org} />
          </div>
        )}
      </section>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <hr style={styles.divider} />

      {/* ── QR Code ───────────────────────────────────────────────────── */}
      <section style={styles.qrSection}>
        <p style={styles.sectionLabel}>PAYMENT DETAILS</p>
        {/*
          aspect-square + w-full makes the QR tile perfectly square and
          responsive on all screen sizes; max-w-[200px] caps the desktop size.
        */}
        <div className="w-full max-w-[200px] mx-auto aspect-square" style={styles.qrWrapper}>
          <QRCodeSVG
            value={paymentDetails}
            size={undefined}
            style={{ width: "100%", height: "100%", display: "block" }}
            bgColor="transparent"
            fgColor="#00F0FF"
            level="H"
            includeMargin={false}
          />
        </div>
        <p style={{ ...styles.mono, marginTop: 8, fontSize: 10, opacity: 0.6 }}>
          {paymentDetails.length > 40
            ? paymentDetails.slice(0, 40) + "…"
            : paymentDetails}
        </p>
      </section>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LocationRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.locationRow}>
      <span style={styles.locationLabel}>{label}</span>
      <span style={styles.locationValue}>{value}</span>
    </div>
  );
}

/**
 * CopyableRow — clicking the value copies it to clipboard and shows a
 * temporary tooltip with a stardust glow animation.
 * Shows "Copied!" on success, or a warning if clipboard API is unavailable.
 */
function CopyableRow({ label, value }: { label: string; value: string }) {
  const [tooltipState, setTooltipState] = useState<"hidden" | "in" | "out">("hidden");
  const [tooltipMsg, setTooltipMsg] = useState("✦ Copied!");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showTooltip(message: string) {
    setTooltipMsg(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltipState("in");
    timerRef.current = setTimeout(() => {
      setTooltipState("out");
      timerRef.current = setTimeout(() => setTooltipState("hidden"), 280);
    }, 1_800);
  }

  function handleCopy() {
    if (!navigator.clipboard) {
      // Clipboard API requires HTTPS / secure context
      showTooltip("⚠ HTTPS required");
      return;
    }
    navigator.clipboard
      .writeText(value)
      .then(() => showTooltip(`✦ ${label} Copied`))
      .catch(() => showTooltip("⚠ Copy failed"));
  }

  return (
    <div style={{ ...styles.locationRow, position: "relative" }}>
      <span style={styles.locationLabel}>{label}</span>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy to clipboard"
        style={styles.copyButton}
      >
        {value}
      </button>

      {/* Stardust tooltip */}
      {tooltipState !== "hidden" && (
        <span
          className={
            tooltipState === "in" ? "animate-stardust-in" : "animate-stardust-out"
          }
          style={styles.tooltip}
        >
          {tooltipMsg}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles  (Claude-style: dark glass, #00F0FF accents, monospace)
// ---------------------------------------------------------------------------

const ACCENT = "#00F0FF";
const FONT_MONO =
  '"Crystal", "JetBrains Mono", "Fira Code", "Courier New", monospace';

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: "relative",
    width: "min(360px, 100%)",
    borderRadius: 16,
    padding: "28px 24px",
    background: "rgba(10, 14, 26, 0.72)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: `1px solid rgba(${hexToRgb(ACCENT)}, 0.35)`,
    boxShadow: `0 0 40px rgba(${hexToRgb(ACCENT)}, 0.12), 0 8px 32px rgba(0, 0, 0, 0.48)`,
    color: "#e8f0fe",
    fontFamily: FONT_MONO,
    userSelect: "none",
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    display: "inline-block",
    fontSize: 10,
    letterSpacing: "0.2em",
    color: ACCENT,
    border: `1px solid rgba(${hexToRgb(ACCENT)}, 0.5)`,
    borderRadius: 4,
    padding: "2px 8px",
    marginBottom: 10,
  },
  ownerName: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: "0.04em",
  },
  locationSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    margin: "0 0 8px",
    fontSize: 9,
    letterSpacing: "0.22em",
    color: `rgba(${hexToRgb(ACCENT)}, 0.7)`,
    textTransform: "uppercase" as const,
  },
  locationGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  locationRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  locationLabel: {
    fontSize: 11,
    color: `rgba(${hexToRgb(ACCENT)}, 0.8)`,
    letterSpacing: "0.1em",
    minWidth: 64,
  },
  locationValue: {
    fontSize: 11,
    color: "#c8d8f8",
    textAlign: "right" as const,
    wordBreak: "break-all" as const,
  },
  copyButton: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: 11,
    color: "#c8d8f8",
    fontFamily: FONT_MONO,
    textAlign: "right" as const,
    wordBreak: "break-all" as const,
    textDecoration: "underline dotted rgba(0,240,255,0.35)",
    transition: "color 0.15s",
  },
  tooltip: {
    position: "absolute" as const,
    bottom: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap" as const,
    background: "rgba(10, 14, 26, 0.92)",
    border: `1px solid rgba(${hexToRgb(ACCENT)}, 0.5)`,
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 10,
    letterSpacing: "0.12em",
    color: ACCENT,
    pointerEvents: "none" as const,
    zIndex: 10,
  },
  mono: {
    margin: 0,
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: "#c8d8f8",
  },
  divider: {
    border: "none",
    borderTop: `1px solid rgba(${hexToRgb(ACCENT)}, 0.2)`,
    margin: "16px 0",
  },
  qrSection: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  qrWrapper: {
    padding: 12,
    borderRadius: 8,
    background: "rgba(0, 240, 255, 0.04)",
    border: `1px solid rgba(${hexToRgb(ACCENT)}, 0.2)`,
  },
};

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
