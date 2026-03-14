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
    title: "Example 1 — Basic Greedy Selection",
    head: 50,
    requests: [55, 58, 39, 18, 90, 160, 150, 38, 184],
    explanation: [
      "Head starts at cylinder 50. All requests are pending: [55, 58, 39, 18, 90, 160, 150, 38, 184].",
      "At 50: Closest is 55 (dist 5). Move to 55. Remaining: [58, 39, 18, 90, 160, 150, 38, 184].",
      "At 55: Closest is 58 (dist 3). Move to 58. Remaining: [39, 18, 90, 160, 150, 38, 184].",
      "At 58: Closest is 39 (dist 19) vs 90 (dist 32). Choose 39. Remaining: [18, 90, 160, 150, 38, 184].",
      "At 39: Closest is 38 (dist 1). Move to 38. Remaining: [18, 90, 160, 150, 184].",
      "At 38: Closest is 18 (dist 20). Move to 18. Remaining: [90, 160, 150, 184].",
      "At 18: Closest is 90 (dist 72). Move to 90. Remaining: [160, 150, 184].",
      "At 90: Closest is 150 (dist 60). Move to 150. Remaining: [160, 184].",
      "At 150: Closest is 160 (dist 10). Move to 160. Remaining: [184].",
      "At 160: Only 184 left. Move to 184.",
      "Total Seek Distance = 5+3+19+1+20+72+60+10+24 = 214 cylinders.",
      "Compare to FIFO (458): SSTF is 53% better! Greedy approach works well here.",
    ],
  },
  {
    title: "Example 2 — Head in the Middle",
    head: 100,
    requests: [35, 180, 20, 140, 75, 10, 200],
    explanation: [
      "Head starts at 100. Pending requests: [35, 180, 20, 140, 75, 10, 200].",
      "At 100: Closest is 140 (dist 40) vs 75 (dist 25). Choose 75. Wait... recalculate: 75 is 25, 140 is 40, 180 is 80, 35 is 65, 20 is 80, 10 is 90, 200 is 100. Closest is 75 (dist 25).",
      "Actually: Let's recalculate at 100: |100-35|=65, |100-180|=80, |100-20|=80, |100-140|=40, |100-75|=25, |100-10|=90, |100-200|=100. Closest is 75.",
      "At 100: Closest is 75 (dist 25). Move to 75. Remaining: [35, 180, 20, 140, 10, 200].",
      "At 75: Closest is 35 (dist 40) vs 20 (dist 55). Choose 35. Remaining: [180, 20, 140, 10, 200].",
      "At 35: Closest is 20 (dist 15). Move to 20. Remaining: [180, 140, 10, 200].",
      "At 20: Closest is 10 (dist 10). Move to 10. Remaining: [180, 140, 200].",
      "At 10: Closest is 140 (dist 130). Move to 140. Remaining: [180, 200].",
      "At 140: Closest is 180 (dist 40). Move to 180. Remaining: [200].",
      "At 180: Only 200 left. Move to 200.",
      "Total Seek Distance = 25+40+15+10+130+40+20 = 280 cylinders.",
      "Compare to FIFO (515): SSTF saves 235 cylinders (45% better)!",
    ],
  },
  {
    title: "Example 3 — Clustered Requests (No Starvation Here)",
    head: 50,
    requests: [10, 15, 20, 25, 30],
    explanation: [
      "Head starts at 50. All requests are close together, below the head: [10, 15, 20, 25, 30].",
      "At 50: Closest is 30 (dist 20). Move to 30. Remaining: [10, 15, 20, 25].",
      "At 30: Closest is 25 (dist 5). Move to 25. Remaining: [10, 15, 20].",
      "At 25: Closest is 20 (dist 5). Move to 20. Remaining: [10, 15].",
      "At 20: Closest is 15 (dist 5). Move to 15. Remaining: [10].",
      "At 15: Only 10 left. Move to 10.",
      "Total Seek Distance = 20+5+5+5+5 = 40 cylinders.",
      "Key observation: All requests get served! When requests are clustered, SSTF works great.",
      "No starvation occurs because the cluster is small and naturally exhausted.",
      "SSTF is efficient with clusters because it follows them smoothly (20→25→30 then back down).",
    ],
  },
  {
    title: "Example 4 — Starvation Risk (Far Request Ignored)",
    head: 100,
    requests: [98, 102, 99, 101, 103, 200],
    explanation: [
      "Head starts at 100. Requests: [98, 102, 99, 101, 103, 200].",
      "At 100: Closest is 98 (dist 2) vs 102 (dist 2) — choose 98. Remaining: [102, 99, 101, 103, 200].",
      "At 98: Closest is 99 (dist 1). Move to 99. Remaining: [102, 101, 103, 200].",
      "At 99: Closest is 101 (dist 2) vs 102 (dist 3). Choose 101. Remaining: [102, 103, 200].",
      "At 101: Closest is 102 (dist 1). Move to 102. Remaining: [103, 200].",
      "At 102: Closest is 103 (dist 1). Move to 103. Remaining: [200].",
      "At 103: Finally move to 200 (dist 97).",
      "Total Seek Distance = 2+1+2+1+1+97 = 104 cylinders.",
      "Notice: Cylinder 200 was kept waiting while the head bounced around 98-103.",
      "This shows SSTF's STARVATION PROBLEM: far requests wait while nearby ones are served.",
      "If new requests kept arriving near 100, cylinder 200 could wait forever!",
    ],
  },
  {
    title: "Example 5 — Alternating High and Low (No Oscillation)",
    head: 50,
    requests: [10, 100, 20, 90, 30],
    explanation: [
      "Head starts at 50. Alternating requests: [10, 100, 20, 90, 30].",
      "At 50: Closest is 20 (dist 30) vs 10 (dist 40) vs 100 (dist 50) vs 90 (dist 40) vs 30 (dist 20). Choose 30.",
      "At 30: Closest is 20 (dist 10) vs 10 (dist 20) vs 100 (dist 70) vs 90 (dist 60). Choose 20.",
      "At 20: Closest is 10 (dist 10) vs 100 (dist 80) vs 90 (dist 70). Choose 10.",
      "At 10: Closest is 90 (dist 80) vs 100 (dist 90). Choose 90.",
      "At 90: Only 100 left. Move to 100.",
      "Total Seek Distance = 20+10+10+80+10 = 130 cylinders.",
      "Notice: The head doesn't oscillate wildly like FIFO would (50→10→100→20→90→30).",
      "Instead, SSTF exhausts one side first (30→20→10) then goes to the other (90→100).",
      "This greedy approach naturally clusters nearby requests together.",
      "Much better than arrival order or random order!",
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
      <p className="font-semibold mb-3 text-gray-700">Seek Path Visualisation:</p>
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
      <p className="font-semibold mb-2 text-gray-700">Greedy Selection at Each Step:</p>
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
                  {s.chosen} ({s.dist})
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
          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold text-xs">
            {r}
          </span>
        ))}
      </div>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
        {ex.explanation.map((line, i) => <li key={i}>{line}</li>)}
      </ol>
      <div className="h-52 bg-white border border-gray-200 rounded-lg p-3 mb-4">
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

  const resetSimulation = () => {
    setRequests("");
    setHead("");
    setSequence([]);
    setRawRequests([]);
    setError("");
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  // Calculate total seek distance
  let totalSeek = 0;
  for (let i = 1; i < sequence.length; i++) {
    totalSeek += Math.abs(sequence[i] - sequence[i - 1]);
  }

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "✏️ Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">SSTF Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Shortest Seek Time First — greedy algorithm that always serves the closest request.
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
              regardless of arrival order. It uses a <span className="font-bold">greedy approach</span> — making
              the locally best choice at each step.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of it like a taxi driver who always picks up the nearest waiting passenger,
              even if others arrived first.
            </p>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Start at the initial head position.", d: "Record this as your starting point." },
                { n: 2, t: "Calculate distance to every pending request.", d: "Distance = |current head − request cylinder|." },
                { n: 3, t: "Pick the request with minimum distance.", d: "This is the greedy choice — the nearest one wins." },
                { n: 4, t: "Move the head to that request.", d: "Add the seek distance to your total." },
                { n: 5, t: "Remove the served request from the queue.", d: "It is now done and will not be selected again." },
                { n: 6, t: "Repeat until all requests are served.", d: "Total Seek Distance = sum of all individual moves." },
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

          <Section title="Key Formula & Greedy Rule">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center mb-4">
              <p className="text-lg font-bold text-indigo-700">
                At each step: choose min( | head − requestᵢ | ) for all remaining requests
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Seek Distance = Σ | position(i+1) − position(i) | following greedy selection.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
              <p className="font-bold text-blue-700 mb-2">🔍 What is a Greedy Algorithm?</p>
              <p className="text-gray-700">
                Greedy means making the <span className="font-semibold">locally optimal choice</span> at every
                step — the nearest request right now. It does not think about the future or global picture.
                Often this works well, but it is <span className="font-semibold">not guaranteed to be globally optimal</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Much better seek distance than FIFO (often 50%+ improvement)</li>
                  <li>Higher throughput under heavy load</li>
                  <li>Natural and intuitive greedy approach</li>
                  <li>Easy to implement and understand</li>
                  <li>Works very well with clustered requests</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Starvation — far requests may never be served</li>
                  <li>Not globally optimal (greedy, not perfect)</li>
                  <li>Uneven wait times (some requests wait much longer)</li>
                  <li>Overhead of scanning all requests each step</li>
                  <li>Can be unfair in continuous arrival scenarios</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="The Starvation Problem">
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-bold text-red-700 mb-2">⚠️ STARVATION — Far Requests Get Stuck!</p>
              <p className="mb-3">
                If requests keep arriving near the current head position, a distant request may be 
                skipped indefinitely. The head keeps choosing nearby requests, and the far cylinder 
                is never reached.
              </p>
              <p className="mb-2">
                <span className="font-bold">Real example:</span> Head is at cylinder 90. Requests at 88, 92, 87, 93 keep arriving.
                A request at cylinder 10 will <span className="font-bold text-red-600">starve</span> because SSTF always picks from the
                nearby cluster.
              </p>
              <p>
                This is why SSTF works well in controlled lab environments but can be unfair
                in real systems with continuous request streams.
              </p>
            </div>
          </Section>

          <Section title="SSTF vs FIFO — Real Numbers">
            <p className="text-sm text-gray-600 mb-3">
              Same input: Head = 50, Requests = [55, 58, 39, 18, 90, 160, 150, 38, 184]
            </p>
            <div className="overflow-x-auto mb-4">
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
                    <td className="px-4 py-2 font-bold text-red-600">458 ❌</td>
                  </tr>
                  <tr className="bg-indigo-50">
                    <td className="px-4 py-2 text-indigo-600 font-semibold">SSTF</td>
                    <td className="px-4 py-2 text-gray-600 text-xs">50→55→58→39→38→18→90→150→160→184</td>
                    <td className="px-4 py-2 font-bold text-green-600">214 ✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-green-700 font-semibold">SSTF reduces seek distance by 53%! That is a huge improvement.</p>
          </Section>

          <Section title="Comparison with Other Algorithms">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Service Rule</th>
                    <th className="px-4 py-2">Seek Performance</th>
                    <th className="px-4 py-2">Starvation?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO",   "First arrived",  "Poor",    "No"],
                    ["LIFO",   "Last arrived",   "Poor",    "Yes"],
                    ["SSTF",   "Closest first",  "Good",    "Yes"],
                    ["SCAN",   "Back & forth",   "Better",  "No"],
                    ["LOOK",   "Smart sweep",    "Better",  "No"],
                  ].map(([alg, rule, perf, starv], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "SSTF" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className="px-4 py-2 text-gray-600">{rule}</td>
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
                "✅ At every step, the chosen request must be the one with the smallest distance to the current head.",
                "✅ After serving a request, it is removed and cannot appear again.",
                "✅ Each distance = |next − current|. Always absolute value (positive).",
                "✅ Total = sum of all individual step distances.",
                "✅ The service order depends on actual positions, not arrival order.",
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
            <p>Each example shows the request queue (blue badges), step-by-step greedy selection
               explaining which request is closest and why, a line chart of head movement, a
               seek-path bar, and a distance table. Pay close attention to which request wins at
               each step — that is the essence of SSTF.</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-blue-50 border border-blue-300 rounded-xl p-4 mb-6">
            <p className="text-blue-700 font-bold mb-1">✏️ Try it yourself</p>
            <p className="text-blue-700">
              Enter your disk request queue and head position. The simulator will apply SSTF
              greedy selection and show a greedy decision table explaining why each request was
              chosen, plus chart, seek-path bar, and distance table.
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
            onClick={simulateSSTF}
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
                    <XAxis dataKey="name" /><YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="position" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Request sequence badges */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-3 text-gray-700">Service Sequence (SSTF order):</p>
                <div className="flex gap-2 flex-wrap">
                  {sequence.map((pos, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-semibold text-sm">
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