import React from "react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <div className="">
      {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
    <footer style={{background:"#080b14"}} className="py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center mono text-white font-bold text-sm">OS</div>
          <span className="font-bold text-white text-lg">OS Simulator</span>
        </a>
        <p className="text-gray-600 text-sm mono">
          © {new Date().getFullYear()} OS Simulator — Built for learning Operating System algorithms.
        </p>
        <a target="_blank" href="https://www.linkedin.com/in/abid-hasan-plabon-a4aa222a1/" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition">
          Talk to developer
        </a>
      </div>
    </footer>
    </div>
  );
};

export default Footer;
