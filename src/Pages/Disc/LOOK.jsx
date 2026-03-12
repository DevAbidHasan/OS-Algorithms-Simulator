// LOOK.jsx
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
      "Split requests: LEFT of 50 → [39, 38, 18] | RIGHT of 50 → [55, 58, 90, 150, 160, 184].",
      "Moving UP first: serve right side in ascending order → 55 → 58 → 90 → 150 → 160 → 184.",
      "LOOK stops at the last request (184). It does NOT travel to the disk boundary. This is the key LOOK rule.",
      "Reverse direction, now moving DOWN: serve left side in descending order → 39 → 38 → 18.",
      "LOOK stops at the last request (18). It does NOT go all the way to 0.",
      "Total Seek Distance = |55-50|+|58-55|+|90-58|+|150-90|+|160-150|+|184-160|+|39-184|+|38-39|+|18-38| = 5+3+32+60+10+24+145+1+20 = 300 cylinders.",
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
      "Moving DOWN first: serve left side in descending order → 75 → 35 → 20 → 10.",
      "LOOK stops at 10 (the last left request). It does NOT travel to cylinder 0.",
      "Reverse direction, now moving UP: serve right side in ascending order → 140 → 180 → 200.",
      "LOOK stops at 200 (the last right request). It does NOT travel beyond 200.",
      "Total Seek Distance = |75-100|+|35-75|+|20-35|+|10-20|+|140-10|+|180-140|+|200-180| = 25+40+15+10+130+40+20 = 280 cylinders.",
    ],
  },
];

// ── LOOK algorithm (reusable) ─────────────────────────────────────────────────
function runLOOK(headPos, reqArr, direction) {
  const sorted = [...reqArr].sort((a, b) => a - b);
  const seq    = [headPos];
  const left   = sorted.filter((r) => r < headPos).reverse();
  const right  = sorted.filter((r) => r >= headPos);

  if (direction === "up") {
    seq.push(...right);
    seq.push(...left);
  } else {
    seq.push(...left);
    seq.push(...right);
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
              left: `${left}%`, width: `${Math.max(width, 0.5)}%`,
              height: 4,
              background: `hsl(${(i * 47) % 360}, 70%, 55%)`,
              transform: "translateY(-50%)", borderRadius: 2, opacity: 0.75,
            }} />
          );
        })}
        {sequence.map((pos, i) => (
          <div key={i} title={`Step ${i}: ${pos}`} style={{
            position: "absolute", top: "50%", left: `${pct(pos)}%`,
            transform: "translate(-50%, -50%)",
            width: i === 0 ? 14 : 10, height: i === 0 ? 14 : 10,
            borderRadius: "50%",
            background: i === 0 ? "#4f46e5" : "#10b981",
            border: "2px solid #fff", zIndex: 10,
          }} />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span style={{width:10,height:10,borderRadius:"50%",background:"#4f46e5",display:"inline-block"}} /> Start position
        </span>
        <span className="flex items-center gap-1">
          <span style={{width:10,height:10,borderRadius:"50%",background:"#10b981",display:"inline-block"}} /> Request served
        </span>
      </div>
      <p className="text-xs text-green-700 mt-1 font-semibold">
        ✅ Notice: the head stops at the last request in each direction — no wasted travel to disk boundaries.
      </p>
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
                <td className="px-4 py-2 font-semibold">{pos}</td>
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

// ── Left / Right split view ───────────────────────────────────────────────────
function SplitView({ head, requests, direction }) {
  if (!requests || requests.length === 0) return null;
  const left  = [...requests].filter((r) => r < head).sort((a, b) => b - a);
  const right = [...requests].filter((r) => r >= head).sort((a, b) => a - b);
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={`rounded-lg p-3 border ${direction === "down" ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
        <p className={`font-semibold text-sm mb-1 ${direction === "down" ? "text-green-700" : "text-gray-500"}`}>
          ⬇ LEFT of head ({head}) {direction === "down" ? "— served FIRST" : "— served SECOND"}
        </p>
        {left.length > 0 && (
          <p className="text-xs text-gray-400 mb-2">
            Reversal point → cylinder <span className="font-bold">{left[left.length - 1]}</span> (last request, not 0)
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
          ⬆ RIGHT of head ({head}) {direction === "up" ? "— served FIRST" : "— served SECOND"}
        </p>
        {right.length > 0 && (
          <p className="text-xs text-gray-400 mb-2">
            Reversal point → cylinder <span className="font-bold">{right[right.length - 1]}</span> (last request, not max disk)
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
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const sequence = runLOOK(ex.head, ex.requests, ex.direction);
  const data = sequence.map((pos, idx) => ({ name: `S${idx}`, position: pos }));
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
      <SeekBar sequence={sequence} />
      <StepTable sequence={sequence} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const LOOK = () => {
  const [requests, setRequests]   = useState("");
  const [head, setHead]           = useState("");
  const [direction, setDirection] = useState("up");
  const [sequence, setSequence]   = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateLOOK = () => {
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
    setSequence(runLOOK(headPos, reqArr, direction));
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">LOOK Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        SCAN's smarter cousin — sweeps in one direction but stops at the last request, not the disk boundary.
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
          <Section title="What is LOOK Disk Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">LOOK</span> works almost exactly like
              SCAN — it moves the head in one direction, serves all requests along the way, then
              reverses and serves the other side. But it has one important improvement:
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-3 text-sm">
              <p className="font-bold text-indigo-700 mb-1">🔑 The Key Rule — "Look Before You Go"</p>
              <p className="text-gray-700">
                Instead of always travelling all the way to the disk boundary (cylinder 0 or max),
                the head <span className="font-bold text-green-700">looks ahead and only goes as
                far as the last pending request</span> in that direction. If there are no more
                requests further ahead, it stops and reverses right there.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Think of it like an elevator that only goes to the highest floor someone pressed —
              it does not ride all the way to the top floor if nobody wants to go there.
            </p>
          </Section>

          <Section title="LOOK vs SCAN — The Only Difference">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">SCAN (Elevator)</p>
                <p className="text-gray-700 mb-2">
                  Head goes UP, serves all requests, then travels all the way to
                  the <span className="font-semibold">disk boundary (max cylinder)</span> before reversing.
                </p>
                <div className="bg-white rounded p-2 text-xs text-gray-500 border border-gray-200">
                  Example: Head at 50, moving up, last request at 184, disk size 199.<br />
                  SCAN travels: ... → 184 → <span className="font-bold text-red-500">199</span> → reverses<br />
                  Wasted move: 184 → 199 = 15 cylinders with no requests
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">LOOK (Smarter SCAN)</p>
                <p className="text-gray-700 mb-2">
                  Head goes UP, serves all requests, then reverses at the
                  <span className="font-semibold"> last pending request</span> — no wasted travel.
                </p>
                <div className="bg-white rounded p-2 text-xs text-gray-500 border border-gray-200">
                  Example: Head at 50, moving up, last request at 184, no disk size needed.<br />
                  LOOK travels: ... → <span className="font-bold text-green-600">184</span> → reverses<br />
                  Saves: 15 cylinders of unnecessary travel
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-bold text-yellow-700 mb-1">📌 Important Note</p>
              <p>
                Because LOOK does not need to go to the disk boundary, you do{" "}
                <span className="font-semibold">not need to enter a disk size</span>. This makes
                LOOK simpler to use than SCAN or C-SCAN in practice.
              </p>
            </div>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Note the head position and initial direction.", d: "e.g., Head at 50, moving Up." },
                { n: 2, t: "Split requests into LEFT and RIGHT of the head.", d: "LEFT = cylinders below the head. RIGHT = cylinders at or above the head." },
                { n: 3, t: "Serve the side matching your direction first.", d: "Moving Up → serve RIGHT in ascending order. Moving Down → serve LEFT in descending order." },
                { n: 4, t: "Stop at the last request in that direction.", d: "Do NOT go to 0 or max disk cylinder. Just reverse at the last request." },
                { n: 5, t: "Reverse direction.", d: "Now move the other way." },
                { n: 6, t: "Serve the remaining requests on the return sweep.", d: "Serve them in the order of the new direction." },
                { n: 7, t: "Stop again at the last request in this direction.", d: "No wasted travel in either direction." },
                { n: 8, t: "Sum all seek distances.", d: "Total Seek Distance = Σ |next − current| for every move made." },
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
                  <li>Stop and reverse at the highest request</li>
                  <li>Serve requests &lt; head (descending order)</li>
                  <li>Stop at the lowest request</li>
                </ol>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-orange-700 mb-2">⬇ Initial Direction: DOWN</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve requests &lt; head (descending order)</li>
                  <li>Stop and reverse at the lowest request</li>
                  <li>Serve requests ≥ head (ascending order)</li>
                  <li>Stop at the highest request</li>
                </ol>
              </div>
            </div>
          </Section>

          <Section title="Advantages & Disadvantages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>No starvation — every request is served</li>
                  <li>Better than SCAN — no wasted travel to boundaries</li>
                  <li>Does not need disk size as input</li>
                  <li>Good balance of fairness and seek performance</li>
                  <li>Simple to implement and understand</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Requests just behind the head still wait a full sweep</li>
                  <li>Not as uniform in wait time as C-LOOK</li>
                  <li>Still serves both directions (unlike C-LOOK)</li>
                  <li>Not globally optimal for seek distance</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="All Algorithms Compared">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Travels to boundary?</th>
                    <th className="px-4 py-2">Starvation?</th>
                    <th className="px-4 py-2">Needs disk size?</th>
                    <th className="px-4 py-2">Seek Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO",   "No boundary",   "No",  "No",  "Poor"  ],
                    ["SSTF",   "No boundary",   "Yes", "No",  "Good"  ],
                    ["SCAN",   "Yes — always",  "No",  "Yes", "Better"],
                    ["C-SCAN", "Yes — always",  "No",  "Yes", "Better"],
                    ["LOOK",   "No — stops at last request", "No", "No", "Better"],
                    ["C-LOOK", "No — stops at last request", "No", "No", "Better"],
                  ].map(([alg, boundary, starv, needsSize, perf], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "LOOK" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className={`px-4 py-2 text-sm ${boundary.startsWith("Yes") ? "text-red-500" : "text-green-600"}`}>{boundary}</td>
                      <td className={`px-4 py-2 font-semibold ${starv === "Yes" ? "text-red-500" : "text-green-600"}`}>{starv}</td>
                      <td className={`px-4 py-2 font-semibold ${needsSize === "Yes" ? "text-orange-500" : "text-green-600"}`}>{needsSize}</td>
                      <td className="px-4 py-2 text-gray-600">{perf}</td>
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
                "✅ If direction is UP: serve all requests ≥ head in ascending order, then serve all requests < head in descending order.",
                "✅ If direction is DOWN: serve all requests < head in descending order, then serve all requests ≥ head in ascending order.",
                "✅ The sequence must NOT include 0 or a disk boundary — LOOK never travels past the last request.",
                "✅ The reversal point = the last request in the initial direction (not a boundary value).",
                "✅ Each distance = |next − current|. Always absolute value.",
                "✅ Total = sum of all individual step distances.",
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
            <p>Each example shows the LEFT/RIGHT split of requests. Notice the reversal point
               shown in each group — it is the <span className="font-semibold">last request</span>,
               not a disk boundary. The seek-path bar shows no dot at 0 or max disk — only at
               actual request positions.</p>
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
               LOOK automatically stops at the last request in each direction. The simulator
               will show the left/right split with reversal points, chart, seek-path bar, and
               distance table.</p>
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
            onClick={simulateLOOK}
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
                <p className="font-semibold mb-2">Service Sequence (LOOK order):</p>
                <div className="flex gap-2 flex-wrap">
                  {sequence.map((pos, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
                      {pos}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-green-700 mt-2 font-semibold">
                  ✅ No 0 or disk boundary in the sequence — LOOK only visits real request positions.
                </p>
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

export default LOOK;