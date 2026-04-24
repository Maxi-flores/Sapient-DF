"use client";

/**
 * StarfieldBackground
 *
 * A fixed, full-viewport starfield with three parallax layers that respond to
 * the user's scroll position via framer-motion's `useScroll` hook.
 * Each layer moves at a different speed, creating a depth illusion.
 *
 * Design tokens:
 *   - Small  stars: #00F0FF (cyan accent)
 *   - Medium stars: mix of cyan and white
 *   - Large  stars: #FFFFFF
 *
 * The container sits at z-index: -1 so it never intercepts pointer events.
 *
 * Usage – place once in your root layout, outside the scrollable content:
 *   <StarfieldBackground />
 */

import { useRef, useEffect, useMemo } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Star {
  x: number; // percent (0–100)
  y: number; // percent (0–100)
  size: number; // px
  opacity: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Deterministic PRNG (seeded) – avoids hydration mismatches
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateStars(count: number, sizeRange: [number, number], colors: string[], seed: number): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: sizeRange[0] + rand() * (sizeRange[1] - sizeRange[0]),
    opacity: 0.4 + rand() * 0.6,
    color: colors[Math.floor(rand() * colors.length)],
  }));
}

// ---------------------------------------------------------------------------
// StarLayer – one parallax layer rendered on a <canvas>
// ---------------------------------------------------------------------------

interface StarLayerProps {
  stars: Star[];
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  /** Fraction of viewport height the layer shifts per full page scroll */
  parallaxStrength: number;
  style?: React.CSSProperties;
}

function StarLayer({ stars, scrollYProgress, parallaxStrength, style }: StarLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw stars onto the canvas once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((star) => {
      const cx = (star.x / 100) * window.innerWidth;
      const cy = (star.y / 100) * window.innerHeight;
      ctx.beginPath();
      ctx.arc(cx, cy, star.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.opacity;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, [stars]);

  // Translate Y based on scroll
  const translateY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0vh", `${parallaxStrength * 100}vh`],
  );

  return (
    <motion.canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        translateY,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StarfieldBackground() {
  const { scrollYProgress } = useScroll();

  // Three layers: small-fast, medium, large-slow
  const layers = useMemo(
    () => [
      {
        stars: generateStars(220, [1, 1.5], ["#00F0FF", "#00d4e0"], 1001),
        parallaxStrength: -0.15, // fastest (moves against scroll)
        zIndex: -3,
      },
      {
        stars: generateStars(80, [1.5, 2.5], ["#ffffff", "#00F0FF", "#aaf4ff"], 2002),
        parallaxStrength: -0.08,
        zIndex: -2,
      },
      {
        stars: generateStars(30, [2.5, 4], ["#ffffff"], 3003),
        parallaxStrength: -0.03, // slowest (nearly fixed)
        zIndex: -1,
      },
    ],
    [],
  );

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    >
      {layers.map((layer, i) => (
        <StarLayer
          key={i}
          stars={layer.stars}
          scrollYProgress={scrollYProgress}
          parallaxStrength={layer.parallaxStrength}
          style={{ zIndex: layer.zIndex }}
        />
      ))}
    </div>
  );
}
