import React, { useEffect, useState } from 'react';

export const TelemetryTypewriter: React.FC = () => {
  const messages = [
    "INIT SM-2 ALGORITHM...",
    "CALCULATING E-FACTOR...",
    "INTERVAL: 4 DAYS SET.",
    "RECALL QUALITY: 4/5.",
    "SCHEDULING NEXT REVIEW."
  ];
  const [text, setText] = useState<string>('');
  const [msgIdx, setMsgIdx] = useState<number>(0);
  const [charIdx, setCharIdx] = useState<number>(0);

  useEffect(() => {
    if (charIdx < messages[msgIdx].length) {
      const timer = setTimeout(() => {
        setText(prev => prev + messages[msgIdx][charIdx]);
        setCharIdx(c => c + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setText('');
        setCharIdx(0);
        setMsgIdx((m) => (m + 1) % messages.length);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [charIdx, msgIdx, messages]);

  return (
    <div className="bg-dark text-[#00ff00] p-6 rounded-[2rem] h-[250px] border border-dark/20 relative drop-shadow-md">
       <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-white/50 text-xs font-mono tracking-widest">LIVE FEED</span>
       </div>
       <div className="font-mono text-sm leading-relaxed overflow-hidden">
          <span>{text}</span><span className="animate-pulse bg-[#00ff00] w-[8px] h-[14px] inline-block ml-1 align-middle" />
       </div>
    </div>
  );
};
