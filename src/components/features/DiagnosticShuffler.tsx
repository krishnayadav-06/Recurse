import React, { useEffect, useState } from 'react';

interface CardValues {
  id: number;
  title: string;
  desc: string;
}

export const DiagnosticShuffler: React.FC = () => {
  const [cards, setCards] = useState<CardValues[]>([
    { id: 1, title: 'Parse', desc: 'Identify core patterns.' },
    { id: 2, title: 'Encode', desc: 'Construct mental models.' },
    { id: 3, title: 'Recall', desc: 'Test without prompting.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newArr = [...prev];
        const last = newArr.pop();
        if(last) newArr.unshift(last);
        return newArr;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[250px] flex items-center justify-center [perspective:1000px]">
      {cards.map((card, i) => (
        <div 
          key={card.id}
          className="absolute w-[80%] bg-white border border-dark/10 p-6 rounded-[2rem] drop-shadow-md flex flex-col justify-between h-[180px]"
          style={{
            transform: `translateY(${i * 20 - 20}px) scale(${1 - i * 0.05})`,
            zIndex: 10 - i,
            opacity: 1 - i * 0.2,
            transition: 'all 800ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div className="font-mono text-xs text-accent tracking-widest">SEQ: {card.id}</div>
          <div>
            <div className="font-sans font-bold text-xl">{card.title}</div>
            <div className="font-mono text-xs text-dark/70 mt-2">{card.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
