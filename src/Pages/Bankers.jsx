import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ScatterChart, Scatter } from "recharts";

// ── Example scenarios ──────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Classic Safe State (5 Processes, 3 Resources)",
    available: [3, 3, 2],
    processes: [
      { name: "P0", allocation: [0, 1, 0], max: [7, 5, 3] },
      { name: "P1", allocation: [2, 0, 0], max: [3, 2, 2] },
      { name: "P2", allocation: [3, 0, 2], max: [9, 0, 2] },
      { name: "P3", allocation: [2, 1, 1], max: [2, 2, 2] },
      { name: "P4", allocation: [0, 0, 2], max: [4, 3, 3] },
    ],
    explanation: [
      "System has 3 resource types (A, B, C). Available = [3, 3, 2].",
      "Calculate Need (Max − Allocation) for each process.",
      "P0: [7,4,3] | P1: [1,2,2] | P2: [6,0,0] | P3: [0,1,1] | P4: [4,3,1]",
      "Safety check with Work = [3, 3, 2].",
      "P1 can run (Need [1,2,2] ≤ Work [3,3,2] ✅). Finishes at Work = [5,3,2].",
      "P3 can run (Need [0,1,1] ≤ Work [5,3,2] ✅). Finishes at Work = [7,4,3].",
      "P4 can run (Need [4,3,1] ≤ Work [7,4,3] ✅). Finishes at Work = [7,4,5].",
      "P0 can run (Need [7,4,3] ≤ Work [7,4,5] ✅). Finishes at Work = [7,5,5].",
      "P2 can run (Need [6,0,0] ≤ Work [7,5,5] ✅).",
      "Safe Sequence: P1 → P3 → P4 → P0 → P2 ✅",
    ],
  },
  {
    title: "Example 2 — Unsafe State (Potential Deadlock)",
    available: [1, 0, 0],
    processes: [
      { name: "P0", allocation: [0, 1, 0], max: [3, 2, 1] },
      { name: "P1", allocation: [2, 0, 0], max: [4, 2, 0] },
      { name: "P2", allocation: [1, 0, 1], max: [3, 0, 1] },
    ],
    explanation: [
      "System has very limited resources. Available = [1, 0, 0].",
      "Need: P0 = [3,1,1], P1 = [2,2,0], P2 = [2,0,0].",
      "Try P0: Need [3,1,1] ≤ Work [1,0,0]? 3≤1 ❌. NO!",
      "Try P1: Need [2,2,0] ≤ Work [1,0,0]? 2≤1 ❌. NO!",
      "Try P2: Need [2,0,0] ≤ Work [1,0,0]? 2≤1 ❌. NO!",
      "No process can proceed. System is STUCK!",
      "This is UNSAFE state. Deadlock is possible! ❌",
    ],
  },
  {
    title: "Example 3 — Single Resource (Simple Case)",
    available: [10],
    processes: [
      { name: "P0", allocation: [5], max: [8] },
      { name: "P1", allocation: [3], max: [7] },
      { name: "P2", allocation: [2], max: [4] },
    ],
    explanation: [
      "Single resource type. Available = [10]. Total allocation = 10.",
      "Need: P0 = [3], P1 = [4], P2 = [2].",
      "P2: Need [2] ≤ Work [10] ✅. Grant. Work = [12].",
      "P0: Need [3] ≤ Work [12] ✅. Grant. Work = [17].",
      "P1: Need [4] ≤ Work [17] ✅. Grant.",
      "Safe Sequence: P2 → P0 → P1 ✅",
    ],
  },
  {
    title: "Example 4 — Four Resources (Complex Case)",
    available: [6, 4, 7, 5],
    processes: [
      { name: "P0", allocation: [2, 1, 2, 1], max: [4, 2, 3, 2] },
      { name: "P1", allocation: [1, 2, 1, 2], max: [3, 4, 3, 4] },
      { name: "P2", allocation: [2, 1, 2, 1], max: [5, 3, 4, 2] },
      { name: "P3", allocation: [1, 0, 2, 1], max: [3, 1, 4, 3] },
    ],
    explanation: [
      "System with 4 resource types. Available = [6, 4, 7, 5].",
      "Total allocation = [6, 4, 7, 5]. ✅ Matches!",
      "Safety check finds: P0 → P1 → P3 → P2 ✅",
    ],
  },
  {
    title: "Example 5 — Equal Needs (Order Critical)",
    available: [4, 2, 2],
    processes: [
      { name: "P0", allocation: [1, 1, 1], max: [3, 3, 3] },
      { name: "P1", allocation: [2, 0, 0], max: [4, 2, 2] },
      { name: "P2", allocation: [1, 1, 1], max: [3, 3, 3] },
    ],
    explanation: [
      "Tight allocation. Available = [4, 2, 2].",
      "All processes have equal needs at their respective steps.",
      "Safe sequence depends on order: P0 → P1 → P2 ✅",
    ],
  },
];

// ── Run Banker's Algorithm ────────────────────────────────────────────────
function runBankers(available, processes) {
  const avail = [...available];
  const n = processes.length;
  const alloc = processes.map((p) => p.allocation);
  const max = processes.map((p) => p.max);
  const need = max.map((row, i) => row.map((val, j) => val - alloc[i][j]));
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
        const name = processes[i].name || `P${i}`;
        safeSeq.push(name);
        steps.push({ name, need: need[i], work: oldWork, newWork: [...work], granted: true });
        progress = true;
      }
    }
  }
  const safe = safeSeq.length === n;
  return { safe, safeSeq, need, steps };
}

// ── Section card ──────────────────────────────────────────────────────────
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

// ── Resource State Chart ──────────────────────────────────────────────────
function ResourceStateChart({ processes, available, need }) {
  if (!processes || !available || !need) return null;

  const chartData = processes.map((proc, idx) => ({
    name: proc.name,
    allocated: proc.allocation.reduce((a, b) => a + b, 0),
    max: proc.max.reduce((a, b) => a + b, 0),
    need: need[idx].reduce((a, b) => a + b, 0),
  }));

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
      <p className="font-semibold mb-4 text-gray-700">Resource Distribution by Process (Total Units):</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="allocated" fill="#4f46e5" name="Allocated" />
          <Bar dataKey="need" fill="#ef4444" name="Still Need" />
          <Bar dataKey="max" fill="#10b981" name="Max" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Need Analysis Chart ───────────────────────────────────────────────────
function NeedAnalysisChart({ processes, available, need }) {
  if (!processes || !available || !need) return null;

  const chartData = processes.map((proc, idx) => {
    const canSatisfy = need[idx].every((val, j) => val <= available[j]);
    return {
      name: proc.name,
      need: need[idx].reduce((a, b) => a + b, 0),
      available: available.reduce((a, b) => a + b, 0),
      canSatisfy: canSatisfy ? 1 : 0,
    };
  });

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
      <p className="font-semibold mb-4 text-gray-700">Need vs Available (Total Resources):</p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="need" name="Need" />
          <YAxis type="number" dataKey="available" name="Available" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Processes" data={chartData}>
            {chartData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.canSatisfy ? "#10b981" : "#ef4444"}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">
        🟢 Green = Can be satisfied | 🔴 Red = Cannot be satisfied with current available
      </p>
    </div>
  );
}

// ── Allocation vs Need Comparison ─────────────────────────────────────────
function AllocationNeedChart({ processes, need }) {
  if (!processes || !need) return null;

  const chartData = processes.map((proc, idx) => ({
    name: proc.name,
    allocated: proc.allocation.reduce((a, b) => a + b, 0),
    need: need[idx].reduce((a, b) => a + b, 0),
  }));

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
      <p className="font-semibold mb-4 text-gray-700">Allocated vs Need (Gap Analysis):</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="allocated" stroke="#4f46e5" strokeWidth={2} name="Currently Allocated" />
          <Line type="monotone" dataKey="need" stroke="#ef4444" strokeWidth={2} name="Still Needs" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Need matrix table ─────────────────────────────────────────────────────
function NeedTable({ processes, need, available }) {
  if (!need || need.length === 0) return null;
  const m = available.length;
  const resourceLabels = Array.from({ length: m }, (_, i) => String.fromCharCode(65 + i));
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2 text-gray-700">Need Matrix (Max − Allocation):</p>
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
              <td className="px-4 py-2 font-semibold text-indigo-600">{p.name || `P${i + 1}`}</td>
              <td className="px-4 py-2">[{p.allocation.join(", ")}]</td>
              <td className="px-4 py-2">[{p.max.join(", ")}]</td>
              <td className="px-4 py-2 font-semibold text-green-700">[{need[i].join(", ")}]</td>
            </tr>
          ))}
          <tr className="bg-blue-50">
            <td className="px-4 py-2 font-semibold text-blue-700" colSpan={3}>Available</td>
            <td className="px-4 py-2 font-semibold text-blue-700">[{available.join(", ")}]</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Safety check steps table ──────────────────────────────────────────────
function SafetySteps({ steps }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2 text-gray-700">Safety Algorithm — Step by Step:</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Step</th>
            <th className="px-4 py-2">Process</th>
            <th className="px-4 py-2">Need</th>
            <th className="px-4 py-2">Work (before)</th>
            <th className="px-4 py-2">Work (after)</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 font-semibold text-indigo-600">{i + 1}</td>
              <td className="px-4 py-2 font-semibold text-green-700">{s.name}</td>
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

// ── Worked example block ──────────────────────────────────────────────────
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
          <span key={i} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold text-xs">
            {p.name}
          </span>
        ))}
      </div>

      {/* Need table */}
      <NeedTable processes={ex.processes} need={need} available={ex.available} />

      {/* Step explanation */}
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 my-4">
        {ex.explanation.map((line, i) => (
          <li key={i} className={line.includes("✅") ? "text-green-700 font-semibold" : line.includes("❌") ? "text-red-700 font-semibold" : ""}>
            {line}
          </li>
        ))}
      </ol>

      {/* Safety steps */}
      {steps.length > 0 && <SafetySteps steps={steps} />}

      {/* Result */}
      <div className={`mt-4 p-4 rounded-lg border text-sm font-semibold ${safe ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}`}>
        {safe
          ? `✅ SAFE STATE! Safe Sequence: ${safeSeq.join(" → ")}`
          : "❌ UNSAFE STATE! No safe sequence exists. Deadlock may occur."}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
const Bankers = () => {
  const [processes, setProcesses] = useState([{ name: "", allocation: "", max: "" }]);
  const [available, setAvailable] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const addProcess = () => {
    setProcesses([...processes, { name: "", allocation: "", max: "" }]);
  };

  const removeProcess = (index) => {
    if (processes.length > 1) {
      setProcesses(processes.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) => {
    const newProcesses = [...processes];
    newProcesses[index][field] = value;
    setProcesses(newProcesses);
  };

  const resetSimulation = () => {
    setAvailable("");
    setProcesses([{ name: "", allocation: "", max: "" }]);
    setResult(null);
    setError("");
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
        name: p.name || `P${i}`,
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
    { key: "theory", label: "📖 Theory" },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "✏️ Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">Banker's Algorithm Simulator</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        A deadlock avoidance algorithm ensuring the system stays safe before granting resources.
        Learn how it works, study examples, then try it yourself.
      </p>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 bg-white border border-gray-300 rounded-lg p-1 w-full max-w-4xl">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 rounded-md font-semibold text-sm transition ${
              activeTab === t.key ? "bg-indigo-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
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
              deadlock avoidance method. Before giving any resource to a process, the OS checks whether
              granting those resources keeps the system in a <span className="font-semibold">safe state</span>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The name comes from banking — a bank never lends so much that it cannot satisfy all customers
              who might withdraw at the same time.
            </p>
          </Section>

          <Section title="Safe vs Unsafe State">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Safe State</p>
                <p className="text-gray-700">
                  A state where at least one safe sequence exists — an order in which all processes
                  can finish without deadlock.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Unsafe State</p>
                <p className="text-gray-700">
                  A state where no safe sequence exists. Deadlock is possible. System rejects requests.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Key Formulas">
            <div className="space-y-2 text-sm">
              <p><span className="font-bold text-indigo-700">Need[i] = Max[i] − Allocation[i]</span> — How much more each process needs.</p>
              <p><span className="font-bold text-indigo-700">Work starts = Available</span> — Temporary free resource count.</p>
              <p><span className="font-bold text-indigo-700">Check: Need[i] ≤ Work for ALL resources</span> — Can we satisfy this process?</p>
            </div>
          </Section>

          <Section title="The Algorithm — 7 Steps">
            <ol className="space-y-2 text-sm">
              {[
                "1. Calculate Need = Max − Allocation for all processes.",
                "2. Set Work = Available.",
                "3. Find unfinished process where Need ≤ Work (all resources).",
                "4. Grant resources and simulate completion.",
                "5. Work += that process's Allocation.",
                "6. Mark as finished, add to safe sequence.",
                "7. Repeat 3-6 until all finish (Safe ✅) or get stuck (Unsafe ❌).",
              ].map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </ol>
          </Section>

          <Section title="Advantages">
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Completely prevents deadlock</li>
              <li>Guarantees system safety</li>
              <li>Works with multiple resource types</li>
              <li>All processes eventually finish</li>
            </ul>
          </Section>

          <Section title="Disadvantages">
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Processes must declare max upfront</li>
              <li>Slow — safety check on every request</li>
              <li>Resources may sit unused</li>
              <li>Cannot handle dynamic processes</li>
            </ul>
          </Section>
        </>
      )}

      {/* ══ EXAMPLES ══ */}
      {activeTab === "examples" && (
        <div className="w-full max-w-4xl">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">💡 5 Complete Examples</p>
            <p>
              Example 1: Classic safe state. Example 2: Unsafe/deadlock risk. Example 3: Single resource.
              Example 4: Complex 4-resource case. Example 5: Equal needs scenario.
            </p>
          </div>
          {EXAMPLES.map((ex, i) => (
            <WorkedExample key={i} ex={ex} />
          ))}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-blue-50 border border-blue-300 rounded-xl p-4 mb-6">
            <p className="text-blue-700 font-bold mb-1">✏️ Try it yourself</p>
            <p className="text-blue-700">
              Enter available resources and process details. The simulator will visualize resource distribution,
              compute the Need matrix, run the safety algorithm, and show comprehensive charts.
            </p>
          </div>

          {/* Input Form Component */}
          <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-300 p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Define Your System Resources</h3>

            {/* Available resources input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Available Resources (comma separated, e.g., 3,3,2)
              </label>
              <input
                type="text"
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
                placeholder="e.g., 3,3,2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Process table */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">Processes</label>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-indigo-500 text-white">
                    <tr>
                      <th className="px-4 py-2">Process Name</th>
                      <th className="px-4 py-2">Allocation (comma sep)</th>
                      <th className="px-4 py-2">Max (comma sep)</th>
                      <th className="px-4 py-2">Action</th>
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
                            placeholder={`P${index}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={process.allocation}
                            onChange={(e) => handleChange(index, "allocation", e.target.value)}
                            placeholder="0,1,0"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={process.max}
                            onChange={(e) => handleChange(index, "max", e.target.value)}
                            placeholder="7,5,3"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          {processes.length > 1 && (
                            <button
                              onClick={() => removeProcess(index)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add process button */}
              <button
                onClick={addProcess}
                className="mt-3 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold transition"
              >
                + Add Process
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
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
            onClick={simulateBankers}
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
          {result && (
            <div className="w-full max-w-4xl space-y-4">
              {/* Result banner */}
              <div
                className={`p-4 rounded-lg border text-center font-bold text-lg ${
                  result.safe
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-red-50 border-red-300 text-red-700"
                }`}
              >
                {result.safe
                  ? `✅ SAFE STATE! Safe Sequence: ${result.safeSeq.join(" → ")}`
                  : "❌ UNSAFE STATE! No safe sequence exists. Deadlock is possible."}
              </div>

              {/* Charts Section */}
              <div className="bg-white p-6 rounded-lg border border-gray-300">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Visual Analysis</h3>
                
                {/* Chart 1: Resource Distribution */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <ResourceStateChart processes={result.parsed} available={result.avail} need={result.need} />
                </div>

                {/* Chart 2: Need vs Available */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <NeedAnalysisChart processes={result.parsed} available={result.avail} need={result.need} />
                </div>

                {/* Chart 3: Allocation vs Need */}
                <div className="mb-4">
                  <AllocationNeedChart processes={result.parsed} need={result.need} />
                </div>
              </div>

              {/* Need matrix */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <NeedTable processes={result.parsed} need={result.need} available={result.avail} />
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
                    After trying every process in every order, no process could satisfy its complete Need.
                    The system is stuck — no process can finish to release resources. This is a potential
                    deadlock situation.
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