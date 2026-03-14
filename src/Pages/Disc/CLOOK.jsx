// CLOOK.jsx
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
    direction: "up",
    explanation: [
      "Head starts at cylinder 50, moving UP.",
      "Split requests: LEFT of 50 → [18, 38, 39] | RIGHT of 50 → [55, 58, 90, 150, 160, 184].",
      "Step 1 — Move UP and serve right-side requests in ascending order: 55 → 58 → 90 → 150 → 160 → 184.",
      "Step 2 — Reached the last right request (184). C-LOOK does NOT go to the disk boundary. It jumps directly to the smallest left request.",
      "Step 3 — Jump to the lowest left request (18) WITHOUT serving anything during the jump. This is the C-LOOK rule.",
      "Step 4 — Continue moving UP from 18, serving left-side requests in ascending order: 18 → 38 → 39.",
      "Total Seek Distance = |55-50|+|58-55|+|90-58|+|150-90|+|160-150|+|184-160|+|18-184|+|38-18|+|39-38| = 5+3+32+60+10+24+166+20+1 = 321 cylinders.",
    ],
  },
  {
    title: "Example 2 — Moving Down",
    head: 100,
    requests: [35, 180, 20, 140, 75, 10, 200],
    direction: "down",
    explanation: [
      "Head starts at cylinder 100, moving DOWN.",
      "Split requests: LEFT of 100 → [75, 35, 20, 10] | RIGHT of 100 → [140, 180, 200].",
      "Step 1 — Move DOWN and serve left-side requests in descending order: 75 → 35 → 20 → 10.",
      "Step 2 — Reached the last left request (10). C-LOOK does NOT go to cylinder 0. It jumps directly to the highest right request.",
      "Step 3 — Jump to the highest right request (200) WITHOUT serving anything during the jump.",
      "Step 4 — Continue moving DOWN from 200, serving right-side requests in descending order: 200 → 180 → 140.",
      "Total Seek Distance = |75-100|+|35-75|+|20-35|+|10-20|+|200-10|+|180-200|+|140-180| = 25+40+15+10+190+20+40 = 340 cylinders.",
    ],
  },
];

// ── C-LOOK algorithm (reusable) ───────────────────────────────────────────────
function runCLOOK(headPos, reqArr, direction) {
  const sorted = [...reqArr].sort((a, b) => a - b);
  const seq    = [headPos];
  const left   = sorted.filter((r) => r < headPos);
  const right  = sorted.filter((r) => r >= headPos);

  if (direction === "up") {
    seq.push(...right);
    if (left.length > 0) seq.push(...left);
  } else {
    seq.push(...left.slice().reverse());
    if (right.length > 0) seq.push(...right.slice().reverse());
  }
  return seq;
}

// ── helpers to find jump index ────────────────────────────────────────────────
function findJumpIndex(sequence, direction, head) {
  // The jump is the big move that crosses over the head position going back
  // to the other side. It is the largest single move in the sequence.
  let maxDist = 0;
  let jumpIdx = -1;
  for (let i = 1; i < sequence.length; i++) {
    const dist = Math.abs(sequence[i] - sequence[i - 1]);
    if (dist > maxDist) { maxDist = dist; jumpIdx = i; }
  }
  return jumpIdx;
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
function SeekBar({ sequence, jumpIdx }) {
  if (sequence.length < 2) return null;
  const max = Math.max(...sequence, 200);
  const pct = (v) => (v / max) * 100;

  return (
    <div className="mt-4">
      <p className="font-semibold mb-3">Seek Path Visualisation:</p>
      <div className="relative h-10 bg-gray-100 rounded-lg border border-gray-300">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2" />
        {sequence.slice(1).map((pos, i) => {
          const from   = pct(sequence[i]);
          const to     = pct(pos);
          const left   = Math.min(from, to);
          const width  = Math.abs(to - from);
          const isJump = i + 1 === jumpIdx;
          return (
            <div key={i} style={{
              position: "absolute", top: "50%",
              left: `${left}%`, width: `${Math.max(width, 0.5)}%`,
              height: isJump ? 3 : 4,
              background: isJump ? "#ef4444" : `hsl(${(i * 47) % 360}, 70%, 55%)`,
              transform: "translateY(-50%)", borderRadius: 2,
              opacity: isJump ? 0.55 : 0.75,
            }} />
          );
        })}
        {sequence.map((pos, i) => {
          const isJumpStart = i === jumpIdx - 1;
          const isJumpEnd   = i === jumpIdx;
          return (
            <div key={i} title={`Step ${i}: ${pos}`} style={{
              position: "absolute", top: "50%", left: `${pct(pos)}%`,
              transform: "translate(-50%, -50%)",
              width:  i === 0 ? 14 : (isJumpStart || isJumpEnd) ? 12 : 10,
              height: i === 0 ? 14 : (isJumpStart || isJumpEnd) ? 12 : 10,
              borderRadius: "50%",
              background: i === 0 ? "#4f46e5" : (isJumpStart || isJumpEnd) ? "#f59e0b" : "#10b981",
              border: "2px solid #fff", zIndex: 10,
            }} />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span style={{width:10,height:10,borderRadius:"50%",background:"#4f46e5",display:"inline-block"}} /> Start position
        </span>
        <span className="flex items-center gap-1">
          <span style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b",display:"inline-block"}} /> Jump endpoints
        </span>
        <span className="flex items-center gap-1">
          <span style={{width:10,height:10,borderRadius:"50%",background:"#10b981",display:"inline-block"}} /> Request served
        </span>
        <span className="flex items-center gap-1">
          <span style={{width:16,height:3,background:"#ef4444",display:"inline-block",opacity:0.6}} /> Jump (no service)
        </span>
      </div>
      <p className="text-xs text-green-700 mt-1 font-semibold">
        ✅ Notice: the head jumps between the last request of one side and the first request of the other — no disk boundaries visited.
      </p>
    </div>
  );
}

// ── Step table ────────────────────────────────────────────────────────────────
function StepTable({ sequence, jumpIdx }) {
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
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Distance</th>
          </tr>
        </thead>
        <tbody>
          {sequence.slice(1).map((pos, i) => {
            const dist   = Math.abs(pos - sequence[i]);
            running     += dist;
            const isJump = i + 1 === jumpIdx;
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 font-semibold text-indigo-600">{i + 1}</td>
                <td className="px-4 py-2">{sequence[i]}</td>
                <td className="px-4 py-2 font-semibold">{pos}</td>
                <td className="px-4 py-2 text-xs">
                  {isJump
                    ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-semibold">Jump (no service)</span>
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
  const left  = [...requests].filter((r) => r < head).sort((a, b) => a - b);
  const right = [...requests].filter((r) => r >= head).sort((a, b) => a - b);

  const jumpFrom = direction === "up"
    ? (right.length > 0 ? right[right.length - 1] : null)
    : (left.length > 0 ? left[0] : null);
  const jumpTo = direction === "up"
    ? (left.length > 0 ? left[0] : null)
    : (right.length > 0 ? right[right.length - 1] : null);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div className={`rounded-lg p-3 border ${direction === "down" ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
          <p className={`font-semibold text-sm mb-1 ${direction === "down" ? "text-green-700" : "text-gray-500"}`}>
            ⬇ LEFT of head ({head}) {direction === "down" ? "— served FIRST" : "— served SECOND (after jump)"}
          </p>
          {left.length > 0 && (
            <p className="text-xs text-gray-400 mb-2">
              {direction === "up"
                ? <>Jump destination → cylinder <span className="font-bold text-orange-600">{left[0]}</span> (lowest left request)</>
                : <>Reversal at → cylinder <span className="font-bold text-green-600">{left[0]}</span> (lowest left request)</>
              }
            </p>
          )}
          <div className="flex gap-1 flex-wrap">
            {left.length > 0
              ? left.map((r, i) => (
                  <span key={i} className={`px-2 py-1 rounded text-sm font-semibold ${direction === "down" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{r}</span>
                ))
              : <span className="text-gray-400 text-sm">None</span>}
          </div>
        </div>
        <div className={`rounded-lg p-3 border ${direction === "up" ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
          <p className={`font-semibold text-sm mb-1 ${direction === "up" ? "text-green-700" : "text-gray-500"}`}>
            ⬆ RIGHT of head ({head}) {direction === "up" ? "— served FIRST" : "— served SECOND (after jump)"}
          </p>
          {right.length > 0 && (
            <p className="text-xs text-gray-400 mb-2">
              {direction === "down"
                ? <>Jump destination → cylinder <span className="font-bold text-orange-600">{right[right.length - 1]}</span> (highest right request)</>
                : <>Reversal at → cylinder <span className="font-bold text-green-600">{right[right.length - 1]}</span> (highest right request)</>
              }
            </p>
          )}
          <div className="flex gap-1 flex-wrap">
            {right.length > 0
              ? right.map((r, i) => (
                  <span key={i} className={`px-2 py-1 rounded text-sm font-semibold ${direction === "up" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{r}</span>
                ))
              : <span className="text-gray-400 text-sm">None</span>}
          </div>
        </div>
      </div>
      {jumpFrom !== null && jumpTo !== null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <span className="text-lg">↩</span>
          <span>
            Jump: <span className="font-bold">{jumpFrom}</span> → <span className="font-bold">{jumpTo}</span>
            <span className="text-gray-500 font-normal ml-2">(distance = {Math.abs(jumpTo - jumpFrom)} cylinders, no service during this move)</span>
          </span>
        </div>
      )}
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const sequence = runCLOOK(ex.head, ex.requests, ex.direction);
  const jumpIdx  = findJumpIndex(sequence, ex.direction, ex.head);
  const data     = sequence.map((pos, idx) => ({ name: `S${idx}`, position: pos }));
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">Head: {ex.head}</span>
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
      <SeekBar sequence={sequence} jumpIdx={jumpIdx} />
      <StepTable sequence={sequence} jumpIdx={jumpIdx} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const CLOOK = () => {
  const [requests, setRequests]   = useState("");
  const [head, setHead]           = useState("");
  const [direction, setDirection] = useState("up");
  const [sequence, setSequence]   = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateCLOOK = () => {
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
    setSequence(runCLOOK(headPos, reqArr, direction));
  };

  const data    = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));
  const jumpIdx = sequence.length > 0 ? findJumpIndex(sequence, direction, parseInt(head)) : -1;

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">C-LOOK Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        The best of both worlds — sweeps in one direction, jumps to the nearest waiting request on the other side, no wasted boundary travel.
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
          <Section title="What is C-LOOK Disk Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">C-LOOK (Circular LOOK)</span> combines
              the best ideas from LOOK and C-SCAN. Like LOOK, it never wastes time travelling to
              disk boundaries. Like C-SCAN, it always sweeps in one direction only. Here is how it
              is different from the others:
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-3 text-sm">
              <p className="font-bold text-indigo-700 mb-1">🔑 The Two Key Rules</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>
                  <span className="font-semibold">No boundary travel</span> — the head stops at
                  the last real request in each direction, just like LOOK.
                </li>
                <li>
                  <span className="font-semibold">Jump to the nearest waiting request on the other side</span> —
                  instead of reversing and serving on the way back (like LOOK/SCAN), it jumps
                  straight to the first unserved request on the other side, just like C-SCAN.
                </li>
              </ol>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Think of it like a delivery driver who delivers all packages going one way down the
              street, then drives back to the first undelivered house at the other end — without
              stopping on the way back — and starts delivering again in the same direction.
            </p>
          </Section>

          <Section title="C-LOOK vs LOOK vs C-SCAN — What is Different?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-bold text-blue-700 mb-2">LOOK</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Sweeps UP, stops at last request</li>
                  <li>Reverses and sweeps DOWN</li>
                  <li>Serves in both directions</li>
                  <li>No boundary travel ✅</li>
                  <li>Two-way service ⚠</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-bold text-purple-700 mb-2">C-SCAN</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Sweeps UP to disk boundary</li>
                  <li>Jumps to cylinder 0</li>
                  <li>Serves in one direction only</li>
                  <li>Travels to boundary ❌</li>
                  <li>One-way service ✅</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">C-LOOK ⭐</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Sweeps UP, stops at last request</li>
                  <li>Jumps to lowest pending request</li>
                  <li>Serves in one direction only</li>
                  <li>No boundary travel ✅</li>
                  <li>One-way service ✅</li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-bold text-yellow-700 mb-1">📌 Key Point — The Jump in C-LOOK</p>
              <p>
                The jump in C-LOOK goes from the <span className="font-semibold">last served request</span> on
                one side directly to the <span className="font-semibold">first pending request</span> on the
                other side. This is shorter than C-SCAN's jump (which always goes to 0 or max disk).
                However, the jump distance is <span className="font-semibold">still counted</span> in
                the total seek distance, just like C-SCAN.
              </p>
            </div>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Note the head position and initial direction.", d: "e.g., Head at 50, moving Up." },
                { n: 2, t: "Split requests into LEFT and RIGHT of the head.", d: "LEFT = cylinders below the head. RIGHT = cylinders at or above the head." },
                { n: 3, t: "Serve the side matching your direction first.", d: "Moving Up → serve RIGHT in ascending order. Moving Down → serve LEFT in descending order." },
                { n: 4, t: "Stop at the last request — do NOT go to the disk boundary.", d: "This is the LOOK part of C-LOOK." },
                { n: 5, t: "Jump directly to the first pending request on the other side.", d: "Moving Up → jump to the LOWEST left request. Moving Down → jump to the HIGHEST right request. No service during the jump." },
                { n: 6, t: "Continue in the same direction and serve remaining requests.", d: "Moving Up → continue ascending through left-side requests. Moving Down → continue descending through right-side requests." },
                { n: 7, t: "Sum all distances including the jump.", d: "Total Seek Distance = Σ |next − current| for all moves including the jump." },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-green-700 mb-2">⬆ Initial Direction: UP</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve requests ≥ head (ascending order)</li>
                  <li>Stop at the highest request (not max disk)</li>
                  <li>Jump to the lowest pending request (not 0)</li>
                  <li>Serve remaining requests (ascending order)</li>
                </ol>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-orange-700 mb-2">⬇ Initial Direction: DOWN</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve requests &lt; head (descending order)</li>
                  <li>Stop at the lowest request (not 0)</li>
                  <li>Jump to the highest pending request (not max disk)</li>
                  <li>Serve remaining requests (descending order)</li>
                </ol>
              </div>
            </div>
          </Section>

          <Section title="Advantages & Disadvantages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>No starvation — every request gets served</li>
                  <li>No wasted travel to disk boundaries</li>
                  <li>More uniform wait times than LOOK or SCAN</li>
                  <li>Does not need disk size as input</li>
                  <li>Shorter jump than C-SCAN (jumps to nearest request, not cylinder 0)</li>
                  <li>Generally considered the best practical algorithm</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Jump distance still adds to total seek distance</li>
                  <li>More complex to implement than FIFO or LOOK</li>
                  <li>Requests just passed still wait a full cycle</li>
                  <li>Not globally optimal in all cases</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="All Algorithms Compared">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-3 py-2">Algorithm</th>
                    <th className="px-3 py-2">Boundary travel?</th>
                    <th className="px-3 py-2">One-way service?</th>
                    <th className="px-3 py-2">Starvation?</th>
                    <th className="px-3 py-2">Needs disk size?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO",   "No",           "N/A",  "No",  "No" ],
                    ["SSTF",   "No",           "N/A",  "Yes", "No" ],
                    ["SCAN",   "Yes ❌",       "No ⚠", "No",  "Yes"],
                    ["C-SCAN", "Yes ❌",       "Yes ✅","No",  "Yes"],
                    ["LOOK",   "No ✅",        "No ⚠", "No",  "No" ],
                    ["C-LOOK", "No ✅",        "Yes ✅","No",  "No" ],
                  ].map(([alg, boundary, oneway, starv, needsSize], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-3 py-2 font-semibold ${alg === "C-LOOK" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{boundary}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{oneway}</td>
                      <td className={`px-3 py-2 font-semibold ${starv === "Yes" ? "text-red-500" : "text-green-600"}`}>{starv}</td>
                      <td className={`px-3 py-2 font-semibold ${needsSize === "Yes" ? "text-orange-500" : "text-green-600"}`}>{needsSize}</td>
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
                "✅ If direction is UP: serve all requests ≥ head in ascending order, then jump to the LOWEST pending request (not 0), then continue ascending.",
                "✅ If direction is DOWN: serve all requests < head in descending order, then jump to the HIGHEST pending request (not max disk), then continue descending.",
                "✅ The sequence must NOT include 0 or max disk cylinder — C-LOOK never visits disk boundaries.",
                "✅ No requests are served during the jump — it is a pure head movement.",
                "✅ The jump distance IS counted in the total seek distance.",
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
            <p>Each example shows the LEFT/RIGHT split with the exact jump endpoints highlighted.
               The red info box below the split shows the jump: from → to and the distance counted.
               In the seek-path bar, the <span className="font-semibold">red dashed line is the jump</span> and
               the <span className="font-semibold">yellow dots are jump endpoints</span>.
               In the distance table, each row is labelled as Request served or Jump (no service).</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>Enter your disk requests, head position, and direction. No disk size needed —
               C-LOOK jumps between real request positions, not disk boundaries. The simulator
               will show the split view with jump info, chart, seek-path bar (jump in red),
               and a labelled distance table.</p>
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
            onClick={simulateCLOOK}
              className="w-full bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-bold text-lg transition mb-6"
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
                <p className="font-semibold mb-2">Service Sequence (C-LOOK order):</p>
                <div className="flex gap-2 flex-wrap">
                  {sequence.map((pos, idx) => {
                    const isJumpEnd = idx === jumpIdx;
                    return (
                      <span key={idx} className={`px-3 py-1 rounded-lg font-semibold ${
                        isJumpEnd
                          ? "bg-red-100 text-red-600"
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {isJumpEnd ? `${pos} ↩` : pos}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">↩ = first position after the jump</p>
                <p className="text-xs text-green-700 mt-1 font-semibold">
                  ✅ No 0 or disk boundary — C-LOOK only visits real request positions.
                </p>
              </div>

              {/* Seek bar */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <SeekBar sequence={sequence} jumpIdx={jumpIdx} />
              </div>

              {/* Step table */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <StepTable sequence={sequence} jumpIdx={jumpIdx} />
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CLOOK;