"use client";
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Copy, Calendar, BrainCircuit, Activity, Repeat, RefreshCcw, Layers, Zap, Clock, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const Features = () => {
  const containerRef = useRef<HTMLElement>(null);
  const metricRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Container stagger
      gsap.fromTo('.feature-card',
        { y: 30, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          }
        }
      );

      // Card 1: Retention Metric
      gsap.to(metricRef.current, {
        innerHTML: 92,
        duration: 2,
        ease: 'power3.out',
        snap: { innerHTML: 1 },
        scrollTrigger: {
          trigger: metricRef.current,
          start: 'top 85%'
        }
      });

      // Card 1: SVG Path animation
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: pathRef.current,
            start: 'top 85%'
          }
        });
      }

      // Card 2: Typewriter
      const codeText = 'recurse review --today';
      if (codeRef.current) {
        codeRef.current.innerHTML = '';
        
        ScrollTrigger.create({
          trigger: codeRef.current,
          start: 'top 85%',
          onEnter: () => {
            let i = 0;
            const interval = setInterval(() => {
              if (codeRef.current && i < codeText.length) {
                codeRef.current.innerHTML += codeText.charAt(i);
                i++;
              } else {
                clearInterval(interval);
              }
            }, 60);
          }
        });
      }

      // Card 3: Mosaic
      gsap.fromTo('.mosaic-tile',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: mosaicRef.current,
            start: 'top 85%'
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('recurse review --today');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mosaicData = [
    { label: '1d', icon: <Zap size={16} /> },
    { label: '3d', icon: <RefreshCcw size={16} /> },
    { label: '7d', icon: <Calendar size={16} /> },
    { label: '14d', icon: <Layers size={16} /> },
    { label: '30d', icon: <BrainCircuit size={16} /> },
    { label: '2mo', icon: <Repeat size={16} /> },
    { label: '6mo', icon: <Activity size={16} /> },
    { label: '1y', icon: <Clock size={16} /> },
  ];

  return (
    <section id="features" ref={containerRef} className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Retention Metric */}
        <div className="feature-card border border-border-light rounded-xl p-6 bg-white hover:border-gray-400 transition-colors duration-150 shadow-sm flex flex-col">
          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span ref={metricRef} className="text-5xl font-extrabold text-ink font-mono tracking-tighter">0</span>
              <span className="text-5xl font-extrabold text-ink font-mono">%</span>
            </div>
            <div className="text-sm text-muted mt-2">Long-term retention rate</div>
          </div>
          <div className="mt-auto pt-4 relative w-full h-24 flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
              <path 
                ref={pathRef}
                d="M0 50 C20 40, 40 20, 60 10 S80 5, 100 2" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-signal"
                strokeLinecap="round"
              />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="50" stroke="#E5E7EB" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Card 2: Command Snippet */}
        <div className="feature-card border border-border-light rounded-xl p-6 bg-white hover:border-gray-400 transition-colors duration-150 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-ink text-lg">CLI Integration</h3>
            <p className="text-sm text-muted mt-1">Review your queue directly from the terminal without breaking your flow.</p>
          </div>
          <div className="mt-auto bg-gray-950 rounded-lg p-4 relative overflow-hidden group">
            <div className="absolute top-3 right-3">
              <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors" aria-label="Copy code">
                {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="font-mono text-sm">
              <span className="text-blue-400">$</span>{' '}
              <span ref={codeRef} className="text-green-400"></span>
              <span className="w-2 h-4 bg-gray-400 inline-block align-middle ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Card 3: Interval Mosaic */}
        <div className="feature-card border border-border-light rounded-xl p-6 bg-white hover:border-gray-400 transition-colors duration-150 shadow-sm flex flex-col md:col-span-2 lg:col-span-1">
          <div className="mb-6">
            <h3 className="font-bold text-ink text-lg">Adaptive Spacing</h3>
            <p className="text-sm text-muted mt-1">SM-2 algorithm calculates the exact moment you're about to forget.</p>
          </div>
          <div ref={mosaicRef} className="mt-auto grid grid-cols-4 gap-2">
            {mosaicData.map((item, idx) => (
              <div key={idx} className="mosaic-tile rounded-lg border border-border-light p-3 flex flex-col items-center justify-center gap-2 hover:border-signal hover:scale-[1.05] hover:-translate-y-[1px] transition-all duration-200 cursor-default bg-wash hover:bg-white group-hover:border-signal">
                <div className="text-muted group-hover:text-signal transition-colors">{item.icon}</div>
                <div className="text-xs font-mono text-muted">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
