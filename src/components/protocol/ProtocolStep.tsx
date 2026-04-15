import React from 'react';
import { ProtocolStepProps } from '../../types';

export const ProtocolStep: React.FC<ProtocolStepProps> = ({ num, title, desc }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      <div className="max-w-4xl text-center relative z-10">
        <div className="font-mono text-xl md:text-3xl text-accent mb-6">STEP // {num}</div>
        <h2 className="font-sans font-bold text-6xl md:text-8xl mb-8 uppercase tracking-tighter text-dark">{title}</h2>
        <p className="font-mono text-dark/60 text-xl max-w-2xl mx-auto leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};
