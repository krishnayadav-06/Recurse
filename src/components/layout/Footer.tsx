import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white rounded-t-[4rem] pt-24 pb-12 px-12 mt-12 overflow-hidden relative">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-16">
        <div className="max-w-xs">
          <h2 className="font-sans font-bold text-3xl mb-4 tracking-tight">Recurse</h2>
          <p className="font-mono text-white/50 text-sm leading-relaxed">Systematic mastery of algorithmic patterns. Built with brutal precision.</p>
        </div>
        <div className="flex gap-16 font-mono text-sm">
          <div className="flex flex-col gap-4 text-white/60">
            <a href="#" className="hover:text-accent transition-colors">Documentation</a>
            <a href="#" className="hover:text-accent transition-colors">Manifesto</a>
            <a href="#" className="hover:text-accent transition-colors">Algorithm</a>
          </div>
          <div className="flex flex-col gap-4 text-white/60">
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t border-white/10 mt-20 pt-8 flex justify-between items-center flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3 font-mono text-xs text-white/50 bg-white/5 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#00ff00] animate-pulse"></div>
          SYSTEM OPERATIONAL
        </div>
        <div className="font-mono text-xs text-white/40 uppercase tracking-widest">
            2026 RECURSE SYSTEM
        </div>
      </div>
    </footer>
  );
};
