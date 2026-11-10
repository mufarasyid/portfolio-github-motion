import { useEffect, useRef } from "react";

const REPLAY_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export default function CanvasFrame({ draw, height = 280, duration = 4000, ariaLabel }) {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const stateRef = useRef({ w: 0, h: 0, start: 0, raf: 0, visible: false, started: false, reduce: false });

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const st = stateRef.current;
    st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = (t) => {
      if (st.w === 0) return;
      ctx.clearRect(0, 0, st.w, st.h);
      drawRef.current(ctx, st.w, st.h, st.reduce ? Infinity : t);
    };

    const loop = (now) => {
      st.raf = 0;
      const t = st.reduce ? Infinity : now - st.start;
      paint(t);
      if (!st.reduce && st.visible && t < duration + 150) {
        st.raf = requestAnimationFrame(loop);
      }
    };

    const kick = () => {
      if (!st.raf) st.raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const rect = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = Math.max(1, rect.width);
      st.h = Math.max(1, rect.height);
      canvas.width = Math.round(st.w * dpr);
      canvas.height = Math.round(st.h * dpr);
      canvas.style.width = `${st.w}px`;
      canvas.style.height = `${st.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(st.reduce ? Infinity : st.started ? performance.now() - st.start : 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          st.visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          if (st.visible && !st.started) {
            st.started = true;
            st.start = performance.now();
          }
          if (st.visible) kick();
        }
      },
      { threshold: [0.35] }
    );
    io.observe(box);

    st.replay = () => {
      st.started = true;
      st.start = performance.now();
      st.visible = true;
      kick();
    };

    return () => {
      cancelAnimationFrame(st.raf);
      st.raf = 0;
      ro.disconnect();
      io.disconnect();
    };
  }, [duration]);

  return (
    <div ref={boxRef} className="relative w-full overflow-hidden" style={{ height }}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} className="block" />
      <button
        type="button"
        onClick={() => stateRef.current.replay?.()}
        className="absolute bottom-2 right-2 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#8b949e] backdrop-blur-sm transition-colors hover:border-[#39d353]/40 hover:text-[#39d353] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39d353]"
        aria-label="Replay animation"
      >
        {REPLAY_ICON}
        Replay
      </button>
    </div>
  );
}
