import React from 'react';

const HowToUse = () => {
    const HOW_STEPS = [
  {n:"01",col:"#6366f1",title:"Choose an Algorithm",    desc:"Pick any algorithm from the home page. CPU Scheduling, Disk Scheduling, or Deadlock Avoidance — each has its own full page."},
  {n:"02",col:"#10b981",title:"Read the Theory Tab",    desc:"The 📖 Theory tab explains everything in plain, simple English — what the algorithm does, key terms, step-by-step rules, pros and cons, and a comparison table."},
  {n:"03",col:"#f59e0b",title:"Study the Examples",     desc:"The 🔍 Examples tab walks through 2 fully solved problems with real numbers, explaining every single decision so you can follow along."},
  {n:"04",col:"#ec4899",title:"Simulate It Yourself",   desc:"The 🧪 Practice tab lets you type in your own inputs and run the algorithm live. Gantt charts, step tables, seek-path bars, and stats — all updated instantly."},
];
    return (
        <div>
            {/* ══ HOW TO USE ══════════════════════════════════════════════════ */}
    <section className="py-24 px-6" style={{background:"linear-gradient(135deg,#1e1b4b,#1f2937)"}}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="mono text-indigo-400 text-xs font-bold tracking-widest uppercase">Getting Started</span>
          <h2 className="text-4xl font-bold text-white mt-2">How to Use This Platform</h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            Four steps. Takes less than a minute before you are running your first simulation.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {HOW_STEPS.map((s,i)=>(
            <div key={i} className="flex gap-5 items-start rounded-2xl p-6 border transition"
              style={{background:"rgba(255,255,255,.04)",borderColor:"rgba(255,255,255,.09)"}}>
              <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center mono font-bold text-white text-sm"
                style={{background:s.col,boxShadow:`0 4px 16px ${s.col}55`}}>
                {s.n}
              </div>
              <div>
                <h3 className="font-bold text-white mb-1.5">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
        </div>
    );
};

export default HowToUse;