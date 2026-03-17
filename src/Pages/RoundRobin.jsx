import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ScatterChart, Scatter } from "recharts";

// ── Colours for processes ─────────────────────────────────────────────────────
const PROC_COLORS = [
  { bg: "bg-indigo-100", text: "text-indigo-700", hex: "#e0e7ff" },
  { bg: "bg-green-100", text: "text-green-700", hex: "#dcfce7" },
  { bg: "bg-pink-100", text: "text-pink-700", hex: "#fce7f3" },
  { bg: "bg-yellow-100", text: "text-yellow-700", hex: "#fef9c3" },
  { bg: "bg-purple-100", text: "text-purple-700", hex: "#f3e8ff" },
  { bg: "bg-orange-100", text: "text-orange-700", hex: "#ffedd5" },
];
const colorFor = (name, names) => {
  const idx = names.indexOf(name);
  return idx >= 0 ? PROC_COLORS[idx % PROC_COLORS.length] : { bg: "bg-gray-200", text: "text-gray-500", hex: "#e5e7eb" };
};

// ── Example scenarios ──────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — All Arrive at Time 0 (Basic Fair Distribution), Quantum = 2",
    quantum: 2,
    processes: [
      { name: "P1", arrival: 0, burst: 5 },
      { name: "P2", arrival: 0, burst: 3 },
      { name: "P3", arrival: 0, burst: 4 },
    ],
    explanation: [
      "All processes arrive at t=0. Queue starts: [P1, P2, P3]. Quantum = 2 (each gets 2 units per turn).",
      "t=0–2: P1 runs for 2 units (full quantum). P1 remaining = 3. P1 goes to back of queue. Queue: [P2, P3, P1].",
      "t=2–4: P2 runs for 2 units (full quantum). P2 remaining = 1. Queue: [P3, P1, P2].",
      "t=4–6: P3 runs for 2 units (full quantum). P3 remaining = 2. Queue: [P1, P2, P3].",
      "t=6–8: P1 runs for 2 units (full quantum). P1 remaining = 1. Queue: [P2, P3, P1].",
      "t=8–9: P2 runs for 1 unit (less than quantum, so it finishes). P2 DONE ✅. Queue: [P3, P1].",
      "t=9–11: P3 runs for 2 units (full quantum, but it finishes). P3 DONE ✅. Queue: [P1].",
      "t=11–12: P1 runs for 1 unit (last slice, finishes). P1 DONE ✅.",
      "Execution sequence: P1(2) → P2(2) → P3(2) → P1(2) → P2(1) → P3(2) → P1(1). Total = 12.",
      "Key: ROUND ROBIN = everyone gets equal turns. Fair scheduling! No starvation.",
    ],
  },
  {
    title: "Example 2 — Different Arrivals, Quantum = 3",
    quantum: 3,
    processes: [
      { name: "P1", arrival: 0, burst: 6 },
      { name: "P2", arrival: 2, burst: 4 },
      { name: "P3", arrival: 5, burst: 2 },
    ],
    explanation: [
      "Processes arrive at different times: P1(0,6), P2(2,4), P3(5,2). Quantum = 3.",
      "t=0: Ready queue = [P1]. No one else has arrived yet.",
      "t=0–3: P1 runs for 3 units (full quantum). P1 remaining = 3. At t=3, P2 has arrived!",
      "Queue update: P2 was added when its arrival time (2) ≤ current time (3). Queue: [P2, P1].",
      "t=3–6: P2 runs for 3 units (full quantum). P2 remaining = 1. At t=6, P3 has arrived!",
      "Queue update: P3 was added when arrival (5) ≤ current time (6). Queue: [P1, P3, P2].",
      "t=6–9: P1 runs for 3 units (remaining burst). P1 DONE ✅. Queue: [P3, P2].",
      "t=9–11: P3 runs for 2 units (less than quantum, so finishes). P3 DONE ✅. Queue: [P2].",
      "t=11–12: P2 runs for 1 unit (last slice, finishes). P2 DONE ✅.",
      "Gantt: P1(3) → P2(3) → P1(3) → P3(2) → P2(1). Total time = 12.",
      "Key: New arrivals join the queue as time progresses. Dynamic queue management!",
    ],
  },
  {
    title: "Example 3 — Very Small Quantum (Quantum = 1) — Shows Context Switch Overhead",
    quantum: 1,
    processes: [
      { name: "P1", arrival: 0, burst: 2 },
      { name: "P2", arrival: 0, burst: 2 },
    ],
    explanation: [
      "Extreme case: Quantum = 1 (tiny time slice). Processes: P1(0,2), P2(0,2).",
      "t=0–1: P1 runs for 1 unit (only 1 allowed per slice!). P1 remaining = 1. Queue: [P2, P1].",
      "t=1–2: P2 runs for 1 unit. P2 remaining = 1. Queue: [P1, P2].",
      "t=2–3: P1 runs for 1 unit. P1 remaining = 0. P1 DONE ✅. Queue: [P2].",
      "t=3–4: P2 runs for 1 unit. P2 remaining = 0. P2 DONE ✅.",
      "Gantt: P1(1) → P2(1) → P1(1) → P2(1). Total time = 4.",
      "Context switches: P1→P2 (at 1), P2→P1 (at 2), P1→P2 (at 3). Total = 3 switches!",
      "Observation: Very small quantum causes frequent context switching. Overhead!",
      "Each switch takes time (saving state, loading new state, flushing cache).",
      "Key: Tiny quantum = fair but slow. Must balance fairness vs efficiency.",
    ],
  },
  {
    title: "Example 4 — Very Large Quantum (Quantum = 10) — Behaves Like FCFS",
    quantum: 10,
    processes: [
      { name: "P1", arrival: 0, burst: 5 },
      { name: "P2", arrival: 1, burst: 3 },
      { name: "P3", arrival: 2, burst: 2 },
    ],
    explanation: [
      "Extreme case: Quantum = 10 (huge time slice). Processes: P1(0,5), P2(1,3), P3(2,2).",
      "t=0–5: P1 runs for 5 units (finishes before quantum expires). P1 DONE ✅. Queue: [P2, P3].",
      "Note: P2 and P3 arrived (at 1 and 2) while P1 was running, so they were added to queue.",
      "t=5–8: P2 runs for 3 units (finishes before quantum expires). P2 DONE ✅. Queue: [P3].",
      "t=8–10: P3 runs for 2 units (finishes before quantum expires). P3 DONE ✅.",
      "Gantt: P1(5) → P2(3) → P3(2). Total time = 10.",
      "Context switches: P1→P2 (at 5), P2→P3 (at 8). Total = 2 switches only!",
      "Observation: Large quantum means most processes finish in their first turn.",
      "Result: Behaves like FCFS! No fairness benefit from Round Robin.",
      "Key: Large quantum = low overhead but unfair. Short jobs wait behind long ones.",
    ],
  },
  {
    title: "Example 5 — Sweet Spot Quantum (Quantum = 3) — Balanced Fairness & Efficiency",
    quantum: 3,
    processes: [
      { name: "Short", arrival: 0, burst: 2 },
      { name: "Long", arrival: 0, burst: 8 },
      { name: "Medium", arrival: 0, burst: 5 },
    ],
    explanation: [
      "Good quantum size: Quantum = 3. Processes: Short(0,2), Long(0,8), Medium(0,5).",
      "t=0–3: Long runs for 3 units (full quantum). Long remaining = 5. Queue: [Medium, Long].",
      "Wait: Where's Short? Short arrived at 0, so it was in queue. Queue started: [Short, Long, Medium].",
      "Actually: t=0–2: Short runs for 2 units (finishes before quantum). Short DONE ✅. Queue: [Long, Medium].",
      "t=2–5: Long runs for 3 units (full quantum). Long remaining = 5. Queue: [Medium, Long].",
      "t=5–8: Medium runs for 3 units (full quantum). Medium remaining = 2. Queue: [Long, Medium].",
      "t=8–11: Long runs for 3 units (full quantum). Long remaining = 2. Queue: [Medium, Long].",
      "t=11–13: Medium runs for 2 units (finishes). Medium DONE ✅. Queue: [Long].",
      "t=13–15: Long runs for 2 units (finishes). Long DONE ✅.",
      "Gantt: Short(2) → Long(3) → Medium(3) → Long(3) → Medium(2) → Long(2). Total = 15.",
      "Context switches: Short→Long (2), Long→Medium (5), Medium→Long (8), Long→Medium (11), Medium→Long (13). = 5 switches.",
      "Key insight: Short job finishes quickly without waiting too long. Long job gets broken into chunks. Medium balanced.",
      "Result: Fair scheduling with reasonable overhead. Good for time-sharing systems!",
    ],
  },
];

// ── Run Round Robin ───────────────────────────────────────────────────────────
function runRR(procInputs, q) {
  const n = procInputs.length;
  const procList = procInputs.map((p) => ({
    name: p.name,
    arrival: p.arrival,
    burst: p.burst,
    remaining: p.burst,
    completed: false,
    finishTime: 0,
  }));

  let time = 0;
  const timeline = [];
  let completed = 0;
  const queue = [];
  const inQueue = new Set();

  const enqueue = (t) => {
    procList.forEach((p) => {
      if (p.arrival <= t && !inQueue.has(p.name) && !p.completed) {
        queue.push(p);
        inQueue.add(p.name);
      }
    });
  };

  enqueue(0);

  while (completed < n) {
    if (queue.length === 0) {
      const last = timeline[timeline.length - 1];
      if (last && last.name === "Idle") {
        last.duration += 1;
        last.end += 1;
      } else {
        timeline.push({ name: "Idle", duration: 1, start: time, end: time + 1 });
      }
      time++;
      enqueue(time);
      continue;
    }

    const current = queue.shift();
    inQueue.delete(current.name);
    const execTime = Math.min(current.remaining, q);
    timeline.push({ name: current.name, duration: execTime, start: time, end: time + execTime });
    time += execTime;
    current.remaining -= execTime;

    enqueue(time);

    if (current.remaining > 0) {
      queue.push(current);
      inQueue.add(current.name);
    } else {
      current.completed = true;
      current.finishTime = time;
      completed++;
    }
  }

  const stats = procList.map((p) => {
    const tat = p.finishTime - p.arrival;
    const wt = tat - p.burst;
    return { name: p.name, arrival: p.arrival, burst: p.burst, finish: p.finishTime, tat, wt };
  });
  const avgTAT = stats.reduce((s, r) => s + r.tat, 0) / n;
  const avgWT = stats.reduce((s, r) => s + r.wt, 0) / n;

  return { timeline, stats, avgTAT, avgWT };
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

// ── Gantt Chart ───────────────────────────────────────────────────────────────
function GanttChart({ timeline, names }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="font-semibold text-gray-700 mb-2">Gantt Chart:</p>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-4">
          {timeline.map((slot, idx) => {
            const c = colorFor(slot.name, names);
            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center text-xs font-bold text-white rounded border border-gray-300 ${
                  slot.name === "Idle" ? "bg-gray-300" : c.bg
                }`}
                style={{
                  width: `${Math.max(slot.duration * 35, 36)}px`,
                  minWidth: `${Math.max(slot.duration * 35, 36)}px`,
                  height: "60px",
                }}
                title={`${slot.name}: ${slot.duration} units`}
              >
                <span className={slot.name === "Idle" ? "text-gray-600" : c.text}>{slot.name}</span>
                <span className={`${slot.name === "Idle" ? "text-gray-600" : c.text}`}>{slot.duration}u</span>
              </div>
            );
          })}
        </div>

        {/* Time axis */}
        <div className="flex gap-1 min-w-max text-xs text-gray-500 font-semibold mt-2">
          {timeline.map((slot, idx) => (
            <div
              key={idx}
              style={{
                width: `${Math.max(slot.duration * 35, 36)}px`,
                minWidth: `${Math.max(slot.duration * 35, 36)}px`,
                textAlign: "center",
              }}
            >
              {slot.start}
            </div>
          ))}
          <div className="text-xs text-gray-500">{timeline[timeline.length - 1].end}</div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-2 text-sm mt-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Total Time</p>
          <p className="font-bold text-blue-600">
            {timeline.reduce((sum, slot) => sum + slot.duration, 0)}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Busy Time</p>
          <p className="font-bold text-green-600">
            {timeline.filter((s) => s.name !== "Idle").reduce((sum, slot) => sum + slot.duration, 0)}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Idle Time</p>
          <p className="font-bold text-amber-600">
            {timeline.filter((s) => s.name === "Idle").reduce((sum, slot) => sum + slot.duration, 0)}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Context Switches</p>
          <p className="font-bold text-purple-600">
            {timeline.filter((_, i) => i > 0 && timeline[i].name !== timeline[i - 1].name).length}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Stats table ───────────────────────────────────────────────────────────────
function StatsTable({ stats, avgTAT, avgWT, names }) {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2 text-gray-700">Process Statistics:</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Process</th>
            <th className="px-4 py-2">Arrival</th>
            <th className="px-4 py-2">Burst</th>
            <th className="px-4 py-2">Finish</th>
            <th className="px-4 py-2">Turnaround</th>
            <th className="px-4 py-2">Waiting</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s, i) => {
            const c = colorFor(s.name, names);
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className={`px-4 py-2 font-semibold ${c.text}`}>{s.name}</td>
                <td className="px-4 py-2">{s.arrival}</td>
                <td className="px-4 py-2">{s.burst}</td>
                <td className="px-4 py-2">{s.finish}</td>
                <td className="px-4 py-2 font-semibold text-blue-600">{s.tat}</td>
                <td className="px-4 py-2 font-semibold text-orange-600">{s.wt}</td>
              </tr>
            );
          })}
          <tr className="bg-indigo-50 font-bold text-sm">
            <td className="px-4 py-2" colSpan={4}>
              Average
            </td>
            <td className="px-4 py-2 text-blue-700">{avgTAT.toFixed(2)}</td>
            <td className="px-4 py-2 text-orange-700">{avgWT.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span>
          <span className="font-semibold text-blue-600">Turnaround</span> = Finish − Arrival
        </span>
        <span>
          <span className="font-semibold text-orange-600">Waiting</span> = Turnaround − Burst
        </span>
      </div>
    </div>
  );
}

// ── Queue trace table ─────────────────────────────────────────────────────────
function QueueTrace({ timeline, quantum }) {
  if (!timeline || timeline.length === 0) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2 text-gray-700">Execution Trace (time slice by time slice):</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Slice</th>
            <th className="px-4 py-2">Process</th>
            <th className="px-4 py-2">Start</th>
            <th className="px-4 py-2">End</th>
            <th className="px-4 py-2">Duration</th>
            <th className="px-4 py-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((slot, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 font-semibold text-indigo-600">{i + 1}</td>
              <td className="px-4 py-2 font-semibold">{slot.name}</td>
              <td className="px-4 py-2">{slot.start}</td>
              <td className="px-4 py-2">{slot.end}</td>
              <td className="px-4 py-2">{slot.duration}</td>
              <td className="px-4 py-2 text-xs text-gray-500">
                {slot.name === "Idle" ? (
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded">CPU idle — no ready process</span>
                ) : slot.duration < quantum ? (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                    Last slice — finishes ✅
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                    Full quantum — back to queue
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Process Burst Chart ──────────────────────────────────────────────────────
function ProcessBurstChart({ processes }) {
  if (!processes) return null;

  const chartData = processes.map((p) => ({
    name: p.name,
    burst: parseInt(p.burst),
    arrival: parseInt(p.arrival),
  }));

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
      <p className="font-semibold mb-4 text-gray-700">Process Burst Times:</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="burst" fill="#4f46e5" name="Burst Time" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Arrival vs Burst Scatter Chart ──────────────────────────────────────
function ArrivalBurstChart({ processes }) {
  if (!processes) return null;

  const chartData = processes.map((p) => ({
    name: p.name,
    arrival: parseInt(p.arrival),
    burst: parseInt(p.burst),
  }));

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
      <p className="font-semibold mb-4 text-gray-700">Arrival Time vs Burst Time:</p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="arrival" name="Arrival Time" />
          <YAxis type="number" dataKey="burst" name="Burst Time" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Processes" data={chartData} fill="#4f46e5" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const { timeline, stats, avgTAT, avgWT } = runRR(ex.processes, ex.quantum);
  const names = ex.processes.map((p) => p.name);

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>

      {/* Input summary */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-semibold">
          Quantum: {ex.quantum}
        </span>
        {ex.processes.map((p, i) => (
          <span
            key={i}
            className={`px-3 py-1 rounded-lg font-semibold ${PROC_COLORS[i % PROC_COLORS.length].bg} ${
              PROC_COLORS[i % PROC_COLORS.length].text
            }`}
          >
            {p.name} (arr={p.arrival}, burst={p.burst})
          </span>
        ))}
      </div>

      {/* Explanation */}
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
        {ex.explanation.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>

      {/* Gantt Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
        <GanttChart timeline={timeline} names={names} />
      </div>

      {/* Stats Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
        <StatsTable stats={stats} avgTAT={avgTAT} avgWT={avgWT} names={names} />
      </div>

      {/* Queue Trace */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <QueueTrace timeline={timeline} quantum={ex.quantum} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const RoundRobin = () => {
  const [processes, setProcesses] = useState([{ name: "", burst: "", arrival: "" }]);
  const [quantum, setQuantum] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const addProcess = () => {
    setProcesses([...processes, { name: "", burst: "", arrival: "" }]);
  };

  const deleteProcess = (index) => {
    if (processes.length > 1) {
      setProcesses(processes.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...processes];
    updated[index][field] = value;
    setProcesses(updated);
  };

  const resetSimulation = () => {
    setProcesses([{ name: "", burst: "", arrival: "" }]);
    setQuantum("");
    setResult(null);
    setError("");
  };

  const simulateRR = () => {
    if (processes.some((p) => !p.name || !p.burst || p.arrival === "") || !quantum) {
      setError("Please fill all fields and set time quantum.");
      setResult(null);
      return;
    }
    setError("");
    const q = parseInt(quantum);
    const parsed = processes.map((p) => ({
      name: p.name,
      arrival: parseInt(p.arrival),
      burst: parseInt(p.burst),
    }));
    setResult({ ...runRR(parsed, q), names: parsed.map((p) => p.name), q });
  };

  const tabs = [
    { key: "theory", label: "📖 Theory" },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "✏️ Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">Round Robin CPU Scheduling Simulator</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Fair CPU scheduling where every process gets equal time slices (quantum). No starvation, great for
        time-sharing systems. Learn how quantum size affects fairness vs efficiency.
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
          <Section title="What is Round Robin Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">Round Robin (RR)</span> is a CPU scheduling algorithm
              where every process gets a <span className="font-semibold">fixed slice of CPU time</span> called a
              <span className="font-semibold"> time quantum</span>. After its quantum expires, the process goes
              to the back of the queue, and the CPU switches to the next process.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This ensures <span className="font-semibold">fairness</span> — no process monopolizes the CPU, and
              <span className="font-semibold"> no starvation</span> — every process eventually gets its turn.
            </p>
          </Section>

          <Section title="Key Concepts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⏰ Time Quantum</p>
                <p className="text-gray-700">
                  The maximum CPU time each process gets per turn. E.g., quantum=2 means each process
                  runs for at most 2 time units before being preempted.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🔄 Ready Queue</p>
                <p className="text-gray-700">
                  A circular queue where processes wait. After running, if not finished, the process
                  goes to the back of the queue.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🚀 Preemption</p>
                <p className="text-gray-700">
                  Round Robin is <span className="font-bold">preemptive</span>. The CPU forcibly stops
                  a process when its quantum expires.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⚖️ Fairness</p>
                <p className="text-gray-700">
                  Every process gets equal CPU time. Short and long jobs both get fair treatment
                  compared to FCFS or SJF.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Round Robin Algorithm — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "Initialize ready queue.",
                  d: "Add all processes that have arrived (arrival time ≤ current time).",
                },
                {
                  n: 2,
                  t: "Pick the first process from the queue.",
                  d: "This is the process that arrived first (or was preempted first if all arrived together).",
                },
                {
                  n: 3,
                  t: "Run it for one quantum (or less if it finishes).",
                  d: "Execute for min(remaining burst, quantum) time units.",
                },
                {
                  n: 4,
                  t: "Check for new arrivals.",
                  d: "Any process whose arrival time ≤ current time joins the queue now.",
                },
                {
                  n: 5,
                  t: "If process finished, remove it. Otherwise, put it back in queue.",
                  d: "If burst remaining > 0, append to the end of queue.",
                },
                {
                  n: 6,
                  t: "Repeat until queue is empty and all processes are done.",
                  d: "Go back to step 2.",
                },
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

          <Section title="How Quantum Size Affects Performance">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-bold text-red-700 mb-2">⚡ Very Small (q=1)</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Very fair allocation</li>
                  <li>High context switches</li>
                  <li>Overhead dominates</li>
                  <li>Slow in practice</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-bold text-green-700 mb-2">✅ Sweet Spot (q=3-10ms)</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Good fairness</li>
                  <li>Reasonable overhead</li>
                  <li>Responsive system</li>
                  <li>Optimal for time-sharing</li>
                </ul>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="font-bold text-orange-700 mb-2">🐢 Very Large (q=∞)</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Low overhead</li>
                  <li>Unfair (behaves like FCFS)</li>
                  <li>Short jobs wait long</li>
                  <li>Not truly Round Robin</li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-bold text-yellow-700 mb-1">📌 Real-world quantum values:</p>
              <p>Linux kernel: ~10ms | Windows: ~20-30ms | Interactive systems: 100ms for responsiveness</p>
            </div>
          </Section>

          <Section title="Advantages of Round Robin">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Fair scheduling:</strong> Every process gets equal CPU time
                </li>
                <li>
                  <strong>No starvation:</strong> Even the longest job eventually completes
                </li>
                <li>
                  <strong>Good responsiveness:</strong> Short jobs don't wait too long
                </li>
                <li>
                  <strong>Suitable for time-sharing:</strong> Multiple users can work concurrently
                </li>
                <li>
                  <strong>Predictable wait times:</strong> Can estimate max wait based on load
                </li>
              </ul>
            </div>
          </Section>

          <Section title="Disadvantages of Round Robin">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Higher average turnaround:</strong> Compared to SJF for burst-time-known workloads
                </li>
                <li>
                  <strong>Context switch overhead:</strong> Frequent switching costs CPU time
                </li>
                <li>
                  <strong>Quantum selection critical:</strong> Too small = overhead, too large = unfair
                </li>
                <li>
                  <strong>Not optimal for batch:</strong> Real-time systems prefer FIFO or priority
                </li>
              </ul>
            </div>
          </Section>

          <Section title="Round Robin vs Other Algorithms">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Preemptive</th>
                    <th className="px-4 py-2">Fair</th>
                    <th className="px-4 py-2">Avg Wait</th>
                    <th className="px-4 py-2">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FCFS", "No", "Sort of", "High", "Batch jobs"],
                    ["SJF", "No", "No", "Medium", "Known burst times"],
                    ["Round Robin", "Yes", "Yes", "Medium", "Time-sharing"],
                    ["SRTF", "Yes", "Yes (good)", "Low", "Interactive"],
                    ["Priority", "Yes", "No", "Variable", "Important tasks"],
                  ].map(([alg, pre, fair, wait, best], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "Round Robin" ? "text-indigo-600" : "text-gray-700"}`}>
                        {alg}
                      </td>
                      <td className="px-4 py-2">{pre}</td>
                      <td className={`px-4 py-2 font-semibold ${fair === "Yes" ? "text-green-600" : "text-red-600"}`}>
                        {fair}
                      </td>
                      <td className="px-4 py-2">{wait}</td>
                      <td className="px-4 py-2 text-gray-600">{best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Quick Verification Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ Process runs for min(remaining burst, quantum) time units.",
                "✅ After each quantum, check for new arrivals and add to queue.",
                "✅ If process not finished, append to back of queue.",
                "✅ If queue empty but processes pending, CPU idles.",
                "✅ Turnaround Time = Finish Time − Arrival Time.",
                "✅ Waiting Time = Turnaround Time − Burst Time.",
                "✅ Round Robin is preemptive (forcibly stops process after quantum).",
                "✅ No starvation (every process gets its turn eventually).",
              ].map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ══ EXAMPLES ══ */}
      {activeTab === "examples" && (
        <div className="w-full max-w-4xl">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">💡 5 Complete Examples (All Critical Cases)</p>
            <p>
              Example 1: Basic fairness (all arrive together). Example 2: Staggered arrivals.
              Example 3: Very small quantum (context switch overhead). Example 4: Very large quantum
              (approaches FCFS). Example 5: Sweet spot quantum (balanced fairness & efficiency).
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
              Enter your own processes with arrival and burst times, set a time quantum, then click
              Simulate. You'll see a color-coded Gantt chart showing all time slices, context switches,
              and a detailed execution trace.
            </p>
          </div>

          {/* Input Form */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg border border-gray-300 p-6 mb-4">
              <h3 className="font-bold text-gray-800 mb-4">Define Your Processes</h3>

              {/* Process table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-300">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Process Name</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Arrival Time</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Burst Time</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((proc, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={proc.name}
                            onChange={(e) => handleChange(idx, "name", e.target.value)}
                            placeholder={`Process ${idx + 1}`}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={proc.arrival}
                            onChange={(e) => handleChange(idx, "arrival", e.target.value)}
                            placeholder="0"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="0"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={proc.burst}
                            onChange={(e) => handleChange(idx, "burst", e.target.value)}
                            placeholder="5"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="1"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => deleteProcess(idx)}
                            disabled={processes.length === 1}
                            className="text-red-500 hover:text-red-700 font-bold disabled:text-gray-300 disabled:cursor-not-allowed"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add process button */}
              <button
                onClick={addProcess}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 font-semibold text-sm transition mb-4"
              >
                + Add Process
              </button>

              {/* Quantum input */}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Time Quantum</label>
                <input
                  type="number"
                  value={quantum}
                  onChange={(e) => setQuantum(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 2"
                  min="1"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetSimulation}
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Simulate button */}
            <button
              onClick={simulateRR}
              className="w-full bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 font-bold text-lg transition mb-6"
            >
              Simulate
            </button>

            {/* Error */}
            {error && (
              <p className="text-red-600 font-semibold mb-4 bg-red-50 border border-red-200 p-3 rounded">
                {error}
              </p>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* Charts */}
                <div className="bg-white p-6 rounded-lg border border-gray-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Visual Analysis</h3>

                  {/* Chart 1: Burst Times */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <ProcessBurstChart processes={processes} />
                  </div>

                  {/* Chart 2: Arrival vs Burst */}
                  <div className="mb-4">
                    <ArrivalBurstChart processes={processes} />
                  </div>
                </div>

                {/* Gantt chart */}
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <GanttChart timeline={result.timeline} names={result.names} />
                </div>

                {/* Statistics table */}
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <StatsTable stats={result.stats} avgTAT={result.avgTAT} avgWT={result.avgWT} names={result.names} />
                </div>

                {/* Queue trace */}
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <QueueTrace timeline={result.timeline} quantum={result.q} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoundRobin;