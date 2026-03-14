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

// ── Worked example data ───────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Basic",
    head: 50,
    requests: [55, 58, 39, 18, 90, 160, 150, 38, 184],
    explanation: [
      "Head starts at cylinder 50. Pending: [55, 58, 39, 18, 90, 160, 150, 38, 184].",
      "Closest to 50 → 55 (dist 5). Move to 55. Pending: [58, 39, 18, 90, 160, 150, 38, 184].",
      "Closest to 55 → 58 (dist 3). Move to 58. Pending: [39, 18, 90, 160, 150, 38, 184].",
      "Closest to 58 → 39 (dist 19) vs 90 (dist 32). Move to 39. Pending: [18, 90, 160, 150, 38, 184].",
      "Closest to 39 → 38 (dist 1). Move to 38. Pending: [18, 90, 160, 150, 184].",
      "Closest to 38 → 18 (dist 20). Move to 18. Pending: [90, 160, 150, 184].",
      "Closest to 18 → 90 (dist 72). Move to 90. Pending: [160, 150, 184].",
      "Closest to 90 → 150 (dist 60). Move to 150. Pending: [160, 184].",
      "Closest to 150 → 160 (dist 10). Move to 160. Pending: [184].",
      "Only 184 left. Move to 184.",
      "Total Seek Distance = 5+3+19+1+20+72+60+10+24 = 214 cylinders.",
    ],
  },
  {
    title: "Example 2 — Head in the middle",
    head: 100,
    requests: [35, 180, 20, 140, 75, 10, 200],
    explanation: [
      "Head starts at 100. Pending: [35, 180, 20, 140, 75, 10, 200].",
      "Closest to 100 → 140 (dist 40). Move to 140.",
      "Closest to 140 → 180 (dist 40). Move to 180.",
      "Closest to 180 → 200 (dist 20). Move to 200.",
      "Closest to 200 → 75 (dist 125) vs 35 (dist 165). Move to 75.",
      "Closest to 75 → 35 (dist 40). Move to 35.",
      "Closest to 35 → 20 (dist 15). Move to 20.",
      "Only 10 left. Move to 10.",
      "Total Seek Distance = 40+40+20+125+40+15+10 = 290 cylinders.",
    ],
  },
];

// ── SSTF algorithm (reusable) ─────────────────────────────────────────────────
function runSSTF(headPos, reqArr) {
  const seq = [headPos];
  let currentHead = headPos;
  const remaining = [...reqArr];
  while (remaining.length > 0) {
    let closestIdx = 0;
    let minDist = Math.abs(remaining[0] - currentHead);
    for (let i = 1; i < remaining.length; i++) {
      const d = Math.abs(remaining[i] - currentHead);
      if (d < minDist) { minDist = d; closestIdx = i; }
    }
    currentHead = remaining[closestIdx];
    seq.push(currentHead);
    remaining.splice(closestIdx, 1);
  }
  return seq;
}

// ── Section card ──────────────────────────────────────────────────────────────
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

// ── Seek path bar ─────────────────────────────────────────────────────────────
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
            <div key={i} style={{
              position: "absolute", top: "50%",
              left: `${left}%`, width: `${width}%`,
              height: 4, background: `hsl(${(i * 47) % 360}, 70%, 55%)`,
              transform: "translateY(-50%)", borderRadius: 2, opacity: 0.75,
            }} />
          );
        })}
        {sequence.map((pos, i) => (
          <div key={i} title={`Step ${i}: ${pos}`} style={{
            position: "absolute", top: "50%", left: `${pct(pos)}%`,
            transform: "translate(-50%, -50%)",
            width: i === 0 ? 14 : 10, height: i === 0 ? 14 : 10,
            borderRadius: "50%", background: i === 0 ? "#4f46e5" : "#10b981",
            border: "2px solid #fff", zIndex: 10,
          }} />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span>
      </div>
    </div>
  );
}

// ── Step table ────────────────────────────────────────────────────────────────
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

// ── Greedy selection visualiser (shows which request was picked and why) ───────
function GreedyTable({ head, requests }) {
  if (!requests || requests.length === 0) return null;
  const steps = [];
  let currentHead = head;
  const remaining = [...requests];
  while (remaining.length > 0) {
    const distances = remaining.map((r) => ({ cylinder: r, dist: Math.abs(r - currentHead) }));
    distances.sort((a, b) => a.dist - b.dist);
    const chosen = distances[0];
    steps.push({ from: currentHead, chosen: chosen.cylinder, dist: chosen.dist, distances });
    currentHead = chosen.cylinder;
    remaining.splice(remaining.indexOf(chosen.cylinder), 1);
  }
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2">Greedy Selection at Each Step:</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Step</th>
            <th className="px-4 py-2">Head At</th>
            <th className="px-4 py-2">Chosen (closest)</th>
            <th className="px-4 py-2">Distance</th>
            <th className="px-4 py-2">Others (farther)</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 font-semibold text-indigo-600">{i + 1}</td>
              <td className="px-4 py-2">{s.from}</td>
              <td className="px-4 py-2">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                  {s.chosen} (dist {s.dist})
                </span>
              </td>
              <td className="px-4 py-2 font-semibold">{s.dist}</td>
              <td className="px-4 py-2 text-gray-500 text-xs">
                {s.distances.slice(1).map((d) => `${d.cylinder}(${d.dist})`).join(", ") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const sequence = runSSTF(ex.head, ex.requests);
  const data = sequence.map((pos, idx) => ({ name: `S${idx}`, position: pos }));
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
          Head: {ex.head}
        </span>
        {ex.requests.map((r, i) => (
          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">{r}</span>
        ))}
      </div>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
        {ex.explanation.map((line, i) => <li key={i}>{line}</li>)}
      </ol>
      <div className="h-52 bg-white border border-gray-200 rounded-lg p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /><YAxis />
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
const SSTF = () => {
  const [requests, setRequests] = useState("");
  const [head, setHead]         = useState("");
  const [sequence, setSequence] = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateSSTF = () => {
    if (!requests || !head) {
      setError("Please enter all fields.");
      setSequence([]);
      return;
    }
    setError("");
    const headPos = parseInt(head);
    const reqArr  = requests.split(",").map((v) => parseInt(v.trim())).filter((v) => !isNaN(v));
    if (reqArr.length === 0) {
      setError("Please enter valid comma-separated requests.");
      return;
    }
    setRawRequests(reqArr);
    setSequence(runSSTF(headPos, reqArr));
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">SSTF Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Shortest Seek Time First — always serves the closest pending request.
        Learn how it works, study worked examples, then try it yourself.
      </p>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 bg-white border border-gray-300 rounded-lg p-1 w-full max-w-4xl">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 rounded-md font-semibold text-sm transition ${
              activeTab === t.key ? "bg-indigo-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ THEORY ══ */}
      {activeTab === "theory" && (
        <>
          <Section title="What is SSTF Disk Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">SSTF (Shortest Seek Time First)</span> is
              a disk scheduling algorithm that always serves the{" "}
              <span className="font-semibold">pending request closest to the current head position</span>,
              regardless of the order in which requests arrived.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of it like a taxi driver who always picks up the nearest waiting passenger
              instead of going in order of who called first.
            </p>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Start at the initial head position.", d: "Record this as the first point in your sequence." },
                { n: 2, t: "Scan all pending requests.", d: "Calculate |current head − each request| to find the seek distance to each." },
                { n: 3, t: "Pick the request with the minimum seek distance.", d: "If two are tied, pick either (usually the lower cylinder by convention)." },
                { n: 4, t: "Move the head to that request.", d: "Add the seek distance to your total. Update the head position." },
                { n: 5, t: "Remove the served request from the queue.", d: "It is now complete." },
                { n: 6, t: "Repeat from step 2 until all requests are served.", d: "Total Seek Distance = Σ of all individual moves." },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex gap-3 items-start">
                  <span className="bg-indigo-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shrink-0">{n}</span>
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
                At each step: choose min( | head − requestᵢ | ) for all remaining requestᵢ
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Seek Distance = Σ | position(i+1) − position(i) | following greedy selection.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
              <p className="font-bold text-blue-700 mb-2">🔍 Why "Greedy"?</p>
              <p className="text-gray-700">
                SSTF makes the <span className="font-semibold">locally optimal choice</span> at every
                step — always the nearest request — without considering the global picture. This is
                the definition of a greedy algorithm. It often performs well, but is not guaranteed
                to give the globally minimum total seek distance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Much better seek time than FIFO/LIFO</li>
                  <li>Higher throughput under heavy load</li>
                  <li>Natural and intuitive greedy approach</li>
                  <li>Easy to implement</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Starvation — far requests may never be served</li>
                  <li>Not globally optimal (greedy, not perfect)</li>
                  <li>Higher variance in response time</li>
                  <li>Overhead of scanning all requests each step</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="The Starvation Problem">
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-bold text-yellow-700 mb-2">⚠️ Critical Drawback — Starvation</p>
              <p className="mb-2">
                If requests keep arriving near the current head position, a distant request may
                be skipped indefinitely. The head keeps choosing nearby requests, and the far
                cylinder is never reached — this is <span className="font-semibold text-red-600">starvation</span>.
              </p>
              <p>
                Example: Head is at cylinder 90. Requests at 88, 92, 87, 93 keep arriving.
                A request at cylinder 10 will starve because the head never travels that far.
              </p>
            </div>
          </Section>

          <Section title="SSTF vs FIFO — A Concrete Comparison">
            <p className="text-sm text-gray-600 mb-3">
              Same input: Head = 50, Requests = [55, 58, 39, 18, 90, 160, 150, 38, 184]
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Service Order</th>
                    <th className="px-4 py-2">Total Seek Distance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-2 text-gray-700 font-semibold">FIFO</td>
                    <td className="px-4 py-2 text-gray-600 text-xs">50→55→58→39→18→90→160→150→38→184</td>
                    <td className="px-4 py-2 font-bold text-red-600">458</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 text-indigo-600 font-semibold">SSTF</td>
                    <td className="px-4 py-2 text-gray-600 text-xs">50→55→58→39→38→18→90→150→160→184</td>
                    <td className="px-4 py-2 font-bold text-green-600">214</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">SSTF reduces seek distance by over 50% on this input.</p>
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
                    ["FIFO / FCFS", "Arrival order",      "Poor",      "No" ],
                    ["LIFO",        "Reverse arrival",     "Poor",      "Yes"],
                    ["SSTF",        "Nearest first",       "Good",      "Yes"],
                    ["SCAN",        "Back and forth",      "Better",    "No" ],
                    ["C-SCAN",      "One direction only",  "Better",    "No" ],
                  ].map(([alg, ord, perf, starv], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "SSTF" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
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
                "✅ First position = initial head position.",
                "✅ At every step, the chosen request must be the one with the smallest |head − request| among all remaining requests.",
                "✅ After serving a request, it is removed — it cannot appear again.",
                "✅ Each distance = |next − current|. Always absolute value.",
                "✅ Total = sum of all individual step distances.",
                "✅ If two requests are equidistant, either is valid — note which tie-breaking rule was used.",
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
            <p>Each example shows the arrival queue (blue badges), a step-by-step greedy selection
               walkthrough, a line chart of head movement, a seek-path bar, and a full distance
               table. Pay attention to <span className="font-semibold">which request is closest at each step</span> — that is the core of SSTF.</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>Enter your disk request queue and head position. The simulator will apply SSTF greedy
               selection and show the full greedy decision table, chart, seek-path bar, and distance
               table so you can trace every step.</p>
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
            onClick={simulateSSTF}
              className="w-full bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-bold text-lg transition mb-6"
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
                    <XAxis dataKey="name" /><YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="position" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Request sequence badges */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-2">Service Sequence (SSTF order):</p>
                <div className="flex gap-2 flex-wrap">
                  {sequence.map((pos, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
                      {pos}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seek bar */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <SeekBar sequence={sequence} />
              </div>

              {/* Greedy decision table */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <GreedyTable head={parseInt(head)} requests={rawRequests} />
              </div>

              {/* Step distance table */}
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

export default SSTF;