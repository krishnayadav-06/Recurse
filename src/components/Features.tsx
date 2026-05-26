"use client";
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Copy, Calendar, BrainCircuit, Activity, Repeat, RefreshCcw, Layers, Zap, Clock, CheckCircle2, MousePointer2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const Features = () => {
  const containerRef = useRef<HTMLElement>(null);
  const metricRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [startTypewriter, setStartTypewriter] = useState(false);

  // Replay the draw-in animation every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(pathRef.current, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' });
      }
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Card 2: Typewriter loop (simulates up to 8 commands, then resets)
  useEffect(() => {
    if (!startTypewriter) return;

    let active = true;
    let timeoutId: any;

    const commands = [
      'recurse review --today',
      'recurse add "Two Sum" --difficulty easy',
      'recurse status',
      'recurse list',
      'recurse review "LRU Cache" --pass',
      'recurse schedule',
      'recurse stats',
      'recurse --help'
    ];

    let cmdIndex = 0;
    let charIndex = 0;
    let currentText = '';

    const typeChar = () => {
      if (!active || !codeRef.current) return;

      const currentCmd = commands[cmdIndex];
      if (charIndex < currentCmd.length) {
        currentText += currentCmd.charAt(charIndex);
        codeRef.current.innerHTML = currentText;
        charIndex++;
        timeoutId = setTimeout(typeChar, 100);
      } else {
        cmdIndex++;
        if (cmdIndex < 8) {
          timeoutId = setTimeout(() => {
            if (!active || !codeRef.current) return;
            currentText += '<br /><span class="text-blue-400">$</span> ';
            codeRef.current.innerHTML = currentText;
            charIndex = 0;
            typeChar();
          }, 5000);
        } else {
          timeoutId = setTimeout(() => {
            if (!active || !codeRef.current) return;
            currentText = '';
            codeRef.current.innerHTML = '';
            cmdIndex = 0;
            charIndex = 0;
            typeChar();
          }, 8000);
        }
      }
    };

    typeChar();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [startTypewriter]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Container stagger
      gsap.fromTo('.feature-card',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          }
        }
      );

      // Card 1: Retention Metric
      gsap.to(metricRef.current, {
        innerHTML: 92,
        duration: 2,
        ease: 'power3.out',
        snap: { innerHTML: 1 },
        scrollTrigger: {
          trigger: metricRef.current,
          start: 'top 85%'
        }
      });

      // Card 1: SVG Path animation
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: pathRef.current,
            start: 'top 85%'
          }
        });
      }

      // Card 2: ScrollTrigger to start typewriter
      if (codeRef.current) {
        ScrollTrigger.create({
          trigger: codeRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            setStartTypewriter(true);
          }
        });
      }

      // Card 3: Mosaic
      gsap.fromTo('.mosaic-tile',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: mosaicRef.current,
            start: 'top 85%'
          }
        }
      );

      // Card 3: Cursor Animation
      if (cursorRef.current && mosaicRef.current) {
        const tiles = mosaicRef.current.querySelectorAll('.mosaic-tile');
        const tl = gsap.timeline({ repeat: -1 });

        tl.set(cursorRef.current, { x: 50, y: 150, opacity: 0 })
          .to(cursorRef.current, { opacity: 1, duration: 0.3 })
          .to(cursorRef.current, {
            x: -40, y: -20, duration: 1.2, ease: "power2.inOut",
            onComplete: () => {
              if (tiles[0]) {
                tiles[0].classList.add('border-ember', 'scale-[1.05]', 'bg-white');
                tiles[0].classList.remove('border-border-light', 'bg-wash');
              }
            }
          })
          .to({}, { duration: 0.8 })
          .to(cursorRef.current, {
            x: 60, y: 30, duration: 1.2, ease: "power2.inOut",
            onStart: () => {
              if (tiles[0]) {
                tiles[0].classList.remove('border-ember', 'scale-[1.05]', 'bg-white');
                tiles[0].classList.add('border-border-light', 'bg-wash');
              }
            },
            onComplete: () => {
              if (tiles[5]) {
                tiles[5].classList.add('border-ember', 'scale-[1.05]', 'bg-white');
                tiles[5].classList.remove('border-border-light', 'bg-wash');
              }
            }
          })
          .to({}, { duration: 0.8 })
          .to(cursorRef.current, {
            x: 50, y: 150, opacity: 0, duration: 1, ease: "power2.inOut",
            onStart: () => {
              if (tiles[5]) {
                tiles[5].classList.remove('border-ember', 'scale-[1.05]', 'bg-white');
                tiles[5].classList.add('border-border-light', 'bg-wash');
              }
            }
          });
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('recurse review --today');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mosaicData = [
    { label: '1d', icon: <Zap size={16} /> },
    { label: '3d', icon: <RefreshCcw size={16} /> },
    { label: '7d', icon: <Calendar size={16} /> },
    { label: '14d', icon: <Layers size={16} /> },
    { label: '30d', icon: <BrainCircuit size={16} /> },
    { label: '2mo', icon: <Repeat size={16} /> },
    { label: '6mo', icon: <Activity size={16} /> },
    { label: '1y', icon: <Clock size={16} /> },
  ];

  return (
    <section id="features" ref={containerRef} className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card 1: Retention Metric */}
        <div className="feature-card border border-border-light rounded-xl p-6 bg-white hover:border-gray-400 transition-colors duration-150 shadow-sm flex flex-col">
          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span ref={metricRef} className="text-5xl font-extrabold text-ink font-mono tracking-tighter">0</span>
              <span className="text-5xl font-extrabold text-ink font-mono">%</span>
            </div>
            <div className="text-sm text-muted mt-2">Long-term retention rate</div>
          </div>
          <div className="mt-auto pt-4 relative w-full h-24 flex items-end">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
              <path
                ref={pathRef}
                d="M0 50 C20 40, 40 20, 60 10 S80 5, 100 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-signal"
              />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="50" stroke="#E5E7EB" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Card 2: Command Snippet */}
        <div className="feature-card border border-border-light rounded-xl p-6 bg-white hover:border-gray-400 transition-colors duration-150 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-ink text-lg">Editor Integration</h3>
            <p className="text-sm text-muted mt-1">Review your queue directly in Editor without breaking your flow.</p>
          </div>
          <div className="mt-auto bg-gray-950 rounded-lg p-4 relative overflow-hidden group">
            <div className="absolute top-3 right-3">
              <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors" aria-label="Copy code">
                {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="font-mono text-sm">
              <span className="text-blue-400">$</span>{' '}
              <span ref={codeRef} className="text-green-400"></span>
              <span className="w-2 h-4 bg-gray-400 inline-block align-middle ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Card 3: Interval Mosaic */}
        <div className="feature-card border border-border-light rounded-xl p-6 bg-white hover:border-gray-400 transition-colors duration-150 shadow-sm flex flex-col md:col-span-2 lg:col-span-1">
          <div className="mb-6">
            <h3 className="font-bold text-ink text-lg">Adaptive Spacing</h3>
            <p className="text-sm text-muted mt-1">FRFS algorithm calculates the exact moment you're about to forget.</p>
          </div>
          <div ref={mosaicRef} className="mt-auto grid grid-cols-4 gap-2 relative">
            {mosaicData.map((item, idx) => (
              <div key={idx} className="mosaic-tile rounded-lg border border-border-light p-3 flex flex-col items-center justify-center gap-2 hover:border-ember hover:scale-[1.05] hover:-translate-y-[1px] transition-all duration-200 cursor-default bg-wash hover:bg-white group-hover:border-ember">
                <div className="text-muted group-hover:text-ember transition-colors">{item.icon}</div>
                <div className="text-xs font-mono text-muted">{item.label}</div>
              </div>
            ))}
            <div ref={cursorRef} className="absolute z-20 pointer-events-none drop-shadow-md text-ink w-6 h-6" style={{ top: '50%', left: '50%', transform: 'translate(0, 0)' }}>
              <MousePointer2 size={24} fill="currentColor" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
