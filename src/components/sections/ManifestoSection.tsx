import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ManifestoSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const manifestoLines = gsap.utils.toArray('.manifesto-line');
      manifestoLines.forEach((line) => {
        gsap.from(line as Element, {
          scrollTrigger: {
            trigger: line as Element,
            start: 'top 80%',
          },
          y: 30,
          opacity: 0,
          duration: 1.5,
          ease: 'power3.out'
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-48 px-8 bg-dark text-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop" alt="Texture" className="w-full h-full object-cover grayscale" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-12">
        <h2 className="manifesto-line font-sans uppercase tracking-widest text-primary/60 text-lg md:text-2xl">
          Most platforms focus on: <span className="text-white font-bold ml-2">endless grinding.</span>
        </h2>
        <h2 className="manifesto-line font-serif italic text-5xl md:text-8xl leading-tight">
          We focus on: <span className="text-accent">precision retention.</span>
        </h2>
      </div>
    </section>
  );
};
