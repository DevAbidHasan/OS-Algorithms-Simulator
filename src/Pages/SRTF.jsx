import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ScatterChart, Scatter, AreaChart, Area } from "recharts";

// ── Example scenarios ──────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Basic Preemption (Short Job Interrupts Long Job)",
    processes: [
      { name: "Long Task", arrival: 0, burst: 10 },
      { name: "Short Task", arrival: 2, burst: 3 },
    ],
    explanation: [
      "Long Task arrives at time 0 with burst=10. Short Task arrives at time 2 with burst=3.",
      "Time 0-2: Long Task runs (no one else available). 2 units executed, 8 remaining.",
      "Time 2: Short Task arrives! SRTF checks: Long has 8 remaining, Short has 3 remaining.",
      "SRTF INTERRUPTS Long Task and switches to Short Task (3 < 8). This is PREEMPTION!",
      "Time 2-5: Short Task runs for 3 units. Completes at time 5.",
      "Time 5+: Long Task resumes. 8 units remaining. Runs 5 → 13.",
      "Execution timeline: Long (0-2, 2u), Short (2-5, 3u), Long (5-13, 8u).",
      "Wait times: Long Task = 0 (but interrupted), Short Task = 0 (started immediately when needed).",
      "Total time = 13. Turnaround: Long=13, Short=3.",
      "Key: SRTF preempts (interrupts) to always run the shortest remaining job!",
    ],
  },
  {
    title: "Example 2 — Multiple Interruptions (Several Context Switches)",
    processes: [
      { name: "P1", arrival: 0, burst: 8 },
      { name: "P2", arrival: 1, burst: 4 },
      { name: "P3", arrival: 2, burst: 2 },
    ],
    explanation: [
      "P1 arrives at 0 (burst=8), P2 arrives at 1 (burst=4), P3 arrives at 2 (burst=2).",
      "Time 0-1: P1 runs (only available). 1 unit executed, 7 remaining.",
      "Time 1: P2 arrives. SRTF checks: P1 remaining=7, P2 remaining=4. Switch to P2 (4<7).",
      "Time 1-2: P2 runs. 1 unit executed, 3 remaining. P1 paused with 7 remaining.",
      "Time 2: P3 arrives. SRTF checks: P1=7, P2=3, P3=2. Switch to P3 (2<3<7).",
      "Time 2-4: P3 runs for 2 units. Completes at time 4.",
      "Time 4: P3 done. Check remaining: P1=7, P2=3. Switch to P2 (3<7).",
      "Time 4-8: P2 runs for 4 units (to completion). Completes at time 8.",
      "Time 8-16: P1 runs for 8 units. Completes at time 16.",
      "Context switches: P1→P2 (at 1), P2→P3 (at 2), P3→P2 (at 4), P2→P1 (at 8). Total = 4 switches!",
      "Wait times: P1=8 (0-1 run, 1-8 wait), P2=3 (1-2 run, 2-4 wait, 4-8 run), P3=0 (started when arrived).",
      "Key: SRTF can cause many context switches. Overhead = cost of switching!",
    ],
  },
  {
    title: "Example 3 — SRTF vs SJF Comparison",
    processes: [
      { name: "Big", arrival: 0, burst: 10 },
      { name: "Tiny", arrival: 1, burst: 1 },
    ],
    explanation: [
      "This example compares non-preemptive SJF vs preemptive SRTF for the same processes.",
      "Processes: Big (arrival=0, burst=10), Tiny (arrival=1, burst=1).",
      "---",
      "SJF (Non-preemptive):",
      "Time 0-10: Big runs (can't be interrupted). 10 units executed.",
      "Time 10-11: Tiny runs. 1 unit executed.",
      "Wait time: Big=0, Tiny=9 (waited from 1 to 10).",
      "---",
      "SRTF (Preemptive):",
      "Time 0-1: Big runs. 1 unit executed, 9 remaining.",
      "Time 1: Tiny arrives! Remaining: Big=9, Tiny=1. Switch to Tiny (1<9).",
      "Time 1-2: Tiny runs. 1 unit executed. Completes!",
      "Time 2-11: Big resumes. 9 units executed.",
      "Wait time: Big=1 (0-1 run, 1-2 paused), Tiny=0 (started when arrived).",
      "---",
      "SRTF is MUCH better: Average wait = 0.5 vs SJF's average wait = 4.5!",
      "Key: Preemption helps short jobs avoid long waits. SRTF is optimal for minimizing wait!",
    ],
  },
  {
    title: "Example 4 — All Processes Arrive Together (No Preemption Needed)",
    processes: [
      { name: "Process A", arrival: 0, burst: 8 },
      { name: "Process B", arrival: 0, burst: 4 },
      { name: "Process C", arrival: 0, burst: 2 },
    ],
    explanation: [
      "All processes arrive at time 0 simultaneously. Bursts: A=8, B=4, C=2.",
      "Time 0: All available. Remaining: A=8, B=4, C=2. Pick C (smallest remaining).",
      "Time 0-2: C runs for 2 units. Completes. Remaining: A=8, B=4.",
      "Time 2: Check remaining. A=8, B=4. Pick B (4<8).",
      "Time 2-6: B runs for 4 units. Completes. Remaining: A=8.",
      "Time 6-14: A runs for 8 units. Completes.",
      "No preemption needed! New job didn't arrive during execution.",
      "Execution: C(0-2), B(2-6), A(6-14). Total time = 14.",
      "Wait times: C=0, B=2 (arrived 0, started 2), A=6 (arrived 0, started 6).",
      "Average wait = 2.67. Same as SJF when all arrive together!",
      "Key: When processes arrive together, SRTF = SJF (no new arrivals to preempt).",
    ],
  },
  {
    title: "Example 5 — Complex Scenario (Realistic Mixed Arrivals)",
    processes: [
      { name: "Job A", arrival: 0, burst: 6 },
      { name: "Job B", arrival: 2, burst: 3 },
      { name: "Job C", arrival: 3, burst: 2 },
      { name: "Job D", arrival: 5, burst: 4 },
    ],
    explanation: [
      "Complex scenario: Job A(0,6), Job B(2,3), Job C(3,2), Job D(5,4).",
      "Time 0-2: A runs. 2 executed, 4 remaining.",
      "Time 2: B arrives. Remaining: A=4, B=3. Switch to B (3<4).",
      "Time 2-3: B runs for 1 unit. 2 remaining.",
      "Time 3: C arrives. Remaining: A=4, B=2, C=2. B and C tie. Pick B (arrived first).",
      "Time 3-5: B runs for 2 units. Completes at 5. Remaining: A=4, C=2.",
      "Time 5: D arrives. Remaining: A=4, C=2, D=4. Pick C (2<4).",
      "Time 5-7: C runs for 2 units. Completes. Remaining: A=4, D=4.",
      "Time 7: A and D tie (4=4). Pick A (arrived first).",
      "Time 7-11: A runs for 4 units. Completes. Remaining: D=4.",
      "Time 11-15: D runs for 4 units. Completes.",
      "Preemptions: A→B(2), B→C(5). Context switches = 2.",
      "Total time = 15. Average wait time calculated from completion times.",
      "Key: SRTF dynamically adjusts as new processes arrive. Always picks shortest remaining!",
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
      <p className="font-semibold text-gray-700">Gantt Chart (Timeline with Preemptions):</p>

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
                <td className="px-4 py-2 text-gray-600">{stat.arrival}</td>
                <td className="px-4 py-2 text-gray-600">{stat.burst}</td>
                <td className="px-4 py-2 text-gray-600">{stat.endTime}</td>
                <td className="px-4 py-2 font-semibold text-red-600">{stat.waitTime}</td>
                <td className="px-4 py-2 font-semibold text-blue-600">{stat.turnaroundTime}</td>
              </tr>
            ))}
            <tr className="bg-indigo-50 font-bold">
              <td className="px-4 py-2" colSpan="4">
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
    remaining: p.burst,
    completed: false
  }));

  let time = 0;
  const timeline = [];
  const n = procList.length;
  let completed = 0;
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

    available.sort((a, b) => a.remaining - b.remaining);
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
            <p className="text-xs">Arrives: {p.arrival}, Burst: {p.burst}</p>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
        {ex.explanation.map((line, i) => (
          <li key={i} className={line.includes("SRTF") || line.includes("Preemption") || line.includes("Switch") ? "font-semibold text-indigo-700" : ""}>
            {line}
          </li>
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
const SRTF = () => {
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

  // ── Simulate SRTF ──────────────────────────────────────────────────────
  const simulateSRTF = () => {
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
      remaining: parseInt(p.burst),
      completed: false,
    }));

    let time = 0;
    const tempTimeline = [];
    const n = procList.length;
    let completed = 0;
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

      available.sort((a, b) => a.remaining - b.remaining);
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
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">SRTF CPU Scheduling Simulator</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Shortest Remaining Time First (Preemptive SJF) — interrupts current process when a shorter job arrives.
        Optimal for minimizing average wait time. Learn how preemption works.
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
          <Section title="What is SRTF Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">SRTF (Shortest Remaining Time First)</span> is the
              <span className="font-semibold"> preemptive version of SJF</span>. It always runs the process with the
              <span className="font-semibold"> shortest remaining burst time</span>. If a new process arrives with
              less remaining time, the current process is <span className="font-semibold">interrupted (preempted)</span>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              SRTF is theoretically optimal for minimizing average wait time but has overhead from context switches.
            </p>
          </Section>

          <Section title="Key Concept: Preemption">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                <span className="font-bold text-orange-700">Preemption</span> means the CPU can interrupt a running
                process and switch to another one. This happens when a higher-priority (shorter remaining time) process
                arrives.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Example: Job A (10 units) runs for 2 units → Job B (1 unit) arrives → CPU STOPS A and switches to B →
                B finishes → CPU resumes A.
              </p>
            </div>
          </Section>

          <Section title="SRTF vs SJF vs FCFS — Comparison">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-300 rounded-lg">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Feature</th>
                    <th className="px-4 py-2">FCFS</th>
                    <th className="px-4 py-2">SJF (Non-Preemptive)</th>
                    <th className="px-4 py-2">SRTF (Preemptive)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b">
                    <td className="px-4 py-2 font-semibold">Preemptive?</td>
                    <td className="px-4 py-2">No</td>
                    <td className="px-4 py-2">No</td>
                    <td className="px-4 py-2 font-bold text-green-700">Yes</td>
                  </tr>
                  <tr className="bg-gray-50 border-b">
                    <td className="px-4 py-2 font-semibold">Selection Criteria</td>
                    <td className="px-4 py-2">First to arrive</td>
                    <td className="px-4 py-2">Shortest burst</td>
                    <td className="px-4 py-2">Shortest remaining time</td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-4 py-2 font-semibold">Avg Wait Time</td>
                    <td className="px-4 py-2">High</td>
                    <td className="px-4 py-2">Medium</td>
                    <td className="px-4 py-2 font-bold text-green-700">Optimal (Lowest)</td>
                  </tr>
                  <tr className="bg-gray-50 border-b">
                    <td className="px-4 py-2 font-semibold">Starvation Risk</td>
                    <td className="px-4 py-2">No</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Yes</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-semibold">Context Switches</td>
                    <td className="px-4 py-2">Few</td>
                    <td className="px-4 py-2">Few</td>
                    <td className="px-4 py-2 font-bold text-red-700">Many</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="SRTF Algorithm — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "Check all available processes.",
                  d: "Processes that have arrived and are not complete.",
                },
                {
                  n: 2,
                  t: "Pick the one with SHORTEST REMAINING TIME.",
                  d: "Compare remaining time, not original burst time.",
                },
                {
                  n: 3,
                  t: "If it's different from current process, PREEMPT.",
                  d: "Stop current process, save its state, switch to new one.",
                },
                {
                  n: 4,
                  t: "Execute for 1 time unit (or until complete).",
                  d: "SRTF checks at each arrival for preemption.",
                },
                {
                  n: 5,
                  t: "Repeat from step 1.",
                  d: "Check again when next process arrives or current completes.",
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

          <Section title="Advantages of SRTF">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Minimizes average wait time:</strong> Theoretically optimal non-preemptive algorithm
                </li>
                <li>
                  <strong>Fairness:</strong> Short jobs don't starve long ones (long jobs eventually run)
                </li>
                <li>
                  <strong>Responsive:</strong> Interactive systems benefit from quick response
                </li>
                <li>
                  <strong>Better than SJF:</strong> SJF can make short jobs wait for long jobs
                </li>
              </ul>
            </div>
          </Section>

          <Section title="Disadvantages of SRTF">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Context switch overhead:</strong> Switching is expensive (time, cache flushes)
                </li>
                <li>
                  <strong>Requires knowing burst times:</strong> Must predict job duration upfront
                </li>
                <li>
                  <strong>Complex to implement:</strong> Needs interrupt handling and scheduling logic
                </li>
                <li>
                  <strong>Can still starve long jobs:</strong> If short jobs keep arriving (rare)
                </li>
              </ul>
            </div>
          </Section>

          <Section title="When to Use SRTF">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  icon: "⏱️",
                  title: "Interactive Systems",
                  desc: "Minimize response time for user requests.",
                },
                {
                  icon: "📊",
                  title: "Batch Systems",
                  desc: "With known job durations available.",
                },
                {
                  icon: "✨",
                  title: "Minimize Wait Time",
                  desc: "Primary goal is lowest average wait.",
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

          <Section title="Context Switch Cost">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                Each preemption causes a <span className="font-bold">context switch</span>:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Save current process state (registers, memory)</li>
                <li>Load new process state</li>
                <li>Flush CPU cache (on some systems)</li>
                <li>All this takes CPU time!</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                Too many context switches can make SRTF slower than simpler algorithms despite optimal theoretical performance.
              </p>
            </div>
          </Section>

          <Section title="Quick Reference">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ SRTF always picks the shortest REMAINING time (not original burst).",
                "✅ PREEMPTION happens when a shorter job arrives.",
                "✅ Optimal for minimizing average wait time (theoretically).",
                "✅ Can cause many context switches (overhead).",
                "✅ Needs future knowledge (burst times).",
                "✅ Better for batch systems than interactive real-time systems.",
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
            <p className="font-bold mb-1">💡 5 Complete Examples (With Preemption)</p>
            <p>
              Example 1: Basic preemption. Example 2: Multiple interruptions/context switches.
              Example 3: SRTF vs SJF comparison. Example 4: All arrive together (no preemption).
              Example 5: Complex realistic scenario.
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
              Enter your own processes with arrival and burst times. The simulator calculates SRTF scheduling
              with preemptions, shows all context switches in the Gantt chart, and displays metrics.
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
              onClick={simulateSRTF}
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

export default SRTF;