import React, { useState } from "react";
import { Link } from "react-router";

const faqs = [
  {
    q: "What is the purpose of the OS Simulator?",
    a: "The OS Simulator helps students understand operating system algorithms through interactive visualizations instead of only reading theoretical explanations.",
  },
  {
    q: "Which algorithms can be simulated?",
    a: "The simulator focuses on core operating system concepts such as CPU scheduling algorithms and disk scheduling algorithms commonly taught in OS courses.",
  },
  {
    q: "How does the simulator help learning?",
    a: "Users can input processes and parameters, then watch algorithms execute step-by-step with Gantt chart visualization to better understand scheduling behavior.",
  },
  {
    q: "Who is this simulator built for?",
    a: "It is mainly designed for computer science students learning operating systems, but anyone curious about OS scheduling algorithms can use it.",
  },
  {
    q: "Why was this project created?",
    a: "The project was inspired by my Operating System course instructor who encouraged students to build practical tools instead of only studying theoretical materials.",
  },
  {
    q: "Can users experiment with different inputs?",
    a: "Yes. The simulator allows users to change process inputs and parameters to see how different algorithms behave under different conditions.",
  },
];

const FAQ = () => {
  const [active, setActive] = useState(null);

  const toggle = (index) => {
    setActive(active === index ? null : index);
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="badge"
            style={{ background: "#eef2ff", color: "#4338ca" }}
          >
            FAQ
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
            Frequently Asked Questions
          </h2>

          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Common questions about the OS Simulator and how it helps students
            understand operating system concepts.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex justify-between items-center text-left px-6 py-4 font-semibold text-gray-800 hover:bg-gray-100 transition"
              >
                {item.q}

                <span className="text-indigo-600 text-xl">
                  {active === i ? "−" : "+"}
                </span>
              </button>

              <div
                className={`px-6 text-gray-600 text-sm transition-all duration-300 overflow-hidden ${
                  active === i ? "max-h-40 pb-4" : "max-h-0"
                }`}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>

        

      </div>
    </section>
  );
};

export default FAQ;