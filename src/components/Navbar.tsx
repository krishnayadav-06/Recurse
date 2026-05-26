"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const positionClasses = scrolled 
    ? 'top-2 w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-7xl' 
    : 'top-0 w-full';

  const backgroundClasses = scrolled 
    ? 'bg-white/80 backdrop-blur-xl' 
    : mobileOpen 
      ? 'bg-white/95 backdrop-blur-xl' 
      : 'bg-transparent';

  const borderClasses = scrolled 
    ? 'border border-border-light/80' 
    : mobileOpen 
      ? 'border-b border-border-light' 
      : 'border-b border-transparent';

  const shadowClasses = scrolled 
    ? 'shadow-md' 
    : mobileOpen 
      ? 'shadow-sm' 
      : 'shadow-none';

  const roundedClasses = scrolled 
    ? 'rounded-2xl' 
    : 'rounded-none';

  return (
    <header className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${positionClasses} ${backgroundClasses} ${borderClasses} ${shadowClasses} ${roundedClasses}`}>
      <div className={`relative max-w-7xl mx-auto h-14 flex items-center justify-between transition-all duration-500 ease-in-out ${
        scrolled ? 'px-6 md:px-8 lg:px-10' : 'px-6 md:px-12 lg:px-24'
      }`}>
        <div className="font-semibold text-ink tracking-tight">Recurse</div>
        
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <a href="#features" className="text-sm text-muted hover:text-ink transition-colors hover:-translate-y-[1px] inline-block">Features</a>
          <a href="#protocol" className="text-sm text-muted hover:text-ink transition-colors hover:-translate-y-[1px] inline-block">Protocol</a>
          <a href="#pricing" className="text-sm text-muted hover:text-ink transition-colors hover:-translate-y-[1px] inline-block">Pricing</a>
        </nav>
        
        <div className="hidden md:block">
          <Button>Start your queue</Button>
        </div>

        <button className="md:hidden text-ink" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-4 flex flex-col gap-4">
          <a href="#features" className="text-sm text-muted" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#protocol" className="text-sm text-muted" onClick={() => setMobileOpen(false)}>Protocol</a>
          <a href="#pricing" className="text-sm text-muted" onClick={() => setMobileOpen(false)}>Pricing</a>
          <Button className="w-full">Start your queue</Button>
        </div>
      </div>
    </header>
  );
};
