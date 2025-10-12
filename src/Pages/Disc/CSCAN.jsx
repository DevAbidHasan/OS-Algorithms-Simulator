// CSCAN.jsx
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

const CSCAN = () => {
  const [requests, setRequests] = useState("");
  const [head, setHead] = useState("");
  const [diskSize, setDiskSize] = useState(""); // Max cylinder
  const [direction, setDirection] = useState("up"); // initial direction
  const [sequence, setSequence] = useState([]);
  const [error, setError] = useState("");

  const simulateCSCAN = () => {
    if (!requests || !head || !diskSize) {
      setError("Please enter all fields.");
      setSequence([]);
      return;
    }
    setError("");

    const headPos = parseInt(head);
    const maxDisk = parseInt(diskSize);
    const reqArr = requests
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b);

    let seq = [headPos];
    const left = reqArr.filter((r) => r < headPos);
    const right = reqArr.filter((r) => r >= headPos);

    if (direction === "up") {
      // move up
      seq.push(...right);
      seq.push(maxDisk); // move to end
      seq.push(0); // jump to start
      seq.push(...left);
    } else {
      // move down
      seq.push(...left.reverse());
      seq.push(0); // move to start
      seq.push(maxDisk); // jump to end
      seq.push(...right.reverse());
    }

    setSequence(seq);
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">CSCAN Disk Scheduling</h1>

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
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />

        <label className="block mb-2 font-semibold">Disk Size (Max Cylinder)</label>
        <input
          type="number"
          value={diskSize}
          onChange={(e) => setDiskSize(e.target.value)}
          placeholder="e.g., 199"
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />

        <label className="block mb-2 font-semibold">Initial Head Direction</label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="up">Up</option>
          <option value="down">Down</option>
        </select>
      </div>

      <button
        onClick={simulateCSCAN}
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

export default CSCAN;
