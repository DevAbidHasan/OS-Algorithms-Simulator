import React, { useEffect, useRef, useState } from "react";

const Stats = () => {
  function useCounter(target, ms = 1500) {
    const [val, set] = useState(0);
    const done = useRef(false);
    const elRef = useRef(null);
    useEffect(() => {
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting && !done.current) {
            done.current = true;
            const t0 = performance.now();
            const tick = (now) => {
              const p = Math.min((now - t0) / ms, 1);
              set(Math.round(p * target));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        },
        { threshold: 0.35 },
      );
      if (elRef.current) obs.observe(elRef.current);
      return () => obs.disconnect();
    }, [target, ms]);
    return [val, elRef];
  }

  function StatPill({ value, suffix = "+", label, accent }) {
    const [v, ref] = useCounter(value);
    return (
      <div ref={ref} className="text-center px-4">
        <p className="mono text-5xl font-bold" style={{ color: accent }}>
          {v}
          {suffix}
        </p>
        <p className="text-gray-500 text-sm mt-1.5 font-medium">{label}</p>
      </div>
    );
  }
  return (
    <div>
      {/* ══ STATS ═══════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
          <StatPill
            value={14}
            suffix="+"
            label="Algorithms Covered"
            accent="#4f46e5"
          />
          <StatPill value={3} suffix="" label="Categories" accent="#7c3aed" />
          <StatPill
            value={80}
            suffix="+"
            label="Worked Examples"
            accent="#059669"
          />
          <StatPill
            value={100}
            suffix="%"
            label="Free to Use"
            accent="#d97706"
          />
        </div>
      </section>
    </div>
  );
};

export default Stats;
