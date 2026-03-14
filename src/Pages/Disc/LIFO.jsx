// LIFO.jsx
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
      "Head starts at cylinder 50.",
      "Requests arrive in order: 55, 58, 39, 18, 90, 160, 150, 38, 184.",
      "LIFO serves the LAST arrived request first, so service order is reversed: 184 → 38 → 150 → 160 → 90 → 18 → 39 → 58 → 55.",
      "Total Seek Distance = |184-50|+|38-184|+|150-38|+|160-150|+|90-160|+|18-90|+|39-18|+|58-39|+|55-58| = 134+146+112+10+70+72+21+19+3 = 587 cylinders.",
    ],
  },
  {
    title: "Example 2 — Head in the middle",
    head: 100,
    requests: [35, 180, 20, 140, 75],
    explanation: [
      "Head starts at cylinder 100.",
      "Requests arrive in order: 35, 180, 20, 140, 75.",
      "LIFO reverses the queue: 75 → 140 → 20 → 180 → 35.",
      "Total Seek Distance = |75-100|+|140-75|+|20-140|+|180-20|+|35-180| = 25+65+120+160+145 = 515 cylinders.",
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

// ── Step-by-step distance table ───────────────────────────────────────────────
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

// ── Arrival order vs service order comparison ─────────────────────────────────
function OrderComparison({ head, requests }) {
  if (!requests || requests.length === 0) return null;
  const serviceOrder = [...requests].reverse();
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-semibold text-blue-700 mb-2 text-sm">📥 Arrival Order (as entered)</p>
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
          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
            {r}
          </span>
        ))}
      </div>
      <OrderComparison head={ex.head} requests={ex.requests} />
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 my-4">
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

  const data = sequence.map((pos, idx) => ({ name: `Step ${idx}`, position: pos }));

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">LIFO Disk Scheduling</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Last In, First Out — serves the most recently arrived request first.
        Learn how it works, study worked examples, then try it yourself.
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
              It works like a stack — the last item pushed is the first item popped.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of a stack of plates: you always pick up the plate that was placed on top most
              recently, not the one at the bottom of the pile.
            </p>
          </Section>

          <Section title="LIFO vs FIFO — The Key Difference">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-bold text-blue-700 mb-2">FIFO (First In, First Out)</p>
                <p className="text-gray-600 mb-2">Arrival order: 55, 58, 39, 18, 90</p>
                <p className="text-gray-700">Service order: <span className="font-semibold">55 → 58 → 39 → 18 → 90</span></p>
                <p className="text-gray-500 mt-1 text-xs">Same as arrival — oldest request first.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">LIFO (Last In, First Out)</p>
                <p className="text-gray-600 mb-2">Arrival order: 55, 58, 39, 18, 90</p>
                <p className="text-gray-700">Service order: <span className="font-semibold">90 → 18 → 39 → 58 → 55</span></p>
                <p className="text-gray-500 mt-1 text-xs">Reversed — newest request first.</p>
              </div>
            </div>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                { n: 1, t: "Record the head start position.", d: "This is where the disk arm currently sits (e.g., cylinder 50)." },
                { n: 2, t: "Collect all pending requests in a stack.", d: "Each new request is pushed onto the top of the stack." },
                { n: 3, t: "Pop and serve the top of the stack.", d: "The last arrived request (top of stack) is served first." },
                { n: 4, t: "Calculate seek distance for each move.", d: "Seek distance = |current − next|." },
                { n: 5, t: "Repeat until all requests are served.", d: "Keep popping until the stack is empty." },
                { n: 6, t: "Sum all individual distances.", d: "Total Seek Distance = Σ |position(i+1) − position(i)|." },
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
                Service Order = Reverse of Arrival Order
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Seek Distance = Σ | position(i+1) − position(i) | applied to the reversed queue.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Simple to implement (just a stack)</li>
                  <li>Recent requests get fast response</li>
                  <li>Good when latest requests are most important</li>
                  <li>Low latency for burst workloads</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Starvation — old requests may never be served</li>
                  <li>Not fair to early-arriving requests</li>
                  <li>Can be inefficient for seek distance</li>
                  <li>Unpredictable for low-priority requests</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="The Starvation Problem">
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-bold text-yellow-700 mb-2">⚠️ Critical Drawback — Starvation</p>
              <p className="mb-2">
                In a real system, requests keep arriving continuously. Because LIFO always serves
                the <span className="font-semibold">most recent</span> request first, older requests
                at the bottom of the stack may wait indefinitely — this is called{" "}
                <span className="font-semibold text-red-600">starvation</span>.
              </p>
              <p>
                Example: If requests keep arriving after cylinder 90, the original request for
                cylinder 55 (which arrived first) may never get served.
              </p>
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
                    ["LIFO",        "Reverse arrival",     "Poor",   "Yes"],
                    ["SSTF",        "Shortest seek first", "Good",   "Yes"],
                    ["SCAN",        "Back and forth",      "Better", "No" ],
                    ["C-SCAN",      "One direction only",  "Better", "No" ],
                  ].map(([alg, ord, perf, starv], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "LIFO" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
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
                "✅ The service order must be the exact reverse of the arrival order.",
                "✅ Each distance = |next − current|. Always use absolute value — no negatives.",
                "✅ Total = sum of all individual step distances.",
                "✅ The last request served must be the one that arrived first.",
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
            <p>Each example shows the arrival order (blue badges), the reversed LIFO service order
               (green badges), a step-by-step breakdown, a line chart of head movement, a seek-path
               bar, and a full distance table.</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>Enter your disk request queue in arrival order and the initial head position.
               The simulator will reverse the queue (LIFO) and show the full result with a chart,
               seek-path bar, and distance table.</p>
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
            onClick={simulateLIFO}
              className="w-full bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-bold text-lg transition mb-6"
          >
            Simulate
          </button>

          {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

          {sequence.length > 0 && (
            <div className="w-full max-w-4xl space-y-4">

              {/* Arrival vs service order */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="font-semibold mb-2">Arrival Order vs Service Order:</p>
                <OrderComparison head={parseInt(head)} requests={rawRequests} />
              </div>

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
                <p className="font-semibold mb-2">Service Sequence (LIFO order):</p>
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

export default LIFO;