'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function LogoAnimation() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const rafRef      = useRef<number>(0);
  const startRef    = useRef<number | null>(null);
  const phaseRef    = useRef<'roll' | 'settle' | 'glow' | 'done'>('roll');
  const glowRef     = useRef(0);
  const soundRef    = useRef(false);
  const unlockedRef = useRef(false);
  const doneRef     = useRef(false);
  const initializedRef = useRef(false);

  const playSound = useCallback(() => {
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      const chime = (f: number, t: number, d: number, v: number) => {
        const o = ac.createOscillator(), g = ac.createGain(), s = ac.currentTime + t;
        o.type = 'sine'; o.frequency.setValueAtTime(f, s);
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(v, s + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, s + d);
        o.connect(g); g.connect(ac.destination); o.start(s); o.stop(s + d);
      };
      chime(1480, 0, 0.8, 0.15); chime(1760, 0.04, 0.7, 0.10);
      chime(880, 0.06, 1.2, 0.12); chime(440, 0.1, 1.8, 0.08);
      chime(587, 0.2, 1.5, 0.07);
    } catch (_) {}
  }, []);

  const draw = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr  = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth  || 640;
    const cssH = canvas.clientHeight || 200;

    if (canvas.width !== Math.round(cssW * dpr)) {
      canvas.width  = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      initializedRef.current = false;
    }

    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = cssW, H = cssH;
    const cx = W / 2, cy = H / 2;
    const R    = Math.min(W * 0.13, 52);
    const band = R * 0.33;
    const gap  = R * 0.52;
    const FAR  = W * 0.46;

    // on very first frame â€” fill solid dark so trail has a base
    if (!initializedRef.current) {
      ctx.clearRect(0, 0, W, H);
      initializedRef.current = true;
    }

    if (!startRef.current) startRef.current = ts;
    const elapsed = ts - startRef.current;

    function easeOutQuint(t: number) { return 1 - Math.pow(1 - t, 5); }

    function gold(x: number, y: number, flip: boolean) {
      const gx = flip ? x + R * 0.3 : x - R * 0.3;
      const g  = ctx.createRadialGradient(gx, y - R * 0.3, 2, x, y, R);
      g.addColorStop(0,    '#FFF8C0');
      g.addColorStop(0.2,  '#F0C040');
      g.addColorStop(0.5,  '#C07800');
      g.addColorStop(0.78, '#E8A820');
      g.addColorStop(1,    '#7A4A00');
      return g;
    }

    function ring(x: number, y: number, flip: boolean, spin: number, alpha: number = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y); ctx.rotate(spin); ctx.translate(-x, -y);
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.strokeStyle = '#2a1800'; ctx.lineWidth = band + 5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.strokeStyle = gold(x, y, flip); ctx.lineWidth = band; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, R - band / 2 + 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(8,6,4,0.8)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, R, Math.PI * 1.05, Math.PI * 1.6);
      ctx.strokeStyle = 'rgba(255,252,180,0.9)'; ctx.lineWidth = 3;
      ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();
    }

    let lx: number, rx: number, spin = 0;
    const phase = phaseRef.current;

    if (phase === 'roll') {
      const t = Math.min(elapsed / 4000, 1);
      const e = easeOutQuint(t);
      lx = cx - gap - (1 - e) * FAR;
      rx = cx + gap + (1 - e) * FAR;
      spin = (1 - e) * Math.PI * 8;

      // â”€â”€ TRAIL: paint semi-transparent dark over whole canvas
      // this dims everything by a tiny amount each frame
      // old ring positions fade to dark slowly = visible gold trail
      ctx.fillStyle = 'rgba(8, 6, 4, 0.04)';
      ctx.fillRect(0, 0, W, H);

      // both rings spin same direction â€” like coins rolling on a table
      ring(rx, cy, true,   spin, 1);
      ring(lx, cy, false,  spin, 1);

      if (t >= 1) { phaseRef.current = 'settle'; startRef.current = ts; }

    } else if (phase === 'settle') {
      // clear cleanly once rings bond
      ctx.clearRect(0, 0, W, H);

      const t = Math.min(elapsed / 500, 1);
      const bounce = Math.sin(t * Math.PI) * 5 * (1 - t);
      lx = cx - gap - bounce; rx = cx + gap + bounce; spin = 0;

      if (!soundRef.current && unlockedRef.current) { soundRef.current = true; playSound(); }
      if (t >= 1) { phaseRef.current = 'glow'; startRef.current = ts; }

      ring(rx, cy, true,  0, 1);
      ring(lx, cy, false, 0, 1);

    } else {
      ctx.clearRect(0, 0, W, H);

      lx = cx - gap; rx = cx + gap; spin = 0;

      if (phase === 'glow') {
        const t = Math.min(elapsed / 1000, 1);
        glowRef.current = Math.sin(t * Math.PI) * 0.65;
        if (t >= 1) {
          phaseRef.current = 'done'; doneRef.current = true;
          if (wordmarkRef.current) wordmarkRef.current.style.opacity = '1';
        }
      }

      // glow burst
      const ga = glowRef.current;
      if (ga > 0) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        g.addColorStop(0,   `rgba(255,210,60,${ga})`);
        g.addColorStop(0.5, `rgba(240,160,20,${ga * 0.3})`);
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fill();
      }

      // interlocked rings â€” proper clip order
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H);
      ctx.arc(rx, cy, R + band / 2 + 2, 0, Math.PI * 2, true);
      ctx.clip('evenodd'); ring(lx, cy, false, 0); ctx.restore();

      ring(rx, cy, true, 0);

      ctx.save();
      ctx.beginPath(); ctx.arc(lx, cy, R + band / 2 + 2, 0, Math.PI * 2);
      ctx.clip(); ring(rx, cy, true, 0); ctx.restore();

      ctx.save();
      ctx.beginPath(); ctx.arc(rx, cy, R + band / 2 + 2, 0, Math.PI * 2);
      ctx.rect(W, 0, -W, H); ctx.clip('evenodd');
      ring(lx, cy, false, 0); ctx.restore();
    }

    if (!doneRef.current || glowRef.current > 0) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [playSound]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  useEffect(() => {
    const unlock = () => {
      if (!unlockedRef.current) {
        unlockedRef.current = true;
        if ((phaseRef.current === 'glow' || phaseRef.current === 'done') && !soundRef.current) {
          soundRef.current = true; playSound();
        }
      }
    };
    window.addEventListener('scroll',     unlock, { once: true, passive: true });
    window.addEventListener('click',      unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener('scroll', unlock);
      window.removeEventListener('click',  unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [playSound]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%', boxSizing: 'border-box',
      minHeight: '280px', position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', maxWidth: '640px', height: '180px', display: 'block' }}
        role="img"
        aria-label="Biyekori â€” two gold rings rolling together"
      />
      <div ref={wordmarkRef} style={{
        fontFamily: 'Georgia, serif',
        fontSize: 'clamp(28px, 6vw, 52px)',
        fontWeight: 700, color: '#F0C040',
        letterSpacing: '3px', opacity: 0,
        marginTop: '6px', transition: 'opacity 1.2s ease'
      }}>
        biyekori
      </div>
    </div>
  );
}


