'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const ticker = [
  '// INTEGRITY',
  '// ACCOUNTABILITY',
  '// OPERATIONAL EXCELLENCE',
  '// DISCIPLINE',
  '// ORDER',
  '// DUTY',
  '// INTEGRITY',
  '// ACCOUNTABILITY',
  '// OPERATIONAL EXCELLENCE',
  '// TRANSPARENCY',
  '// DISCIPLINE',
  '// DEDICATION',
  '// ORDER',
  '// DUTY',
];

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] } },
});

export default function Hero() {
  const canvasRef = useRef(null);

  // Animated particle grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let w = (canvas.width  = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // Dots grid
    const cols = Math.ceil(w / 60);
    const rows = Math.ceil(h / 60);
    const dots = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        dots.push({
          x:   c * 60,
          y:   r * 60,
          base: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;

      // Lines
      ctx.strokeStyle = 'rgba(201,162,40,0.04)';
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * 60, 0);
        ctx.lineTo(c * 60, h);
        ctx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * 60);
        ctx.lineTo(w, r * 60);
        ctx.stroke();
      }

      // Dots
      for (const d of dots) {
        const alpha = 0.08 + Math.sin(t * d.speed * 60 + d.phase) * 0.06;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,40,${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const scrollTo = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden scanline-parent bg-boi-dark">
      {/* ── Canvas background ── */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* ── Radial glow ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(201,162,40,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-boi-bg to-transparent pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 flex flex-col items-center text-center">
        {/* Title */}
        <motion.h1
          variants={fadeUp(0.2)}
          initial="hidden"
          animate="visible"
          className="font-serif font-bold text-5xl md:text-7xl tracking-wide text-white text-glow-gold leading-tight mb-4"
        >
          Bureau of<br />
          <span className="text-boi-gold">Operational</span> Integrity
        </motion.h1>

        {/* Mono divider */}
        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate="visible"
          className="font-mono text-xs tracking-[0.28em] text-boi-muted uppercase mb-6"
        >
          B . O . I . &nbsp;,&nbsp; ESTABLISHED MMXXIV
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={fadeUp(0.35)}
          initial="hidden"
          animate="visible"
          className="text-boi-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
        >
          Defending order. Ensuring trust. A <span className="text-white">teaching</span> department
          built to make officers better, not to punish them.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp(0.45)}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => scrollTo('#apply')}
            className="clip-corner bg-boi-gold text-boi-bg font-mono text-sm font-bold tracking-widest px-8 py-3.5 uppercase hover:bg-boi-gold-lt transition-colors duration-200 flex items-center gap-2 group"
          >
            Submit Application
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => scrollTo('#about')}
            className="clip-corner border border-boi-gold/40 bg-transparent text-boi-gold font-mono text-sm tracking-widest px-8 py-3.5 uppercase hover:border-boi-gold hover:bg-boi-gold/10 transition-all duration-200"
          >
            Learn More
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeUp(0.55)}
          initial="hidden"
          animate="visible"
          className="mt-16 grid grid-cols-3 gap-8 md:gap-16 border-t border-boi-border pt-10 w-full max-w-xl"
        >
          {[
            { val: '4',    label: 'Divisions'     },
            { val: 'JDO',  label: 'Parent Dept'   },
            { val: '100%', label: 'Accountability' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-3xl font-bold text-boi-gold text-glow-sm">{s.val}</div>
              <div className="font-mono text-[10px] tracking-widest text-boi-muted uppercase mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Ticker ── */}
      <div className="relative z-10 border-t border-boi-border bg-boi-bg-2/80 backdrop-blur-sm py-2.5 overflow-hidden">
        <div className="ticker-content font-mono text-[10px] tracking-widest text-boi-gold/50 uppercase whitespace-nowrap">
          {ticker.join('  \u00A0\u00A0  ')}
          &nbsp;&nbsp;&nbsp;&nbsp;
          {ticker.join('  \u00A0\u00A0  ')}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.5 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
        onClick={() => scrollTo('#about')}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-boi-gold/40 hover:text-boi-gold transition-colors z-10"
      >
        <ChevronDown size={24} />
      </motion.button>
    </section>
  );
}
