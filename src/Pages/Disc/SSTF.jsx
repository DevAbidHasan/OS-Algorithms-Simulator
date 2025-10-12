// SSTF.jsx
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SSTF = () => {
  const [requests, setRequests] = useState("");
  const [head, setHead] = useState("");
  const [sequence, setSequence] = useState([]);
  const [error, setError] = useState("");

  const simulateSSTF = () => {
    if (!requests || !head) {
      setError("Please enter all fields.");
      setSequence([]);
      return;
    }
    setError("");

    const headPos = parseInt(head);
    const reqArr = requests
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));

    const seq = [headPos];
    let currentHead = headPos;
    const remaining = [...reqArr];

    while (remaining.length > 0) {
      // Find request with minimum seek time
      let closestIdx = 0;
      let minDistance = Math.abs(remaining[0] - currentHead);

      for (let i = 1; i < remaining.length; i++) {
        const dist = Math.abs(remaining[i] - currentHead);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }

      currentHead = remaining[closestIdx];
      seq.push(currentHead);
      remaining.splice(closestIdx, 1);
    }

    setSequence(seq);
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">SSTF Disk Scheduling</h1>

      <div className="w-full max-w-2xl mb-4">
        <label className="block mb-2 font-semibold">Disk Requests (comma separated)</label>
        <input
          type="text"
          value={requests}
          onChange={(e) => setRequests(e.target.value)}
          placeholder="e.g., 55, 58, 39, 18, 90, 160, 150, 38, 184"
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />

        <label className="block mb-2 font-semibold">Initial Head Position</label>
        <input
          type="number"
          value={head}
          onChange={(e) => setHead(e.target.value)}
          placeholder="e.g., 50"
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={simulateSSTF}
        className="mb-6 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
      >
        Simulate
      </button>

      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      {sequence.length > 0 && (
        <div className="w-full max-w-4xl h-80 bg-white p-4 rounded-lg border border-gray-300">
          <p className="font-semibold mb-2">Disk Head Movement:</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="position"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {sequence.length > 0 && (
        <div className="mt-4 w-full max-w-4xl overflow-x-auto">
          <p className="font-semibold mb-2">Request Sequence:</p>
          <div className="flex gap-2 flex-wrap">
            {sequence.map((pos, idx) => (
              <span
                key={idx}
                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold"
              >
                {pos}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SSTF;
