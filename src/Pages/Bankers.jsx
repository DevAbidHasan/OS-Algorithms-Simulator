// Bankers.jsx
import React, { useState } from "react";
import { Link } from "react-router";

const Bankers = () => {
  const [processes, setProcesses] = useState([{ name: "", allocation: "", max: "" }]);
  const [available, setAvailable] = useState("");
  const [safeSequence, setSafeSequence] = useState([]);
  const [error, setError] = useState("");

  // Add a new process
  const addProcess = () => {
    setProcesses([...processes, { name: "", allocation: "", max: "" }]);
  };

  // Handle input change
  const handleChange = (index, field, value) => {
    const newProcesses = [...processes];
    newProcesses[index][field] = value;
    setProcesses(newProcesses);
  };

  // Simulate Bankers Algorithm
  const simulateBankers = () => {
    // Basic validation
    if (!available) {
      setError("Please enter available resources.");
      return;
    }
    setError("");

    // Convert inputs to arrays of numbers
    const avail = available.split(",").map(Number);
    const alloc = processes.map((p) => p.allocation.split(",").map(Number));
    const max = processes.map((p) => p.max.split(",").map(Number));
    const n = processes.length;
    const m = avail.length;

    const need = max.map((row, i) => row.map((val, j) => val - alloc[i][j]));
    const finish = Array(n).fill(false);
    const safeSeq = [];
    let work = [...avail];

    let progress = true;
    while (safeSeq.length < n && progress) {
      progress = false;
      for (let i = 0; i < n; i++) {
        if (!finish[i] && need[i].every((val, j) => val <= work[j])) {
          work = work.map((val, j) => val + alloc[i][j]);
          finish[i] = true;
          safeSeq.push(processes[i].name || `P${i + 1}`);
          progress = true;
        }
      }
    }

    if (safeSeq.length === n) {
      setSafeSequence(safeSeq);
      setError("");
    } else {
      setSafeSequence([]);
      setError("System is not in a safe state!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 md:p-12">
      <h1 className="md:text-3xl font-bold mb-6 text-indigo-700">Bankers Algorithm Simulator</h1>
      <button className="btn btn-primary">
        <Link to="/bankers-algorithm">Refresh</Link>
      </button>

      {/* Available Resources */}
      <div className="mb-6 w-full max-w-2xl">
        <label className="block mb-2 font-semibold">Available Resources (comma separated)</label>
        <input
          type="text"
          value={available}
          onChange={(e) => setAvailable(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., 3,3,2"
        />
      </div>

      {/* Processes Table */}
      <div className="w-full max-w-3xl overflow-x-auto">
        <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-indigo-500 text-white">
            <tr>
              <th className="px-4 py-2">Process</th>
              <th className="px-4 py-2">Allocation</th>
              <th className="px-4 py-2">Max</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={process.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    placeholder={`P${index + 1}`}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={process.allocation}
                    onChange={(e) => handleChange(index, "allocation", e.target.value)}
                    placeholder="e.g., 0,1,0"
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={process.max}
                    onChange={(e) => handleChange(index, "max", e.target.value)}
                    placeholder="e.g., 7,5,3"
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
        onClick={simulateBankers}
        className="mt-6 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
      >
        Simulate
      </button>

      {/* Output */}
      <div className="mt-6 w-full max-w-3xl text-center">
        {error && <p className="text-red-500 font-semibold">{error}</p>}
        {safeSequence.length > 0 && (
          <p className="text-green-600 font-semibold">
            Safe Sequence: {safeSequence.join(" → ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default Bankers;
