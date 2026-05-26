"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Philosophy = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to('.philosophy-word', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        }
      });

      gsap.fromTo('.stat-item',
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.4,
          scrollTrigger: {
            trigger: '.stats-row',
            start: 'top 85%'
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const renderWords = (text, highlightWord = '') => {
    return text.split(' ').map((word, i) => {
      // Remove punctuation for highlight check
      const cleanWord = word.replace(/[.,]/g, '');
      const isHighlight = highlightWord && cleanWord === highlightWord;
      return (
        <span
          key={i}
          className={`inline-block mr-2 philosophy-word opacity-0 translate-y-5 ${isHighlight ? 'text-ember' : ''}`}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <section ref={containerRef} className="bg-gray-50 border-y border-gray-200 w-full relative overflow-hidden">
      {/* SVG Texture */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#6B7280" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto text-center py-32 px-6 relative z-10">
        <p className="text-base text-gray-500 font-medium mb-6">
          {renderWords("Most practice tools show you problems.")}
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {renderWords("Recurse shows you when.", "when.")}
        </h2>

        {/* Stats Row */}
        <div className="stats-row border-t border-gray-200 mt-24 pt-12 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24">
          <div className="stat-item flex flex-col items-center">
            <span className="font-mono text-3xl font-bold text-gray-900 mb-2">92%</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg. Retention</span>
          </div>
          <div className="stat-item flex flex-col items-center">
            <span className="font-mono text-3xl font-bold text-gray-900 mb-2">15m</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Daily Queue Time</span>
          </div>
          <div className="stat-item flex flex-col items-center">
            <span className="font-mono text-3xl font-bold text-gray-900 mb-2">4.2d</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Average Interval</span>
          </div>
        </div>
      </div>
    </section>
  );
};
