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

// ── Worked example data ───────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Moving Up",
    head: 50,
    requests: [55, 58, 39, 18, 90, 160, 150, 38, 184],
    diskSize: 199,
    direction: "up",
    explanation: [
      "Head starts at cylinder 50, moving UP. Disk size = 199.",
      "Split requests: LEFT of 50 → [18, 38, 39] | RIGHT of 50 → [55, 58, 90, 150, 160, 184].",
      "Step 1 — Move UP and serve all right-side requests in order: 55 → 58 → 90 → 150 → 160 → 184.",
      "Step 2 — Reach the disk end: → 199. (This is just a boundary visit, not a real request.)",
      "Step 3 — Jump back to cylinder 0 WITHOUT serving anything on the way. (This is the key C-SCAN rule — no service on the return jump.)",
      "Step 4 — Move UP again from 0 and serve left-side requests in order: 18 → 38 → 39.",
      "Total Seek Distance = |55-50|+|58-55|+|90-58|+|150-90|+|160-150|+|184-160|+|199-184|+|0-199|+|18-0|+|38-18|+|39-38| = 5+3+32+60+10+24+15+199+18+20+1 = 387 cylinders.",
    ],
  },
  {
    title: "Example 2 — Moving Down",
    head: 100,
    requests: [35, 180, 20, 140, 75, 10, 200],
    diskSize: 200,
    direction: "down",
    explanation: [
      "Head starts at cylinder 100, moving DOWN. Disk size = 200.",
      "Split requests: LEFT of 100 → [75, 35, 20, 10] | RIGHT of 100 → [140, 180, 200].",
      "Step 1 — Move DOWN and serve all left-side requests in descending order: 75 → 35 → 20 → 10.",
      "Step 2 — Reach the disk start: → 0. (Boundary visit only.)",
      "Step 3 — Jump to cylinder 200 WITHOUT serving anything. (C-SCAN rule — no service on the jump.)",
      "Step 4 — Move DOWN again from 200 and serve right-side requests in descending order: 200 → 180 → 140.",
      "Total Seek Distance = |75-100|+|35-75|+|20-35|+|10-20|+|0-10|+|200-0|+|180-200|+|140-180| = 25+40+15+10+10+200+20+40 = 360 cylinders.",
    ],
  },
];

// ── C-SCAN algorithm (reusable) ───────────────────────────────────────────────
function runCSCAN(headPos, reqArr, maxDisk, direction) {
  const sorted = [...reqArr].sort((a, b) => a - b);
  const seq    = [headPos];
  const left   = sorted.filter((r) => r < headPos);
  const right  = sorted.filter((r) => r >= headPos);

  if (direction === "up") {
    seq.push(...right);
    seq.push(maxDisk);
    seq.push(0);
    seq.push(...left);
  } else {
    seq.push(...left.slice().reverse());
    seq.push(0);
    seq.push(maxDisk);
    seq.push(...right.slice().reverse());
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
function SeekBar({ sequence, diskSize }) {
  if (sequence.length < 2) return null;
  const max = diskSize || Math.max(...sequence, 200);
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
          // The jump (0↔max) gets a dashed red style
          const isJump =
            (sequence[i] === 0 && pos === max) ||
            (sequence[i] === max && pos === 0);
          return (
            <div key={i} style={{
              position: "absolute", top: "50%",
              left: `${left}%`, width: `${Math.max(width, 0.5)}%`,
              height: isJump ? 3 : 4,
              background: isJump ? "#ef4444" : `hsl(${(i * 47) % 360}, 70%, 55%)`,
              transform: "translateY(-50%)", borderRadius: 2,
              opacity: isJump ? 0.5 : 0.75,
              borderTop: isJump ? "2px dashed #ef4444" : "none",
            }} />
          );
        })}
        {sequence.map((pos, i) => {
          const isBoundary = pos === 0 || pos === max;
          return (
            <div key={i} title={`Step ${i}: ${pos}`} style={{
              position: "absolute", top: "50%", left: `${pct(pos)}%`,
              transform: "translate(-50%, -50%)",
              width:  i === 0 ? 14 : isBoundary ? 12 : 10,
              height: i === 0 ? 14 : isBoundary ? 12 : 10,
              borderRadius: "50%",
              background: i === 0 ? "#4f46e5" : isBoundary ? "#f59e0b" : "#10b981",
              border: "2px solid #fff", zIndex: 10,
            }} />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><span style={{width:10,height:10,borderRadius:"50%",background:"#4f46e5",display:"inline-block"}} /> Start position</span>
        <span className="flex items-center gap-1"><span style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b",display:"inline-block"}} /> Boundary (0 or max)</span>
        <span className="flex items-center gap-1"><span style={{width:10,height:10,borderRadius:"50%",background:"#10b981",display:"inline-block"}} /> Request served</span>
        <span className="flex items-center gap-1"><span style={{width:16,height:3,background:"#ef4444",display:"inline-block",opacity:0.6}} /> Jump (no service)</span>
      </div>
    </div>
  );
}

// ── Step table ────────────────────────────────────────────────────────────────
function StepTable({ sequence, diskSize }) {
  if (sequence.length < 2) return null;
  let running = 0;
  const maxDisk = diskSize;

  // Find the jump index: where sequence goes from max→0 or 0→max
  const jumpIdx = sequence.findIndex((pos, i) =>
    i > 0 && ((sequence[i - 1] === maxDisk && pos === 0) || (sequence[i - 1] === 0 && pos === maxDisk))
  );

  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2">Step-by-step Seek Distances:</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Step</th>
            <th className="px-4 py-2">From</th>
            <th className="px-4 py-2">To</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Distance</th>
          </tr>
        </thead>
        <tbody>
          {sequence.slice(1).map((pos, i) => {
            const dist = Math.abs(pos - sequence[i]);
            running += dist;
            const isJump =
              (sequence[i] === 0 && pos === maxDisk) ||
              (sequence[i] === maxDisk && pos === 0);
            const isBoundary = sequence[i] === maxDisk || sequence[i] === 0;
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 font-semibold text-indigo-600">{i + 1}</td>
                <td className="px-4 py-2">{sequence[i]}</td>
                <td className="px-4 py-2 font-semibold">{pos}</td>
                <td className="px-4 py-2 text-xs">
                  {isJump
                    ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-semibold">Jump (no service)</span>
                    : isBoundary
                    ? <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-semibold">Boundary visit</span>
                    : <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">Request served</span>
                  }
                </td>
                <td className="px-4 py-2 font-semibold">{dist}</td>
              </tr>
            );
          })}
          <tr className="bg-indigo-50 font-bold">
            <td className="px-4 py-2" colSpan={4}>Total Seek Distance</td>
            <td className="px-4 py-2 text-indigo-700">{running}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Left / Right split view ───────────────────────────────────────────────────
function SplitView({ head, requests, direction }) {
  if (!requests || requests.length === 0) return null;
  const left  = [...requests].filter((r) => r < head).sort((a, b) => b - a);
  const right = [...requests].filter((r) => r >= head).sort((a, b) => a - b);
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={`rounded-lg p-3 border ${direction === "down" ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
        <p className={`font-semibold text-sm mb-2 ${direction === "down" ? "text-green-700" : "text-gray-500"}`}>
          ⬇ LEFT of head ({head}) {direction === "down" ? "— served FIRST" : "— served SECOND (after jump)"}
        </p>
        <div className="flex gap-1 flex-wrap">
          {left.length > 0
            ? left.map((r, i) => (
                <span key={i} className={`px-2 py-1 rounded text-sm font-semibold ${direction === "down" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{r}</span>
              ))
            : <span className="text-gray-400 text-sm">None</span>}
        </div>
      </div>
      <div className={`rounded-lg p-3 border ${direction === "up" ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
        <p className={`font-semibold text-sm mb-2 ${direction === "up" ? "text-green-700" : "text-gray-500"}`}>
          ⬆ RIGHT of head ({head}) {direction === "up" ? "— served FIRST" : "— served SECOND (after jump)"}
        </p>
        <div className="flex gap-1 flex-wrap">
          {right.length > 0
            ? right.map((r, i) => (
                <span key={i} className={`px-2 py-1 rounded text-sm font-semibold ${direction === "up" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{r}</span>
              ))
            : <span className="text-gray-400 text-sm">None</span>}
        </div>
      </div>
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const sequence = runCSCAN(ex.head, ex.requests, ex.diskSize, ex.direction);
  const data = sequence.map((pos, idx) => ({ name: `S${idx}`, position: pos }));
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">Head: {ex.head}</span>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-semibold">Disk Size: {ex.diskSize}</span>
        <span className={`px-3 py-1 rounded-lg font-semibold ${ex.direction === "up" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
          Direction: {ex.direction === "up" ? "⬆ Up" : "⬇ Down"}
        </span>
        {ex.requests.map((r, i) => (
          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">{r}</span>
        ))}
      </div>
      <SplitView head={ex.head} requests={ex.requests} direction={ex.direction} />
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 my-4">
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
      <SeekBar sequence={sequence} diskSize={ex.diskSize} />
      <StepTable sequence={sequence} diskSize={ex.diskSize} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const CSCAN = () => {
  const [requests, setRequests]   = useState("");
  const [head, setHead]           = useState("");
  const [diskSize, setDiskSize]   = useState("");
  const [direction, setDirection] = useState("up");
  const [sequence, setSequence]   = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateCSCAN = () => {
    if (!requests || !head || !diskSize) {
      setError("Please enter all fields.");
      setSequence([]);
      return;
    }
    setError("");
    const headPos = parseInt(head);
    const maxDisk = parseInt(diskSize);
    const reqArr  = requests.split(",").map((v) => parseInt(v.trim())).filter((v) => !isNaN(v));
    if (reqArr.length === 0) {
      setError("Please enter valid comma-separated requests.");
      return;
    }
    setRawRequests(reqArr);
    setSequence(runCSCAN(headPos, reqArr, maxDisk, direction));
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">C-SCAN Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Circular SCAN — sweeps in one direction only, then jumps back to the start and sweeps again.
        Learn how it works, study examples, then try it yourself.
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
          <Section title="What is C-SCAN Disk Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">C-SCAN (Circular SCAN)</span> is an
              improved version of the SCAN algorithm. Like SCAN, it moves the disk head in one
              direction and serves all requests along the way. But here is the big difference:
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-3 text-sm">
              <p className="font-bold text-indigo-700 mb-1">🔑 The Key Rule</p>
              <p className="text-gray-700">
                When the head reaches the end of the disk, it <span className="font-bold text-red-600">jumps
                straight back to the other end without serving any requests</span> on the way back.
                Then it starts sweeping again in the same direction as before.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Think of it like a typewriter: after finishing a line, the carriage snaps back to
              the left and starts typing a new line — it does not type backwards.
            </p>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Note the head position and initial direction.", d: "e.g., Head at 50, moving Up." },
                { n: 2, t: "Split requests into LEFT and RIGHT of the head.", d: "LEFT = cylinders below the head. RIGHT = cylinders at or above the head." },
                { n: 3, t: "Serve the side matching your direction first.", d: "Moving Up → serve RIGHT in ascending order. Moving Down → serve LEFT in descending order." },
                { n: 4, t: "Reach the disk boundary.", d: "Travel all the way to the end of the disk (0 or max cylinder). This boundary point counts toward seek distance." },
                { n: 5, t: "Jump to the opposite end — NO service during the jump.", d: "This is the key difference from SCAN. The head teleports to the other end. The jump distance is still counted in total seek distance." },
                { n: 6, t: "Serve the remaining requests in the same direction.", d: "Continue sweeping in the original direction through the remaining requests." },
                { n: 7, t: "Sum all distances including the jump.", d: "Total Seek Distance = all individual moves + the jump distance." },
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

          <Section title="Direction Rules">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-green-700 mb-2">⬆ Initial Direction: UP</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve requests ≥ head (ascending order)</li>
                  <li>Go to max cylinder (boundary)</li>
                  <li>Jump to cylinder 0 — no service</li>
                  <li>Serve remaining requests (ascending order)</li>
                </ol>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-orange-700 mb-2">⬇ Initial Direction: DOWN</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve requests &lt; head (descending order)</li>
                  <li>Go to cylinder 0 (boundary)</li>
                  <li>Jump to max cylinder — no service</li>
                  <li>Serve remaining requests (descending order)</li>
                </ol>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-bold text-yellow-700 mb-1">⚠️ Important — Jump Distance is Counted</p>
              <p>Even though no requests are served during the jump, the distance of that jump
                 (from max to 0, or from 0 to max) is <span className="font-semibold">still added
                 to the total seek distance</span>. This is why C-SCAN can sometimes have a higher
                 total seek distance than SCAN, even though it gives fairer wait times.</p>
            </div>
          </Section>

          <Section title="Advantages & Disadvantages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>No starvation — every request gets served</li>
                  <li>More uniform wait time than SCAN</li>
                  <li>Requests are never skipped or revisited</li>
                  <li>Predictable and consistent behaviour</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>The long jump (0 ↔ max) adds a lot to total seek distance</li>
                  <li>Requires knowing disk size (the boundary)</li>
                  <li>More complex than FIFO or LIFO</li>
                  <li>Jump counts in seek time even with no service</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="C-SCAN vs SCAN — The Key Difference">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">SCAN (Elevator)</p>
                <p className="text-gray-700 mb-2">
                  Goes UP serving requests, reaches the end, then comes back DOWN serving
                  requests again. Serves in <span className="font-semibold">both directions</span>.
                </p>
                <p className="text-gray-500 text-xs">
                  ⚠ Requests just missed by the head on the way up have to wait a full round
                  trip (up + all the way back down) before being served.
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-bold text-purple-700 mb-2">C-SCAN (Circular)</p>
                <p className="text-gray-700 mb-2">
                  Goes UP serving requests, reaches the end, <span className="font-semibold">jumps
                  to 0 without serving</span>, then goes UP again.
                  Serves in <span className="font-semibold">one direction only</span>.
                </p>
                <p className="text-gray-500 text-xs">
                  ✅ All requests wait at most one full sweep in one direction. Fairer for everyone.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <p className="font-bold text-gray-700 mb-2">📊 Same Input Comparison (Head=50, requests=[55,58,39,18,90,160,150,38,184], disk=199, dir=up)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-200 rounded overflow-hidden text-xs">
                  <thead className="bg-indigo-500 text-white">
                    <tr>
                      <th className="px-3 py-2">Algorithm</th>
                      <th className="px-3 py-2">After boundary</th>
                      <th className="px-3 py-2">Total Seek</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="px-3 py-2 font-semibold text-indigo-600">SCAN</td>
                      <td className="px-3 py-2 text-gray-600">Reverses and serves left side going down</td>
                      <td className="px-3 py-2 font-bold text-green-600">330</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-purple-600">C-SCAN</td>
                      <td className="px-3 py-2 text-gray-600">Jumps to 0, then serves left side going up</td>
                      <td className="px-3 py-2 font-bold text-orange-600">387</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                C-SCAN has a higher seek distance here because of the large jump (199 → 0 = 199 cylinders).
                But it gives more uniform wait times across all requests.
              </p>
            </div>
          </Section>

          <Section title="All Algorithms Compared">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">How it decides</th>
                    <th className="px-4 py-2">Seek Performance</th>
                    <th className="px-4 py-2">Starvation?</th>
                    <th className="px-4 py-2">Fair wait times?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO",   "Arrival order",       "Poor",   "No",  "Yes"],
                    ["LIFO",   "Reverse arrival",      "Poor",   "Yes", "No" ],
                    ["SSTF",   "Nearest first",        "Good",   "Yes", "No" ],
                    ["SCAN",   "Sweep both ways",      "Better", "No",  "Mostly"],
                    ["C-SCAN", "Sweep one way + jump", "Better", "No",  "Yes"],
                  ].map(([alg, how, perf, starv, fair], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "C-SCAN" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className="px-4 py-2 text-gray-600">{how}</td>
                      <td className="px-4 py-2 text-gray-600">{perf}</td>
                      <td className={`px-4 py-2 font-semibold ${starv === "Yes" ? "text-red-500" : "text-green-600"}`}>{starv}</td>
                      <td className={`px-4 py-2 font-semibold ${fair === "Yes" ? "text-green-600" : fair === "Mostly" ? "text-yellow-600" : "text-red-500"}`}>{fair}</td>
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
                "✅ If direction is UP: serve all requests ≥ head in ascending order, then go to max, then jump to 0, then serve remaining in ascending order.",
                "✅ If direction is DOWN: serve all requests < head in descending order, then go to 0, then jump to max, then serve remaining in descending order.",
                "✅ Both 0 and max (or max and 0) must appear in the sequence — boundary visit AND jump point.",
                "✅ No requests are served during the jump from max→0 or 0→max.",
                "✅ The jump distance (max cylinder value) IS counted in the total seek distance.",
                "✅ Each distance = |next − current|. Always absolute value.",
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
            <p>Each example shows the LEFT/RIGHT split of requests, a step-by-step explanation,
               a line chart, and a seek-path bar. In the seek-path bar, the{" "}
               <span className="font-semibold">red dashed line is the jump</span> (no service) and
               the <span className="font-semibold">yellow dots are boundary points</span>. In the
               distance table, each row is labelled as Request served, Boundary visit, or Jump
               (no service).</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>Enter your requests, head position, disk size, and direction. The simulator will
               run C-SCAN and show the left/right split, chart, seek-path bar (with the jump
               highlighted in red), and a labelled distance table.</p>
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
              <option value="up">⬆ Up (towards higher cylinders)</option>
              <option value="down">⬇ Down (towards lower cylinders)</option>
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
            <div className="w-full max-w-4xl space-y-4">

              {/* Split view */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-2">Left / Right Split Around Head:</p>
                <SplitView head={parseInt(head)} requests={rawRequests} direction={direction} />
              </div>

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

              {/* Sequence badges */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-2">Service Sequence (C-SCAN order):</p>
                <div className="flex gap-2 flex-wrap">
                  {sequence.map((pos, idx) => {
                    const maxD = parseInt(diskSize);
                    const prev = sequence[idx - 1];
                    const isJump = idx > 0 && ((prev === maxD && pos === 0) || (prev === 0 && pos === maxD));
                    const isBoundary = pos === 0 || pos === maxD;
                    return (
                      <span key={idx} className={`px-3 py-1 rounded-lg font-semibold ${
                        isJump
                          ? "bg-red-100 text-red-600"
                          : isBoundary
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {isJump ? `${pos} ↩` : isBoundary ? `${pos} ⚡` : pos}
                      </span>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>⚡ = boundary visit</span>
                  <span>↩ = jump start (no service)</span>
                </div>
              </div>

              {/* Seek bar */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <SeekBar sequence={sequence} diskSize={parseInt(diskSize)} />
              </div>

              {/* Step table */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <StepTable sequence={sequence} diskSize={parseInt(diskSize)} />
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CSCAN;