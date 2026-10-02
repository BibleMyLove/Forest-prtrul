import React, { useEffect, useMemo, useRef } from 'react';
import { soundManager } from '../sound';

/**
 * Живий фон гри: північне сяйво, зорі, світлячки, силуети ялин,
 * іскри за курсором та вибухи при кліках.
 * Також вмикає фонову музику після першого дотику та звуки наведення/кліків на кнопки.
 */

type Kind = 'firefly' | 'star' | 'spark' | 'shoot' | 'leaf';

interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  speed: number;
  hue: number;
  life: number; // для іскор / метеорів: залишок життя 0..1
  decay: number;
}

const makeSprite = (hue: number, size = 64): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `hsla(${hue}, 100%, 92%, 1)`);
  grad.addColorStop(0.18, `hsla(${hue}, 100%, 68%, 0.85)`);
  grad.addColorStop(0.5, `hsla(${hue}, 100%, 55%, 0.18)`);
  grad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
};

// Ялинові силуети (генеруємо шлях один раз)
const buildPines = (count: number, seed: number, minH: number, maxH: number): string => {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let d = 'M0,300 ';
  const step = 1600 / count;
  for (let i = 0; i < count; i++) {
    const cx = i * step + step / 2 + (rnd() - 0.5) * step * 0.6;
    const h = minH + rnd() * (maxH - minH);
    const w = 26 + rnd() * 26;
    const tiers = 4 + Math.floor(rnd() * 2);
    const base = 300;
    d += `L${(cx - w).toFixed(1)},${base} `;
    for (let t = 0; t < tiers; t++) {
      const ty = base - (h * t) / tiers;
      const tw = w * (1 - t / (tiers + 0.6));
      const nextY = base - (h * (t + 1)) / tiers;
      d += `L${(cx - tw).toFixed(1)},${(ty - 6).toFixed(1)} L${(cx - tw * 0.45).toFixed(1)},${(ty - 6).toFixed(1)} L${cx.toFixed(1)},${(nextY - 14).toFixed(1)} `;
    }
    for (let t = tiers - 1; t >= 0; t--) {
      const ty = base - (h * t) / tiers;
      const tw = w * (1 - t / (tiers + 0.6));
      const nextY = base - (h * (t + 1)) / tiers;
      d += `L${(cx + tw * 0.45).toFixed(1)},${(ty - 6).toFixed(1)} L${(cx + tw).toFixed(1)},${(ty - 6).toFixed(1)} `;
      void nextY;
    }
    d += `L${(cx + w).toFixed(1)},${base} `;
  }
  d += 'L1600,300 Z';
  return d;
};

export const Ambient: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pinesBack = useMemo(() => buildPines(26, 7, 90, 170), []);
  const pinesFront = useMemo(() => buildPines(16, 21, 130, 230), []);

  // ───── Звуки інтерфейсу та старт музики ─────
  useEffect(() => {
    let lastEl: Element | null = null;

    const interactive = (t: EventTarget | null): Element | null => {
      if (!(t instanceof Element)) return null;
      return t.closest('button, select, a, [role="button"], [data-sfx]');
    };

    const onOver = (e: PointerEvent) => {
      const el = interactive(e.target);
      if (el && el !== lastEl) {
        lastEl = el;
        if ((el as HTMLButtonElement).disabled) return;
        soundManager.playHoverSound();
      } else if (!el) {
        lastEl = null;
      }
    };

    const onDown = (e: PointerEvent) => {
      // Музика стартує після першого жесту (вимога браузерів)
      soundManager.startAmbient();
      const el = interactive(e.target);
      if (el && el.tagName === 'BUTTON' && !(el as HTMLButtonElement).disabled) {
        soundManager.playClickSound();
        // Головні кнопки вибухають іскрами свого кольору
        const cls = el.getAttribute('class') || '';
        const hue = cls.includes('from-emerald-') ? 160 : cls.includes('from-rose-') ? 340 : cls.includes('from-amber-') ? 48 : null;
        if (hue !== null) {
          const r = el.getBoundingClientRect();
          window.dispatchEvent(
            new CustomEvent('fx:burst', {
              detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, count: 26, power: 5, hue },
            })
          );
          soundManager.playSparkleSound(3);
        }
      }
    };

    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => {
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
    };
  }, []);

  // ───── Canvas: зорі, світлячки, іскри ─────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    const sprites: Record<number, HTMLCanvasElement> = {
      48: makeSprite(48), // золотий
      95: makeSprite(95), // зелений
      160: makeSprite(160), // м'ятний
      190: makeSprite(190), // блакитний
      290: makeSprite(290), // фіолетовий
      340: makeSprite(340), // рожевий
    };
    const fireflyHues = [48, 48, 95, 160];
    const sparkHues = [48, 160, 190, 290, 340];

    let particles: Particle[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const spawnStatic = () => {
      particles = [];
      const area = W * H;
      const fireflies = reduced ? 8 : Math.round(Math.min(70, Math.max(24, area / 22000)));
      const stars = Math.round(Math.min(140, Math.max(50, area / 14000)));
      for (let i = 0; i < stars; i++) {
        particles.push({
          kind: 'star',
          x: rand(0, W),
          y: rand(0, H * 0.7),
          vx: 0,
          vy: 0,
          r: rand(0.4, 1.4),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.6, 2.2),
          hue: 0,
          life: 1,
          decay: 0,
        });
      }
      for (let i = 0; i < fireflies; i++) {
        particles.push({
          kind: 'firefly',
          x: rand(0, W),
          y: rand(H * 0.15, H),
          vx: rand(-0.18, 0.18),
          vy: rand(-0.14, 0.1),
          r: rand(10, 26),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.5, 1.6),
          hue: fireflyHues[Math.floor(Math.random() * fireflyHues.length)],
          life: 1,
          decay: 0,
        });
      }
      if (!reduced) {
        for (let i = 0; i < 9; i++) {
          particles.push({
            kind: 'leaf',
            x: rand(0, W),
            y: rand(-H * 0.2, H),
            vx: rand(0.2, 0.6),
            vy: rand(0.25, 0.65),
            r: rand(3, 6),
            phase: rand(0, Math.PI * 2),
            speed: rand(0.8, 1.8),
            hue: rand(30, 120),
            life: 1,
            decay: 0,
          });
        }
      }
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnStatic();
    };
    resize();
    window.addEventListener('resize', resize);

    const addSparks = (x: number, y: number, count: number, power: number, hue?: number) => {
      if (reduced) return;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = rand(0.4, 1) * power;
        particles.push({
          kind: 'spark',
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - power * 0.15,
          r: rand(5, 14),
          phase: 0,
          speed: 0,
          hue: hue ?? sparkHues[Math.floor(Math.random() * sparkHues.length)],
          life: 1,
          decay: rand(0.012, 0.03),
        });
      }
    };

    // ───── Події ─────
    let lastTrail = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastTrail < 45) return;
      lastTrail = now;
      addSparks(e.clientX, e.clientY, 1, 0.9, 48);
    };
    const onClick = (e: PointerEvent) => {
      addSparks(e.clientX, e.clientY, 14, 4.2);
    };
    const onFx = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      addSparks(d.x ?? W / 2, d.y ?? H / 2, d.count ?? 40, d.power ?? 6, d.hue);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onClick, { passive: true });
    window.addEventListener('fx:burst', onFx);

    // ───── Малювання ─────
    let raf = 0;
    let last = performance.now();
    let nextShoot = last + rand(3000, 7000);

    const frame = (nowMs: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) {
        last = nowMs;
        return;
      }
      const dt = Math.min(50, nowMs - last) / 16.67;
      last = nowMs;
      const t = nowMs / 1000;

      ctx.clearRect(0, 0, W, H);

      if (!reduced && nowMs > nextShoot) {
        nextShoot = nowMs + rand(5000, 11000);
        particles.push({
          kind: 'shoot',
          x: rand(W * 0.2, W),
          y: rand(0, H * 0.3),
          vx: -rand(7, 11),
          vy: rand(3, 5),
          r: 2,
          phase: 0,
          speed: 0,
          hue: 190,
          life: 1,
          decay: 0.018,
        });
      }

      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.kind === 'star') {
          const a = 0.25 + 0.75 * Math.abs(Math.sin(t * p.speed + p.phase));
          ctx.globalAlpha = a * 0.8;
          ctx.fillStyle = '#dff6ff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        if (p.kind === 'firefly') {
          p.phase += 0.012 * dt * p.speed;
          p.vx += Math.sin(p.phase * 3) * 0.004 * dt;
          p.vy += Math.cos(p.phase * 2.3) * 0.004 * dt;
          p.vx = Math.max(-0.35, Math.min(0.35, p.vx));
          p.vy = Math.max(-0.3, Math.min(0.3, p.vy));
          p.x += p.vx * dt * (reduced ? 0.2 : 1);
          p.y += p.vy * dt * (reduced ? 0.2 : 1);
          if (p.x < -40) p.x = W + 40;
          if (p.x > W + 40) p.x = -40;
          if (p.y < -40) p.y = H + 40;
          if (p.y > H + 40) p.y = -40;
          const pulse = 0.35 + 0.65 * Math.pow(Math.abs(Math.sin(t * p.speed + p.phase * 4)), 2);
          ctx.globalAlpha = pulse * 0.9;
          const size = p.r * (0.8 + pulse * 0.5);
          ctx.drawImage(sprites[p.hue], p.x - size, p.y - size, size * 2, size * 2);
          continue;
        }

        if (p.kind === 'leaf') {
          p.x += (p.vx + Math.sin(t * p.speed + p.phase) * 0.5) * dt;
          p.y += p.vy * dt;
          p.phase += 0.01 * dt;
          if (p.y > H + 20 || p.x > W + 20) {
            p.x = rand(-20, W * 0.8);
            p.y = -20;
          }
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 0.35;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(t * p.speed + p.phase);
          ctx.fillStyle = `hsl(${p.hue}, 55%, 45%)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          ctx.globalCompositeOperation = 'lighter';
          continue;
        }

        if (p.kind === 'spark') {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 0.06 * dt;
          p.vx *= 0.985;
          p.life -= p.decay * dt;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = Math.max(0, p.life);
          const size = p.r * (0.4 + p.life * 0.8);
          ctx.drawImage(sprites[p.hue] || sprites[48], p.x - size, p.y - size, size * 2, size * 2);
          continue;
        }

        if (p.kind === 'shoot') {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= p.decay * dt;
          if (p.life <= 0 || p.x < -100 || p.y > H + 100) {
            particles.splice(i, 1);
            continue;
          }
          const grad = ctx.createLinearGradient(p.x, p.y, p.x - p.vx * 9, p.y - p.vy * 9);
          grad.addColorStop(0, 'rgba(220,250,255,0.95)');
          grad.addColorStop(1, 'rgba(120,200,255,0)');
          ctx.globalAlpha = Math.min(1, p.life * 1.6);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 9, p.y - p.vy * 9);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onClick);
      window.removeEventListener('fx:burst', onFx);
    };
  }, []);

  return (
    <div className="ambient-root" aria-hidden="true">
      <div className="ambient-sky" />
      <div className="ambient-aurora a1" />
      <div className="ambient-aurora a2" />
      <div className="ambient-aurora a3" />
      <div className="ambient-moon" />
      <canvas ref={canvasRef} className="ambient-canvas" />
      <svg className="ambient-pines back" viewBox="0 0 1600 300" preserveAspectRatio="none">
        <path d={pinesBack} />
      </svg>
      <svg className="ambient-pines front" viewBox="0 0 1600 300" preserveAspectRatio="none">
        <path d={pinesFront} />
      </svg>
      <div className="ambient-vignette" />
    </div>
  );
};

export default Ambient;
