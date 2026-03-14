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

// ── Example scenarios ──────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Basic Sequential Requests",
    head: 50,
    requests: [55, 58, 39, 18, 90, 160, 150, 38, 184],
    explanation: [
      "Head starts at cylinder 50.",
      "Serve requests in arrival order: 55 → 58 → 39 → 18 → 90 → 160 → 150 → 38 → 184.",
      "Step 1: Move from 50 to 55 = |55-50| = 5 cylinders",
      "Step 2: Move from 55 to 58 = |58-55| = 3 cylinders",
      "Step 3: Move from 58 to 39 = |39-58| = 19 cylinders",
      "Step 4: Move from 39 to 18 = |18-39| = 21 cylinders",
      "Step 5: Move from 18 to 90 = |90-18| = 72 cylinders",
      "Step 6: Move from 90 to 160 = |160-90| = 70 cylinders",
      "Step 7: Move from 160 to 150 = |150-160| = 10 cylinders",
      "Step 8: Move from 150 to 38 = |38-150| = 112 cylinders",
      "Step 9: Move from 38 to 184 = |184-38| = 146 cylinders",
      "Total Seek Distance = 5+3+19+21+72+70+10+112+146 = 458 cylinders.",
    ],
  },
  {
    title: "Example 2 — Head in the Middle",
    head: 100,
    requests: [35, 180, 20, 140, 75, 10, 200],
    explanation: [
      "Head starts at cylinder 100 (middle position).",
      "Serve requests in arrival order: 35 → 180 → 20 → 140 → 75 → 10 → 200.",
      "Step 1: Move from 100 to 35 = |35-100| = 65 cylinders",
      "Step 2: Move from 35 to 180 = |180-35| = 145 cylinders",
      "Step 3: Move from 180 to 20 = |20-180| = 160 cylinders",
      "Step 4: Move from 20 to 140 = |140-20| = 120 cylinders",
      "Step 5: Move from 140 to 75 = |75-140| = 65 cylinders",
      "Step 6: Move from 75 to 10 = |10-75| = 65 cylinders",
      "Step 7: Move from 10 to 200 = |200-10| = 190 cylinders",
      "Total Seek Distance = 65+145+160+120+65+65+190 = 810 cylinders.",
      "Notice: Large jumps cause high seek distance. FIFO doesn't optimize movement.",
    ],
  },
  {
    title: "Example 3 — Clustered Requests",
    head: 0,
    requests: [10, 12, 8, 15, 200, 205, 198, 210],
    explanation: [
      "Head starts at cylinder 0.",
      "Requests are clustered: first group near 10, second group near 200.",
      "Serve in arrival order: 10 → 12 → 8 → 15 → 200 → 205 → 198 → 210.",
      "Step 1: Move from 0 to 10 = 10 cylinders",
      "Step 2: Move from 10 to 12 = 2 cylinders",
      "Step 3: Move from 12 to 8 = 4 cylinders",
      "Step 4: Move from 8 to 15 = 7 cylinders",
      "Step 5: Move from 15 to 200 = 185 cylinders (big jump!)",
      "Step 6: Move from 200 to 205 = 5 cylinders",
      "Step 7: Move from 205 to 198 = 7 cylinders",
      "Step 8: Move from 198 to 210 = 12 cylinders",
      "Total Seek Distance = 10+2+4+7+185+5+7+12 = 232 cylinders.",
      "Key lesson: FIFO causes unnecessary jumps between clusters.",
    ],
  },
  {
    title: "Example 4 — Sorted vs FIFO Comparison",
    head: 50,
    requests: [100, 20, 80, 40, 120],
    explanation: [
      "Head starts at cylinder 50.",
      "Requests arrive in order: 100 → 20 → 80 → 40 → 120",
      "With FIFO (no reordering): 100 → 20 → 80 → 40 → 120",
      "Step 1: 50 to 100 = 50 cylinders",
      "Step 2: 100 to 20 = 80 cylinders (big jump!)",
      "Step 3: 20 to 80 = 60 cylinders",
      "Step 4: 80 to 40 = 40 cylinders",
      "Step 5: 40 to 120 = 80 cylinders",
      "FIFO Total = 50+80+60+40+80 = 310 cylinders",
      "If sorted (20,40,50,80,100,120): Total would be ~70 cylinders",
      "FIFO is 4x worse! This shows why optimization matters.",
    ],
  },
  {
    title: "Example 5 — Light Workload",
    head: 75,
    requests: [80, 85, 90],
    explanation: [
      "Head starts at cylinder 75.",
      "Only 3 requests nearby: 80 → 85 → 90 (all close together).",
      "Step 1: 75 to 80 = 5 cylinders",
      "Step 2: 80 to 85 = 5 cylinders",
      "Step 3: 85 to 90 = 5 cylinders",
      "Total Seek Distance = 5+5+5 = 15 cylinders",
      "When requests are naturally nearby, FIFO performs well!",
      "This is why FIFO works okay for light workloads or geographically clustered data.",
      "Performance depends heavily on request distribution.",
    ],
  },
];

// ── Reusable Section component ────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-300 p-6 mb-6">
      <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Seek Bar Visualization ────────────────────────────────────────────────
function SeekBar({ sequence }) {
  if (sequence.length < 2) return null;
  const max = Math.max(...sequence, 200);
  const pct = (v) => (v / max) * 100;

  return (
    <div className="mt-4">
      <p className="font-semibold mb-3 text-gray-700">Seek Path Visualisation:</p>
      <div className="relative h-10 bg-gray-100 rounded-lg border border-gray-300">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2" />
        {sequence.slice(1).map((pos, i) => {
          const from = pct(sequence[i]);
          const to = pct(pos);
          const left = Math.min(from, to);
          const width = Math.abs(to - from);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: `${left}%`,
                width: `${width}%`,
                height: 4,
                background: `hsl(${(i * 47) % 360}, 70%, 55%)`,
                transform: "translateY(-50%)",
                borderRadius: 2,
                opacity: 0.75,
              }}
            />
          );
        })}
        {sequence.map((pos, i) => (
          <div
            key={i}
            title={`Step ${i}: ${pos}`}
            style={{
              position: "absolute",
              top: "50%",
              left: `${pct(pos)}%`,
              transform: "translate(-50%, -50%)",
              width: i === 0 ? 14 : 10,
              height: i === 0 ? 14 : 10,
              borderRadius: "50%",
              background: i === 0 ? "#4f46e5" : "#10b981",
              border: "2px solid #fff",
              zIndex: 10,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>0</span>
        <span>{Math.round(max / 2)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ── Step Table ────────────────────────────────────────────────────────────
function StepTable({ sequence }) {
  if (sequence.length < 2) return null;
  let running = 0;
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2 text-gray-700">Step-by-step Seek Distances:</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Step</th>
            <th className="px-4 py-2">From</th>
            <th className="px-4 py-2">To</th>
            <th className="px-4 py-2">Distance</th>
          </tr>
        </thead>
        <tbody>
          {sequence.slice(1).map((pos, i) => {
            const dist = Math.abs(pos - sequence[i]);
            running += dist;
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 font-semibold text-indigo-600">{i + 1}</td>
                <td className="px-4 py-2 text-gray-700">{sequence[i]}</td>
                <td className="px-4 py-2 text-gray-700">{pos}</td>
                <td className="px-4 py-2 font-semibold text-indigo-700">{dist}</td>
              </tr>
            );
          })}
          <tr className="bg-indigo-50 font-bold">
            <td className="px-4 py-2" colSpan={3}>
              Total Seek Distance
            </td>
            <td className="px-4 py-2 text-indigo-700">{running}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Worked Example Block ──────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const sequence = [ex.head, ...ex.requests];
  const data = sequence.map((pos, idx) => ({ name: `S${idx}`, position: pos }));

  // Calculate total seek distance
  let totalSeek = 0;
  for (let i = 1; i < sequence.length; i++) {
    totalSeek += Math.abs(sequence[i] - sequence[i - 1]);
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>

      {/* Request badges */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
          Head: {ex.head}
        </span>
        {ex.requests.map((r, i) => (
          <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold text-sm">
            {r}
          </span>
        ))}
      </div>

      {/* Explanation */}
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
        {ex.explanation.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Initial Head Position</p>
          <p className="font-bold text-indigo-600">{ex.head}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Total Seek Distance</p>
          <p className="font-bold text-indigo-600">{totalSeek}</p>
        </div>
      </div>

      {/* Line chart */}
      <div className="h-52 bg-white border border-gray-200 rounded-lg p-3 mb-4">
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
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Seek bar */}
      <SeekBar sequence={sequence} />

      {/* Step table */}
      <StepTable sequence={sequence} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
const FIFO = () => {
  const [requests, setRequests] = useState("");
  const [head, setHead] = useState("");
  const [sequence, setSequence] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateFIFO = () => {
    // Validation
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

    if (reqArr.length === 0) {
      setError("Please enter valid comma-separated requests.");
      setSequence([]);
      return;
    }

    if (isNaN(headPos)) {
      setError("Initial head position must be a valid number.");
      setSequence([]);
      return;
    }

    setSequence([headPos, ...reqArr]);
  };

  const resetSimulation = () => {
    setRequests("");
    setHead("");
    setSequence([]);
    setError("");
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  // Calculate total seek distance
  let totalSeek = 0;
  for (let i = 1; i < sequence.length; i++) {
    totalSeek += Math.abs(sequence[i] - sequence[i - 1]);
  }

  const tabs = [
    { key: "theory", label: "📖 Theory" },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "✏️ Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">FIFO Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        First In, First Out — the simplest disk scheduling algorithm. Learn how it works, study
        worked examples, then try it yourself.
      </p>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 bg-white border border-gray-300 rounded-lg p-1 w-full max-w-4xl">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 rounded-md font-semibold text-sm transition ${
              activeTab === t.key
                ? "bg-indigo-500 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ THEORY ══ */}
      {activeTab === "theory" && (
        <>
          <Section title="What is FIFO Disk Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">FIFO (First In, First Out)</span>, also
              called <span className="font-bold">FCFS (First Come, First Served)</span>, is the
              simplest disk scheduling algorithm. The disk head services requests{" "}
              <span className="font-semibold">in the exact order they arrive</span> — no
              reordering, no optimization.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of it like a queue at a ticket counter: whoever arrived first gets served first,
              regardless of where they are in the room.
            </p>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "Record the head start position.",
                  d: "This is where the disk arm currently sits (e.g., cylinder 50).",
                },
                {
                  n: 2,
                  t: "Take the request queue as-is.",
                  d: "No sorting. The order of arrival is the order of service.",
                },
                {
                  n: 3,
                  t: "Move the head to the first request.",
                  d: "Seek distance = |current − next|.",
                },
                {
                  n: 4,
                  t: "Repeat for every remaining request.",
                  d: "Always move to the next request in queue order.",
                },
                {
                  n: 5,
                  t: "Sum all individual distances.",
                  d: "Total Seek Distance = Σ |position(i+1) − position(i)|.",
                },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex gap-3 items-start">
                  <span className="bg-indigo-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shrink-0">
                    {n}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">{t}</span>{" "}
                    <span className="text-gray-600 text-sm">{d}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Key Formula">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center mb-4">
              <p className="text-lg font-bold text-indigo-700">
                Total Seek Distance = Σ | position(i+1) − position(i) |
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Sum of absolute differences between consecutive positions in arrival order.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Extremely simple to implement</li>
                  <li>Fair — no request is ever starved</li>
                  <li>No extra computation or sorting needed</li>
                  <li>Predictable and easy to reason about</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>High seek time — head may oscillate wildly</li>
                  <li>Not optimal — ignores disk geometry</li>
                  <li>Poor throughput under heavy load</li>
                  <li>Does not minimise total head movement</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="When is FIFO Used?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  icon: "🖥️",
                  title: "Simple systems",
                  desc: "Embedded or low-complexity OS where simplicity beats performance.",
                },
                {
                  icon: "📉",
                  title: "Light workloads",
                  desc: "When requests are infrequent, seek overhead is less critical.",
                },
                {
                  icon: "⚖️",
                  title: "Fairness required",
                  desc: "When every request must be guaranteed service in arrival order.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="font-bold text-gray-800 mb-1">{title}</p>
                  <p className="text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Comparison with Other Algorithms">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Order of Service</th>
                    <th className="px-4 py-2">Seek Performance</th>
                    <th className="px-4 py-2">Starvation?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO / FCFS", "Arrival order", "Poor", "No"],
                    ["SSTF", "Shortest seek first", "Good", "Yes"],
                    ["SCAN", "Back and forth", "Better", "No"],
                    ["C-SCAN", "One direction only", "Better", "No"],
                  ].map(([alg, ord, perf, starv], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          alg.startsWith("FIFO") ? "text-indigo-600" : "text-gray-700"
                        }`}
                      >
                        {alg}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{ord}</td>
                      <td className="px-4 py-2 text-gray-600">{perf}</td>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          starv === "Yes" ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {starv}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Quick Verification Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ The first position in the sequence must equal the initial head position.",
                "✅ Every subsequent position must match the requests in their original arrival order.",
                "✅ Each distance = |next − current|. No negatives — always absolute value.",
                "✅ Total = sum of all individual step distances.",
                "✅ There are no idle slots — FIFO always has the next request ready.",
              ].map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ══ EXAMPLES ══ */}
      {activeTab === "examples" && (
        <div className="w-full max-w-4xl">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">💡 How to read these examples</p>
            <p>
              Each example shows the head start position, the request queue in arrival order, a
              step-by-step breakdown, a line chart of head movement, a seek-path bar, and a full
              distance table. Follow along before trying the simulator.
            </p>
          </div>
          {EXAMPLES.map((ex, i) => (
            <WorkedExample key={i} ex={ex} />
          ))}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-blue-50 border border-blue-300 rounded-xl p-4 mb-6">
            <p className="text-blue-700 font-bold mb-1">✏️ Try it yourself</p>
            <p className="text-blue-700">
              Enter your own disk request queue and initial head position, then click Simulate to
              see FIFO scheduling in action with a chart, seek-path bar, and distance table.
            </p>
          </div>

          {/* Input Form Component */}
          <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-300 p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Define Your Disk Request Queue</h3>

            {/* Input Fields */}
            <div className="space-y-6">
              {/* Head Position Input */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Initial Head Position
                </label>
                <input
                  type="number"
                  value={head}
                  onChange={(e) => setHead(e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Requests Input */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Disk Requests (comma separated)
                </label>
                <input
                  type="text"
                  value={requests}
                  onChange={(e) => setRequests(e.target.value)}
                  placeholder="e.g., 55, 58, 39, 18, 90, 160, 150, 38, 184"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetSimulation}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Simulate Button */}
          <button
            onClick={simulateFIFO}
            className="w-full max-w-4xl bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 font-bold text-lg transition mb-6"
          >
            Simulate
          </button>

          {/* Error Message */}
          {error && (
            <p className="w-full max-w-4xl text-red-600 font-semibold bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
              {error}
            </p>
          )}

          {/* Results */}
          {sequence.length > 0 && (
            <div className="w-full max-w-4xl space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm font-semibold">Initial Head</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">{sequence[0]}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm font-semibold">Total Requests</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">{sequence.length - 1}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm font-semibold">Total Seek Distance</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">{totalSeek}</p>
                </div>
              </div>

              {/* Line Chart */}
              <div className="bg-white p-4 rounded-lg border border-gray-300 h-80">
                <p className="font-semibold mb-2 text-gray-700">Disk Head Movement:</p>
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

              {/* Request Sequence Badges */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-3 text-gray-700">Request Sequence:</p>
                <div className="flex gap-2 flex-wrap">
                  {sequence.map((pos, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm ${
                        idx === 0
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {idx === 0 ? `Head: ${pos}` : pos}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seek Bar */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <SeekBar sequence={sequence} />
              </div>

              {/* Step Table */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <StepTable sequence={sequence} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FIFO;