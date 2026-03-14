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
    title: "Example 1 — Basic Stack (Last In, First Out)",
    head: 50,
    requests: [55, 58, 39, 18, 90, 160, 150, 38, 184],
    explanation: [
      "Head starts at cylinder 50.",
      "Requests arrive in order: 55 → 58 → 39 → 18 → 90 → 160 → 150 → 38 → 184.",
      "Imagine a stack of plates. The last plate placed on top (184) is served first. This is LIFO.",
      "Service order (reversed): 184 → 38 → 150 → 160 → 90 → 18 → 39 → 58 → 55.",
      "The very first request (55) is served last. It waited the longest!",
      "Step-by-step distances: |184-50|=134, |38-184|=146, |150-38|=112, |160-150|=10, |90-160|=70, |18-90|=72, |39-18|=21, |58-39|=19, |55-58|=3.",
      "Total Seek Distance = 134+146+112+10+70+72+21+19+3 = 587 cylinders.",
      "Compare to FIFO (458): LIFO is 28% worse because the reversed order causes huge jumps.",
    ],
  },
  {
    title: "Example 2 — Middle Head Position",
    head: 100,
    requests: [35, 180, 20, 140, 75],
    explanation: [
      "Head starts at cylinder 100 (middle of disk).",
      "Requests arrive in order: 35 → 180 → 20 → 140 → 75.",
      "Last request (most recent) is 75. It gets served first. Next is 140. Then 20, and so on.",
      "Service order (reversed): 75 → 140 → 20 → 180 → 35.",
      "The first request (35, from earliest) is served last. This is the starvation risk!",
      "Step-by-step distances: |75-100|=25, |140-75|=65, |20-140|=120, |180-20|=160, |35-180|=145.",
      "Total Seek Distance = 25+65+120+160+145 = 515 cylinders.",
      "With just 5 requests, seek distance is already very high. LIFO is not good for optimization.",
    ],
  },
  {
    title: "Example 3 — All Requests on One Side",
    head: 60,
    requests: [10, 15, 20, 25, 30],
    explanation: [
      "Head starts at cylinder 60. All requests are BELOW the head (on the left).",
      "Requests arrive: 10 → 15 → 20 → 25 → 30.",
      "Last request (30) comes first. Most recent = highest priority in LIFO.",
      "Service order (reversed): 30 → 25 → 20 → 15 → 10.",
      "The head bounces back and forth between nearby cylinders (30, 25, 20, 15, 10).",
      "Step-by-step distances: |30-60|=30, |25-30|=5, |20-25|=5, |15-20|=5, |10-15|=5.",
      "Total Seek Distance = 30+5+5+5+5 = 50 cylinders.",
      "When requests are close together, LIFO performs okay. But starvation still exists!",
    ],
  },
  {
    title: "Example 4 — Alternating High and Low Requests",
    head: 50,
    requests: [10, 100, 20, 90, 30],
    explanation: [
      "Head starts at cylinder 50. Requests alternate between low (10, 20, 30) and high (100, 90).",
      "Requests arrive: 10 → 100 → 20 → 90 → 30 (last one).",
      "LIFO serves in reverse: 30 → 90 → 20 → 100 → 10.",
      "Notice: The head oscillates wildly between low and high cylinders!",
      "Service order shows the oscillation problem of LIFO: it reverses the arrival order completely.",
      "Step-by-step distances: |30-50|=20, |90-30|=60, |20-90|=70, |100-20|=80, |10-100|=90.",
      "Total Seek Distance = 20+60+70+80+90 = 320 cylinders.",
      "The reversed order causes the head to bounce around the disk inefficiently!",
    ],
  },
  {
    title: "Example 5 — Continuous Stream of Requests (Starvation Risk)",
    head: 75,
    requests: [40, 50, 60, 70, 80],
    explanation: [
      "Head starts at cylinder 75. Requests arrive in increasing order: 40 → 50 → 60 → 70 → 80.",
      "In a real system, new requests keep arriving. LIFO always serves the newest first.",
      "Current service order (reversed from arrival): 80 → 70 → 60 → 50 → 40.",
      "In reality: If more requests keep coming (85, 90, 95...), the oldest request (40) may NEVER be served.",
      "This is called STARVATION. Old requests wait forever while new ones are served.",
      "Step-by-step distances: |80-75|=5, |70-80|=10, |60-70|=10, |50-60|=10, |40-50|=10.",
      "Total Seek Distance = 5+10+10+10+10 = 45 cylinders.",
      "Performance looks good here, but in reality, cylinder 40 could wait forever if new requests keep arriving!",
    ],
  },
];

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

// ── Step-by-step distance table ───────────────────────────────────────────────
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

// ── Arrival order vs service order comparison ─────────────────────────────────
function OrderComparison({ head, requests }) {
  if (!requests || requests.length === 0) return null;
  const serviceOrder = [...requests].reverse();
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-semibold text-blue-700 mb-2 text-sm">📥 Arrival Order (as entered)</p>
        <p className="text-xs text-gray-500 mb-2">First request to last request</p>
        <div className="flex gap-1 flex-wrap">
          {requests.map((r, i) => (
            <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-semibold">
              {r}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="font-semibold text-green-700 mb-2 text-sm">⚙️ Service Order (LIFO reversed)</p>
        <p className="text-xs text-gray-500 mb-2">Last request to first request</p>
        <div className="flex gap-1 flex-wrap">
          {serviceOrder.map((r, i) => (
            <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-semibold">
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const sequence = [ex.head, ...([...ex.requests].reverse())];
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
      <OrderComparison head={ex.head} requests={ex.requests} />
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 my-4">
        {ex.explanation.map((line, i) => <li key={i}>{line}</li>)}
      </ol>
      <div className="h-52 bg-white border border-gray-200 rounded-lg p-3 mb-4">
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
const LIFO = () => {
  const [requests, setRequests] = useState("");
  const [head, setHead]         = useState("");
  const [sequence, setSequence] = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const simulateLIFO = () => {
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
    setRawRequests(reqArr);
    setSequence([headPos, ...reqArr.slice().reverse()]);
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

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">LIFO Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Last In, First Out — newest request gets served first. Simple but unfair to old requests.
        Learn how it works, study examples, then try it yourself.
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
          <Section title="What is LIFO Disk Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">LIFO (Last In, First Out)</span> is a
              disk scheduling algorithm where the{" "}
              <span className="font-semibold">most recently arrived request is served first</span>.
              It works like a stack of plates — you take the plate from the top (the one placed
              most recently), not from the bottom.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Simple way to understand: Imagine requests arriving in a pile. The newest request
              (on top) always gets picked first. The oldest request (at the bottom) has to wait.
            </p>
          </Section>

          <Section title="LIFO vs FIFO — Easy Example">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-bold text-blue-700 mb-2">FIFO (Fair & Equal)</p>
                <p className="text-gray-600 mb-2">Requests arrive: 55, 58, 39, 18, 90</p>
                <p className="text-gray-700 mb-1">Serve in order: <span className="font-semibold">55 → 58 → 39 → 18 → 90</span></p>
                <p className="text-gray-500 text-xs">Everyone gets treated the same way. First come, first served.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">LIFO (Newest First)</p>
                <p className="text-gray-600 mb-2">Requests arrive: 55, 58, 39, 18, 90</p>
                <p className="text-gray-700 mb-1">Serve in order: <span className="font-semibold">90 → 18 → 39 → 58 → 55</span></p>
                <p className="text-gray-500 text-xs">Newest request (90) goes first. Oldest request (55) goes last.</p>
              </div>
            </div>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Record the head start position.", d: "The disk arm starts at one place (e.g., cylinder 50)." },
                { n: 2, t: "Collect all requests in arrival order.", d: "55, then 58, then 39, and so on." },
                { n: 3, t: "Reverse the order (LIFO).", d: "Newest request goes first: 90, then 18, then 39..." },
                { n: 4, t: "Serve requests one by one.", d: "Move the head to each request in the reversed order." },
                { n: 5, t: "Calculate distance for each move.", d: "Distance = how many cylinders the head travels." },
                { n: 6, t: "Sum all distances.", d: "Total Seek Distance = all the distances added together." },
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

          <Section title="Key Rule">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center mb-4">
              <p className="text-lg font-bold text-indigo-700">
                Service Order = Reverse of Arrival Order
              </p>
              <p className="text-sm text-gray-500 mt-1">
                That's the simple rule. Just flip the queue upside down!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Super simple to build (just a stack)</li>
                  <li>Recent requests get fast response</li>
                  <li>Good for urgent/new requests</li>
                  <li>Very easy to understand</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Old requests may NEVER be served (STARVATION)</li>
                  <li>Very unfair to early requests</li>
                  <li>Seek distance is usually high</li>
                  <li>Poor performance overall</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="The Big Problem — STARVATION">
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-bold text-red-700 mb-2">⚠️ STARVATION — Old Requests Never Get Served!</p>
              <p className="mb-3">
                Imagine you're the first person in line. You wait for service. But every time a new
                person arrives, they get served before you. If new people keep coming, you might
                <span className="font-bold text-red-600"> wait forever</span> and never get served.
              </p>
              <p className="font-semibold text-gray-800">
                Real example: Request for cylinder 55 arrives first. But if new requests (85, 90, 95...)
                keep coming, cylinder 55 might never be served because LIFO always picks the newest!
              </p>
            </div>
          </Section>

          <Section title="Comparison with Other Algorithms">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Service Order</th>
                    <th className="px-4 py-2">Performance</th>
                    <th className="px-4 py-2">Fair?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO",   "First request first",      "Poor",   "Yes"  ],
                    ["LIFO",   "Last request first",       "Poor",   "NO ❌"],
                    ["SSTF",   "Closest request first",    "Good",   "NO ❌"],
                    ["SCAN",   "Sweep back & forth",       "Better", "Yes"  ],
                    ["LOOK",   "Smart sweep (no boundary)", "Better", "Yes"  ],
                  ].map(([alg, ord, perf, fair], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "LIFO" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className="px-4 py-2 text-gray-600">{ord}</td>
                      <td className="px-4 py-2 text-gray-600">{perf}</td>
                      <td className={`px-4 py-2 font-bold ${fair === "Yes" ? "text-green-600" : "text-red-600"}`}>{fair}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Quick Verification Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ The first position = the head start position.",
                "✅ The service order = exactly reversed arrival order.",
                "✅ Distance = absolute value (always positive).",
                "✅ Total = sum of all step distances.",
                "✅ The first request to arrive is served LAST.",
                "✅ The last request to arrive is served FIRST.",
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
            <p>Each example shows arrival order (blue badges) vs service order (green badges).
               Watch how the order reverses. See how the head bounces around inefficiently. Pay
               attention to the starvation problem — how the oldest request suffers!</p>
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
              Enter your disk requests in arrival order (first to last). Then enter the head position.
              The simulator will reverse the queue (that's LIFO) and show you the result. Watch how
              the newest request gets served first!
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
                  Disk Requests (comma separated, in arrival order)
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
            onClick={simulateLIFO}
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

              {/* Arrival vs service order */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-3 text-gray-700">Arrival Order vs Service Order:</p>
                <OrderComparison head={parseInt(head)} requests={rawRequests} />
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

              {/* Request sequence badges */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-3 text-gray-700">Service Sequence (LIFO order):</p>
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

export default LIFO;