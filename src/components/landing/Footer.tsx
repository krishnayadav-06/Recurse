import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="relative bg-wash border-t border-border-light overflow-hidden pt-16 md:pt-32 min-h-[80vh] flex flex-col justify-between">

      {/* Top Grid Area */}
      <div className="w-full px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4 w-full">

          {/* Col 1 */}
          <div className="flex flex-col text-sm text-ink font-medium gap-1">
            <span>Recurse</span>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col text-sm font-medium gap-1.5">
            <a href="#features" className="text-ink hover:text-muted transition-colors w-fit">Features</a>
            <a href="#protocol" className="text-ink hover:text-muted transition-colors w-fit">Protocol</a>
            <a href="#pricing" className="text-ink hover:text-muted transition-colors w-fit">Pricing</a>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col text-sm font-medium gap-1.5">
            <a href="https://github.com/krishnayadav-06/_Recurse" target="_blank" rel="noopener noreferrer" className="text-ink hover:text-muted transition-colors w-fit">GitHub</a>
            <a href="https://www.linkedin.com/in/kris-yadav/" target="_blank" rel="noopener noreferrer" className="text-ink hover:text-muted transition-colors w-fit">LinkedIn</a>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col text-sm font-medium gap-1.5">
            <span className="text-muted">Contact</span>
            <a href="mailto:hello@recurse.com" className="text-ink hover:text-muted transition-colors w-fit">hello@recurse.com</a>
          </div>

        </div>
      </div>

      {/* Bottom Area: Legal Row & Giant Text */}
      <div className="w-full relative z-10 mt-32">
        {/* Legal / Copyright Row */}
        <div className="px-6 md:px-12 lg:px-24 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4 w-full items-end text-sm font-medium text-ink pb-8">
          <span>©{new Date().getFullYear()}</span>
          <div className="flex gap-8 md:gap-16 md:col-span-2">
            <Link href="/privacy" className="hover:text-muted transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-muted transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-muted transition-colors hidden sm:block">Cookies</Link>
          </div>
          <span className="hidden md:block text-muted">Practice less, remember <span className="underline underline-offset-4">more.</span></span>
        </div>

        {/* Massive Solid Typography */}
        <div className="relative w-full flex justify-center overflow-hidden select-none pointer-events-none">
          <h1 className="font-bold text-[28vw] leading-[0.75] tracking-tighter text-ink translate-y-[28%]">
            recurse
          </h1>
        </div>
      </div>
    </footer>
  );
};
