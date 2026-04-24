"use client";

/**
 * FundanceTransition
 *
 * A full-viewport transparent overlay that plays a Lottie "star-burst"
 * animation on every Next.js route change.  It listens to the browser's
 * Navigation API (supported in modern Chromium) and falls back gracefully
 * to a manual `usePathname` watcher on browsers that don't support it.
 *
 * Usage – wrap your root layout:
 *
 *   import { FundanceTransition } from "@/components/FundanceTransition";
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           <FundanceTransition />
 *           {children}
 *         </body>
 *       </html>
 *     );
 *   }
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { usePathname } from "next/navigation";
import starBurstData from "../../public/animations/star-burst.json";

interface FundanceTransitionProps {
  /** Duration (ms) to keep the overlay visible after the animation finishes.
   *  Defaults to 0 – overlay disappears as soon as the animation ends. */
  lingerMs?: number;
}

export function FundanceTransition({
  lingerMs = 0,
}: FundanceTransitionProps) {
  const [visible, setVisible] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  const play = useCallback(() => {
    setVisible(true);
    lottieRef.current?.goToAndPlay(0, true);
  }, []);

  // Watch for pathname changes (Next.js App Router).
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      play();
    }
  }, [pathname, play]);

  const handleComplete = useCallback(() => {
    if (lingerMs > 0) {
      setTimeout(() => setVisible(false), lingerMs);
    } else {
      setVisible(false);
    }
  }, [lingerMs]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={starBurstData}
        loop={false}
        autoplay
        onComplete={handleComplete}
        style={{ width: 400, height: 400 }}
      />
    </div>
  );
}
