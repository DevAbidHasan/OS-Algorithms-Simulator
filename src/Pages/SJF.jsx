import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ScatterChart, Scatter } from "recharts";

// ── Example scenarios ──────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Three Processes with Different Burst Times (Basic SJF)",
    processes: [
      { name: "Process A", arrival: 0, burst: 5 },
      { name: "Process B", arrival: 1, burst: 3 },
      { name: "Process C", arrival: 2, burst: 4 },
    ],
    explanation: [
      "Process A arrives at time 0, burst=5. Process B arrives at time 1, burst=3. Process C arrives at time 2, burst=4.",
      "At time 0: Only A is available. A starts and runs for 5 units (0 → 5).",
      "At time 5: A finishes. Both B and C are waiting. B has burst=3, C has burst=4.",
      "SJF picks the SHORTEST: B runs from 5 → 8 (3 units).",
      "At time 8: B finishes. Only C is available. C runs from 8 → 12 (4 units).",
      "Total execution: 0-5 (A), 5-8 (B), 8-12 (C). Total time = 12.",
      "Wait times: A=0, B=4 (waited 1→5), C=6 (waited 2→8).",
      "Turnaround: A=5, B=7, C=10. Average wait = 3.33. Average turnaround = 7.33.",
      "Key: SJF chose the shorter job (B) over the longer one (C), reducing wait for B!",
    ],
  },
  {
    title: "Example 2 — Convoy Effect Reduced (Compare with FCFS)",
    processes: [
      { name: "Long Task", arrival: 0, burst: 10 },
      { name: "Short Task 1", arrival: 1, burst: 1 },
      { name: "Short Task 2", arrival: 2, burst: 1 },
    ],
    explanation: [
      "Long Task arrives at 0 with burst=10. Short tasks arrive at 1 and 2 with burst=1 each.",
      "At time 0: Only Long Task available. It starts and runs 0 → 10.",
      "At time 10: Long Task finishes. Short Task 1 and 2 are waiting.",
      "SJF picks the shortest: Short Task 1 (burst=1) runs 10 → 11.",
      "At time 11: Short Task 2 (burst=1) runs 11 → 12.",
      "Wait times: Long=0, Short1=9 (waited 1→10), Short2=9 (waited 2→11).",
      "If FCFS: Same timeline since Long came first and must complete first anyway!",
      "But SJF reduces waits after Long Task finishes by picking Short1 FIRST (not random).",
      "Total time = 12. Average wait = 6. Average turnaround = (10+10+10)/3 = 10.",
      "Key: SJF is especially good when many short jobs arrive after a long one!",
    ],
  },
  {
    title: "Example 3 — All Processes Arrive Together (SJF Shines Here)",
    processes: [
      { name: "P1", arrival: 0, burst: 8 },
      { name: "P2", arrival: 0, burst: 4 },
      { name: "P3", arrival: 0, burst: 2 },
    ],
    explanation: [
      "All three processes arrive at time 0. Burst times: P1=8, P2=4, P3=2.",
      "At time 0: All available. SJF picks the SHORTEST: P3 (burst=2) runs 0 → 2.",
      "At time 2: P3 done. P1 and P2 remain. SJF picks P2 (burst=4) over P1 (burst=8).",
      "P2 runs 2 → 6 (4 units).",
      "At time 6: P2 done. Only P1 remains. P1 runs 6 → 14 (8 units).",
      "Wait times: P3=0, P2=2 (0→2), P1=6 (0→6).",
      "Turnaround: P3=2, P2=6, P1=14. Average wait = 2.67. Average turnaround = 7.33.",
      "Compare with FCFS (P1,P2,P3): Wait times would be 0, 8, 12. Average wait = 6.67!",
      "SJF saves 4 units of average wait time compared to FCFS!",
      "Key: When all arrive together, SJF dramatically reduces wait times!",
    ],
  },
  {
    title: "Example 4 — Staggered Arrivals with Mixed Bursts",
    processes: [
      { name: "Job A", arrival: 0, burst: 6 },
      { name: "Job B", arrival: 2, burst: 2 },
      { name: "Job C", arrival: 4, burst: 4 },
      { name: "Job D", arrival: 6, burst: 3 },
    ],
    explanation: [
      "Job A (arrival=0, burst=6), Job B (arrival=2, burst=2), Job C (arrival=4, burst=4), Job D (arrival=6, burst=3).",
      "Time 0: Only A available. A runs 0 → 6.",
      "Time 6: A done. Available: B, C, D. SJF picks shortest: D (burst=3) over C (burst=4) and B is already done? No, B arrived at 2!",
      "Actually: At time 6, check arrivals: B (arrived 2), C (arrived 4), D (arrived 6). All available!",
      "Shortest is B (burst=2)? No wait, let me recalculate. At time 6, available are those with arrival≤6.",
      "B, C, D all available (arrived 2, 4, 6). Burst times: B=2, C=4, D=3.",
      "SJF picks B (shortest=2). B runs 6 → 8.",
      "Time 8: B done. Available: C (burst=4), D (burst=3). SJF picks D. D runs 8 → 11.",
      "Time 11: D done. Only C remains. C runs 11 → 15.",
      "Wait times: A=0, B=4 (arrived 2, started 6), C=7 (arrived 4, started 11), D=2 (arrived 6, started 8).",
      "Turnaround: A=6, B=6, C=11, D=5. Average wait=3.25. Average turnaround=7.",
      "Key: SJF optimally sequences jobs based on shortest burst among available processes!",
    ],
  },
  {
    title: "Example 5 — Extreme Case: One Very Short Job (Preemption vs Non-preemptive)",
    processes: [
      { name: "Big Task", arrival: 0, burst: 20 },
      { name: "Tiny Task", arrival: 1, burst: 1 },
      { name: "Medium Task", arrival: 2, burst: 5 },
    ],
    explanation: [
      "Big Task (arrival=0, burst=20), Tiny Task (arrival=1, burst=1), Medium Task (arrival=2, burst=5).",
      "This example demonstrates non-preemptive SJF (not preemptive).",
      "Time 0: Only Big Task. It starts and MUST RUN TO COMPLETION (non-preemptive). Big runs 0 → 20.",
      "Time 20: Big done. Tiny and Medium both available. SJF picks Tiny (burst=1). Tiny runs 20 → 21.",
      "Time 21: Medium runs 21 → 26.",
      "Wait times: Big=0, Tiny=19 (arrived 1, started 20!), Medium=19 (arrived 2, started 21).",
      "Turnaround: Big=20, Tiny=20, Medium=24. Average wait=12.67. Average turnaround=21.33.",
      "This shows the PROBLEM with non-preemptive SJF: short jobs wait a long time for long jobs!",
      "Preemptive SJF (SRTF) would interrupt Big at time 1, run Tiny first, then resume Big.",
      "That would give: Tiny wait=0, Big wait=1, Medium wait varies... much better!",
      "Key: Non-preemptive SJF has issues when a long job arrives before short jobs. Preemptive is better!",
    ],
  },
];

// ── Reusable Section component ────────────────────────────────────────────
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

// ── Gantt Chart Visualization ─────────────────────────────────────────────
function GanttChart({ timeline, maxTime }) {
  if (timeline.length === 0) return null;

  const colorMap = {};
  const colors = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  let colorIndex = 0;

  timeline.forEach((slot) => {
    if (!colorMap[slot.name] && slot.name !== "Idle") {
      colorMap[slot.name] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });

  return (
    <div className="mt-4 space-y-4">
      <p className="font-semibold text-gray-700">Gantt Chart (Timeline):</p>

      {/* Gantt chart */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-4">
          {timeline.map((slot, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center text-xs font-bold text-white rounded border border-gray-300"
              style={{
                width: `${slot.duration * 35}px`,
                minWidth: `${slot.duration * 35}px`,
                height: "60px",
                backgroundColor: slot.name === "Idle" ? "#d1d5db" : colorMap[slot.name] || "#d1d5db",
              }}
              title={`${slot.name}: ${slot.duration} units`}
            >
              <span>{slot.name}</span>
              <span>{slot.duration}u</span>
            </div>
          ))}
        </div>

        {/* Time axis */}
        <div className="flex gap-1 min-w-max text-xs text-gray-500 font-semibold">
          {timeline.map((slot, idx) => {
            let startTime = 0;
            for (let i = 0; i < idx; i++) {
              startTime += timeline[i].duration;
            }
            return (
              <div
                key={idx}
                style={{
                  width: `${slot.duration * 35}px`,
                  minWidth: `${slot.duration * 35}px`,
                  textAlign: "center",
                }}
              >
                {startTime}
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-2 text-sm">
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
          <p className="text-gray-600 text-xs">CPU Use</p>
          <p className="font-bold text-purple-600">
            {(
              (timeline.filter((s) => s.name !== "Idle").reduce((sum, slot) => sum + slot.duration, 0) /
                timeline.reduce((sum, slot) => sum + slot.duration, 0)) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm">
        {Object.entries(colorMap).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
            <span className="text-gray-700">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detailed Statistics Table ──────────────────────────────────────────────
function StatisticsTable({ timeline, processes }) {
  if (timeline.length === 0) return null;

  const processMap = {};
  processes.forEach((p) => {
    processMap[p.name] = { arrival: parseInt(p.arrival), burst: parseInt(p.burst) };
  });

  const stats = [];
  let currentTime = 0;

  timeline.forEach((slot) => {
    const duration = slot.duration;
    const startTime = currentTime;
    const endTime = currentTime + duration;

    if (slot.name !== "Idle") {
      const proc = processMap[slot.name];
      const turnaroundTime = endTime - proc.arrival;
      const waitTime = startTime - proc.arrival;

      stats.push({
        process: slot.name,
        arrival: proc.arrival,
        burst: proc.burst,
        startTime,
        endTime,
        turnaroundTime,
        waitTime,
      });
    }

    currentTime = endTime;
  });

  const avgWaitTime = stats.length > 0 ? (stats.reduce((sum, s) => sum + s.waitTime, 0) / stats.length).toFixed(2) : 0;
  const avgTurnaroundTime = stats.length > 0 ? (stats.reduce((sum, s) => sum + s.turnaroundTime, 0) / stats.length).toFixed(2) : 0;

  return (
    <div className="mt-4 space-y-4">
      <p className="font-semibold mb-2 text-gray-700">Process Metrics:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
          <thead className="bg-indigo-500 text-white">
            <tr>
              <th className="px-4 py-2">Process</th>
              <th className="px-4 py-2">Arrival</th>
              <th className="px-4 py-2">Burst</th>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">End</th>
              <th className="px-4 py-2">Wait Time</th>
              <th className="px-4 py-2">Turnaround</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 font-semibold text-indigo-700">{stat.process}</td>
                <td className="px-4 py-2 text-gray-600">{stat.arrival}</td>
                <td className="px-4 py-2 text-gray-600">{stat.burst}</td>
                <td className="px-4 py-2 text-gray-600">{stat.startTime}</td>
                <td className="px-4 py-2 text-gray-600">{stat.endTime}</td>
                <td className="px-4 py-2 font-semibold text-red-600">{stat.waitTime}</td>
                <td className="px-4 py-2 font-semibold text-blue-600">{stat.turnaroundTime}</td>
              </tr>
            ))}
            <tr className="bg-indigo-50 font-bold">
              <td className="px-4 py-2" colSpan="5">
                Average
              </td>
              <td className="px-4 py-2 text-red-600">{avgWaitTime}</td>
              <td className="px-4 py-2 text-blue-600">{avgTurnaroundTime}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Process Burst Chart ──────────────────────────────────────────────────
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

// ── Worked Example Block ──────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const procList = ex.processes.map(p => ({
    name: p.name,
    arrival: p.arrival,
    burst: p.burst,
    completed: false
  }));

  const timeline = [];
  let currentTime = 0;
  let completedCount = 0;
  const n = procList.length;

  while (completedCount < n) {
    const available = procList.filter(p => p.arrival <= currentTime && !p.completed);

    if (available.length === 0) {
      const nextArrival = Math.min(...procList.filter(p => !p.completed).map(p => p.arrival));
      timeline.push({ name: "Idle", duration: nextArrival - currentTime });
      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => a.burst - b.burst);
    const currentProc = available[0];
    timeline.push({ name: currentProc.name, duration: currentProc.burst });
    currentTime += currentProc.burst;
    currentProc.completed = true;
    completedCount++;
  }

  const totalTime = timeline.reduce((sum, slot) => sum + slot.duration, 0);
  const busyTime = timeline.filter((s) => s.name !== "Idle").reduce((sum, slot) => sum + slot.duration, 0);
  const idleTime = totalTime - busyTime;
  const cpuUtil = ((busyTime / totalTime) * 100).toFixed(1);

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>

      {/* Process badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ex.processes.map((p, i) => (
          <div key={i} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-semibold text-sm">
            <p className="font-bold">{p.name}</p>
            <p className="text-xs">Arrives: {p.arrival}, Burst: {p.burst}</p>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
        {ex.explanation.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Total Time</p>
          <p className="font-bold text-indigo-600">{totalTime}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">CPU Busy</p>
          <p className="font-bold text-indigo-600">{busyTime}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">CPU Idle</p>
          <p className="font-bold text-indigo-600">{idleTime}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">CPU Use %</p>
          <p className="font-bold text-indigo-600">{cpuUtil}%</p>
        </div>
      </div>

      {/* Gantt Chart */}
      <GanttChart timeline={timeline} maxTime={totalTime} />

      {/* Statistics Table */}
      <StatisticsTable timeline={timeline} processes={ex.processes} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
const SJF = () => {
  const [processes, setProcesses] = useState([{ name: "", burst: "", arrival: "" }]);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  // ── Add process ────────────────────────────────────────────────────────
  const addProcess = () => {
    setProcesses([...processes, { name: "", burst: "", arrival: "" }]);
  };

  // ── Delete process ─────────────────────────────────────────────────────
  const deleteProcess = (index) => {
    if (processes.length > 1) {
      setProcesses(processes.filter((_, i) => i !== index));
    }
  };

  // ── Handle input changes ───────────────────────────────────────────────
  const handleChange = (index, field, value) => {
    const newProcesses = [...processes];
    newProcesses[index][field] = value;
    setProcesses(newProcesses);
  };

  // ── Simulate SJF ───────────────────────────────────────────────────────
  const simulateSJF = () => {
    if (processes.some((p) => !p.name || !p.burst || p.arrival === "")) {
      setError("Please fill all fields for each process.");
      setTimeline([]);
      return;
    }

    setError("");

    const procList = processes.map((p) => ({
      name: p.name,
      arrival: parseInt(p.arrival),
      burst: parseInt(p.burst),
      completed: false,
    }));

    const tempTimeline = [];
    let currentTime = 0;
    let completedCount = 0;
    const n = procList.length;

    while (completedCount < n) {
      const available = procList.filter((p) => p.arrival <= currentTime && !p.completed);

      if (available.length === 0) {
        const nextArrival = Math.min(...procList.filter((p) => !p.completed).map((p) => p.arrival));
        tempTimeline.push({ name: "Idle", duration: nextArrival - currentTime });
        currentTime = nextArrival;
        continue;
      }

      available.sort((a, b) => a.burst - b.burst);
      const currentProc = available[0];
      tempTimeline.push({ name: currentProc.name, duration: currentProc.burst });
      currentTime += currentProc.burst;
      currentProc.completed = true;
      completedCount++;
    }

    setTimeline(tempTimeline);
  };

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = () => {
    setProcesses([{ name: "", burst: "", arrival: "" }]);
    setTimeline([]);
    setError("");
  };

  const tabs = [
    { key: "theory", label: "📖 Theory" },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "✏️ Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">SJF CPU Scheduling Simulator</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Shortest Job First — picks the process with the smallest burst time. Reduces average wait time
        compared to FCFS. Learn how it works and see real examples.
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
          <Section title="What is SJF Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">SJF (Shortest Job First)</span> selects the
              process with the <span className="font-semibold">smallest burst time</span> from all available
              processes. This reduces the average waiting time compared to FCFS.
            </p>
            <p className="text-gray-700 leading-relaxed">
              SJF can be <span className="font-semibold">non-preemptive</span> (process runs to completion)
              or <span className="font-semibold">preemptive</span> (SRTF: Shortest Remaining Time First, can interrupt).
            </p>
          </Section>

          <Section title="SJF vs FCFS — Which is Better?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ SJF Advantages</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Minimizes average wait time</li>
                  <li>Better for mixed workloads</li>
                  <li>Reduces convoy effect</li>
                  <li>Optimizes short jobs</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ SJF Disadvantages</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Hard to predict burst time</li>
                  <li>Can starve long jobs</li>
                  <li>Needs future knowledge</li>
                  <li>Not for interactive systems</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Key Terms">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⏰ Arrival Time</p>
                <p className="text-gray-700 text-sm">When the process shows up and joins the queue.</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⏱️ Burst Time</p>
                <p className="text-gray-700 text-sm">How long the process needs the CPU (SJF picks the smallest).</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⌛ Wait Time</p>
                <p className="text-gray-700 text-sm">How long process waits before CPU starts it.</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🔄 Turnaround Time</p>
                <p className="text-gray-700 text-sm">Total time from arrival to completion.</p>
              </div>
            </div>
          </Section>

          <Section title="SJF Algorithm — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "Identify all available processes.",
                  d: "Processes that have arrived and are not yet complete.",
                },
                {
                  n: 2,
                  t: "Pick the process with SMALLEST burst time.",
                  d: "This is the key difference from FCFS.",
                },
                {
                  n: 3,
                  t: "Process runs to completion (non-preemptive).",
                  d: "Can't be interrupted. Runs its full burst time.",
                },
                {
                  n: 4,
                  t: "After completion, repeat step 1.",
                  d: "Check for newly arrived processes.",
                },
                {
                  n: 5,
                  t: "If no process ready, CPU idles.",
                  d: "Wait for the next process to arrive.",
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

          <Section title="Starvation Problem">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                <span className="font-bold text-yellow-700">Starvation</span> can occur if many short jobs
                keep arriving. Long jobs get pushed back indefinitely!
              </p>
              <p className="text-sm text-gray-600">
                Example: If new 1-unit jobs keep arriving, a 100-unit job might never run. Solution: Use
                aging (increase priority over time) or time quanta.
              </p>
            </div>
          </Section>

          <Section title="Non-Preemptive vs Preemptive SJF">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-bold text-blue-700 mb-2">Non-Preemptive SJF</p>
                <p className="text-gray-700 mb-2">
                  Process runs to completion. Can't be interrupted. Longer jobs arriving first hurt short jobs.
                </p>
                <p className="font-semibold text-gray-600">Example: Big job (20u) arrives first → must finish before short job (1u) can start.</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-bold text-purple-700 mb-2">Preemptive SJF (SRTF)</p>
                <p className="text-gray-700 mb-2">
                  Shortest Remaining Time First. Can interrupt. New shorter job interrupts current job.
                </p>
                <p className="font-semibold text-gray-600">Example: Big job running → short job arrives → interrupt big job, run short job first!</p>
              </div>
            </div>
          </Section>

          <Section title="When to Use SJF">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  icon: "📊",
                  title: "Batch Systems",
                  desc: "Known job durations available upfront.",
                },
                {
                  icon: "🔧",
                  title: "Predictable Workload",
                  desc: "Similar job sizes, burst times stable.",
                },
                {
                  icon: "⏱️",
                  title: "Minimize Wait Time",
                  desc: "Primary goal is low average wait.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="font-bold text-gray-800 mb-1">{title}</p>
                  <p className="text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Quick Comparison: FCFS vs SJF">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-300 rounded-lg">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Aspect</th>
                    <th className="px-4 py-2">FCFS</th>
                    <th className="px-4 py-2">SJF</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b">
                    <td className="px-4 py-2 font-semibold">Selection</td>
                    <td className="px-4 py-2">First to arrive</td>
                    <td className="px-4 py-2">Shortest burst</td>
                  </tr>
                  <tr className="bg-gray-50 border-b">
                    <td className="px-4 py-2 font-semibold">Avg Wait Time</td>
                    <td className="px-4 py-2">High (due to convoy)</td>
                    <td className="px-4 py-2">Lower (optimal non-preemptive)</td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-4 py-2 font-semibold">Starvation</td>
                    <td className="px-4 py-2">No</td>
                    <td className="px-4 py-2">Yes (long jobs)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-semibold">Knowledge Needed</td>
                    <td className="px-4 py-2">None</td>
                    <td className="px-4 py-2">Burst time upfront</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      {/* ══ EXAMPLES ══ */}
      {activeTab === "examples" && (
        <div className="w-full max-w-4xl">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">💡 5 Complete Examples</p>
            <p>
              Example 1: Basic SJF with 3 processes. Example 2: Convoy effect comparison.
              Example 3: All arrive together (SJF shines). Example 4: Staggered arrivals.
              Example 5: Preemptive vs non-preemptive comparison.
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
              Enter your own processes with arrival and burst times. The simulator will calculate the shortest
              job first schedule, show the Gantt chart, and display comprehensive metrics.
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
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">
                        Process Name
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">
                        Arrival Time
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">
                        Burst Time
                      </th>
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

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={addProcess}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 font-semibold text-sm transition"
                >
                  + Add Process
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold text-sm transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Simulate button */}
            <button
              onClick={simulateSJF}
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
            {timeline.length > 0 && (
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
                  <GanttChart timeline={timeline} maxTime={timeline.reduce((sum, s) => sum + s.duration, 0)} />
                </div>

                {/* Statistics table */}
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <StatisticsTable timeline={timeline} processes={processes} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SJF;