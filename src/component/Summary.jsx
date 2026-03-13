import React from "react";
import { Link } from "react-router";

const Summary = () => {
  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span
            className="badge"
            style={{ background: "#eef2ff", color: "#4338ca" }}
          >
            Project Summary
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
            OS Simulator
          </h2>

          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            An interactive platform that helps students understand Operating
            System algorithms through visual simulation and experimentation.
          </p>
        </div>

        {/* Description */}
        <div className="text-gray-700 text-[15px] leading-relaxed space-y-4 text-center max-w-3xl mx-auto">
          <p>
            This project was inspired by my Operating System course instructor,
            who encouraged students to build something practical instead of
            only studying theory.
          
            The simulator allows users to experiment with CPU scheduling and
            disk scheduling algorithms, visualize execution using Gantt charts,
            and better understand how operating systems manage processes.
          </p>

          <p className="font-medium text-gray-800">
            The goal is simple — turn abstract OS theory into clear,
            interactive learning.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[
            {
              title: "Algorithm Simulation",
              desc: "Run CPU & disk scheduling algorithms interactively.",
            },
            {
              title: "Gantt Charts",
              desc: "Visualize execution order clearly.",
            },
            {
              title: "Interactive Learning",
              desc: "Experiment with custom process inputs.",
            },
            {
              title: "Student Friendly",
              desc: "Designed for easier OS concept understanding.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-indigo-600 text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-gray-600 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-sm shadow-md hover:scale-105 transition"
          >
            Explore Simulator →
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Summary;