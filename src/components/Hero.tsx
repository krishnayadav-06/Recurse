"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Button } from './Button';
import { CheckCircle2, Clock } from 'lucide-react';

interface QueueItemProps {
  title: string;
  tags: string[];
  difficulty: string;
  lastReviewed: string;
  nextInterval: string;
  dueNow: boolean;
  index: number;
  isMobileHidden?: boolean;
}

const QueueItem = ({ title, tags, difficulty, lastReviewed, nextInterval, dueNow, index, isMobileHidden }: QueueItemProps) => {
  return (
    <div className={`queue-row flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border-light last:border-b-0 ${dueNow ? 'bg-white' : 'bg-gray-50/50'} ${isMobileHidden ? 'hidden sm:flex' : 'flex'}`}>
      <div className="flex flex-col gap-1 mb-3 sm:mb-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink text-sm sm:text-base">{title}</span>
          <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
            difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
            {difficulty}
          </span>
        </div>
        <div className="flex gap-2 text-xs text-muted font-mono">
          {tags.map(tag => <span key={tag} className="bg-gray-100 px-1.5 py-0.5 rounded">{tag}</span>)}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-muted">Last: {lastReviewed}</span>
          <span className={`text-xs font-mono font-medium ${dueNow ? 'text-ember' : 'text-muted'}`}>
            {dueNow ? 'Due now' : `+${nextInterval}`}
          </span>
        </div>
        {dueNow ? (
          <Button className="w-24">Review</Button>
        ) : (
          <div className="w-24 flex items-center justify-center">
            <Clock size={16} className="text-gray-300" />
          </div>
        )}
      </div>
    </div>
  );
};

export const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Left column text stagger
      gsap.fromTo('.hero-text-element',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      );

      // Right column queue rows stagger
      gsap.fromTo('.queue-row',
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-[100dvh] pt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 md:px-12 lg:px-24 py-24 bg-white relative overflow-hidden">
      {/* Left Column */}
      <div className="flex flex-col items-start z-10">
        <div className="hero-text-element inline-flex items-center text-xs font-mono text-signal bg-blue-50 border border-blue-200 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-signal mr-2 animate-pulse"></span>
          FRFS Algorithm Active
        </div>

        <h1 className="hero-text-element font-extrabold text-5xl md:text-6xl lg:text-7xl text-ink tracking-tight leading-none mb-6">
          Practice less.<br />
          <span className="text-gray-900">Remember more.</span>
        </h1>

        <p className="hero-text-element text-lg md:text-xl text-gray-800 font-normal max-w-lg mb-8 leading-relaxed">
          Recurse schedules your LeetCode reviews using spaced repetition - so you stop re-solving the same problems from scratch.
        </p>

        <div className="hero-text-element flex flex-col sm:flex-row w-full sm:w-auto gap-4 mb-6">
          <Button variant="primary" className="py-3 px-6 text-base">Start your queue</Button>
          <Button variant="ghost" className="py-3 px-6 text-base border-gray-300">View methodology</Button>
        </div>

        <div className="hero-text-element text-sm text-gray-400 flex items-center gap-2">
          <CheckCircle2 size={16} /> Free for single users. No credit card required.
        </div>
      </div>

      {/* Right Column - Mockup */}
      <div className="relative z-10 w-full max-w-xl mx-auto lg:mx-0 lg:ml-auto perspective-1000">
        <div className="rounded-xl border border-border-light shadow-2xl shadow-gray-200/50 overflow-hidden bg-white flex flex-col transform md:-rotate-y-2 md:rotate-x-2">
          <div className="bg-wash px-4 py-3 border-b border-border-light flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-mono text-muted">recurse --queue today</div>
          </div>

          <div className="flex flex-col">
            <QueueItem
              title="Two Sum"
              tags={['Array', 'Hash Table']}
              difficulty="Easy"
              lastReviewed="12h ago"
              nextInterval="0d"
              dueNow={true}
              index={0}
            />
            <QueueItem
              title="LRU Cache"
              tags={['Design', 'Linked List']}
              difficulty="Medium"
              lastReviewed="2d ago"
              nextInterval="1d"
              dueNow={false}
              index={1}
            />
            <QueueItem
              title="Sliding Window Maximum"
              tags={['Array', 'Queue']}
              difficulty="Hard"
              lastReviewed="4d ago"
              nextInterval="3d"
              dueNow={false}
              index={2}
            />
            <QueueItem
              title="Merge Intervals"
              tags={['Array', 'Sorting']}
              difficulty="Medium"
              lastReviewed="7d ago"
              nextInterval="14d"
              dueNow={false}
              index={3}
              isMobileHidden={true}
            />
            <QueueItem
              title="Valid Anagram"
              tags={['String', 'Hash Table']}
              difficulty="Easy"
              lastReviewed="14d ago"
              nextInterval="30d"
              dueNow={false}
              index={4}
              isMobileHidden={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
