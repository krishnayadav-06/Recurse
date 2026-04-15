import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Navbar: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { className: 'nav-scrolled', targets: navRef.current },
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav ref={navRef} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 rounded-[2rem] px-8 py-4 flex items-center justify-between w-[90%] max-w-4xl text-white mix-blend-difference nav-base">
      <div className="font-sans font-bold tracking-tight text-xl">Recurse</div>
      <div className="hidden md:flex gap-8 font-mono text-sm">
        <a href="#features" className="hover:-translate-y-[1px] transition-transform">Features</a>
        <a href="#protocol" className="hover:-translate-y-[1px] transition-transform">Protocol</a>
      </div>
      <a href="#pricing" className="bg-accent text-white px-5 py-2 rounded-full font-sans font-bold text-sm magnetic-btn">
        <span className="relative z-10">Start Tracking</span>
      </a>
    </nav>
  );
};
