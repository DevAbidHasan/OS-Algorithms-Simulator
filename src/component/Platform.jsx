import React from 'react';

const Platform = () => {
    return (
        <div>
            {/* ══ WHAT IT DOES ════════════════════════════════════════════════ */}
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <span className="badge" style={{background:"#eef2ff",color:"#4338ca"}}>Platform Overview</span>
        <h2 className="text-4xl font-bold text-gray-900 mt-3">What This Platform Does</h2>
        <p className="text-gray-400 mt-3 max-w-xl mx-auto">
          Every algorithm page shares the same 3-tab structure. Learn one, know them all.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {emoji:"📖",bg:"#eef2ff",ac:"#4f46e5",tag:"Theory",
           title:"Learn the Concept",
           desc:"Plain-English explanations with key terms, step-by-step rules, formulas, pros and cons, and comparison tables. No textbook jargon."},
          {emoji:"🔍",bg:"#ecfdf5",ac:"#059669",tag:"Examples",
           title:"See It Solved",
           desc:"Two fully worked examples per algorithm with every decision explained using real numbers. See the algorithm think before trying it yourself."},
          {emoji:"🧪",bg:"#fdf4ff",ac:"#7c3aed",tag:"Practice",
           title:"Run It Yourself",
           desc:"Enter your own inputs and simulate live. Get colour-coded Gantt charts, seek-path bars, step tables, and stats — all generated instantly."},
        ].map((c,i)=>(
          <div key={i} className="card-lift bg-white rounded-2xl border border-gray-200 p-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
              style={{background:c.bg}}>{c.emoji}</div>
            <span className="mono text-xs font-bold px-3 py-1 rounded-full" style={{background:c.bg,color:c.ac}}>
              Tab {i+1} — {c.tag}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{c.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
        </div>
    );
};

export default Platform;