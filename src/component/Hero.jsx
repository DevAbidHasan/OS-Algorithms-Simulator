import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";


function DiskArt() {
  return (
    <div className="relative w-48 h-48 mx-auto">
      <div className="glow absolute inset-0 rounded-full"
        style={{ background:"radial-gradient(circle,rgba(99,102,241,.22),transparent 70%)" }} />
      {/* platter */}
      <div className="plat-spin absolute inset-3 rounded-full flex items-center justify-center"
        style={{
          background:"conic-gradient(from 0deg,#c7d2fe 0%,#818cf8 30%,#4f46e5 55%,#312e81 75%,#c7d2fe 100%)",
          boxShadow:"inset 0 0 20px rgba(0,0,0,.25), 0 6px 28px rgba(79,70,229,.35)"
        }}>
        <div className="absolute w-32 h-32 rounded-full border border-white/20" />
        <div className="absolute w-20 h-20 rounded-full border border-white/20" />
        <div className="absolute w-10 h-10 rounded-full border border-white/30" />
        <div className="w-6 h-6 rounded-full z-10"
          style={{ background:"radial-gradient(#fff 25%,#a5b4fc)", boxShadow:"0 0 0 3px #6366f1,0 0 14px rgba(99,102,241,.6)" }} />
      </div>
      {/* arm */}
      <div className="arm-sway absolute" style={{ bottom:20, right:18 }}>
        <div style={{ width:9, height:68, background:"linear-gradient(to top,#4f46e5,#818cf8)", borderRadius:8, boxShadow:"2px 2px 10px rgba(79,70,229,.45)" }} />
        <div style={{ width:13, height:13, borderRadius:"50%", background:"#4338ca", position:"absolute", top:-5, left:-2, boxShadow:"0 0 8px #6366f1" }} />
      </div>
    </div>
  );
}

function ChipArt() {
  const procs = [
    { name:"P1", bg:"#6366f1" }, { name:"P2", bg:"#10b981" },
    { name:"P3", bg:"#f59e0b" }, { name:"P4", bg:"#ec4899" },
  ];
  return (
    <div className="float-y flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 flex items-center justify-center rounded-2xl"
        style={{ background:"linear-gradient(145deg,#4f46e5,#7c3aed)", boxShadow:"0 10px 36px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.18)" }}>
        {[0,1,2,3].map(i=><div key={`L${i}`} className="absolute h-1 bg-indigo-300 rounded-sm" style={{width:14,left:-13,top:`${22+i*19}%`}} />)}
        {[0,1,2,3].map(i=><div key={`R${i}`} className="absolute h-1 bg-indigo-300 rounded-sm" style={{width:14,right:-13,top:`${22+i*19}%`}} />)}
        {[0,1,2].map(i=><div key={`T${i}`} className="absolute w-1 bg-indigo-300 rounded-sm" style={{height:14,top:-13,left:`${24+i*26}%`}} />)}
        {[0,1,2].map(i=><div key={`B${i}`} className="absolute w-1 bg-indigo-300 rounded-sm" style={{height:14,bottom:-13,left:`${24+i*26}%`}} />)}
        <div className="grid grid-cols-3 gap-1 p-2">
          {Array(9).fill(0).map((_,i)=>(
            <div key={i} className="w-5 h-5 rounded-sm"
              style={{ background: i%3===1 ? "rgba(255,255,255,.38)" : "rgba(255,255,255,.15)" }} />
          ))}
        </div>
      </div>
      <p className="mono text-white/40 text-[10px] tracking-widest uppercase">Ready Queue</p>
      <div className="flex gap-1.5">
        {procs.map(p=>(
          <div key={p.name} className="w-10 h-10 rounded-xl flex items-center justify-center mono text-xs font-bold text-white"
            style={{ background: p.bg, boxShadow:`0 4px 14px ${p.bg}55` }}>
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}


const Hero = () => (
  <div className="about-root min-h-screen" style={{background:"#f7f8ff"}}>
    

    {/* ══ HERO ════════════════════════════════════════════════════════ */}
    <section className="relative overflow-hidden text-white"
      style={{background:"linear-gradient(135deg,#1e1b4b 0%,#4338ca 50%,#6d28d9 100%)"}}>
      <div className="hero-dots absolute inset-0 opacity-100" />
      <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full opacity-10"
        style={{background:"radial-gradient(circle,#a5b4fc,transparent)"}} />

      <div className="relative max-w-6xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-14">
        {/* Left */}
        <div className="flex-1 fade-up text-center md:text-left">
          <span className="badge animate-pulse mb-5" style={{background:"rgba(255,255,255,.14)",color:"#c7d2fe"}}>
            
            Free · Open Source · Educational
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            OS Simulator<br/>
            <span style={{color:"#a5b4fc"}}>Learn by Doing.</span>
          </h1>
          <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
            An interactive platform for CS students to explore CPU scheduling,
            disk scheduling, and deadlock avoidance — with theory, worked
            examples, and live simulation all in one place.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <a href="#algorithms"
              className="bg-white text-indigo-700 font-bold px-7 py-3.5 rounded-full shadow-xl hover:scale-105 transition">
              Browse Algorithms ↓
            </a>
            <a href="https://github.com/DevAbidHasan/OS-Algorithms-Simulator" target="_blank"
              className="border-2 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition"
              style={{borderColor:"rgba(255,255,255,.28)"}}>
              Learn More
            </a>
          </div>
        </div>

        {/* Right illustrations */}
        <div className="flex overflow-hidden items-end justify-center gap-3 md:gap-12 flex-shrink-0">
          <div className="flex flex-col items-center gap-3">
            <DiskArt />
            <p className="mono text-white/35 text-[10px] tracking-widest uppercase">Disk Scheduling</p>
          </div>
          <div className="flex flex-col items-center gap-3 mb-8">
            <ChipArt />
            <p className="mono text-white/35 text-[10px] tracking-widest uppercase">CPU Scheduling</p>
          </div>
        </div>
      </div>
    </section>

    
    

    
    

    

    {/* ══ TECH STACK ══════════════════════════════════════════════════ */}
    
    


    
  </div>
);

export default Hero;