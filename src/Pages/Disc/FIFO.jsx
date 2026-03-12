// FIFO.jsx
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


const EXAMPLES = [
  {
    title: "Example 1 — Basic",
    head: 50,
    requests: [55, 58, 39, 18, 90, 160, 150, 38, 184],
    explanation: [
      "Head starts at cylinder 50.",
      "Serve requests in arrival order: 55 → 58 → 39 → 18 → 90 → 160 → 150 → 38 → 184.",
      "Total Seek Distance = |55-50|+|58-55|+|39-58|+|18-39|+|90-18|+|160-90|+|150-160|+|38-150|+|184-38| = 5+3+19+21+72+70+10+112+146 = 458 cylinders.",
    ],
  },
  {
    title: "Example 2 — Head in the middle",
    head: 100,
    requests: [35, 180, 20, 140, 75, 10, 200],
    explanation: [
      "Head starts at cylinder 100.",
      "Serve requests in arrival order: 35 → 180 → 20 → 140 → 75 → 10 → 200.",
      "Total Seek Distance = |35-100|+|180-35|+|20-180|+|140-20|+|75-140|+|10-75|+|200-10| = 65+145+160+120+65+65+190 = 810 cylinders.",
    ],
  },
];


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

function SeekBar({ sequence }) {
  if (sequence.length < 2) return null;
  const max = Math.max(...sequence, 200);
  const pct = (v) => (v / max) * 100;

  return (
    <div className="mt-4">
      <p className="font-semibold mb-3">Seek Path Visualisation:</p>
      <div className="relative h-10 bg-gray-100 rounded-lg border border-gray-300">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2" />
        {sequence.slice(1).map((pos, i) => {
          const from  = pct(sequence[i]);
          const to    = pct(pos);
          const left  = Math.min(from, to);
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
              width:  i === 0 ? 14 : 10,
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


function StepTable({ sequence }) {
  if (sequence.length < 2) return null;
  let running = 0;
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2">Step-by-step Seek Distances:</p>
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
                <td className="px-4 py-2">{sequence[i]}</td>
                <td className="px-4 py-2">{pos}</td>
                <td className="px-4 py-2 font-semibold">{dist}</td>
              </tr>
            );
          })}
          <tr className="bg-indigo-50 font-bold">
            <td className="px-4 py-2" colSpan={3}>Total Seek Distance</td>
            <td className="px-4 py-2 text-indigo-700">{running}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const sequence = [ex.head, ...ex.requests];
  const data = sequence.map((pos, idx) => ({ name: `S${idx}`, position: pos }));
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
          Head: {ex.head}
        </span>
        {ex.requests.map((r, i) => (
          <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
            {r}
          </span>
        ))}
      </div>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
        {ex.explanation.map((line, i) => <li key={i}>{line}</li>)}
      </ol>
      <div className="h-52 bg-white border border-gray-200 rounded-lg p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="position" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SeekBar sequence={sequence} />
      <StepTable sequence={sequence} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const FIFO = () => {
  const [requests, setRequests] = useState("");
  const [head, setHead]         = useState("");
  const [sequence, setSequence] = useState([]);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateFIFO = () => {
    if (!requests || !head) {
      setError("Please enter all fields.");
      setSequence([]);
      return;
    }
    setError("");
    const headPos = parseInt(head);
    const reqArr  = requests
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    if (reqArr.length === 0) {
      setError("Please enter valid comma-separated requests.");
      return;
    }
    setSequence([headPos, ...reqArr]);
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">FIFO Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        First In, First Out — the simplest disk scheduling algorithm. Learn how it works,
        study worked examples, then try it yourself.
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
              reordering, no optimisation.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of it like a queue at a ticket counter: whoever arrived first gets served first,
              regardless of where they are in the room.
            </p>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Record the head start position.", d: "This is where the disk arm currently sits (e.g., cylinder 50)." },
                { n: 2, t: "Take the request queue as-is.", d: "No sorting. The order of arrival is the order of service." },
                { n: 3, t: "Move the head to the first request.", d: "Seek distance = |current − next|." },
                { n: 4, t: "Repeat for every remaining request.", d: "Always move to the next request in queue order." },
                { n: 5, t: "Sum all individual distances.", d: "Total Seek Distance = Σ |position(i+1) − position(i)|." },
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
                { icon: "🖥️", title: "Simple systems",   desc: "Embedded or low-complexity OS where simplicity beats performance." },
                { icon: "📉", title: "Light workloads",   desc: "When requests are infrequent, seek overhead is less critical." },
                { icon: "⚖️", title: "Fairness required", desc: "When every request must be guaranteed service in arrival order." },
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
                    ["FIFO / FCFS", "Arrival order",      "Poor",   "No" ],
                    ["SSTF",        "Shortest seek first", "Good",   "Yes"],
                    ["SCAN",        "Back and forth",      "Better", "No" ],
                    ["C-SCAN",      "One direction only",  "Better", "No" ],
                  ].map(([alg, ord, perf, starv], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg.startsWith("FIFO") ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className="px-4 py-2 text-gray-600">{ord}</td>
                      <td className="px-4 py-2 text-gray-600">{perf}</td>
                      <td className={`px-4 py-2 font-semibold ${starv === "Yes" ? "text-red-500" : "text-green-600"}`}>{starv}</td>
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
              ].map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </Section>
        </>
      )}

      {/* ══ EXAMPLES ══ */}
      {activeTab === "examples" && (
        <div className="w-full max-w-4xl">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">💡 How to read these examples</p>
            <p>Each example shows the head start position, the request queue in arrival order, a
               step-by-step breakdown, a line chart of head movement, a seek-path bar, and a full
               distance table. Follow along before trying the simulator.</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>Enter your own disk request queue and initial head position, then click Simulate
               to see FIFO scheduling in action with a chart, seek-path bar, and distance table.</p>
          </div>

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
            onClick={simulateFIFO}
            className="mb-6 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
          >
            Simulate
          </button>

          {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

          {sequence.length > 0 && (
            <div className="w-full max-w-4xl space-y-4">

              {/* Line chart */}
              <div className="bg-white p-4 rounded-lg border border-gray-300 h-80">
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

              {/* Request sequence badges */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
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

              {/* Seek bar */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <SeekBar sequence={sequence} />
              </div>

              {/* Step table */}
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