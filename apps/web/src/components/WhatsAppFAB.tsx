"use client";

/**
 * WhatsAppFAB
 *
 * A Floating Action Button positioned at the bottom-right of the viewport.
 *
 * Behaviour:
 *  • Hover  → plays the star-burst Lottie animation as a small overlay
 *  • Click  → opens WhatsApp using the NEXT_PUBLIC_WHATSAPP_NUMBER env var
 *
 * Design (Claude AI style):
 *  • 1 px border at 20 % white opacity
 *  • backdrop-blur-xl glass background
 *  • Crystal Mono font label
 *  • #00F0FF accent glow on hover
 */

import { useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import starBurstData from "../../public/animations/star-burst.json";

// WhatsApp SVG icon (official brand mark)
function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="22"
      height="22"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.476 2.027 7.785L0 32l8.418-2.004A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.406 22.594c-.352.99-2.055 1.943-2.822 1.969-.766.026-1.48.363-7.023-2.076-5.543-2.44-8.934-8.28-9.204-8.666-.27-.387-2.197-2.924-2.197-5.563s1.387-3.949 1.879-4.494c.492-.545 1.07-.682 1.427-.682.355 0 .711.003 1.023.02.328.018.767-.124 1.203.918.457 1.076 1.549 3.715 1.684 3.985.135.27.226.59.045.949-.18.36-.27.583-.539.898-.27.315-.567.703-.812.943-.27.27-.55.563-.237 1.103.314.54 1.393 2.299 2.993 3.723 2.055 1.832 3.787 2.4 4.327 2.67.54.27.854.226 1.168-.135.314-.36 1.348-1.574 1.707-2.113.358-.54.718-.45 1.212-.27.494.18 3.133 1.48 3.672 1.75.54.27.898.404 1.033.629.134.225.134 1.305-.218 2.297z" />
    </svg>
  );
}

export function WhatsAppFAB() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);

  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const waUrl = `https://wa.me/${number.replace(/\D/g, "")}`;

  function handleMouseEnter() {
    setHovered(true);
    setPlaying(true);
    lottieRef.current?.goToAndPlay(0, true);
  }

  function handleMouseLeave() {
    setHovered(false);
  }

  function handleLottieComplete() {
    setPlaying(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Lottie burst — renders above the button, centred on it */}
      {playing && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 120,
            pointerEvents: "none",
          }}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={starBurstData}
            loop={false}
            autoplay
            onComplete={handleLottieComplete}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}

      {/* The actual FAB */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="
          flex items-center gap-2
          px-4 py-3
          rounded-2xl
          text-white
          backdrop-blur-xl
          transition-all duration-200
        "
        style={{
          background: "rgba(10, 14, 26, 0.72)",
          border: "1px solid rgba(255, 255, 255, 0.20)",
          boxShadow: hovered
            ? "0 0 24px rgba(0, 240, 255, 0.4), 0 4px 20px rgba(0,0,0,0.5)"
            : "0 4px 20px rgba(0,0,0,0.5)",
          color: hovered ? "#00F0FF" : "#e8f0fe",
          fontFamily: '"Crystal", "JetBrains Mono", "Fira Code", "Courier New", monospace',
          fontSize: 12,
          letterSpacing: "0.12em",
          textDecoration: "none",
          userSelect: "none",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        <WhatsAppIcon />
        <span>CHAT</span>
      </a>
    </div>
  );
}
