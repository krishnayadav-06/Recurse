import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-wash border-t border-border-light text-ink">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <span className="font-semibold text-ink tracking-tight mb-2">Recurse</span>
            <p className="text-sm text-muted">Spaced repetition for LeetCode-style coding practice. Practice less, remember more.</p>
            <p className="text-xs text-gray-400 mt-4">© {new Date().getFullYear()} Recurse Inc.</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Product</span>
            <a href="#features" className="text-sm text-muted hover:text-ink transition-colors">Features</a>
            <a href="#protocol" className="text-sm text-muted hover:text-ink transition-colors">Protocol</a>
            <a href="#pricing" className="text-sm text-muted hover:text-ink transition-colors">Pricing</a>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">Changelog</a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Resources</span>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">Documentation</a>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">Code-Editor Reference</a>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">FRFS Deep Dive</a>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">Blog</a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink mb-1">Company</span>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">About</a>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">Careers</a>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">Twitter</a>
            <a href="#" className="text-sm text-muted hover:text-ink transition-colors">GitHub</a>
          </div>
        </div>

        <div className="border-t border-border-light mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
            <a href="#" className="text-xs text-gray-400 hover:text-ink transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-400 hover:text-ink transition-colors">Terms of Service</a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-3 h-3">
              <div className="absolute w-2 h-2 rounded-full bg-green-500 opacity-75 animate-ping"></div>
              <div className="relative w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-mono text-muted">All systems operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
