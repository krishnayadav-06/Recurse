"use client";
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function GSAPRefresh() {
  useEffect(() => {
    if (typeof window === "undefined" || !("ResizeObserver" in window)) return;

    let debounceTimer: NodeJS.Timeout;

    // Create a ResizeObserver on the document body to catch any layout shifts
    // (such as stylesheet loading, font swapping, or React rendering/hydration)
    const observer = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log("📏 GSAPRefresh: Layout height change detected. Refreshing ScrollTrigger.");
        ScrollTrigger.refresh();
      }, 150); // Debounce by 150ms to prevent thrashing
    });

    observer.observe(document.body);

    // Also refresh on window load and font loading completions
    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', handleLoad);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('load', handleLoad);
      clearTimeout(debounceTimer);
    };
  }, []);

  return null;
}
