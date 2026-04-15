import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Crosshair } from 'lucide-react';

export const CursorProtocolScheduler: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });
      
      tl.set('.cursor', { x: 10, y: 150, opacity: 0 })
        .to('.cursor', { x: 50, y: 70, opacity: 1, duration: 1, ease: 'power2.out' })
        .to('.cursor', { x: 140, y: 40, duration: 0.8, ease: 'power2.inOut' })
        .to('.cursor', { scale: 0.8, duration: 0.1 })
        .to('.day-2', { backgroundColor: '#E63B2E', color: '#fff', duration: 0.2 }, '<')
        .to('.cursor', { scale: 1, duration: 0.1 })
        .to('.cursor', { x: 230, y: 40, duration: 0.8, ease: 'power2.inOut', delay: 0.2 })
        .to('.cursor', { scale: 0.8, duration: 0.1 })
        .to('.day-4', { backgroundColor: '#E63B2E', color: '#fff', duration: 0.2 }, '<')
        .to('.cursor', { scale: 1, duration: 0.1 })
        .to('.cursor', { x: 300, y: 150, opacity: 0, duration: 1, delay: 0.5 })
        .to('.day-2, .day-4', { backgroundColor: 'transparent', color: '#111', duration: 0.5 });
        
    }, container);
    return () => ctx.revert();
  }, []);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div ref={container} className="relative bg-white border border-dark/10 p-6 rounded-[2rem] h-[250px] overflow-hidden drop-shadow-md flex flex-col justify-between pb-8">
      <div>
        <div className="font-sans font-bold text-xl mb-2">Weekly Loop</div>
        <div className="font-mono text-xs text-dark/60">Atomic knowledge building schedule.</div>
      </div>
      <div className="flex justify-between items-center px-2 relative z-10 w-[95%] mx-auto">
        {days.map((d, i) => (
          <div key={i} className={`day-${i} w-8 h-8 rounded-full border border-dark/10 flex items-center justify-center font-mono text-xs transition-colors`}>{d}</div>
        ))}
      </div>
      <Crosshair className="cursor absolute text-dark w-6 h-6 z-20 pointer-events-none" />
    </div>
  );
};
