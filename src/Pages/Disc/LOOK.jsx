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
    direction: "up",
    explanation: [
      "Head starts at cylinder 50, moving UP.",
      "Split requests: LEFT of 50 → [39, 38, 18] | RIGHT of 50 → [55, 58, 90, 150, 160, 184].",
      "Moving UP first: serve right side in ascending order → 55 → 58 → 90 → 150 → 160 → 184.",
      "Key difference from SCAN: After serving 184 (the last request going UP), check if there are requests on the left.",
      "There ARE requests on the left → reverse direction immediately. NO unnecessary boundary travel!",
      "Reverse direction, now moving DOWN: serve left side in descending order → 39 → 38 → 18.",
      "Step-by-step: |55-50|=5, |58-55|=3, |90-58|=32, |150-90|=60, |160-150|=10, |184-160|=24, |39-184|=145, |38-39|=1, |18-38|=20.",
      "Total Seek Distance = 5+3+32+60+10+24+145+1+20 = 300 cylinders.",
      "Compare to SCAN (330): LOOK saves 30 cylinders (9% better)! No wasted boundary travel.",
    ],
  },
  {
    title: "Example 2 — Moving Down (Towards lower cylinders)",
    head: 100,
    requests: [35, 180, 20, 140, 75, 10, 200],
    direction: "down",
    explanation: [
      "Head starts at cylinder 100, moving DOWN.",
      "Split requests: LEFT of 100 → [75, 35, 20, 10] | RIGHT of 100 → [140, 180, 200].",
      "Moving DOWN first: serve left side in descending order → 75 → 35 → 20 → 10.",
      "After serving 10 (the last request going DOWN), check if there are requests on the right.",
      "There ARE requests on the right → reverse direction immediately. Jump directly to 140, not to 0!",
      "Reverse direction, now moving UP: serve right side in ascending order → 140 → 180 → 200.",
      "Step-by-step: |75-100|=25, |35-75|=40, |20-35|=15, |10-20|=10, |140-10|=130, |180-140|=40, |200-180|=20.",
      "Total Seek Distance = 25+40+15+10+130+40+20 = 280 cylinders.",
      "Compare to SCAN (300): LOOK saves 20 cylinders (7% better)! More efficient reversal.",
    ],
  },
  {
    title: "Example 3 — No Requests on Return Side",
    head: 60,
    requests: [10, 20, 30, 40, 50],
    direction: "up",
    explanation: [
      "Head starts at cylinder 60, moving UP. All requests are BELOW the head!",
      "Split requests: LEFT of 60 → [10, 20, 30, 40, 50] | RIGHT of 60 → (none).",
      "Moving UP first: no requests on the right. Head continues up but finds nothing.",
      "Key LOOK feature: Check if there are more requests in the direction of movement.",
      "No more requests going UP → immediately reverse (don't go to boundary like SCAN).",
      "Reverse direction, now moving DOWN: serve all left requests in descending order → 50 → 40 → 30 → 20 → 10.",
      "Step-by-step: |50-60|=10 (immediate reversal, no boundary waste), |40-50|=10, |30-40|=10, |20-30|=10, |10-20|=10.",
      "Total Seek Distance = 10+10+10+10+10+10 = 60 cylinders.",
      "Compare to SCAN (230): LOOK saves 170 cylinders (74% better)! HUGE difference when one-sided!",
    ],
  },
  {
    title: "Example 4 — Clustered Requests with Early Reversal",
    head: 50,
    requests: [10, 15, 20, 80, 85, 90],
    direction: "up",
    explanation: [
      "Head starts at cylinder 50, moving UP.",
      "Split requests: LEFT of 50 → [10, 15, 20] | RIGHT of 50 → [80, 85, 90].",
      "Moving UP first: serve right cluster in order → 80 → 85 → 90.",
      "After 90, check if there are more requests going UP. No requests beyond 90.",
      "LOOK reverses immediately (no boundary travel to 99/100/etc).",
      "Reverse, moving DOWN: serve left cluster in descending order → 20 → 15 → 10.",
      "Step-by-step: |80-50|=30, |85-80|=5, |90-85|=5, |20-90|=70, |15-20|=5, |10-15|=5.",
      "Total Seek Distance = 30+5+5+70+5+5 = 120 cylinders.",
      "LOOK is optimal here because clusters are well-defined. No wasted boundary moves.",
    ],
  },
  {
    title: "Example 5 — Symmetrical Requests Both Sides",
    head: 50,
    requests: [10, 20, 30, 70, 80, 90],
    direction: "down",
    explanation: [
      "Head starts at cylinder 50, moving DOWN. Symmetrical distribution.",
      "Split requests: LEFT of 50 → [10, 20, 30] | RIGHT of 50 → [70, 80, 90].",
      "Moving DOWN first: serve left side in descending order → 30 → 20 → 10.",
      "After 10, check if there are more requests going DOWN. No requests below 10.",
      "LOOK reverses immediately to serve the right side.",
      "Reverse, moving UP: serve right side in ascending order → 70 → 80 → 90.",
      "Step-by-step: |30-50|=20, |20-30|=10, |10-20|=10, |70-10|=60, |80-70|=10, |90-80|=10.",
      "Total Seek Distance = 20+10+10+60+10+10 = 120 cylinders.",
      "LOOK handles symmetrical requests efficiently with early reversal when needed.",
    ],
  },
];

// ── LOOK algorithm (reusable) ──────────────────────────────────────────────────
function runLOOK(headPos, reqArr, direction) {
  const sorted = [...reqArr].sort((a, b) => a - b);
  const seq = [headPos];
  const left  = sorted.filter((r) => r < headPos).reverse();
  const right = sorted.filter((r) => r >= headPos);

  if (direction === "up") {
    // Move up, serve all right requests, then reverse and serve left
    seq.push(...right);
    seq.push(...left); // Direct reversal, no boundary
  } else {
    // Move down, serve all left requests, then reverse and serve right
    seq.push(...left);
    seq.push(...right); // Direct reversal, no boundary
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
        <span className="flex items-center gap-1"><span style={{width:10,height:10,borderRadius:"50%",background:"#4f46e5",display:"inline-block"}} /> Start</span>
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
const LOOK = () => {
  const [requests, setRequests] = useState("");
  const [head, setHead]         = useState("");
  const [direction, setDirection] = useState("up");
  const [sequence, setSequence] = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateLOOK = () => {
    if (!requests || !head) {
      setError("Please enter all fields.");
      setSequence([]);
      return;
    }
    setError("");
    const headPos  = parseInt(head);
    const reqArr   = requests.split(",").map((v) => parseInt(v.trim())).filter((v) => !isNaN(v));
    if (reqArr.length === 0) {
      setError("Please enter valid comma-separated requests.");
      return;
    }
    setRawRequests(reqArr);
    setSequence(runLOOK(headPos, reqArr, direction));
  };

  const resetSimulation = () => {
    setRequests("");
    setHead("");
    setDirection("up");
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

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">LOOK Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        The Smart Elevator — only visits cylinders that have requests, no unnecessary boundary travel.
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
          <Section title="What is LOOK Disk Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">LOOK</span>, also called{" "}
              <span className="font-bold">C-LOOK</span> when applied bidirectionally, is a smarter
              version of SCAN. Instead of always travelling to the disk boundary (0 or max cylinder),
              the disk head only{" "}
              <span className="font-semibold">looks ahead to see if there are more requests in the
              current direction</span>. If not, it immediately reverses — eliminating unnecessary
              boundary travel.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of an elevator that <span className="font-semibold">doesn't always go to the
              top floor</span> — it checks if anyone is waiting above, and if not, it reverses
              direction immediately. Much more efficient!
            </p>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Note the starting head position and initial direction.", d: "e.g., Head at 50, moving Up." },
                { n: 2, t: "Split requests into LEFT and RIGHT of the head.", d: "LEFT = requests < head. RIGHT = requests ≥ head." },
                { n: 3, t: "Serve requests in the direction of initial movement.", d: "Moving Up → serve RIGHT in ascending order. Moving Down → serve LEFT in descending order." },
                { n: 4, t: "After serving the last request in that direction, LOOK AHEAD.", d: "Are there more requests beyond the last one I just served?" },
                { n: 5, t: "If NO more requests ahead, immediately reverse direction.", d: "Don't go to boundary — waste avoided!" },
                { n: 6, t: "If YES more requests ahead (rare), continue in the same direction.", d: "Keep moving toward the next cluster." },
                { n: 7, t: "Serve remaining requests on the return sweep.", d: "These are on the other side of the original head position." },
                { n: 8, t: "Sum all seek distances.", d: "No boundary costs — only actual request distances." },
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
                No boundary overhead — only counts actual request positions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-green-700 mb-2">⬆ Initial Direction: UP</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve all requests ≥ head (ascending)</li>
                  <li>After last request, check if more requests beyond it</li>
                  <li>If NO → reverse immediately and serve requests &lt; head (descending)</li>
                  <li>If YES (rare) → continue up to next cluster</li>
                </ol>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
                <p className="font-bold text-orange-700 mb-2">⬇ Initial Direction: DOWN</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Serve all requests &lt; head (descending)</li>
                  <li>After last request, check if more requests beyond it</li>
                  <li>If NO → reverse immediately and serve requests ≥ head (ascending)</li>
                  <li>If YES (rare) → continue down to next cluster</li>
                </ol>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>No starvation — all requests served fairly</li>
                  <li>Eliminates boundary overhead of SCAN</li>
                  <li>Better performance than SCAN in most cases</li>
                  <li>Smarter reversal decision logic</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Slightly more complex than SCAN</li>
                  <li>Requires tracking maximum request position in each direction</li>
                  <li>Requests just behind the head still wait a full sweep (like SCAN)</li>
                  <li>Does not improve uniform wait times vs SCAN</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="LOOK vs SCAN vs C-LOOK">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Reversal Point</th>
                    <th className="px-4 py-2">Efficiency</th>
                    <th className="px-4 py-2">Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO",   "N/A (arrival order)", "Poor", "Very Simple"],
                    ["SCAN",   "Always at boundary (0 or max)", "Better", "Simple"],
                    ["LOOK",   "Last request in direction", "Better+", "Moderate"],
                    ["C-LOOK", "Last request, one direction only", "Best", "Moderate"],
                  ].map(([alg, rev, eff, comp], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "LOOK" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className="px-4 py-2 text-gray-600">{rev}</td>
                      <td className={`px-4 py-2 ${alg === "LOOK" ? "text-green-600 font-semibold" : "text-gray-600"}`}>{eff}</td>
                      <td className="px-4 py-2 text-gray-600">{comp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="LOOK vs SCAN: Real Example">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">❌ SCAN Approach</p>
                <p className="text-gray-700 mb-2">Head at 50, requests [10, 20, 30, 40, 50], moving UP.</p>
                <p className="font-semibold text-gray-700 mb-1">Path: 50 → (no requests UP) → 199 (boundary) → 40 → 30 → 20 → 10</p>
                <p className="text-gray-500">Total: ~250 cylinders (includes 150 cylinder boundary waste)</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ LOOK Approach</p>
                <p className="text-gray-700 mb-2">Head at 50, requests [10, 20, 30, 40, 50], moving UP.</p>
                <p className="font-semibold text-gray-700 mb-1">Path: 50 → (check UP: no more requests) → reverse → 40 → 30 → 20 → 10</p>
                <p className="text-gray-500">Total: ~60 cylinders (saves 190 cylinders!) 🎯</p>
              </div>
            </div>
          </Section>

          <Section title="Quick Verification Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ First position = initial head position.",
                "✅ Requests are split: LEFT (< head) and RIGHT (≥ head).",
                "✅ If direction UP: serve RIGHT in ascending order, then LEFT in descending.",
                "✅ If direction DOWN: serve LEFT in descending order, then RIGHT in ascending.",
                "✅ NO boundary stops (0 or max). The head reverses at the last actual request.",
                "✅ Each distance = |next − current|. Always absolute value.",
                "✅ Total = sum of all step distances. Should be notably less than SCAN for asymmetrical requests.",
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
            <p>Each example shows the LEFT/RIGHT split, initial direction, step-by-step explanation with
               performance insights, a line chart, a seek-path bar, and a distance table. Compare each LOOK
               result to SCAN to see the efficiency gains!</p>
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
              Enter your disk requests, head position, and initial direction. The simulator will apply
              LOOK and show a split view, chart, and distance table. Watch how LOOK avoids unnecessary
              boundary travel!
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

              {/* Direction Selection */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Initial Head Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="up">⬆ Up (towards higher cylinders)</option>
                  <option value="down">⬇ Down (towards lower cylinders)</option>
                </select>
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
            onClick={simulateLOOK}
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

              {/* Split view */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-3 text-gray-700">Left / Right Split Around Head:</p>
                <SplitView head={parseInt(head)} requests={rawRequests} direction={direction} />
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

              {/* Request Sequence Badges */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-3 text-gray-700">Service Sequence (LOOK order):</p>
                <div className="flex gap-2 flex-wrap">
                  {sequence.map((pos, idx) => (
                    <span key={idx}
                      className="px-3 py-2 rounded-lg font-semibold text-sm bg-indigo-100 text-indigo-700">
                      {pos}
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

export default LOOK;