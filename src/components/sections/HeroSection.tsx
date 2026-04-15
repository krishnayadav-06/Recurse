import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { CodeEditor } from '../features/CodeEditor';

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-elem', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[100dvh] w-full flex items-center pt-32 pb-24 px-8 md:px-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542125387-c71274d94f0a?q=80&w=2000&auto=format&fit=crop" 
          alt="Neon Biotech Ambient" 
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity brightness-150"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/90 to-background/50"></div>
        <div className="absolute inset-0 bg-background/60"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 mt-12 md:mt-0">
        <div className="flex-1 text-dark">
          <h1 className="flex flex-col gap-2 md:gap-4 lg:gap-6">
             <span className="hero-elem font-sans font-bold text-5xl md:text-7xl lg:text-[80px] tracking-tight uppercase leading-[0.9]">Master the</span>
             <span className="hero-elem font-serif italic text-6xl md:text-[110px] lg:text-[130px] leading-[0.8] text-accent drop-shadow-[0_0_20px_rgba(230,59,46,0.2)]">Algorithm.</span>
          </h1>
          <p className="hero-elem font-mono text-dark/70 mt-12 max-w-lg text-sm md:text-base leading-relaxed hidden md:block">
            Spaced repetition designed for LeetCode problem solving. 
            Stop grinding endlessly. Start encoding patterns directly into long-term memory.
          </p>
          <a href="#pricing" className="hero-elem mt-12 bg-dark text-primary px-8 py-5 rounded-full font-sans font-bold text-lg magnetic-btn inline-block brutal-shadow" style={{boxShadow: "4px 4px 0px 0px #E63B2E"}}>
            <span className="relative z-10 flex items-center gap-2">
              Start Tracking <ArrowRight size={20} />
            </span>
          </a>
        </div>
        <div className="flex-1 hero-elem w-full flex justify-center lg:justify-end">
           <CodeEditor />
        </div>
      </div>
    </section>
  );
};
