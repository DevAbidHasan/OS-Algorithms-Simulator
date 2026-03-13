import React from 'react';
import { Link } from 'react-router';

const Algorithms = () => {
    const CPU_ALGOS = [
  {name:"FCFS",           path:"/fcfs",           desc:"First Come, First Serve"},
  {name:"SJF",            path:"/sjf",            desc:"Shortest Job First"},
  {name:"SRTF",           path:"/srtf",           desc:"Shortest Remaining Time"},
  {name:"Round Robin",    path:"/rr",             desc:"Equal time-slice rotation"},
  {name:"Priority",       path:"/priority",       desc:"Priority-based scheduling"},
  {name:"Rate Monotonic", path:"/rate-monotonic", desc:"Period-based real-time"},
  {name:"EDF",            path:"/edf",            desc:"Earliest Deadline First"},
];
const DISK_ALGOS = [
  {name:"FIFO",   path:"/fifo",   desc:"Arrival order service"},
  {name:"LIFO",   path:"/LIFO",   desc:"Last In, First Out"},
  {name:"SSTF",   path:"/sstf",   desc:"Shortest Seek Time First"},
  {name:"SCAN",   path:"/scan",   desc:"Elevator algorithm"},
  {name:"C-SCAN", path:"/cscan",  desc:"Circular SCAN"},
  {name:"LOOK",   path:"/look",   desc:"SCAN without boundary travel"},
  {name:"C-LOOK", path:"/clook",  desc:"Circular LOOK"},
];
const DEADLOCK_ALGOS = [
  {name:"Banker's Algorithm", path:"/bankers-algorithm", desc:"Safe-state deadlock avoidance"},
];

    return (
        <div>
            {/* ══ ALGORITHMS ══════════════════════════════════════════════════ */}
    <section id="algorithms" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <span className="badge" style={{background:"#eef2ff",color:"#4338ca"}}>Full Coverage</span>
        <h2 className="text-4xl font-bold text-gray-900 mt-3">Algorithms Covered</h2>
        <p className="text-gray-400 mt-3 max-w-xl mx-auto">Click any algorithm to jump straight to its page.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* CPU */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="px-6 py-5 border-b" style={{background:"linear-gradient(135deg,#eef2ff,#e0e7ff)",borderColor:"#c7d2fe"}}>
            <div className="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center text-xl mb-3">🖥️</div>
            <span className="mono text-indigo-400 text-[10px] font-bold tracking-widest uppercase">Category 1</span>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">CPU Scheduling</h3>
            <p className="text-xs text-gray-500 mt-1">Decides which process gets the CPU next and for how long.</p>
          </div>
          <ul className="p-3 space-y-0.5">
            {CPU_ALGOS.map(a=>(
              <li key={a.name}>
                <Link to={a.path} className="al-row flex items-center justify-between px-3 py-2.5 group">
                  <div>
                    <span className="font-semibold text-gray-800 group-hover:text-indigo-600 text-sm transition">{a.name}</span>
                    <span className="block text-xs text-gray-400">{a.desc}</span>
                  </div>
                  <span className="text-indigo-300 group-hover:text-indigo-500 transition font-bold text-sm">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Disk */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="px-6 py-5 border-b" style={{background:"linear-gradient(135deg,#ecfdf5,#d1fae5)",borderColor:"#a7f3d0"}}>
            <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center text-xl mb-3">💽</div>
            <span className="mono text-green-500 text-[10px] font-bold tracking-widest uppercase">Category 2</span>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">Disk Scheduling</h3>
            <p className="text-xs text-gray-500 mt-1">Controls how the disk head moves to serve read/write requests.</p>
          </div>
          <ul className="p-3 space-y-0.5">
            {DISK_ALGOS.map(a=>(
              <li key={a.name}>
                <Link to={a.path} className="al-row-g al-row flex items-center justify-between px-3 py-2.5 group">
                  <div>
                    <span className="font-semibold text-gray-800 group-hover:text-green-600 text-sm transition">{a.name}</span>
                    <span className="block text-xs text-gray-400">{a.desc}</span>
                  </div>
                  <span className="text-green-300 group-hover:text-green-500 transition font-bold text-sm">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Deadlock */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="px-6 py-5 border-b" style={{background:"linear-gradient(135deg,#fdf4ff,#ede9fe)",borderColor:"#ddd6fe"}}>
            <div className="w-11 h-11 bg-violet-500 rounded-xl flex items-center justify-center text-xl mb-3">🔒</div>
            <span className="mono text-violet-500 text-[10px] font-bold tracking-widest uppercase">Category 3</span>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">Deadlock Avoidance</h3>
            <p className="text-xs text-gray-500 mt-1">Prevents processes from getting stuck waiting forever.</p>
          </div>
          <ul className="p-3 space-y-0.5">
            {DEADLOCK_ALGOS.map(a=>(
              <li key={a.name}>
                <Link to={a.path} className="al-row-v al-row flex items-center justify-between px-3 py-2.5 group">
                  <div>
                    <span className="font-semibold text-gray-800 group-hover:text-violet-600 text-sm transition">{a.name}</span>
                    <span className="block text-xs text-gray-400">{a.desc}</span>
                  </div>
                  <span className="text-violet-300 group-hover:text-violet-500 transition font-bold text-sm">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-3 mb-3 rounded-xl p-4 border" style={{background:"#fdf4ff",borderColor:"#ede9fe"}}>
            <p className="mono text-violet-500 text-[10px] font-bold uppercase tracking-widest mb-2">Concepts inside</p>
            {["Safe State vs Unsafe State","Need = Max − Allocation","Resource Allocation Graph","Deadlock vs Starvation"].map(c=>(
              <div key={c} className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0"/>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
        </div>
    );
};

export default Algorithms;