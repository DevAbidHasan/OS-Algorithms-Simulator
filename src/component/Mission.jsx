import React from "react";
import { Link } from "react-router";

const Mission = () => {
  return (
    <div>
      <section
        className="relative py-28 px-6 text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#1e1b4b 0%,#4338ca 55%,#6d28d9 100%)",
        }}
      >
        <div className="hero-dots absolute inset-0 opacity-60" />
        <div className="relative max-w-3xl mx-auto">
          <span className="mono text-indigo-300 text-xs font-bold tracking-widest uppercase">
            My Goal
          </span>
          <h2 className="text-4xl font-bold text-white mt-3 mb-5">
            Making OS Concepts Finally Click
          </h2>
          <p className="text-white/75 text-justify text-lg leading-relaxed mb-10">
            Most universities teach OS algorithms with dry slides and formulas.
            Students memorise steps but never really understand why. This
            platform gives you a place to experiment, see mistakes in real time,
            and watch algorithms run live — until it all finally makes sense.
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-indigo-700 font-bold px-10 py-4 rounded-full shadow-2xl hover:scale-105 transition text-lg"
          >
            Start Learning →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Mission;
