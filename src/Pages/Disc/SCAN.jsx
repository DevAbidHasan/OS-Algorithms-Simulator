// SCAN.jsx
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
    title: "Example 1 — Moving Up (Towards higher cylinders)",
    head: 50,
    requests: [55, 58, 39, 18, 90, 160, 150, 38, 184],
    diskSize: 199,
    direction: "up",
    explanation: [
      "Head starts at cylinder 50, moving UP. Disk size = 199.",
      "Split requests: LEFT of 50 → [39, 38, 18] | RIGHT of 50 → [55, 58, 90, 150, 160, 184].",
      "Moving UP first: serve right side in ascending order → 55 → 58 → 90 → 150 → 160 → 184.",
      "Reach the end of the disk: → 199 (boundary).",
      "Reverse direction, now moving DOWN: serve left side in descending order → 39 → 38 → 18.",
      "Total Seek Distance = |55-50|+|58-55|+|90-58|+|150-90|+|160-150|+|184-160|+|199-184|+|39-199|+|38-39|+|18-38| = 5+3+32+60+10+24+15+160+1+20 = 330 cylinders.",
    ],
  },
  {
    title: "Example 2 — Moving Down (Towards lower cylinders)",
    head: 100,
    requests: [35, 180, 20, 140, 75, 10, 200],
    diskSize: 200,
    direction: "down",
    explanation: [
      "Head starts at cylinder 100, moving DOWN. Disk size = 200.",
      "Split requests: LEFT of 100 → [75, 35, 20, 10] | RIGHT of 100 → [140, 180, 200].",
      "Moving DOWN first: serve left side in descending order → 75 → 35 → 20 → 10.",
      "Reach the start of the disk: → 0 (boundary).",
      "Reverse direction, now moving UP: serve right side in ascending order → 140 → 180 → 200.",
      "Total Seek Distance = |75-100|+|35-75|+|20-35|+|10-20|+|0-10|+|140-0|+|180-140|+|200-180| = 25+40+15+10+10+140+40+20 = 300 cylinders.",
    ],
  },
];

// ── SCAN algorithm (reusable) ─────────────────────────────────────────────────
function runSCAN(headPos, reqArr, maxDisk, direction) {
  const sorted = [...reqArr].sort((a, b) => a - b);
  const seq = [headPos];
  const left  = sorted.filter((r) => r < headPos).reverse();
  const right = sorted.filter((r) => r >= headPos);

  if (direction === "up") {
    seq.push(...right);
    seq.push(maxDisk);
    seq.push(...left);
  } else {
    seq.push(...left);
    seq.push(0);
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
            borderRadius: "50%",
            background: i === 0 ? "#4f46e5" : (pos === 0 || pos === max ? "#f59e0b" : "#10b981"),
            border: "2px solid #fff", zIndex: 10,
          }} />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span style={{width:10,height:10,borderRadius:"50%",background:"#4f46e5",display:"inline-block"}} /> Start</span>
        <span className="flex items-center gap-1"><span style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b",display:"inline-block"}} /> Boundary</span>
        <span className="flex items-center gap-1"><span style={{width:10,height:10,borderRadius:"50%",background:"#10b981",display:"inline-block"}} /> Request</span>
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
            <th className="px-4 py-2">Note</th>
            <th className="px-4 py-2">Distance</th>
          </tr>
        </thead>
        <tbody>
          {sequence.slice(1).map((pos, i) => {
            const dist = Math.abs(pos - sequence[i]);
            running += dist;
            const isBoundary = pos === 0 || (i > 0 && pos > sequence[i - 1 < 0 ? 0 : i] && sequence.slice(i + 2).length > 0 && sequence[i + 2] < pos);
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 font-semibold text-indigo-600">{i + 1}</td>
                <td className="px-4 py-2">{sequence[i]}</td>
                <td className="px-4 py-2 font-semibold">{pos}</td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {pos === 0
                    ? <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-semibold">Boundary (0)</span>
                    : sequence.indexOf(pos) === sequence.lastIndexOf(pos) && (sequence[sequence.indexOf(pos) + 1] < pos || sequence[sequence.indexOf(pos) - 1] < pos) && i === sequence.length - 2
                    ? ""
                    : ""}
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

// ── Split visualiser — left / right partition ─────────────────────────────────
function SplitView({ head, requests, direction }) {
  if (!requests || requests.length === 0) return null;
  const left  = [...requests].filter((r) => r < head).sort((a, b) => b - a);
  const right = [...requests].filter((r) => r >= head).sort((a, b) => a - b);
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={`rounded-lg p-3 border ${direction === "down" ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
        <p className={`font-semibold text-sm mb-2 ${direction === "down" ? "text-green-700" : "text-gray-500"}`}>
          ⬇ LEFT of head ({head}) {direction === "down" ? "— served FIRST" : "— served SECOND"}
        </p>
        <div className="flex gap-1 flex-wrap">
          {left.length > 0 ? left.map((r, i) => (
            <span key={i} className={`px-2 py-1 rounded text-sm font-semibold ${direction === "down" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{r}</span>
          )) : <span className="text-gray-400 text-sm">None</span>}
        </div>
      </div>
      <div className={`rounded-lg p-3 border ${direction === "up" ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
        <p className={`font-semibold text-sm mb-2 ${direction === "up" ? "text-green-700" : "text-gray-500"}`}>
          ⬆ RIGHT of head ({head}) {direction === "up" ? "— served FIRST" : "— served SECOND"}
        </p>
        <div className="flex gap-1 flex-wrap">
          {right.length > 0 ? right.map((r, i) => (
            <span key={i} className={`px-2 py-1 rounded text-sm font-semibold ${direction === "up" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{r}</span>
          )) : <span className="text-gray-400 text-sm">None</span>}
        </div>
      </div>
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const sequence = runSCAN(ex.head, ex.requests, ex.diskSize, ex.direction);
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
      <StepTable sequence={sequence} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const SCAN = () => {
  const [requests, setRequests] = useState("");
  const [head, setHead]         = useState("");
  const [diskSize, setDiskSize] = useState("");
  const [direction, setDirection] = useState("up");
  const [sequence, setSequence] = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateSCAN = () => {
    if (!requests || !head || !diskSize) {
      setError("Please enter all fields.");
      setSequence([]);
      return;
    }
    setError("");
    const headPos  = parseInt(head);
    const maxDisk  = parseInt(diskSize);
    const reqArr   = requests.split(",").map((v) => parseInt(v.trim())).filter((v) => !isNaN(v));
    if (reqArr.length === 0) {
      setError("Please enter valid comma-separated requests.");
      return;
    }
    setRawRequests(reqArr);
    setSequence(runSCAN(headPos, reqArr, maxDisk, direction));
  };

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">SCAN Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        The Elevator Algorithm — sweeps in one direction, then reverses.
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
          <Section title="What is SCAN Disk Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">SCAN</span>, also called the{" "}
              <span className="font-bold">Elevator Algorithm</span>, moves the disk head in one
              direction (up or down), serving all pending requests along the way, until it reaches
              the end of the disk. It then{" "}
              <span className="font-semibold">reverses direction</span> and sweeps back, serving
              requests on the return journey.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of an elevator: it goes up picking up passengers on every floor, reaches the
              top, then comes back down picking up everyone who was waiting on lower floors.
            </p>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Note the starting head position and initial direction.", d: "e.g., Head at 50, moving Up." },
                { n: 2, t: "Split requests into LEFT and RIGHT of the head.", d: "LEFT = all requests with cylinder < head. RIGHT = all requests with cylinder ≥ head." },
                { n: 3, t: "Serve the side matching the initial direction first.", d: "Moving Up → serve RIGHT in ascending order. Moving Down → serve LEFT in descending order." },
                { n: 4, t: "Reach the disk boundary (0 or max cylinder).", d: "The head always travels to the end of the disk before reversing, even if there are no more requests in that direction." },
                { n: 5, t: "Reverse direction.", d: "Now move in the opposite direction." },
                { n: 6, t: "Serve remaining requests on the return sweep.", d: "These are the requests on the other side of the original head position." },
                { n: 7, t: "Sum all seek distances.", d: "Total = sum of all |next − current| including the boundary move." },
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

          <Section title="Key Formula & Direction Rules">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center mb-4">
              <p className="text-lg font-bold text-indigo-700">
                Total Seek Distance = Σ | position(i+1) − position(i) |
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Including the move to the disk boundary before reversing.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-green-700 mb-2">⬆ Initial Direction: UP</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve requests ≥ head (ascending)</li>
                  <li>Travel to max cylinder (boundary)</li>
                  <li>Reverse → serve requests &lt; head (descending)</li>
                </ol>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-orange-700 mb-2">⬇ Initial Direction: DOWN</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve requests &lt; head (descending)</li>
                  <li>Travel to cylinder 0 (boundary)</li>
                  <li>Reverse → serve requests ≥ head (ascending)</li>
                </ol>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>No starvation — every request is eventually served</li>
                  <li>Much better than FIFO and LIFO for seek time</li>
                  <li>Uniform wait time across all requests</li>
                  <li>Efficient for moderate to heavy workloads</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Requests just behind the head wait a full sweep cycle</li>
                  <li>Always travels to disk boundary — even if no requests there</li>
                  <li>Not as optimal as C-SCAN for uniform wait times</li>
                  <li>Requires knowing disk size (boundary)</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Why SCAN is Better than SSTF">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 mb-4">
              <p className="font-bold text-blue-700 mb-2">🔍 No Starvation</p>
              <p>
                SSTF can starve far-away requests by always picking the nearest one. SCAN
                guarantees that the head will sweep through the entire disk in both directions,
                so <span className="font-semibold">every request is served within at most one
                full sweep cycle</span> — no request waits forever.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Seek Performance</th>
                    <th className="px-4 py-2">Starvation?</th>
                    <th className="px-4 py-2">Max Wait</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO",   "Poor",   "No",  "Unbounded"],
                    ["LIFO",   "Poor",   "Yes", "Unbounded"],
                    ["SSTF",   "Good",   "Yes", "Unbounded"],
                    ["SCAN",   "Better", "No",  "1 full sweep"],
                    ["C-SCAN", "Better", "No",  "1 full sweep"],
                  ].map(([alg, perf, starv, wait], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "SCAN" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className="px-4 py-2 text-gray-600">{perf}</td>
                      <td className={`px-4 py-2 font-semibold ${starv === "Yes" ? "text-red-500" : "text-green-600"}`}>{starv}</td>
                      <td className={`px-4 py-2 text-sm ${wait === "Unbounded" ? "text-red-500" : "text-green-600"}`}>{wait}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="SCAN vs C-SCAN">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">SCAN (Elevator)</p>
                <p className="text-gray-700 mb-2">Sweeps UP then DOWN (or DOWN then UP), serving requests in both directions.</p>
                <p className="text-gray-500 text-xs">⚠ Requests just passed by the head have to wait a full round trip before being served again.</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-bold text-purple-700 mb-2">C-SCAN (Circular SCAN)</p>
                <p className="text-gray-700 mb-2">Sweeps in only ONE direction, jumps back to start without serving on the return, then sweeps again.</p>
                <p className="text-gray-500 text-xs">✅ More uniform wait times — all requests wait at most one full sweep in one direction.</p>
              </div>
            </div>
          </Section>

          <Section title="Quick Verification Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ First position = initial head position.",
                "✅ If direction is UP: serve all requests ≥ head in ascending order, then reach max cylinder, then serve remaining in descending order.",
                "✅ If direction is DOWN: serve all requests < head in descending order, then reach 0, then serve remaining in ascending order.",
                "✅ The boundary point (0 or max) must appear in the sequence — the head always travels to the end.",
                "✅ Each distance = |next − current|. Always absolute value.",
                "✅ Total = sum of all individual step distances, including the boundary move.",
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
            <p>Each example shows the LEFT/RIGHT split of requests around the head, the direction
               of initial travel, a step-by-step explanation, a line chart, a seek-path bar (yellow
               dot = disk boundary), and a full distance table.</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>Enter your disk requests, head position, disk size, and initial direction. The
               simulator will apply SCAN and show a split view, chart, seek-path bar, and distance
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
            onClick={simulateSCAN}
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

              {/* Request sequence badges */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-2">Service Sequence (SCAN order):</p>
                <div className="flex gap-2 flex-wrap">
                  {sequence.map((pos, idx) => (
                    <span key={idx}
                      className={`px-3 py-1 rounded-lg font-semibold ${
                        pos === 0 || pos === parseInt(diskSize)
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                      {pos === 0 || pos === parseInt(diskSize) ? `${pos} ⚡` : pos}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">⚡ = disk boundary (reversal point)</p>
              </div>

              {/* Seek bar */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <SeekBar sequence={sequence} diskSize={parseInt(diskSize)} />
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

export default SCAN;