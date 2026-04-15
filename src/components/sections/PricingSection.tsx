import React from 'react';
import { Check, Crosshair } from 'lucide-react';

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-32 px-8 border-t border-dark/10 mt-[100vh]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="font-sans font-bold uppercase text-5xl md:text-6xl tracking-tight">Adopt the System</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="p-8 rounded-[3rem] border border-dark/10 brutal-shadow relative bg-white h-full flex flex-col justify-between">
            <div>
              <h3 className="font-mono tracking-wide text-dark/70 mb-2 font-bold">Essential</h3>
              <div className="font-serif italic text-6xl mb-6">Free</div>
              <ul className="gap-4 flex flex-col mb-12 font-mono text-sm text-dark/80">
                <li className="flex items-center gap-3"><Check size={16} className="text-accent" /> Base patterns library</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-accent" /> Daily practice limits</li>
              </ul>
            </div>
            <button className="w-full py-4 rounded-full border border-dark font-sans font-bold magnetic-btn">
              <span className="relative z-10">Start Tracking</span>
            </button>
          </div>
          
          <div className="p-10 rounded-[3rem] bg-accent text-white scale-100 md:scale-105 brutal-shadow shadow-[8px_8px_0_0_#111] z-10 h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-white/20"><Crosshair size={120} /></div>
            <div className="relative z-10">
              <h3 className="font-mono tracking-wide mb-2 font-bold opacity-80">Performance</h3>
              <div className="font-serif italic text-6xl mb-6">$12<span className="text-xl font-sans not-italic font-normal opacity-70">/mo</span></div>
              <ul className="gap-4 flex flex-col mb-12 font-mono text-sm">
                <li className="flex items-center gap-3"><Check size={16} /> Advanced SM-2 telemetry</li>
                <li className="flex items-center gap-3"><Check size={16} /> Unlimited recall loops</li>
                <li className="flex items-center gap-3"><Check size={16} /> Data export & analytics</li>
              </ul>
            </div>
            <button className="w-full py-4 rounded-full bg-white text-dark font-sans font-bold magnetic-btn">
              <span className="relative z-10">Upgrade Signal</span>
            </button>
          </div>

          <div className="p-8 rounded-[3rem] border border-dark/10 brutal-shadow relative bg-white h-full flex flex-col justify-between">
            <div>
              <h3 className="font-mono tracking-wide text-dark/70 mb-2 font-bold">Enterprise</h3>
              <div className="font-serif italic text-6xl mb-6">$49<span className="text-xl font-sans not-italic font-normal opacity-70">/mo</span></div>
              <ul className="gap-4 flex flex-col mb-12 font-mono text-sm text-dark/80">
                <li className="flex items-center gap-3"><Check size={16} className="text-accent" /> Institutional access</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-accent" /> Interview simulations</li>
              </ul>
            </div>
            <button className="w-full py-4 rounded-full border border-dark font-sans font-bold magnetic-btn">
              <span className="relative z-10">Contact Matrix</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
