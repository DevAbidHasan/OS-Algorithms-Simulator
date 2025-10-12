// RoundRobin.jsx
import React, { useState } from "react";

const RoundRobin = () => {
  const [processes, setProcesses] = useState([{ name: "", burst: "", arrival: "" }]);
  const [quantum, setQuantum] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");

  // Add a new process
  const addProcess = () => {
    setProcesses([...processes, { name: "", burst: "", arrival: "" }]);
  };

  // Handle input change
  const handleChange = (index, field, value) => {
    const newProcesses = [...processes];
    newProcesses[index][field] = value;
    setProcesses(newProcesses);
  };

  // Simulate Round Robin
  const simulateRR = () => {
    if (processes.some(p => !p.name || !p.burst || !p.arrival) || !quantum) {
      setError("Please fill all fields and set time quantum.");
      setTimeline([]);
      return;
    }
    setError("");

    const n = processes.length;
    const q = parseInt(quantum);
    const procList = processes.map(p => ({
      name: p.name,
      arrival: parseInt(p.arrival),
      burst: parseInt(p.burst),
      remaining: parseInt(p.burst),
      completed: false
    }));

    let time = 0;
    const tempTimeline = [];
    let completed = 0;
    const queue = [];

    while (completed < n) {
      // Add newly arrived processes to queue
      procList.forEach(p => {
        if (p.arrival <= time && !queue.includes(p) && !p.completed) {
          queue.push(p);
        }
      });

      if (queue.length === 0) {
        // Idle time
        if (tempTimeline.length && tempTimeline[tempTimeline.length - 1].name === "Idle") {
          tempTimeline[tempTimeline.length - 1].duration += 1;
        } else {
          tempTimeline.push({ name: "Idle", duration: 1 });
        }
        time++;
        continue;
      }

      const current = queue.shift();

      const execTime = Math.min(current.remaining, q);
      tempTimeline.push({ name: current.name, duration: execTime });
      time += execTime;
      current.remaining -= execTime;

      // Add newly arrived processes during execution
      procList.forEach(p => {
        if (p.arrival <= time && !queue.includes(p) && !p.completed && p !== current) {
          queue.push(p);
        }
      });

      if (current.remaining > 0) {
        queue.push(current); // put back for next round
      } else {
        current.completed = true;
        completed++;
      }
    }

    setTimeline(tempTimeline);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Round Robin Simulator</h1>

      {/* Processes Input */}
      <div className="w-full max-w-3xl overflow-x-auto mb-4">
        <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-indigo-500 text-white">
            <tr>
              <th className="px-4 py-2">Process</th>
              <th className="px-4 py-2">Arrival Time</th>
              <th className="px-4 py-2">Burst Time</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((proc, idx) => (
              <tr key={idx} className="bg-white border-b">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={proc.name}
                    onChange={(e) => handleChange(idx, "name", e.target.value)}
                    placeholder={`P${idx + 1}`}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={proc.arrival}
                    onChange={(e) => handleChange(idx, "arrival", e.target.value)}
                    placeholder="Arrival"
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={proc.burst}
                    onChange={(e) => handleChange(idx, "burst", e.target.value)}
                    placeholder="Burst"
                    className="w-full p-2 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addProcess}
          className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition"
        >
          Add Process
        </button>
      </div>

      {/* Quantum Input */}
      <div className="w-full max-w-2xl mb-4">
        <label className="block mb-2 font-semibold">Time Quantum</label>
        <input
          type="number"
          value={quantum}
          onChange={(e) => setQuantum(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., 2"
        />
      </div>

      {/* Simulate Button */}
      <button
        onClick={simulateRR}
        className="mb-6 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
      >
        Simulate
      </button>

      {/* Timeline / Gantt Chart */}
      <div className="w-full max-w-4xl">
        {error && <p className="text-red-500 font-semibold">{error}</p>}
        {timeline.length > 0 && (
          <div className="overflow-x-auto bg-white p-4 rounded-lg border border-gray-300">
            <p className="font-semibold mb-2">Gantt Chart:</p>
            <div className="flex gap-1">
              {timeline.map((slot, idx) => (
                <div
                  key={idx}
                  className={`flex-shrink-0 text-center py-2 rounded text-sm ${
                    slot.name === "Idle"
                      ? "bg-gray-200 text-gray-500"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                  style={{ width: `${slot.duration * 40}px` }}
                >
                  {slot.name} <br /> {slot.duration}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundRobin;
