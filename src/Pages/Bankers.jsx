// Bankers.jsx
import React, { useState } from "react";

// ── Worked example data ───────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Classic Textbook Example",
    available: [3, 3, 2],
    processes: [
      { name: "P0", allocation: [0,1,0], max: [7,5,3] },
      { name: "P1", allocation: [2,0,0], max: [3,2,2] },
      { name: "P2", allocation: [3,0,2], max: [9,0,2] },
      { name: "P3", allocation: [2,1,1], max: [2,2,2] },
      { name: "P4", allocation: [0,0,2], max: [4,3,3] },
    ],
    explanation: [
      "We have 3 resource types (A, B, C). Available = [3, 3, 2].",
      "First calculate Need = Max − Allocation for each process.",
      "P0 need = [7,5,3]−[0,1,0] = [7,4,3]. P1 need = [1,2,2]. P2 need = [6,0,0]. P3 need = [0,1,1]. P4 need = [4,3,1].",
      "Try P1: need [1,2,2] ≤ available [3,3,2] ✅. Grant. Work becomes [3,3,2]+[2,0,0] = [5,3,2].",
      "Try P3: need [0,1,1] ≤ work [5,3,2] ✅. Grant. Work becomes [5,3,2]+[2,1,1] = [7,4,3].",
      "Try P4: need [4,3,1] ≤ work [7,4,3] ✅. Grant. Work becomes [7,4,3]+[0,0,2] = [7,4,5].",
      "Try P0: need [7,4,3] ≤ work [7,4,5] ✅. Grant. Work becomes [7,4,5]+[0,1,0] = [7,5,5].",
      "Try P2: need [6,0,0] ≤ work [7,5,5] ✅. Grant. All processes finish.",
      "Safe Sequence: P1 → P3 → P4 → P0 → P2 ✅",
    ],
  },
  {
    title: "Example 2 — Unsafe State",
    available: [1, 0, 0],
    processes: [
      { name: "P0", allocation: [0,1,0], max: [3,2,1] },
      { name: "P1", allocation: [2,0,0], max: [4,2,0] },
      { name: "P2", allocation: [1,0,1], max: [3,0,1] },
    ],
    explanation: [
      "Available = [1, 0, 0]. This is very tight.",
      "Need: P0 = [3,1,1], P1 = [2,2,0], P2 = [2,0,0].",
      "Try P0: need [3,1,1] ≤ [1,0,0]? No ❌.",
      "Try P1: need [2,2,0] ≤ [1,0,0]? No ❌.",
      "Try P2: need [2,0,0] ≤ [1,0,0]? No ❌.",
      "No process can proceed. System is in an UNSAFE state — deadlock may occur!",
    ],
  },
];

// ── Run Banker's Algorithm ────────────────────────────────────────────────────
function runBankers(available, processes) {
  const avail = [...available];
  const n     = processes.length;
  const alloc = processes.map((p) => p.allocation);
  const max   = processes.map((p) => p.max);
  const need  = max.map((row, i) => row.map((val, j) => val - alloc[i][j]));
  const finish = Array(n).fill(false);
  const safeSeq = [];
  let work = [...avail];
  const steps = [];

  let progress = true;
  while (safeSeq.length < n && progress) {
    progress = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i] && need[i].every((val, j) => val <= work[j])) {
        const oldWork = [...work];
        work = work.map((val, j) => val + alloc[i][j]);
        finish[i] = true;
        const name = processes[i].name || `P${i + 1}`;
        safeSeq.push(name);
        steps.push({ name, need: need[i], work: oldWork, newWork: [...work], granted: true });
        progress = true;
      }
    }
  }
  const safe = safeSeq.length === n;
  return { safe, safeSeq, need, steps };
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

// ── Need matrix table ─────────────────────────────────────────────────────────
function NeedTable({ processes, need, available }) {
  if (!need || need.length === 0) return null;
  const m = available.length;
  const resourceLabels = Array.from({ length: m }, (_, i) => String.fromCharCode(65 + i));
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2">Computed Need Matrix (Max − Allocation):</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Process</th>
            <th className="px-4 py-2">Allocation</th>
            <th className="px-4 py-2">Max</th>
            <th className="px-4 py-2">Need</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 font-semibold text-indigo-600">{p.name || `P${i+1}`}</td>
              <td className="px-4 py-2">[{p.allocation.join(", ")}]</td>
              <td className="px-4 py-2">[{p.max.join(", ")}]</td>
              <td className="px-4 py-2 font-semibold text-green-700">[{need[i].join(", ")}]</td>
            </tr>
          ))}
          <tr className="bg-blue-50">
            <td className="px-4 py-2 font-semibold text-blue-700" colSpan={3}>Available Resources</td>
            <td className="px-4 py-2 font-semibold text-blue-700">[{available.join(", ")}]</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Safety check steps table ──────────────────────────────────────────────────
function SafetySteps({ steps }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2">Safety Algorithm — Step by Step:</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Step</th>
            <th className="px-4 py-2">Process</th>
            <th className="px-4 py-2">Need</th>
            <th className="px-4 py-2">Work (before)</th>
            <th className="px-4 py-2">Work (after grant)</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 font-semibold text-indigo-600">{i + 1}</td>
              <td className="px-4 py-2 font-semibold">{s.name}</td>
              <td className="px-4 py-2">[{s.need.join(", ")}]</td>
              <td className="px-4 py-2 text-gray-500">[{s.work.join(", ")}]</td>
              <td className="px-4 py-2 text-green-700 font-semibold">[{s.newWork.join(", ")}]</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const { safe, safeSeq, need, steps } = runBankers(ex.available, ex.processes);
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>

      {/* Input summary */}
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold">
          Available: [{ex.available.join(", ")}]
        </span>
        {ex.processes.map((p, i) => (
          <span key={i} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold">{p.name}</span>
        ))}
      </div>

      {/* Need table */}
      <NeedTable processes={ex.processes} need={need} available={ex.available} />

      {/* Step explanation */}
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 my-4">
        {ex.explanation.map((line, i) => <li key={i}>{line}</li>)}
      </ol>

      {/* Safety steps */}
      {steps.length > 0 && <SafetySteps steps={steps} />}

      {/* Result */}
      <div className={`mt-4 p-3 rounded-lg border text-sm font-semibold ${safe ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}`}>
        {safe
          ? `✅ Safe State! Safe Sequence: ${safeSeq.join(" → ")}`
          : "❌ Unsafe State! No safe sequence exists. Deadlock may occur."}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const Bankers = () => {
  const [processes, setProcesses] = useState([{ name: "", allocation: "", max: "" }]);
  const [available, setAvailable] = useState("");
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const addProcess = () => {
    setProcesses([...processes, { name: "", allocation: "", max: "" }]);
  };

  const handleChange = (index, field, value) => {
    const newProcesses = [...processes];
    newProcesses[index][field] = value;
    setProcesses(newProcesses);
  };

  const simulateBankers = () => {
    if (!available) {
      setError("Please enter available resources.");
      return;
    }
    if (processes.some((p) => !p.allocation || !p.max)) {
      setError("Please fill in allocation and max for every process.");
      return;
    }
    setError("");

    try {
      const avail = available.split(",").map(Number);
      const parsed = processes.map((p, i) => ({
        name: p.name || `P${i + 1}`,
        allocation: p.allocation.split(",").map(Number),
        max: p.max.split(",").map(Number),
      }));
      const { safe, safeSeq, need, steps } = runBankers(avail, parsed);
      setResult({ safe, safeSeq, need, steps, avail, parsed });
    } catch {
      setError("Invalid input. Please check your numbers and commas.");
    }
  };

  const tabs = [
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 md:p-12">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">Banker's Algorithm Simulation</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        A deadlock avoidance algorithm used by operating systems to make sure the system
        always stays in a safe state before granting any resource.
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
          <Section title="What is the Banker's Algorithm?">
            <p className="text-gray-700 leading-relaxed mb-3">
              The <span className="font-bold text-indigo-600">Banker's Algorithm</span> is a
              deadlock avoidance method. Before giving any resource to a process, the operating
              system checks whether giving those resources will keep the system in a
              <span className="font-semibold"> safe state</span>. If yes, it grants the request.
              If no, it makes the process wait.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              The name comes from banking — a bank never lends out so much money that it cannot
              satisfy all customers who might need to withdraw at the same time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Safe State</p>
                <p className="text-gray-700">
                  A state is safe if there is at least one order in which all processes can
                  finish without any of them getting stuck waiting forever. This order is called
                  the <span className="font-semibold">safe sequence</span>.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Unsafe State</p>
                <p className="text-gray-700">
                  A state is unsafe if no such order exists. This does not always mean deadlock
                  will happen, but it means deadlock is possible. The Banker's Algorithm avoids
                  entering this state at all.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Key Terms — What Do They Mean?">
            <div className="space-y-3">
              {[
                { term: "Resources",   color: "indigo", desc: "Things that processes need to run — like CPU time, memory, or printers. There can be multiple types (e.g., Resource A, B, C)." },
                { term: "Allocation",  color: "blue",   desc: "How many resources a process currently holds right now." },
                { term: "Max",         color: "purple", desc: "The maximum number of resources a process could ever ask for during its lifetime." },
                { term: "Need",        color: "green",  desc: "How many MORE resources a process still needs to finish. Need = Max − Allocation." },
                { term: "Available",   color: "yellow", desc: "The total resources currently free and not given to any process. Work starts with this value." },
                { term: "Work",        color: "orange", desc: "A temporary variable that starts as Available and grows as processes finish and return their resources." },
                { term: "Safe Sequence", color: "teal", desc: "An order in which all processes can run to completion using only the currently available resources plus whatever finished processes return." },
              ].map(({ term, color, desc }) => (
                <div key={term} className="flex gap-3 items-start">
                  <span className={`bg-${color}-100 text-${color}-700 px-3 py-1 rounded-lg font-bold text-sm shrink-0 min-w-24 text-center`}>{term}</span>
                  <p className="text-gray-700 text-sm pt-1">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="How It Works — Step by Step">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 text-sm">
              <p className="font-bold text-indigo-700 mb-1">📐 The One Formula You Need</p>
              <p className="text-gray-700 font-semibold text-center text-base mt-1">Need = Max − Allocation</p>
              <p className="text-gray-500 text-center text-xs mt-1">Calculate this for every process first.</p>
            </div>
            <ol className="space-y-3">
              {[
                { n: 1, t: "Calculate Need for every process.", d: "Need[i] = Max[i] − Allocation[i]. Do this for each resource type." },
                { n: 2, t: "Set Work = Available.", d: "Work is our running total of free resources. It starts equal to Available." },
                { n: 3, t: "Look for an unfinished process whose Need ≤ Work.", d: "This means we have enough free resources to satisfy this process right now." },
                { n: 4, t: "Pretend to run that process.", d: "When it finishes, it releases all its resources. Add its Allocation back to Work." },
                { n: 5, t: "Mark that process as finished.", d: "Add it to the safe sequence. Remove it from consideration." },
                { n: 6, t: "Repeat steps 3–5 until all processes finish or no progress can be made.", d: "" },
                { n: 7, t: "Check the result.", d: "If all processes finished → Safe State ✅. If some processes are stuck → Unsafe State ❌." },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex gap-3 items-start">
                  <span className="bg-indigo-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shrink-0">{n}</span>
                  <div>
                    <span className="font-semibold text-gray-800">{t}</span>{" "}
                    {d && <span className="text-gray-600 text-sm">{d}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="The Safety Check — How to Test Need ≤ Work">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mb-4">
              <p className="font-bold text-blue-700 mb-2">📌 This is the most important check</p>
              <p className="text-gray-700 mb-2">
                For a process with Need = [a, b, c] and current Work = [x, y, z], the check passes only if:
              </p>
              <p className="text-center font-bold text-indigo-700 text-base">a ≤ x AND b ≤ y AND c ≤ z</p>
              <p className="text-gray-500 text-xs text-center mt-1">Every single resource type must be satisfied. If even one fails, skip this process.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-bold text-green-700 mb-2">✅ Check Passes</p>
                <p className="text-gray-600">Need = [1, 2, 2], Work = [3, 3, 2]</p>
                <p className="text-gray-700 mt-1">1≤3 ✅ AND 2≤3 ✅ AND 2≤2 ✅</p>
                <p className="text-green-600 font-semibold mt-1">→ Grant resources, run this process</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-bold text-red-700 mb-2">❌ Check Fails</p>
                <p className="text-gray-600">Need = [7, 4, 3], Work = [3, 3, 2]</p>
                <p className="text-gray-700 mt-1">7≤3 ❌ — fails immediately</p>
                <p className="text-red-600 font-semibold mt-1">→ Skip this process, try the next one</p>
              </div>
            </div>
          </Section>

          <Section title="Advantages & Disadvantages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Completely prevents deadlock</li>
                  <li>Guarantees the system stays in a safe state</li>
                  <li>All processes eventually get to finish</li>
                  <li>Works with multiple resource types</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Processes must declare maximum need upfront — not always realistic</li>
                  <li>Slow — must run the safety check on every resource request</li>
                  <li>Resources may sit unused while the system waits for a safe state</li>
                  <li>Does not work well with dynamically created processes</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Quick Verification Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ Need = Max − Allocation for every process and every resource type.",
                "✅ Work starts equal to Available.",
                "✅ A process can only be selected if ALL its Need values are ≤ the matching Work values.",
                "✅ When a process finishes, add its Allocation to Work before checking the next process.",
                "✅ If all processes are added to the safe sequence → Safe State.",
                "✅ If you get stuck and no process can proceed → Unsafe State.",
                "✅ There can be more than one valid safe sequence — any one of them is correct.",
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
            <p>Each example shows the full input table, the computed Need matrix, a step-by-step
               safety check walkthrough showing Work before and after each grant, and the final
               result. Example 2 shows what an unsafe state looks like.</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>Enter the available resources, then fill in each process's current allocation and
               maximum need. Use commas to separate multiple resource types — e.g., for 3 resources
               type: <span className="font-semibold">3,3,2</span>. The simulator will compute the
               Need matrix, run the safety algorithm, and show every step.</p>
          </div>

          {/* Available resources input */}
          <div className="mb-6 w-full max-w-2xl">
            <label className="block mb-2 font-semibold">Available Resources (comma separated)</label>
            <input
              type="text"
              value={available}
              onChange={(e) => setAvailable(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 3,3,2"
            />
          </div>

          {/* Process table */}
          <div className="w-full max-w-3xl overflow-x-auto">
            <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-indigo-500 text-white">
                <tr>
                  <th className="px-4 py-2">Process</th>
                  <th className="px-4 py-2">Allocation</th>
                  <th className="px-4 py-2">Max</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={process.name}
                        onChange={(e) => handleChange(index, "name", e.target.value)}
                        placeholder={`P${index + 1}`}
                        className="w-full p-2 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={process.allocation}
                        onChange={(e) => handleChange(index, "allocation", e.target.value)}
                        placeholder="e.g., 0,1,0"
                        className="w-full p-2 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={process.max}
                        onChange={(e) => handleChange(index, "max", e.target.value)}
                        placeholder="e.g., 7,5,3"
                        className="w-full p-2 border rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addProcess}
              className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition"
            >
              Add Process
            </button>
          </div>

          {/* Simulate button */}
          <button
            onClick={simulateBankers}
            className="mt-6 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
          >
            Simulate
          </button>

          {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}

          {result && (
            <div className="mt-6 w-full max-w-4xl space-y-4">

              {/* Result banner */}
              <div className={`p-4 rounded-lg border text-center font-bold text-lg ${result.safe ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}`}>
                {result.safe
                  ? `✅ Safe State!  Safe Sequence: ${result.safeSeq.join(" → ")}`
                  : "❌ Unsafe State! No safe sequence exists. Deadlock may occur."}
              </div>

              {/* Need matrix */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <NeedTable
                  processes={result.parsed}
                  need={result.need}
                  available={result.avail}
                />
              </div>

              {/* Safety steps */}
              {result.steps.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <SafetySteps steps={result.steps} />
                </div>
              )}

              {/* Unsafe explanation */}
              {!result.safe && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-bold text-yellow-700 mb-2">⚠️ Why is this unsafe?</p>
                  <p>
                    After trying every process in every order, no process could satisfy its full
                    Need from the available Work. This means the system is stuck —
                    no process can finish and release resources, so no other process can start.
                    This is a potential deadlock situation.
                  </p>
                </div>
              )}

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Bankers;