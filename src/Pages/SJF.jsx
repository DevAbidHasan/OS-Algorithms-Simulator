// SJF.jsx
import React, { useState } from "react";

const SJF = () => {
  const [processes, setProcesses] = useState([{ name: "", burst: "", arrival: "" }]);
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

  // Simulate SJF (Non-preemptive)
  const simulateSJF = () => {
    if (processes.some(p => !p.name || !p.burst || !p.arrival)) {
      setError("Please fill all fields for all processes.");
      setTimeline([]);
      return;
    }
    setError("");

    const n = processes.length;
    const procList = processes.map(p => ({
      name: p.name,
      arrival: parseInt(p.arrival),
      burst: parseInt(p.burst),
      completed: false
    }));

    const tempTimeline = [];
    let currentTime = 0;
    let completedCount = 0;

    while (completedCount < n) {
      // Get available processes
      const available = procList.filter(p => p.arrival <= currentTime && !p.completed);

      if (available.length === 0) {
        // Idle
        const nextArrival = Math.min(...procList.filter(p => !p.completed).map(p => p.arrival));
        tempTimeline.push({ name: "Idle", duration: nextArrival - currentTime });
        currentTime = nextArrival;
        continue;
      }

      // Pick process with shortest burst
      available.sort((a, b) => a.burst - b.burst);
      const currentProc = available[0];
      tempTimeline.push({ name: currentProc.name, duration: currentProc.burst });
      currentTime += currentProc.burst;
      currentProc.completed = true;
      completedCount++;
    }

    setTimeline(tempTimeline);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">SJF Scheduling Simulator</h1>

      {/* Processes Input */}
      <div className="w-full max-w-3xl overflow-x-auto">
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
                    onChange={e => handleChange(idx, "name", e.target.value)}
                    placeholder={`P${idx + 1}`}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={proc.arrival}
                    onChange={e => handleChange(idx, "arrival", e.target.value)}
                    placeholder="Arrival"
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={proc.burst}
                    onChange={e => handleChange(idx, "burst", e.target.value)}
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

      {/* Simulate Button */}
      <button
        onClick={simulateSJF}
        className="mt-6 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
      >
        Simulate
      </button>

      {/* Timeline / Gantt Chart */}
      <div className="mt-6 w-full max-w-3xl">
        {error && <p className="text-red-500 font-semibold">{error}</p>}
        {timeline.length > 0 && (
          <div className="overflow-x-auto bg-white p-4 rounded-lg border border-gray-300">
            <p className="font-semibold mb-2">Gantt Chart:</p>
            <div className="flex gap-2">
              {timeline.map((slot, idx) => (
                <div
                  key={idx}
                  className={`flex-shrink-0 text-center py-2 rounded ${
                    slot.name === "Idle" ? "bg-gray-200 text-gray-500" : "bg-indigo-100 text-indigo-700"
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

export default SJF;
