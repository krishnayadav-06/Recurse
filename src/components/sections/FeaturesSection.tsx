import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DiagnosticShuffler } from '../features/DiagnosticShuffler';
import { TelemetryTypewriter } from '../features/TelemetryTypewriter';
import { CursorProtocolScheduler } from '../features/CursorProtocolScheduler';

gsap.registerPlugin(ScrollTrigger);

export const FeaturesSection: React.FC = () => {
  const container = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: container.current,
          start: 'top 70%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power2.out'
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} id="features" className="py-32 px-8 w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="feature-card flex flex-col justify-end">
          <DiagnosticShuffler />
          <div className="mt-8">
            <h3 className="font-sans font-bold text-2xl uppercase tracking-tight">Active Recall</h3>
            <p className="font-mono text-dark/70 text-sm mt-3 leading-relaxed">Constantly test memory retrieval without training wheels. Build robust neural pathways.</p>
          </div>
        </div>
        
        <div className="feature-card flex flex-col justify-end">
          <TelemetryTypewriter />
          <div className="mt-8">
            <h3 className="font-sans font-bold text-2xl uppercase tracking-tight">SM-2 Algorithm</h3>
            <p className="font-mono text-dark/70 text-sm mt-3 leading-relaxed">High memory retention enforced by scientifically backed spaced repetition telemetry.</p>
          </div>
        </div>
        
        <div className="feature-card flex flex-col justify-end">
          <CursorProtocolScheduler />
          <div className="mt-8">
            <h3 className="font-sans font-bold text-2xl uppercase tracking-tight">Atomic Linking</h3>
            <p className="font-mono text-dark/70 text-sm mt-3 leading-relaxed">Build strictly upon what you have already mastered. Compound your problem solving intuition week over week.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
