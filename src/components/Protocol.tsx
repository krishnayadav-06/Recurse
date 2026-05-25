"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Protocol = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.protocol-card');
      
      cards.forEach((card, index) => {
        if (index < cards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: "top 5%",
            endTrigger: cards[index + 1],
            end: "top 5%",
            pin: true,
            pinSpacing: false,
            animation: gsap.to(card, {
              scale: 0.9,
              opacity: 0.5,
              filter: 'blur(20px)',
              ease: "none"
            }),
            scrub: true
          });
        }
      });

      // Card 1: Rotating Geometric
      gsap.to('.svg-rotate', {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: 'linear',
        transformOrigin: "50% 50%"
      });

      // Card 2: Scanning Laser
      gsap.fromTo('.svg-scan',
        { y: 0 },
        { y: 300, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }
      );

      // Card 3: EKG Waveform
      const pulsePath = document.querySelector('.svg-pulse') as SVGPathElement | null;
      if (pulsePath) {
        const length = pulsePath.getTotalLength();
        gsap.set(pulsePath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(pulsePath, {
          strokeDashoffset: 0,
          duration: 2,
          repeat: -1,
          ease: 'power1.inOut',
          yoyo: true
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" ref={containerRef} className="w-full bg-white relative py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Step 1 */}
        <div className="protocol-card min-h-[90vh] flex items-center justify-center mb-12">
          <div className="w-full bg-white border border-border-light rounded-xl shadow-2xl shadow-gray-200/50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 md:p-16 lg:p-24">
              <div>
                <span className="text-xs font-mono text-gray-400 font-semibold tracking-wider">STEP 01</span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight mt-4">Add problems to your queue</h3>
                <p className="text-base text-muted mt-4 max-w-sm leading-relaxed">
                  Whenever you solve a problem on LeetCode, log it in Recurse. We store the problem, difficulty, and your initial mastery level.
                </p>
              </div>
              <div className="bg-wash rounded-xl h-64 md:h-80 flex items-center justify-center relative overflow-hidden border border-border-light/50">
                <svg width="200" height="200" viewBox="0 0 200 200" className="svg-rotate text-border-light drop-shadow-md">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                  <polygon points="100,20 115,40 85,40" fill="none" stroke="currentColor" strokeWidth="2" />
                  <polygon points="100,180 115,160 85,160" fill="none" stroke="currentColor" strokeWidth="2" />
                  <polygon points="20,100 40,85 40,115" fill="none" stroke="currentColor" strokeWidth="2" />
                  <polygon points="180,100 160,85 160,115" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <div className="absolute w-12 h-12 bg-white border border-border-light rounded-full shadow-sm flex items-center justify-center z-10">
                  <div className="w-4 h-4 bg-signal rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="protocol-card min-h-[90vh] flex items-center justify-center mb-12">
          <div className="w-full bg-white border border-border-light rounded-xl shadow-2xl shadow-gray-200/50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 md:p-16 lg:p-24">
              <div>
                <span className="text-xs font-mono text-gray-400 font-semibold tracking-wider">STEP 02</span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight mt-4">Review on schedule</h3>
                <p className="text-base text-muted mt-4 max-w-sm leading-relaxed">
                  Recurse tells you what to review today. The SM-2 algorithm ensures you only practice the problems you're about to forget.
                </p>
              </div>
              <div className="bg-wash rounded-xl h-64 md:h-80 flex items-center justify-center relative overflow-hidden border border-border-light/50">
                <div className="absolute inset-0 p-8 grid grid-cols-6 grid-rows-6 gap-4">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className="bg-white border border-border-light rounded-sm shadow-sm w-full h-full flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${i % 7 === 0 ? 'bg-signal' : 'bg-gray-200'}`}></div>
                    </div>
                  ))}
                </div>
                <div className="svg-scan absolute top-0 left-0 w-full h-1 bg-signal/50 shadow-[0_0_15px_rgba(37,99,235,0.8)] z-10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="protocol-card min-h-[90vh] flex items-center justify-center">
          <div className="w-full bg-white border border-border-light rounded-xl shadow-2xl shadow-gray-200/50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 md:p-16 lg:p-24">
              <div>
                <span className="text-xs font-mono text-gray-400 font-semibold tracking-wider">STEP 03</span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight mt-4">Track retention over time</h3>
                <p className="text-base text-muted mt-4 max-w-sm leading-relaxed">
                  Watch your intervals grow from days to months. Problems you once struggled with become permanent knowledge.
                </p>
              </div>
              <div className="bg-wash rounded-xl h-64 md:h-80 flex items-center justify-center relative overflow-hidden border border-border-light/50">
                <svg width="300" height="150" viewBox="0 0 300 150" className="overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="120" x2="300" y2="120" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="0" y1="90" x2="300" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="30" x2="300" y2="30" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Waveform */}
                  <path 
                    className="svg-pulse"
                    d="M 0 120 C 30 120, 40 100, 50 80 C 60 60, 70 30, 90 30 C 110 30, 120 70, 140 70 C 160 70, 170 50, 190 40 C 210 30, 230 40, 250 20 C 270 0, 290 10, 300 10" 
                    fill="none" 
                    stroke="#2563EB" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  <circle cx="50" cy="80" r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                  <circle cx="90" cy="30" r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                  <circle cx="140" cy="70" r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                  <circle cx="190" cy="40" r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                  <circle cx="250" cy="20" r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
