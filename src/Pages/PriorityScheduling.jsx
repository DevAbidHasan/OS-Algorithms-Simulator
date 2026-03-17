import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ScatterChart, Scatter } from "recharts";

// ── Example scenarios ──────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Basic Priority (Lower Number = Higher Priority)",
    processes: [
      { name: "P1", arrival: 0, burst: 5, priority: 2 },
      { name: "P2", arrival: 1, burst: 3, priority: 1 },
      { name: "P3", arrival: 2, burst: 4, priority: 3 },
    ],
    explanation: [
      "Priority: 1=highest, 2=medium, 3=lowest. Processes: P1(burst=5,pri=2), P2(burst=3,pri=1), P3(burst=4,pri=3).",
      "t=0: Only P1 available. P1 starts and runs to completion (5 units). 0→5.",
      "t=5: P1 done. Available: P2(pri=1), P3(pri=3). P2 has higher priority (1<3). P2 runs. 5→8.",
      "t=8: P2 done. Only P3 remains. P3 runs. 8→12.",
      "Execution: P1(5) → P2(3) → P3(4). Total = 12.",
      "Wait times: P1=0, P2=4 (arrived 1, started 5), P3=6 (arrived 2, started 8).",
      "Key insight: Higher priority process (P2) ran even though it arrived later!",
      "Disadvantage: P1 and P3 had to wait for P2 due to priority.",
    ],
  },
  {
    title: "Example 2 — Starvation Risk (Low Priority Process Ignored)",
    processes: [
      { name: "HighPriority", arrival: 0, burst: 3, priority: 1 },
      { name: "MediumPriority", arrival: 1, burst: 3, priority: 2 },
      { name: "LowPriority", arrival: 2, burst: 5, priority: 3 },
    ],
    explanation: [
      "Priority: 1=highest, 3=lowest. Processes arrive sequentially.",
      "t=0–3: HighPriority runs (burst=3). 0→3.",
      "t=3: HighPriority done. Available: MediumPriority(pri=2), LowPriority(pri=3).",
      "MediumPriority has higher priority. MediumPriority runs. 3→6.",
      "t=6: MediumPriority done. Only LowPriority remains. LowPriority runs. 6→11.",
      "Execution: HighPriority(3) → MediumPriority(3) → LowPriority(5). Total = 11.",
      "Wait times: High=0, Medium=2, Low=4.",
      "Key insight: If high/medium priority jobs keep arriving, low priority starves!",
      "In real systems, aging is used: increase priority of waiting processes over time.",
    ],
  },
  {
    title: "Example 3 — Preemptive Priority (Higher Priority Interrupts)",
    processes: [
      { name: "Normal", arrival: 0, burst: 8, priority: 2 },
      { name: "Urgent", arrival: 3, burst: 2, priority: 1 },
    ],
    explanation: [
      "Preemptive priority: Higher priority can interrupt (preempt) lower priority.",
      "t=0–3: Normal runs (pri=2, burst=8). 3 units executed, 5 remaining.",
      "t=3: Urgent arrives (pri=1). Priority check: Urgent(1) > Normal(2). PREEMPT!",
      "Normal is paused. Urgent runs. 3→5 (2 units executed).",
      "t=5: Urgent done. Normal resumes with 5 units remaining. 5→13.",
      "Execution: Normal(3) → Urgent(2) → Normal(5). Total = 13.",
      "Wait times: Normal=5 (0→3 run, 3→5 paused, then 5→13), Urgent=0 (started immediately).",
      "Key insight: Preemptive priority ensures urgent tasks don't wait for less important ones.",
      "Real-world use: Interrupt handlers, keyboard input, alarms (higher priority).",
    ],
  },
  {
    title: "Example 4 — All Same Priority (Becomes FCFS)",
    processes: [
      { name: "P1", arrival: 0, burst: 4, priority: 1 },
      { name: "P2", arrival: 2, burst: 3, priority: 1 },
      { name: "P3", arrival: 3, burst: 2, priority: 1 },
    ],
    explanation: [
      "All processes have SAME priority (1). No priority differentiation.",
      "When priorities are equal, CPU scheduler uses arrival time (FCFS).",
      "t=0–4: P1 runs (first to arrive). 0→4.",
      "t=4: P1 done. Available: P2(pri=1), P3(pri=1). P2 arrived before P3 (2<3). P2 runs. 4→7.",
      "t=7: P2 done. Only P3 remains. P3 runs. 7→9.",
      "Execution: P1(4) → P2(3) → P3(2). Total = 9.",
      "Key insight: When all have same priority, degenerates to FCFS (first come, first served).",
      "Same as non-preemptive priority with no preemption.",
    ],
  },
  {
    title: "Example 5 — Complex Mixed Priorities (Real-World Scenario)",
    processes: [
      { name: "Background", arrival: 0, burst: 10, priority: 3 },
      { name: "UserApp", arrival: 2, burst: 5, priority: 2 },
      { name: "SystemTask", arrival: 4, burst: 3, priority: 1 },
      { name: "BackupJob", arrival: 6, burst: 4, priority: 3 },
    ],
    explanation: [
      "Realistic scenario: Background(p=3), UserApp(p=2), SystemTask(p=1), BackupJob(p=3).",
      "Priority: 1=System task, 2=User application, 3=Background/Low priority.",
      "t=0–4: Background runs (only available, pri=3). 4 units executed, 6 remaining.",
      "t=4: SystemTask arrives (pri=1)! Available: Background(6 remaining, p=3), SystemTask(p=1), UserApp(p=2).",
      "SystemTask has HIGHEST priority. But this is non-preemptive, so Background finishes its unit.",
      "Actually: Each scheduler decision is made when current process finishes or new process arrives.",
      "t=0–10: Background runs to completion (no interruption in non-preemptive).",
      "t=10: Background done. Available: UserApp(5 burst, p=2), SystemTask(3 burst, p=1), BackupJob(4 burst, p=3).",
      "SystemTask has highest priority (1). SystemTask runs. 10→13.",
      "t=13: SystemTask done. Available: UserApp(p=2), BackupJob(p=3). UserApp runs. 13→18.",
      "t=18: UserApp done. Only BackupJob remains. BackupJob runs. 18→22.",
      "Execution: Background(10) → SystemTask(3) → UserApp(5) → BackupJob(4). Total = 22.",
      "Wait times: Background=0, UserApp=11 (arrived 2, started 13), SystemTask=6 (arrived 4, started 10), BackupJob=12 (arrived 6, started 18).",
      "Key insight: Non-preemptive priority allows long low-priority jobs to block important ones!",
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
    processMap[p.name] = { arrival: parseInt(p.arrival), burst: parseInt(p.burst), priority: parseInt(p.priority) };
  });

  const stats = [];
  let currentTime = 0;
  const processCompletion = {};

  timeline.forEach((slot) => {
    const duration = slot.duration;
    currentTime += duration;

    if (slot.name !== "Idle") {
      processCompletion[slot.name] = currentTime;
    }
  });

  Object.keys(processMap).forEach((name) => {
    const proc = processMap[name];
    const endTime = processCompletion[name];
    const turnaroundTime = endTime - proc.arrival;
    const waitTime = turnaroundTime - proc.burst;

    stats.push({
      process: name,
      arrival: proc.arrival,
      burst: proc.burst,
      priority: proc.priority,
      endTime,
      turnaroundTime,
      waitTime,
    });
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
              <th className="px-4 py-2">Priority</th>
              <th className="px-4 py-2">Arrival</th>
              <th className="px-4 py-2">Burst</th>
              <th className="px-4 py-2">End</th>
              <th className="px-4 py-2">Wait Time</th>
              <th className="px-4 py-2">Turnaround</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 font-semibold text-indigo-700">{stat.process}</td>
                <td className={`px-4 py-2 font-bold ${stat.priority === 1 ? "text-red-600" : stat.priority === 2 ? "text-yellow-600" : "text-gray-600"}`}>
                  {stat.priority === 1 ? "🔴 High" : stat.priority === 2 ? "🟡 Medium" : "⚪ Low"}
                </td>
                <td className="px-4 py-2">{stat.arrival}</td>
                <td className="px-4 py-2">{stat.burst}</td>
                <td className="px-4 py-2">{stat.endTime}</td>
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
    priority: parseInt(p.priority),
    arrival: parseInt(p.arrival),
  }));

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
      <p className="font-semibold mb-4 text-gray-700">Process Burst Times by Priority:</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="burst" fill="#4f46e5" name="Burst Time" />
          <Bar dataKey="priority" fill="#ef4444" name="Priority (1=High)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Arrival vs Priority Scatter Chart ──────────────────────────────────
function ArrivalPriorityChart({ processes }) {
  if (!processes) return null;

  const chartData = processes.map((p) => ({
    name: p.name,
    arrival: parseInt(p.arrival),
    priority: parseInt(p.priority),
  }));

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
      <p className="font-semibold mb-4 text-gray-700">Arrival Time vs Priority:</p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="arrival" name="Arrival Time" />
          <YAxis type="number" dataKey="priority" name="Priority" label={{ value: "Priority (1=High)", angle: -90, position: "insideLeft" }} />
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
    priority: p.priority,
    remaining: p.burst,
    completed: false
  }));

  let time = 0;
  const timeline = [];
  let completed = 0;
  const n = procList.length;
  let lastProcess = null;

  while (completed < n) {
    const available = procList.filter(p => p.arrival <= time && !p.completed);
    if (available.length === 0) {
      if (lastProcess !== "Idle") timeline.push({ name: "Idle", start: time, duration: 1 });
      else timeline[timeline.length - 1].duration += 1;
      time++;
      lastProcess = "Idle";
      continue;
    }

    available.sort((a, b) => a.priority - b.priority);
    const current = available[0];

    if (lastProcess === current.name) {
      timeline[timeline.length - 1].duration += 1;
    } else {
      timeline.push({ name: current.name, start: time, duration: 1 });
    }

    current.remaining -= 1;
    if (current.remaining === 0) {
      current.completed = true;
      completed++;
    }

    time++;
    lastProcess = current.name;
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
            <p className="text-xs">Arr: {p.arrival}, Burst: {p.burst}, Pri: {p.priority}</p>
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
const PriorityScheduling = () => {
  const [processes, setProcesses] = useState([{ name: "", burst: "", arrival: "", priority: "" }]);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  // ── Add process ────────────────────────────────────────────────────────
  const addProcess = () => {
    setProcesses([...processes, { name: "", burst: "", arrival: "", priority: "" }]);
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

  // ── Simulate Priority Scheduling ───────────────────────────────────────
  const simulatePriority = () => {
    if (processes.some((p) => !p.name || !p.burst || p.arrival === "" || !p.priority)) {
      setError("Please fill all fields for each process.");
      setTimeline([]);
      return;
    }

    setError("");

    const procList = processes.map((p) => ({
      name: p.name,
      arrival: parseInt(p.arrival),
      burst: parseInt(p.burst),
      priority: parseInt(p.priority),
      remaining: parseInt(p.burst),
      completed: false,
    }));

    let time = 0;
    const tempTimeline = [];
    let completed = 0;
    const n = procList.length;
    let lastProcess = null;

    while (completed < n) {
      const available = procList.filter((p) => p.arrival <= time && !p.completed);
      if (available.length === 0) {
        if (lastProcess !== "Idle") tempTimeline.push({ name: "Idle", start: time, duration: 1 });
        else tempTimeline[tempTimeline.length - 1].duration += 1;
        time++;
        lastProcess = "Idle";
        continue;
      }

      available.sort((a, b) => a.priority - b.priority);
      const current = available[0];

      if (lastProcess === current.name) {
        tempTimeline[tempTimeline.length - 1].duration += 1;
      } else {
        tempTimeline.push({ name: current.name, start: time, duration: 1 });
      }

      current.remaining -= 1;
      if (current.remaining === 0) {
        current.completed = true;
        completed++;
      }

      time++;
      lastProcess = current.name;
    }

    setTimeline(tempTimeline);
  };

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = () => {
    setProcesses([{ name: "", burst: "", arrival: "", priority: "" }]);
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
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">Priority Scheduling Simulator</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Higher priority processes run before lower priority ones. Can lead to starvation if not managed carefully.
        Learn about priority-based scheduling and its tradeoffs.
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
          <Section title="What is Priority Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">Priority Scheduling</span> assigns each process a
              <span className="font-semibold"> priority level</span>. The CPU always runs the process with the
              <span className="font-semibold"> highest priority</span> among available processes. This ensures
              important tasks get executed first.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Priority can be <span className="font-semibold">static</span> (fixed throughout execution) or
              <span className="font-semibold"> dynamic</span> (changes over time). It can also be
              <span className="font-semibold"> preemptive</span> (higher priority interrupts lower) or
              <span className="font-semibold"> non-preemptive</span> (waits for current process to finish).
            </p>
          </Section>

          <Section title="Priority Levels Explained">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">🔴 High Priority (1)</p>
                <p className="text-gray-700">
                  Critical tasks, system operations, real-time processes. Run first.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-bold text-yellow-700 mb-2">🟡 Medium Priority (2)</p>
                <p className="text-gray-700">
                  User applications, interactive tasks. Run after high priority.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-bold text-gray-700 mb-2">⚪ Low Priority (3+)</p>
                <p className="text-gray-700">
                  Background jobs, batch processing. Run when nothing else is ready.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Priority Scheduling Algorithm — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "Check all available processes.",
                  d: "Processes that have arrived and are not yet complete.",
                },
                {
                  n: 2,
                  t: "Pick the process with HIGHEST PRIORITY.",
                  d: "Lower priority number = higher priority (priority 1 > priority 2).",
                },
                {
                  n: 3,
                  t: "Run it until it finishes (non-preemptive) or is preempted.",
                  d: "For non-preemptive: process runs to completion. For preemptive: can be interrupted by higher priority.",
                },
                {
                  n: 4,
                  t: "After process finishes (or is preempted), check for newly arrived processes.",
                  d: "Recalculate highest priority among available processes.",
                },
                {
                  n: 5,
                  t: "Repeat until all processes complete.",
                  d: "Always pick highest priority from available processes.",
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

          <Section title="The Starvation Problem">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-bold text-red-700">Starvation</span> occurs when low-priority processes
                never get CPU time because high-priority processes keep arriving. The low-priority process waits forever!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Problem: Starvation</p>
                <p className="text-gray-700 mb-2">
                  If high/medium priority jobs keep arriving, a low-priority job may never run.
                </p>
                <p className="font-semibold text-red-600">Solution: Aging</p>
                <p className="text-gray-600 text-xs">Increase priority of waiting processes over time.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Solution: Aging</p>
                <p className="text-gray-700 mb-2">
                  Every time unit a process waits, increase its priority (decrease priority number).
                </p>
                <p className="font-semibold text-green-600">Example:</p>
                <p className="text-gray-600 text-xs">After waiting 10 units, low-priority becomes medium-priority.</p>
              </div>
            </div>
          </Section>

          <Section title="Non-Preemptive vs Preemptive Priority">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-bold text-blue-700 mb-2">Non-Preemptive</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Current process runs to completion</li>
                  <li>Next higher priority process waits</li>
                  <li>Low overhead (no context switches)</li>
                  <li>Can block important tasks</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-bold text-purple-700 mb-2">Preemptive</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Higher priority interrupts current</li>
                  <li>Important tasks run immediately</li>
                  <li>Context switch overhead</li>
                  <li>Better for real-time systems</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Advantages of Priority Scheduling">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Important tasks first:</strong> Critical jobs get higher priority
                </li>
                <li>
                  <strong>Real-time systems:</strong> Deadline-driven scheduling is possible
                </li>
                <li>
                  <strong>Flexible:</strong> Priority can be static or dynamic (aging)
                </li>
                <li>
                  <strong>Responsive:</strong> User tasks can have higher priority than background
                </li>
              </ul>
            </div>
          </Section>

          <Section title="Disadvantages of Priority Scheduling">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Starvation:</strong> Low-priority processes may never run
                </li>
                <li>
                  <strong>Complexity:</strong> Assigning priorities is not trivial
                </li>
                <li>
                  <strong>Unfair:</strong> Low-priority jobs can wait indefinitely
                </li>
                <li>
                  <strong>Context switches:</strong> Preemptive priority has overhead
                </li>
              </ul>
            </div>
          </Section>

          <Section title="Real-World Examples of Priority Scheduling">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  icon: "🖥️",
                  title: "Operating Systems",
                  desc: "Kernel processes > user apps > background jobs.",
                },
                {
                  icon: "⏰",
                  title: "Real-Time Systems",
                  desc: "Deadline-driven. Safety-critical tasks highest priority.",
                },
                {
                  icon: "🎮",
                  title: "Video Games",
                  desc: "Game loop (high) > rendering (medium) > logging (low).",
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

          <Section title="Quick Comparison: All CPU Scheduling Algorithms">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Preemptive</th>
                    <th className="px-4 py-2">Fair</th>
                    <th className="px-4 py-2">Starvation</th>
                    <th className="px-4 py-2">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FCFS", "No", "Yes", "No", "Batch jobs"],
                    ["SJF", "No", "No", "Yes", "Known burst times"],
                    ["SRTF", "Yes", "Sort of", "Yes", "Interactive"],
                    ["Round Robin", "Yes", "Yes", "No", "Time-sharing"],
                    ["Priority", "Varies", "No", "Yes", "Real-time / Important tasks"],
                    ["MLFQ", "Yes", "Yes", "No", "General-purpose"],
                  ].map(([alg, pre, fair, starv, best], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "Priority" ? "text-indigo-600" : "text-gray-700"}`}>
                        {alg}
                      </td>
                      <td className="px-4 py-2">{pre}</td>
                      <td className={`px-4 py-2 font-semibold ${fair === "Yes" ? "text-green-600" : "text-red-600"}`}>
                        {fair}
                      </td>
                      <td className={`px-4 py-2 font-semibold ${starv === "Yes" ? "text-red-600" : "text-green-600"}`}>
                        {starv}
                      </td>
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
                "✅ Always pick the process with LOWEST priority number (1 = highest).",
                "✅ Non-preemptive: current process finishes before checking priority again.",
                "✅ Preemptive: higher priority interrupts lower priority immediately.",
                "✅ Starvation possible: low-priority processes may never run.",
                "✅ Aging solution: increase priority of waiting processes over time.",
                "✅ Turnaround Time = Finish Time − Arrival Time.",
                "✅ Waiting Time = Turnaround Time − Burst Time.",
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
            <p className="font-bold mb-1">💡 5 Complete Examples (Critical Cases)</p>
            <p>
              Example 1: Basic priority. Example 2: Starvation risk. Example 3: Preemptive priority.
              Example 4: All same priority (becomes FCFS). Example 5: Complex real-world scenario.
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
              Enter your own processes with arrival times, burst times, and priorities. Lower number = higher priority.
              Click Simulate to see the Gantt chart, execution timeline, and metrics.
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
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Priority (1=High)</th>
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
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={proc.priority}
                            onChange={(e) => handleChange(idx, "priority", e.target.value)}
                            placeholder="1"
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

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Simulate button */}
            <button
              onClick={simulatePriority}
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

                  {/* Chart 1: Burst Times and Priority */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <ProcessBurstChart processes={processes} />
                  </div>

                  {/* Chart 2: Arrival vs Priority */}
                  <div className="mb-4">
                    <ArrivalPriorityChart processes={processes} />
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

export default PriorityScheduling;