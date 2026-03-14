import React, { useState } from "react";

// ── Example scenarios ──────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Three Processes Arriving in Order",
    processes: [
      { name: "Process A", arrival: 0, burst: 5 },
      { name: "Process B", arrival: 1, burst: 3 },
      { name: "Process C", arrival: 2, burst: 4 },
    ],
    explanation: [
      "Process A arrives at time 0 and needs 5 time units of CPU.",
      "Process B arrives at time 1 and needs 3 time units.",
      "Process C arrives at time 2 and needs 4 time units.",
      "Since A arrived first, it runs first from time 0 to 5.",
      "B arrived second and waits. When A finishes at time 5, B starts and runs until time 8.",
      "C waits for B to finish. At time 8, C starts and runs until time 12.",
      "FCFS is simple: first process in line gets the CPU, no jumping ahead.",
    ],
  },
  {
    title: "Example 2 — All Processes Arrive at the Same Time",
    processes: [
      { name: "P1", arrival: 0, burst: 8 },
      { name: "P2", arrival: 0, burst: 4 },
      { name: "P3", arrival: 0, burst: 2 },
    ],
    explanation: [
      "All three processes arrive at time 0 (same moment).",
      "P1 is listed first, so it goes into the queue first.",
      "P1 runs from time 0 to 8 (8 time units).",
      "P2 waits while P1 runs. When P1 finishes at time 8, P2 starts.",
      "P2 runs from time 8 to 12 (4 time units).",
      "P3 waits the longest. At time 12, P3 finally gets the CPU.",
      "P3 runs from time 12 to 14 (2 time units).",
      "Notice: the order matters! If P2 arrived first, it would run first.",
    ],
  },
  {
    title: "Example 3 — Processes With Gaps (Idle CPU)",
    processes: [
      { name: "Process A", arrival: 0, burst: 3 },
      { name: "Process B", arrival: 8, burst: 2 },
      { name: "Process C", arrival: 10, burst: 5 },
    ],
    explanation: [
      "Process A arrives at time 0 and runs from 0 to 3.",
      "After A finishes at time 3, there are no more processes ready!",
      "The CPU sits idle (waiting) from time 3 to 8.",
      "At time 8, Process B finally arrives and immediately starts running.",
      "B runs from time 8 to 10 (2 time units).",
      "At time 10, Process C arrives and the queue is empty.",
      "C starts immediately and runs from time 10 to 15 (5 time units).",
      "Key point: If the next process hasn't arrived yet, the CPU stays idle.",
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

  const colors = {
    Idle: "#d1d5db",
    "Process A": "#4f46e5",
    "Process B": "#06b6d4",
    "Process C": "#10b981",
    P1: "#4f46e5",
    P2: "#06b6d4",
    P3: "#10b981",
    A: "#4f46e5",
    B: "#06b6d4",
    C: "#10b981",
  };

  const colorMap = {};
  timeline.forEach((slot) => {
    if (!colorMap[slot.name]) {
      const existingColors = Object.values(colorMap);
      const availableColors = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
      let colorIndex = 0;
      for (let color of availableColors) {
        if (!existingColors.includes(color)) {
          colorMap[slot.name] = color;
          break;
        }
        colorIndex++;
      }
      if (!colorMap[slot.name]) {
        colorMap[slot.name] = availableColors[existingColors.length % availableColors.length];
      }
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
                backgroundColor: colorMap[slot.name] || "#d1d5db",
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
        {Object.entries(colorMap)
          .filter(([name]) => name !== "Idle")
          .map(([name, color]) => (
            <div key={name} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              ></div>
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

// ── Worked Example Block ──────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const timeline = [];
  let currentTime = 0;
  const sorted = [...ex.processes].sort((a, b) => a.arrival - b.arrival);

  sorted.forEach((proc) => {
    const arrival = proc.arrival;
    const burst = proc.burst;

    if (arrival > currentTime) {
      timeline.push({ name: "Idle", duration: arrival - currentTime });
      currentTime = arrival;
    }

    timeline.push({ name: proc.name, duration: burst });
    currentTime += burst;
  });

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
const FCFS = () => {
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

  // ── Simulate FCFS ──────────────────────────────────────────────────────
  const simulateFCFS = () => {
    // Validation
    if (processes.some((p) => !p.name || !p.burst || !p.arrival)) {
      setError("Please fill all fields for each process.");
      setTimeline([]);
      return;
    }

    if (processes.some((p) => p.name.trim() === "")) {
      setError("All processes must have a name.");
      setTimeline([]);
      return;
    }

    setError("");

    // Sort by arrival time
    const processData = processes.map((p) => ({
      name: p.name,
      arrival: parseInt(p.arrival),
      burst: parseInt(p.burst),
    }));

    // Validate
    if (processData.some((p) => p.arrival < 0 || p.burst <= 0)) {
      setError("Arrival time must be >= 0 and burst time must be positive.");
      setTimeline([]);
      return;
    }

    const sorted = [...processData].sort((a, b) => a.arrival - b.arrival);
    const tempTimeline = [];
    let currentTime = 0;

    sorted.forEach((proc) => {
      const arrival = proc.arrival;
      const burst = proc.burst;

      if (arrival > currentTime) {
        tempTimeline.push({ name: "Idle", duration: arrival - currentTime });
        currentTime = arrival;
      }

      tempTimeline.push({ name: proc.name, duration: burst });
      currentTime += burst;
    });

    setTimeline(tempTimeline);
  };

  // ── Load example ───────────────────────────────────────────────────────
  const loadExample = (exampleIndex) => {
    const ex = EXAMPLES[exampleIndex];
    setProcesses(JSON.parse(JSON.stringify(ex.processes)));
    setTimeline([]);
    setError("");
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
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">
        FCFS CPU Scheduling Simulator
      </h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        First Come First Served — the simplest CPU scheduling algorithm. Processes run in the order
        they arrive. No jumping ahead, no priorities. Learn how it works and see real examples.
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
          <Section title="What is FCFS Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">FCFS (First Come First Served)</span> is
              the simplest CPU scheduling algorithm. It works like a queue at a ticket counter:{" "}
              <span className="font-semibold">whoever arrives first gets served first</span>. No
              special treatment, no jumping ahead.
            </p>
            <p className="text-gray-700 leading-relaxed">
              When a process arrives, it joins the back of the queue. When the CPU becomes free,
              the process at the front of the queue gets to use the CPU. The process runs completely
              to the end (no interruption) before the next process starts.
            </p>
          </Section>

          <Section title="Key Terms (Simple Explanation)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⏰ Arrival Time</p>
                <p className="text-gray-700 text-sm">
                  When the process shows up and joins the queue. Like arriving at a bus stop.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⏱️ Burst Time</p>
                <p className="text-gray-700 text-sm">
                  How long the process needs the CPU. Like how long your transaction takes.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⌛ Wait Time</p>
                <p className="text-gray-700 text-sm">
                  How long the process waits before the CPU starts running it. (Start Time - Arrival Time)
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🔄 Turnaround Time</p>
                <p className="text-gray-700 text-sm">
                  Total time from arrival to completion. (End Time - Arrival Time)
                </p>
              </div>
            </div>
          </Section>

          <Section title="How FCFS Works — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "Processes arrive at different times.",
                  d: "When a process is created, it joins the queue.",
                },
                {
                  n: 2,
                  t: "CPU picks the first process in the queue.",
                  d: "The process that arrived earliest (or was waiting longest) gets the CPU.",
                },
                {
                  n: 3,
                  t: "Process runs for its entire burst time.",
                  d: "Once started, the process uses the CPU until it finishes. No interruption.",
                },
                {
                  n: 4,
                  t: "After one process finishes, pick the next.",
                  d: "The CPU moves to the next waiting process in the queue.",
                },
                {
                  n: 5,
                  t: "If no process is ready, CPU stays idle.",
                  d: "If the next process hasn't arrived yet, CPU waits (doing nothing).",
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

          <Section title="Advantages of FCFS">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Super simple:</strong> Easy to understand and implement
                </li>
                <li>
                  <strong>Fair:</strong> Every process gets a turn, no one is ignored
                </li>
                <li>
                  <strong>Low overhead:</strong> Doesn't waste CPU time on scheduling decisions
                </li>
                <li>
                  <strong>No starvation:</strong> Every process will eventually run
                </li>
              </ul>
            </div>
          </Section>

          <Section title="Disadvantages of FCFS">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Long waits:</strong> A big process can make others wait a long time
                </li>
                <li>
                  <strong>Convoy effect:</strong> Short processes wait behind long ones
                </li>
                <li>
                  <strong>Poor CPU usage:</strong> CPU sits idle waiting for processes to arrive
                </li>
                <li>
                  <strong>Not interactive:</strong> Bad for systems that need quick response times
                </li>
              </ul>
            </div>
          </Section>

          <Section title="Real-World Example">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-700 space-y-2 text-sm">
              <p>
                Imagine a coffee shop. When you order, you join the line. The barista serves
                customers in the order they arrived:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Customer 1 arrives at 8:00 and needs 5 minutes → runs 8:00-8:05</li>
                <li>Customer 2 arrives at 8:02 but must wait until 8:05 → runs 8:05-8:07</li>
                <li>Customer 3 arrives at 8:03 but waits even longer → runs 8:07-8:10</li>
              </ul>
              <p className="mt-2">
                Customer 3 arrived first and still waits the longest! This is FCFS.
              </p>
            </div>
          </Section>

          <Section title="When is FCFS Used?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  icon: "🔧",
                  title: "Simple Systems",
                  desc: "Embedded devices or systems where simplicity matters more than performance.",
                },
                {
                  icon: "📊",
                  title: "Batch Processing",
                  desc: "Running many jobs in order, like printing or data processing.",
                },
                {
                  icon: "📚",
                  title: "Teaching",
                  desc: "Learning about scheduling — it's the easiest algorithm to understand.",
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

          <Section title="Quick Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ Processes are served in the order they arrive (FIFO queue).",
                "✅ Each process runs to completion without interruption.",
                "✅ If CPU is free and a process is waiting, it starts immediately.",
                "✅ If no process is ready, CPU stays idle (waiting).",
                "✅ Simple to implement and understand.",
                "✅ Fair, but can cause long waits for some processes.",
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
            <p className="font-bold mb-1">💡 How to read these examples</p>
            <p>
              Each example shows the processes, a step-by-step explanation, a Gantt chart (visual
              timeline), and a table with metrics. The Gantt chart shows which process is running
              at each moment. Pay attention to wait times and idle periods!
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
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>
              Enter your own processes with their arrival times and burst times. Then click
              Simulate to see the Gantt chart and metrics. Experiment to see how arrival times and
              burst times affect wait times!
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
                        Burst Time (CPU duration)
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
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold text-sm transition"
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
              onClick={simulateFCFS}
              className="w-full bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-bold text-lg transition mb-6"
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

export default FCFS;