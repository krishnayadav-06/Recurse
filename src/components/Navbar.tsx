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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-xl border-border-light shadow-sm' : 'bg-transparent border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 h-14 flex items-center justify-between">
        <div className="font-semibold text-ink tracking-tight">Recurse</div>
        
        <nav className="hidden md:flex items-center gap-6">
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
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${mobileOpen ? 'max-h-64 opacity-100 bg-white border-b border-border-light shadow-md' : 'max-h-0 opacity-0'}`}>
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
