// Pricing component
"use client";
import React, { useState } from 'react';
import { Button } from './Button';
import { Check, Minus } from 'lucide-react';

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-white border-t border-border-light">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-ink tracking-tight mb-6">Simple, transparent pricing</h2>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="relative inline-flex items-center bg-wash border border-border-light rounded-full p-1 cursor-pointer" onClick={() => setIsAnnual(!isAnnual)}>
              <div
                className={`absolute w-1/2 h-full top-0 left-0 bg-ink rounded-full transition-transform duration-300 ease-out transform scale-y-75 ${isAnnual ? 'translate-x-full' : 'translate-x-0'}`}
                style={{ top: '0.25rem', bottom: '0.25rem', height: 'calc(100% - 0.5rem)', width: 'calc(50% - 0.25rem)', left: '0.25rem' }}
              ></div>
              <span className={`relative z-10 px-6 py-2 text-sm font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-muted'}`}>
                Monthly
              </span>
              <span className={`relative z-10 px-6 py-2 text-sm font-medium transition-colors ${isAnnual ? 'text-white' : 'text-muted'}`}>
                Annual
              </span>
            </div>
            {isAnnual && (
              <span className="font-mono text-ember text-xs font-semibold bg-[#FFF2ED] px-2 py-1 rounded-full border border-[#FFD8C9]">
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">

          {/* Solo Tier */}
          <div className="rounded-xl border border-border-light p-6 md:p-8 bg-white flex flex-col hover:border-gray-300 transition-colors">
            <div className="mb-6">
              <h3 className="font-semibold text-ink mb-2">Solo</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-ink font-mono tracking-tighter">
                  {isAnnual ? '$0' : '$0'}
                </span>
                <span className="text-sm text-muted">/mo</span>
              </div>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-muted items-start">
                <Check size={16} className="text-ink shrink-0 mt-0.5" />
                <span>Up to 100 queued problems</span>
              </li>
              <li className="flex gap-3 text-sm text-muted items-start">
                <Check size={16} className="text-ink shrink-0 mt-0.5" />
                <span>Standard FRFS algorithm</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-300 items-start">
                <Minus size={16} className="shrink-0 mt-0.5" />
                <span>Code-Editor access</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-300 items-start">
                <Minus size={16} className="shrink-0 mt-0.5" />
                <span>Custom interval tuning</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full">Get Started</Button>
          </div>

          {/* Engineer Tier (Featured) */}
          <div className="rounded-xl border-gray-900 ring-1 ring-gray-900 p-6 md:p-8 bg-white flex flex-col relative">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
              <span className="bg-ink text-white text-xs font-mono px-3 py-1 rounded-full">Most Popular</span>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-ink mb-2">Engineer</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-ink font-mono tracking-tighter">
                  {isAnnual ? '$8' : '$10'}
                </span>
                <span className="text-sm text-muted">/mo</span>
              </div>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-muted items-start">
                <Check size={16} className="text-ink shrink-0 mt-0.5" />
                <span className="font-medium text-ink">Unlimited queued problems</span>
              </li>
              <li className="flex gap-3 text-sm text-muted items-start">
                <Check size={16} className="text-ink shrink-0 mt-0.5" />
                <span>Advanced FRFS tuning</span>
              </li>
              <li className="flex gap-3 text-sm text-muted items-start">
                <Check size={16} className="text-ink shrink-0 mt-0.5" />
                <span>Code-Editor access</span>
              </li>
              <li className="flex gap-3 text-sm text-muted items-start">
                <Check size={16} className="text-ink shrink-0 mt-0.5" />
                <span>Retention analytics dashboard</span>
              </li>
            </ul>
            <Button variant="primary" className="w-full">Start 14-day Trial</Button>
          </div>

        </div>
      </div>
    </section>
  );
};
