import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProtocolStep } from '../protocol/ProtocolStep';

gsap.registerPlugin(ScrollTrigger);

export const ProtocolSection: React.FC = () => {
  const protocolRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');
      if (cards.length > 0) {
        ScrollTrigger.create({
          trigger: protocolRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1,
          animation: gsap.timeline()
            .to(cards[0] as Element, { scale: 0.9, opacity: 0.5, filter: "blur(20px)", ease: "none" }, 0)
            .from(cards[1] as Element, { yPercent: 100, ease: "none" }, 0)
            .to(cards[1] as Element, { scale: 0.9, opacity: 0.5, filter: "blur(20px)", ease: "none" }, 1)
            .from(cards[2] as Element, { yPercent: 100, ease: "none" }, 1)
        });
      }
    }, protocolRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" ref={protocolRef} className="relative h-[100vh] w-full bg-background overflow-hidden">
      <div className="protocol-card absolute z-[1] w-full h-full will-change-transform">
        <ProtocolStep num="1" title="Parse" desc="Identify and isolate the core algorithmic pattern in a problem." />
      </div>
      <div className="protocol-card absolute z-[2] w-full h-full will-change-transform">
        <ProtocolStep num="2" title="Encode" desc="Construct a mental model and file the optimal solution strategy." />
      </div>
      <div className="protocol-card absolute z-[3] w-full h-full will-change-transform">
        <ProtocolStep num="3" title="Retain" desc="Surface the concept at optimal intervals until intuition is permanent." />
      </div>
    </section>
  );
};
