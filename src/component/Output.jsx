import React from "react";

const Output = () => {
  const SLOTS = [
    { n: "P1", d: 3, c: "#6366f1" },
    { n: "P2", d: 2, c: "#10b981" },
    { n: "P3", d: 4, c: "#f59e0b" },
    { n: "P1", d: 3, c: "#6366f1" },
    { n: "P4", d: 2, c: "#ec4899" },
    { n: "P2", d: 1, c: "#10b981" },
    { n: "P3", d: 2, c: "#f59e0b" },
  ];
  function GanttTerminal() {
    let t = 0;
    const marks = SLOTS.map((s) => {
      const x = t;
      t += s.d;
      return x;
    });
    marks.push(t);

    return (
      <div className="bg-[#0d1117] rounded-2xl overflow-hidden p-5 border border-white/10 shadow-2xl w-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="mono text-gray-500 text-xs ml-2 truncate">
            round_robin.jsx
          </span>
        </div>

        {/* Simulation Info */}
        <p className="mono text-green-400 text-xs mb-4">
          <span className="text-gray-600">$ </span>Simulating Round Robin —
          quantum=2
          <span className="blink-cur ml-1">▋</span>
        </p>

        {/* Gantt Chart */}
        <div className="overflow-x-auto">
          {/* Gantt Slots */}
          <div className="flex gap-1 rounded-lg overflow-hidden min-w-max">
            {SLOTS.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-2 text-xs font-bold text-white rounded transition-opacity hover:opacity-80"
                style={{
                  minWidth: `${Math.max(s.d * 10, 36)}px`, // scaled down for mobile
                  flex: s.d, // responsive width
                  background: s.c,
                }}
              >
                <span className="truncate">{s.n}</span>
                <span className="text-white/55 text-[10px] font-normal">
                  {s.d}u
                </span>
              </div>
            ))}
          </div>

          {/* Time Marks */}
          <div className="flex gap-1 mt-1 min-w-max">
            {SLOTS.map((s, i) => (
              <div
                key={i}
                className="mono text-gray-600 text-[10px] text-center"
                style={{ flex: s.d }}
              >
                {marks[i]}
              </div>
            ))}
            <div className="mono text-gray-600 text-[10px] text-center">
              {marks[marks.length - 1]}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            ["Avg Wait", "3.4u", "#6366f1"],
            ["Avg TAT", "8.7u", "#10b981"],
            ["CPU Util", "94%", "#f59e0b"],
          ].map(([l, v, c]) => (
            <div
              key={l}
              className="bg-white/5 rounded-lg p-2.5 text-center border border-white/8"
            >
              <p className="text-gray-500 text-[10px] mono">{l}</p>
              <p className="font-bold text-sm mono" style={{ color: c }}>
                {v}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  function SeekTerminal() {
    const pts = [50, 150, 30, 160, 18, 184, 90];
    const max = 200;
    const pct = (v) => (v / max) * 100;
    const clrs = [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#14b8a6",
    ];
    return (
      <div className="bg-[#0d1117] rounded-2xl p-5 border border-white/10 shadow-2xl w-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="mono text-gray-500 text-xs ml-2">
            scan_scheduler.jsx
          </span>
        </div>
        <p className="mono text-green-400 text-xs mb-4">
          <span className="text-gray-600">$ </span>SCAN — head=50 direction=↑
          <span className="blink-cur ml-1">▋</span>
        </p>
        <div className="relative h-10 bg-white/5 rounded-xl border border-white/10">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
          {pts.slice(1).map((p, i) => {
            const fr = pct(pts[i]),
              to = pct(p);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${Math.min(fr, to)}%`,
                  width: `${Math.max(Math.abs(to - fr), 0.5)}%`,
                  height: 4,
                  background: clrs[i],
                  transform: "translateY(-50%)",
                  borderRadius: 3,
                  opacity: 0.8,
                }}
              />
            );
          })}
          {pts.map((p, i) => (
            <div
              key={i}
              title={p}
              style={{
                position: "absolute",
                top: "50%",
                left: `${pct(p)}%`,
                transform: "translate(-50%,-50%)",
                width: i === 0 ? 15 : 11,
                height: i === 0 ? 15 : 11,
                borderRadius: "50%",
                background: i === 0 ? "#fff" : clrs[i - 1] || "#6366f1",
                border: "2px solid #0d1117",
                zIndex: 10,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mono text-gray-600 text-[10px] mt-1 px-0.5">
          <span>0</span>
          <span>100</span>
          <span>200</span>
        </div>
        <div className="mt-4 flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/8">
          <span className="text-gray-400 mono text-xs">
            Total Seek Distance
          </span>
          <span className="text-indigo-400 font-bold mono">330 cylinders</span>
        </div>
      </div>
    );
  }
  return (
    <div>
      <section className="py-24 px-6" style={{ background: "#0d1117" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="mono text-indigo-400 text-xs font-bold tracking-widest uppercase">
              Live Output
            </span>
            <h2 className="text-4xl font-bold text-white mt-2">
              See What You Get
            </h2>
            <p className="text-gray-500 mt-3 text-sm">
              Real simulator outputs — generated from student inputs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="mono text-gray-500 text-xs uppercase tracking-widest mb-4">
                CPU — Gantt Chart
              </p>
              <GanttTerminal />
            </div>
            <div>
              <p className="mono text-gray-500 text-xs uppercase tracking-widest mb-4">
                Disk — Seek Path
              </p>
              <SeekTerminal />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Output;
