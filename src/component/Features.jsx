import React from "react";
import { FaMicrochip, FaDatabase, FaCompactDisc, FaMemory } from "react-icons/fa";

const features = [
  {
    title: "CPU Scheduling",
    icon: <FaMicrochip className="text-4xl text-indigo-600 mb-4" />,
    text: "Simulate First Come First Serve (FCFS), Round Robin, and Priority Scheduling to understand CPU process handling.",
  },
  {
    title: "Banker’s Algorithm",
    icon: <FaDatabase className="text-4xl text-indigo-600 mb-4" />,
    text: "Visualize how systems avoid deadlock by safely allocating resources using Banker’s safety algorithm.",
  },
  {
    title: "Disk Scheduling",
    icon: <FaCompactDisc className="text-4xl text-indigo-600 mb-4" />,
    text: "Learn how disk arm movements are optimized with algorithms like FCFS, SCAN, and C-SCAN.",
  },
  {
    title: "Memory Management",
    icon: <FaMemory className="text-4xl text-indigo-600 mb-4" />,
    text: "Understand paging, segmentation, and memory allocation through interactive visual simulations.",
  },
];

const Features = () => {
  return (
    <section className="bg-gray-50 py-20 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Core Features of OS Simulator
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore real-time simulations of key operating system algorithms
          designed for clarity, interaction, and deep understanding.
        </p>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 text-center transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300"
          >
            <div className="flex justify-center">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              {item.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
