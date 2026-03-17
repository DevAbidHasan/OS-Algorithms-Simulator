import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// ── Example scenarios ──────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — Simple Three-Task System (Basic Concept)",
    tasks: [
      { name: "Task A", execution: 2, period: 4 },
      { name: "Task B", execution: 1, period: 6 },
      { name: "Task C", execution: 2, period: 12 },
    ],
    explanation: [
      "Task A: Execution=2, Period=4 (runs at times 0, 4, 8, 12, ...)",
      "Task B: Execution=1, Period=6 (runs at times 0, 6, 12, ...)",
      "Task C: Execution=2, Period=12 (runs at times 0, 12, ...)",
      "Hyperperiod = LCM(4, 6, 12) = 12 time units",
      "Schedule repeats every 12 time units.",
      "Within one hyperperiod: TaskA runs 3x (6 units), TaskB runs 2x (2 units), TaskC runs 1x (2 units) = 10 units total.",
      "CPU usage: 10/12 = 83.3% (plenty of idle time for other tasks)",
      "Key insight: All three tasks coexist and their instances are scheduled before runtime.",
    ],
  },
  {
    title: "Example 2 — Real-Time Sampling System (High vs Low Frequency)",
    tasks: [
      { name: "Sensor", execution: 1, period: 2 },
      { name: "Process", execution: 2, period: 4 },
      { name: "Log", execution: 1, period: 8 },
    ],
    explanation: [
      "Sensor: Execution=1, Period=2 (high frequency sampling, quick execution)",
      "Process: Execution=2, Period=4 (medium frequency processing)",
      "Log: Execution=1, Period=8 (low frequency data logging)",
      "Hyperperiod = LCM(2, 4, 8) = 8 time units",
      "Within hyperperiod H=8:",
      "  Sensor: 8/2=4 instances × 1 unit = 4 units",
      "  Process: 8/4=2 instances × 2 units = 4 units",
      "  Log: 8/8=1 instance × 1 unit = 1 unit",
      "Total: 4+4+1 = 9 units required but only 8 available!",
      "CPU usage = 9/8 = 112.5% — SYSTEM IS INFEASIBLE!",
      "Key insight: Not all task combinations are schedulable. Check feasibility first!",
    ],
  },
  {
    title: "Example 3 — Mixed Periodicity (LCM Explosion Problem)",
    tasks: [
      { name: "T1", execution: 2, period: 5 },
      { name: "T2", execution: 1, period: 7 },
      { name: "T3", execution: 1, period: 3 },
    ],
    explanation: [
      "T1: Execution=2, Period=5",
      "T2: Execution=1, Period=7",
      "T3: Execution=1, Period=3",
      "Hyperperiod = LCM(5, 7, 3) = 105 time units (LARGE!)",
      "This demonstrates the LCM explosion problem:",
      "With just 3 tasks and small periods, hyperperiod grows to 105.",
      "Imagine 10 tasks with prime periods — hyperperiod could be product of all primes!",
      "Within hyperperiod H=105:",
      "  T1: 105/5=21 instances × 2 units = 42 units",
      "  T2: 105/7=15 instances × 1 unit = 15 units",
      "  T3: 105/3=35 instances × 1 unit = 35 units",
      "Total: 42+15+35 = 92 units. CPU usage = 92/105 = 87.6% (feasible)",
      "Key insight: Static scheduling with many tasks suffers from hyperperiod explosion.",
      "Storage grows fast. Schedule must be pre-computed and stored entirely.",
      "Real systems avoid this by using harmonic periods (multiples of each other).",
    ],
  },
  {
    title: "Example 4 — Infeasible System (Cannot Schedule All Tasks)",
    tasks: [
      { name: "HighLoad", execution: 3, period: 4 },
      { name: "MediumLoad", execution: 2, period: 4 },
      { name: "LowLoad", execution: 2, period: 4 },
    ],
    explanation: [
      "All tasks have SAME period = 4. But total execution: 3+2+2 = 7 per period!",
      "Hyperperiod = LCM(4, 4, 4) = 4 time units",
      "Each period has only 4 time units available.",
      "Required per period: 3+2+2 = 7 units.",
      "Available: 4 units.",
      "Within H=4: HighLoad runs 1x (3 units), MediumLoad runs 1x (2 units), LowLoad runs 1x (2 units).",
      "Total = 3+2+2 = 7 units but only 4 available!",
      "CPU usage = 7/4 = 175% — IMPOSSIBLE!",
      "Key insight: Infeasible systems CANNOT be statically scheduled.",
      "Must reduce execution times, increase periods, or add more processors.",
      "Feasibility checking is CRITICAL before attempting static scheduling.",
    ],
  },
  {
    title: "Example 5 — Nested Periods (Ideal for Static Scheduling)",
    tasks: [
      { name: "Fast", execution: 1, period: 2 },
      { name: "Medium", execution: 1, period: 4 },
      { name: "Slow", execution: 2, period: 8 },
    ],
    explanation: [
      "Nested periods: 2, 4, 8 (each is power-of-2 multiple of previous)",
      "This is IDEAL for static scheduling!",
      "Hyperperiod = LCM(2, 4, 8) = 8 time units (manageable!)",
      "Within H=8:",
      "  Fast: 8/2=4 instances × 1 unit = 4 units",
      "  Medium: 8/4=2 instances × 1 unit = 2 units",
      "  Slow: 8/8=1 instance × 2 units = 2 units",
      "Total: 4+2+2 = 8 units. CPU usage = 8/8 = 100% (PERFECTLY BALANCED!)",
      "Task instances align nicely without gaps:",
      "  t=0: Fast, Medium, Slow activate together",
      "  t=2: Fast activates again",
      "  t=4: Fast, Medium activate again",
      "  t=6: Fast activates again",
      "Schedule: Fast(1) Medium(1) Slow(2) Fast(1) Medium(1) Fast(1) Slow(?) Fast(1)",
      "Wait, Slow needs 2 units. Scheduler fits them optimally.",
      "Key insight: Harmonic/nested task sets are ideal for static scheduling.",
      "Real systems deliberately use harmonic periods to keep hyperperiods small.",
    ],
  },
  {
    title: "Example 6 — Single Task (Baseline Case)",
    tasks: [
      { name: "OnlyTask", execution: 3, period: 6 },
    ],
    explanation: [
      "Single task case: Simplest static scheduling scenario.",
      "OnlyTask: Execution=3, Period=6",
      "Hyperperiod = 6 time units (no LCM calculation needed)",
      "Schedule is trivial: Run OnlyTask every 6 time units, taking 3 units each time.",
      "Timeline:",
      "  t=0→3: OnlyTask executes (first activation)",
      "  t=3→6: Idle (CPU waiting for next period)",
      "  t=6→9: OnlyTask executes (second activation)",
      "  t=9→12: Idle",
      "  ... repeats",
      "Within H=6: 1 instance × 3 units = 3 units.",
      "CPU usage = 3/6 = 50% (lots of idle time available)",
      "Key insight: Single-task systems are trivial for static scheduling.",
      "Static scheduling really shines with multiple interleaved periodic tasks.",
    ],
  },
  {
    title: "Example 7 — Critically Feasible System (CPU at 100% with Margin)",
    tasks: [
      { name: "Task1", execution: 3, period: 5 },
      { name: "Task2", execution: 2, period: 5 },
    ],
    explanation: [
      "Task1: Execution=3, Period=5",
      "Task2: Execution=2, Period=5",
      "Both have same period: 5",
      "Hyperperiod = LCM(5, 5) = 5 time units",
      "Within H=5:",
      "  Task1: 5/5=1 instance × 3 units = 3 units",
      "  Task2: 5/5=1 instance × 2 units = 2 units",
      "Total: 3+2 = 5 units. CPU usage = 5/5 = 100% (FULL CAPACITY!)",
      "Schedule is tight (no room for additional tasks or errors):",
      "  Task1 executes 3 units (t=0→3)",
      "  Task2 executes 2 units (t=3→5)",
      "  Then repeat every 5 time units",
      "At t=5: Both tasks activate again, same schedule repeats",
      "Key insight: Critically feasible systems use 100% CPU.",
      "Any delay or overhead causes deadline miss!",
      "Real systems add some slack (typically keep CPU < 90%) for safety.",
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

// ── Timeline Visualization ────────────────────────────────────────────────
function TimelineVisualization({ schedule, hyperperiod }) {
  if (schedule.length === 0) return null;

  const uniqueTasks = [...new Set(schedule.map((s) => s.task))];
  const colors = [
    "#4f46e5", // indigo
    "#06b6d4", // cyan
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
  ];

  const timelineData = [];
  for (let t = 0; t < hyperperiod; t++) {
    const tasksAtTime = schedule.filter((s) => s.time === t);
    const row = { time: t };
    tasksAtTime.forEach((s) => {
      row[s.task] = (row[s.task] || 0) + 1;
    });
    timelineData.push(row);
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="font-semibold text-gray-700">Task Execution Over Time:</p>

      {/* Stacked bar chart */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            {uniqueTasks.map((task, idx) => (
              <Bar
                key={task}
                dataKey={task}
                stackId="a"
                fill={colors[idx % colors.length]}
                name={task}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {uniqueTasks.map((task, idx) => (
          <div key={task} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[idx % colors.length] }}
            ></div>
            <span className="text-gray-700">{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Schedule Table ────────────────────────────────────────────────────────
function ScheduleTable({ schedule }) {
  if (schedule.length === 0) return null;

  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2 text-gray-700">Execution Schedule (Step-by-Step):</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Step</th>
            <th className="px-4 py-2">Time Unit</th>
            <th className="px-4 py-2">Task</th>
            <th className="px-4 py-2">Execution Part</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 font-semibold text-indigo-600">{idx + 1}</td>
              <td className="px-4 py-2 text-gray-700">{item.time}</td>
              <td className="px-4 py-2 font-semibold text-indigo-700">{item.task}</td>
              <td className="px-4 py-2 text-gray-600">
                {item.execution}/{item.totalExecution}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Worked Example Block ──────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const schedule = [];
  let hyperperiod = 1;

  // Calculate hyperperiod
  const gcd = (a, b) => (!b ? a : gcd(b, a % b));
  const lcm = (a, b) => (a * b) / gcd(a, b);
  hyperperiod = ex.tasks[0].period;
  for (let i = 1; i < ex.tasks.length; i++) {
    hyperperiod = lcm(hyperperiod, ex.tasks[i].period);
  }

  // Generate schedule
  for (let time = 0; time < hyperperiod; time++) {
    for (let task of ex.tasks) {
      if (time % task.period === 0) {
        for (let e = 0; e < task.execution; e++) {
          schedule.push({
            task: task.name,
            time,
            execution: e + 1,
            totalExecution: task.execution,
          });
        }
      }
    }
  }

  const cpuUtil = ((schedule.length / hyperperiod) * 100).toFixed(1);

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>

      {/* Task badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ex.tasks.map((t, i) => (
          <div key={i} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-semibold text-sm">
            <p className="font-bold">{t.name}</p>
            <p className="text-xs">C={t.execution}, T={t.period}</p>
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
      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
        <div className={`rounded p-3 text-center ${cpuUtil > 100 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
          <p className={cpuUtil > 100 ? "text-red-600" : "text-green-600"}>Hyperperiod</p>
          <p className={`font-bold ${cpuUtil > 100 ? "text-red-600" : "text-green-600"}`}>{hyperperiod}</p>
        </div>
        <div className={`rounded p-3 text-center ${cpuUtil > 100 ? "bg-red-50 border border-red-200" : "bg-white border border-gray-200"}`}>
          <p className="text-gray-600">Total Slots</p>
          <p className={`font-bold ${cpuUtil > 100 ? "text-red-600" : "text-indigo-600"}`}>{schedule.length}</p>
        </div>
        <div className={`rounded p-3 text-center ${cpuUtil > 100 ? "bg-red-50 border border-red-200" : "bg-white border border-gray-200"}`}>
          <p className="text-gray-600">CPU Usage</p>
          <p className={`font-bold ${cpuUtil > 100 ? "text-red-600 font-bold" : "text-indigo-600"}`}>
            {cpuUtil}% {cpuUtil > 100 && "❌ INFEASIBLE"}
          </p>
        </div>
      </div>

      {/* Timeline chart */}
      <TimelineVisualization schedule={schedule} hyperperiod={hyperperiod} />

      {/* Schedule table */}
      <ScheduleTable schedule={schedule} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
const BasicStatic = () => {
  const [tasks, setTasks] = useState([
    { name: "", execution: "", period: "" },
  ]);
  const [schedule, setSchedule] = useState([]);
  const [hyperperiod, setHyperperiod] = useState(0);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  // ── Utility functions ──────────────────────────────────────────────────
  const gcd = (a, b) => (!b ? a : gcd(b, a % b));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  // ── Add task ───────────────────────────────────────────────────────────
  const addTask = () => {
    setTasks([...tasks, { name: "", execution: "", period: "" }]);
  };

  // ── Delete task ────────────────────────────────────────────────────────
  const deleteTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  // ── Handle input changes ───────────────────────────────────────────────
  const handleChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  // ── Simulate scheduling ────────────────────────────────────────────────
  const simulateSchedule = () => {
    // Validation
    if (tasks.some((t) => !t.name || !t.execution || !t.period)) {
      setError("Please fill all fields for each task.");
      setSchedule([]);
      return;
    }

    if (tasks.some((t) => t.name.trim() === "")) {
      setError("All tasks must have a name.");
      setSchedule([]);
      return;
    }

    setError("");

    // Convert to numbers
    const taskData = tasks.map((t) => ({
      name: t.name,
      execution: parseInt(t.execution),
      period: parseInt(t.period),
    }));

    // Validate
    if (taskData.some((t) => t.execution <= 0 || t.period <= 0)) {
      setError("Execution time and period must be positive integers.");
      setSchedule([]);
      return;
    }

    // Calculate hyperperiod
    let hp = taskData[0].period;
    for (let i = 1; i < taskData.length; i++) {
      hp = lcm(hp, taskData[i].period);
    }

    if (hp > 500) {
      setError("Hyperperiod is too large (>500). Try smaller periods.");
      setSchedule([]);
      return;
    }

    // Generate schedule
    const sched = [];
    for (let time = 0; time < hp; time++) {
      for (let task of taskData) {
        if (time % task.period === 0) {
          for (let e = 0; e < task.execution; e++) {
            sched.push({
              task: task.name,
              time,
              execution: e + 1,
              totalExecution: task.execution,
            });
          }
        }
      }
    }

    setHyperperiod(hp);
    setSchedule(sched);
  };

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = () => {
    setTasks([{ name: "", execution: "", period: "" }]);
    setSchedule([]);
    setError("");
  };

  const cpuUtil = schedule.length > 0 ? ((schedule.length / hyperperiod) * 100).toFixed(1) : 0;

  const tabs = [
    { key: "theory", label: "📖 Theory" },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">
        Basic Static Scheduling Simulator
      </h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Learn offline periodic task scheduling for hard real-time systems. Understand hyperperiod,
        feasibility, and how to generate static schedules before runtime.
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
          <Section title="What is Basic Static Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">Basic Static Scheduling</span> is an
              offline scheduling algorithm for periodic real-time tasks. All scheduling decisions
              are made <span className="font-semibold">before runtime</span>, based on task periods
              and execution times. The schedule is then repeated cyclically.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Unlike dynamic scheduling, there is no runtime overhead—the processor simply follows
              the pre-computed schedule. This makes it ideal for hard real-time systems where
              predictability is critical (aerospace, medical, automotive).
            </p>
          </Section>

          <Section title="Key Concepts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⏱️ Execution Time (C)</p>
                <p className="text-gray-700 text-sm">
                  How long a single instance of the task takes to run on the processor.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🔄 Period (T)</p>
                <p className="text-gray-700 text-sm">
                  The time interval between successive activations (instances) of the task.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">📊 Hyperperiod (H)</p>
                <p className="text-gray-700 text-sm">
                  The Least Common Multiple (LCM) of all task periods. The schedule repeats every
                  H time units.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🎯 Feasibility</p>
                <p className="text-gray-700 text-sm">
                  A task set is feasible if total CPU time needed ≤ available CPU time (≤100%).
                </p>
              </div>
            </div>
          </Section>

          <Section title="How It Works — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "Identify all periodic tasks.",
                  d: "Collect each task's name, execution time (C), and period (T).",
                },
                {
                  n: 2,
                  t: "Calculate the hyperperiod.",
                  d: "H = LCM(T₁, T₂, ..., Tₙ) — the schedule repeats after H time units.",
                },
                {
                  n: 3,
                  t: "Check feasibility.",
                  d: "Sum of (execution / period) for all tasks must be ≤ 1.0 (100% CPU).",
                },
                {
                  n: 4,
                  t: "Generate the offline schedule.",
                  d: "For each time unit from 0 to H−1, schedule task instances that are due.",
                },
                {
                  n: 5,
                  t: "Execute cyclically.",
                  d: "The processor follows the pre-computed schedule, repeating every H time units.",
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

          <Section title="Feasibility Analysis">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="font-bold text-blue-700 mb-2">📐 Feasibility Condition</p>
              <p className="text-gray-700 text-sm mb-2">
                For a task set to be schedulable, the utilization must not exceed 100%:
              </p>
              <p className="font-mono text-center bg-white p-3 rounded border border-blue-300 text-sm">
                U = Σ(C<sub>i</sub> / T<sub>i</sub>) ≤ 1.0
              </p>
              <p className="text-gray-700 text-sm mt-2">
                If U &gt; 1.0, the system is <span className="font-bold">infeasible</span> — cannot schedule all tasks!
              </p>
            </div>
          </Section>

          <Section title="Advantages & Disadvantages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-3">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Zero runtime overhead — schedule is pre-computed</li>
                  <li>Fully predictable — no surprises at runtime</li>
                  <li>Optimal for hard real-time systems</li>
                  <li>Simple to verify task deadlines before deployment</li>
                  <li>No priority inversions or synchronization issues</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-3">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Inflexible — schedule is fixed, hard to add new tasks</li>
                  <li>Hyperperiod can explode (LCM of many primes is product)</li>
                  <li>Wastes memory storing large schedules</li>
                  <li>Not suitable for systems with dynamic workloads</li>
                  <li>Poor scalability to many tasks</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="When is Static Scheduling Used?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  icon: "🛰️",
                  title: "Aerospace & Avionics",
                  desc: "Aircraft and satellite control systems with hard real-time constraints.",
                },
                {
                  icon: "🏭",
                  title: "Industrial Control",
                  desc: "Manufacturing and process control where timing is critical.",
                },
                {
                  icon: "🏥",
                  title: "Medical Devices",
                  desc: "Pacemakers, ventilators, and surgical robots requiring guarantee.",
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

          <Section title="Quick Verification Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ All task names are unique and non-empty.",
                "✅ All execution times and periods are positive integers.",
                "✅ The hyperperiod is calculated correctly as LCM of all periods.",
                "✅ Feasibility check: total utilization ≤ 100%.",
                "✅ At each time unit, only tasks due at that time are scheduled.",
                "✅ Every instance of every task appears exactly once in schedule.",
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
            <p className="font-bold mb-1">💡 7 Complete Examples (All Critical Cases)</p>
            <p className="mb-2">
              <strong>Ex 1-4:</strong> Basic, infeasible systems, LCM explosion, CPU overload.
            </p>
            <p>
              <strong>Ex 5-7:</strong> Nested periods (ideal), single task, critically feasible systems (100% CPU).
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
              Enter your own tasks with execution times and periods. The simulator calculates hyperperiod,
              checks feasibility (CPU usage %), and generates the complete static schedule.
            </p>
          </div>

          {/* Input Form */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg border border-gray-300 p-6 mb-4">
              <h3 className="font-bold text-gray-800 mb-4">Define Your Tasks</h3>

              {/* Task table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-300">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">
                        Task Name
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">
                        Execution Time (C)
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">
                        Period (T)
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={task.name}
                            onChange={(e) => handleChange(idx, "name", e.target.value)}
                            placeholder={`Task ${idx + 1}`}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={task.execution}
                            onChange={(e) => handleChange(idx, "execution", e.target.value)}
                            placeholder="2"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={task.period}
                            onChange={(e) => handleChange(idx, "period", e.target.value)}
                            placeholder="4"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="1"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => deleteTask(idx)}
                            disabled={tasks.length === 1}
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
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold text-sm transition"
                >
                  + Add Task
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
              onClick={simulateSchedule}
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
            {schedule.length > 0 && (
              <div className="space-y-4">
                {/* Stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                    <p className="text-gray-600 text-sm">Hyperperiod</p>
                    <p className="text-2xl font-bold text-indigo-600">{hyperperiod}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                    <p className="text-gray-600 text-sm">Total Slots</p>
                    <p className="text-2xl font-bold text-indigo-600">{schedule.length}</p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${cpuUtil > 100 ? "bg-red-50 border border-red-200" : "bg-indigo-50 border border-indigo-200"}`}>
                    <p className="text-gray-600 text-sm">CPU Usage</p>
                    <p className={`text-2xl font-bold ${cpuUtil > 100 ? "text-red-600" : "text-indigo-600"}`}>
                      {cpuUtil}%
                    </p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                    <p className="text-gray-600 text-sm">Tasks</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {[...new Set(schedule.map((s) => s.task))].length}
                    </p>
                  </div>
                </div>

                {cpuUtil > 100 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 font-bold">❌ System is INFEASIBLE!</p>
                    <p className="text-red-600 text-sm mt-1">
                      CPU usage exceeds 100%. Not enough processor capacity to schedule all tasks.
                      Reduce execution times, increase periods, or add processors.
                    </p>
                  </div>
                )}

                {/* Timeline chart */}
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <TimelineVisualization schedule={schedule} hyperperiod={hyperperiod} />
                </div>

                {/* Schedule table */}
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <ScheduleTable schedule={schedule} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BasicStatic;