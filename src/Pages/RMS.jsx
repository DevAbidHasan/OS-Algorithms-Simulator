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
    title: "Example 1 — Simple Three-Task System",
    tasks: [
      { name: "Task A", execution: 2, period: 4 },
      { name: "Task B", execution: 1, period: 6 },
      { name: "Task C", execution: 2, period: 12 },
    ],
    explanation: [
      "Task A: C=2, T=4 → Priority 1 (shortest period, highest priority)",
      "Task B: C=1, T=6 → Priority 2",
      "Task C: C=2, T=12 → Priority 3 (longest period, lowest priority)",
      "RMS assigns priority inversely to period: shorter period = higher priority.",
      "Hyperperiod = LCM(4, 6, 12) = 12 time units.",
      "At each time, the highest priority ready task executes (preemptive).",
    ],
  },
  {
    title: "Example 2 — High-Frequency vs Low-Frequency Tasks",
    tasks: [
      { name: "Sensor", execution: 1, period: 2 },
      { name: "Process", execution: 2, period: 4 },
      { name: "Log", execution: 1, period: 8 },
    ],
    explanation: [
      "Sensor: C=1, T=2 → Priority 1 (highest, runs frequently)",
      "Process: C=2, T=4 → Priority 2",
      "Log: C=1, T=8 → Priority 3 (lowest, runs infrequently)",
      "The high-frequency Sensor task gets priority over less frequent tasks.",
      "Hyperperiod = LCM(2, 4, 8) = 8 time units.",
      "This ensures critical, frequent tasks are never blocked by low-priority tasks.",
    ],
  },
  {
    title: "Example 3 — Preemption in Action",
    tasks: [
      { name: "High", execution: 1, period: 2 },
      { name: "Low", execution: 3, period: 6 },
    ],
    explanation: [
      "High: C=1, T=2 → Priority 1 (frequent, high-priority)",
      "Low: C=3, T=6 → Priority 2 (infrequent, low-priority)",
      "At time 0: Both released. High has higher priority, executes first.",
      "At time 1: High completes. Low starts executing.",
      "At time 2: High released again! Preempts Low (even mid-execution).",
      "Low resumes after High finishes. Preemption ensures deadline safety.",
      "Hyperperiod = LCM(2, 6) = 6 time units.",
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

  const uniqueTasks = [...new Set(schedule.filter((s) => s !== "-"))];
  const colors = [
    "#4f46e5", // indigo
    "#06b6d4", // cyan
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
  ];

  return (
    <div className="mt-4 space-y-4">
      <p className="font-semibold text-gray-700">Task Execution Timeline:</p>

      {/* Timeline visualization */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-2">
          {schedule.map((task, idx) => {
            const taskIndex = uniqueTasks.indexOf(task);
            const isIdle = task === "-";
            return (
              <div
                key={idx}
                className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white border border-gray-300"
                style={{
                  backgroundColor: isIdle ? "#d1d5db" : colors[taskIndex % colors.length],
                }}
                title={`Time ${idx}: ${task}`}
              >
                {isIdle ? "—" : task[0]}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Each block = 1 time unit. Colored = task execution, Gray = idle.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <p className="text-gray-600">Total Time Units</p>
          <p className="font-bold text-blue-600">{schedule.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <p className="text-gray-600">Busy Slots</p>
          <p className="font-bold text-green-600">
            {schedule.filter((t) => t !== "-").length}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded p-2">
          <p className="text-gray-600">CPU Usage</p>
          <p className="font-bold text-amber-600">
            {((schedule.filter((t) => t !== "-").length / schedule.length) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-3 text-sm">
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

// ── Detailed Schedule Table ────────────────────────────────────────────────
function ScheduleTable({ schedule, tasks }) {
  if (schedule.length === 0) return null;

  // Reconstruct priority and remaining time info
  const sortedTasks = [...tasks].sort((a, b) => a.period - b.period);
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  let hyperperiod = sortedTasks[0].period;
  for (let i = 1; i < sortedTasks.length; i++) {
    hyperperiod = lcm(hyperperiod, sortedTasks[i].period);
  }

  const scheduleDetails = [];
  const remaining = sortedTasks.map((t) => 0);

  for (let time = 0; time < hyperperiod; time++) {
    // Release tasks
    sortedTasks.forEach((t, idx) => {
      if (time % t.period === 0) remaining[idx] = t.execution;
    });

    // Find highest priority ready task
    const readyTasks = remaining
      .map((rem, idx) => ({ rem, idx }))
      .filter((t) => t.rem > 0);

    if (readyTasks.length > 0) {
      const executeIdx = readyTasks[0].idx;
      const executeTask = sortedTasks[executeIdx];
      remaining[executeIdx] -= 1;

      scheduleDetails.push({
        time,
        task: executeTask.name,
        priority: executeIdx + 1,
        period: executeTask.period,
        remaining: remaining[executeIdx],
      });
    } else {
      scheduleDetails.push({
        time,
        task: "—",
        priority: "—",
        period: "—",
        remaining: "—",
      });
    }
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2 text-gray-700">Execution Timeline (Detailed):</p>
      <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="px-4 py-2">Time Unit</th>
            <th className="px-4 py-2">Task</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Period</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {scheduleDetails.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 font-semibold text-gray-700">{item.time}</td>
              <td className="px-4 py-2 font-semibold text-indigo-700">{item.task}</td>
              <td className="px-4 py-2 text-gray-600">
                {item.priority === "—" ? "—" : `P${item.priority}`}
              </td>
              <td className="px-4 py-2 text-gray-600">{item.period}</td>
              <td className="px-4 py-2 text-gray-600">
                {item.task === "—" ? "Idle" : `${item.remaining} units remaining`}
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
  // Calculate hyperperiod
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  let hyperperiod = ex.tasks[0].period;
  for (let i = 1; i < ex.tasks.length; i++) {
    hyperperiod = lcm(hyperperiod, ex.tasks[i].period);
  }

  // Sort by period (for priority assignment)
  const sortedTasks = [...ex.tasks].sort((a, b) => a.period - b.period);

  // Generate schedule
  const schedule = [];
  const remaining = sortedTasks.map((t) => 0);

  for (let time = 0; time < hyperperiod; time++) {
    sortedTasks.forEach((t, idx) => {
      if (time % t.period === 0) remaining[idx] = t.execution;
    });

    const readyTasks = remaining
      .map((rem, idx) => ({ rem, idx }))
      .filter((t) => t.rem > 0);

    if (readyTasks.length > 0) {
      const executeIdx = readyTasks[0].idx;
      schedule.push(sortedTasks[executeIdx].name);
      remaining[executeIdx] -= 1;
    } else {
      schedule.push("-");
    }
  }

  const busySlots = schedule.filter((t) => t !== "-").length;
  const cpuUtil = ((busySlots / hyperperiod) * 100).toFixed(1);

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>

      {/* Task badges with priority */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sortedTasks.map((t, i) => (
          <div key={i} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-semibold text-sm">
            <p className="font-bold">P{i + 1} {t.name}</p>
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
      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Hyperperiod</p>
          <p className="font-bold text-indigo-600">{hyperperiod}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Busy Slots</p>
          <p className="font-bold text-indigo-600">{busySlots}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">CPU Usage</p>
          <p className="font-bold text-indigo-600">{cpuUtil}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Idle Slots</p>
          <p className="font-bold text-indigo-600">{hyperperiod - busySlots}</p>
        </div>
      </div>

      {/* Timeline visualization */}
      <TimelineVisualization schedule={schedule} hyperperiod={hyperperiod} />

      {/* Schedule table */}
      <ScheduleTable schedule={schedule} tasks={ex.tasks} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
const RMS = () => {
  const [tasks, setTasks] = useState([{ name: "", execution: "", period: "" }]);
  const [schedule, setSchedule] = useState([]);
  const [hyperperiod, setHyperperiod] = useState(0);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  // ── Utility functions ──────────────────────────────────────────────────
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
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

  // ── Simulate RMS scheduling ────────────────────────────────────────────
  const simulateRMS = () => {
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

    // Sort by period (higher priority = shorter period)
    const sortedTasks = [...taskData].sort((a, b) => a.period - b.period);

    // Calculate hyperperiod
    let hp = sortedTasks[0].period;
    for (let i = 1; i < sortedTasks.length; i++) {
      hp = lcm(hp, sortedTasks[i].period);
    }

    if (hp > 500) {
      setError("Hyperperiod is too large (>500). Try smaller periods.");
      setSchedule([]);
      return;
    }

    // Generate RMS schedule (preemptive)
    const sched = [];
    const remaining = sortedTasks.map((t) => 0);

    for (let time = 0; time < hp; time++) {
      // Release tasks at start of period
      sortedTasks.forEach((t, idx) => {
        if (time % t.period === 0) remaining[idx] = t.execution;
      });

      // Pick highest priority ready task
      const readyTasks = remaining
        .map((rem, idx) => ({ rem, idx }))
        .filter((t) => t.rem > 0);

      if (readyTasks.length > 0) {
        const executeIdx = readyTasks[0].idx;
        sched.push(sortedTasks[executeIdx].name);
        remaining[executeIdx] -= 1;
      } else {
        sched.push("-");
      }
    }

    setHyperperiod(hp);
    setSchedule(sched);
  };

  // ── Load example ───────────────────────────────────────────────────────
  const loadExample = (exampleIndex) => {
    const ex = EXAMPLES[exampleIndex];
    setTasks(JSON.parse(JSON.stringify(ex.tasks)));
    setSchedule([]);
    setError("");
  };

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = () => {
    setTasks([{ name: "", execution: "", period: "" }]);
    setSchedule([]);
    setError("");
  };

  const busySlots = schedule.filter((t) => t !== "-").length;
  const cpuUtil = schedule.length > 0 ? ((busySlots / schedule.length) * 100).toFixed(1) : 0;

  const tabs = [
    { key: "theory", label: "📖 Theory" },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">
        Rate Monotonic Scheduling (RMS)
      </h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        A fixed-priority scheduling algorithm where task priority is inversely proportional to its
        period. Learn why shorter periods get higher priority and how this guarantees deadline safety.
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
          <Section title="What is Rate Monotonic Scheduling (RMS)?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">RMS (Rate Monotonic Scheduling)</span> is
              a <span className="font-semibold">fixed-priority scheduling algorithm</span> for
              periodic real-time tasks. It assigns task priority based on their period: tasks with{" "}
              <span className="font-bold">shorter periods get higher priority</span>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              RMS is one of the most widely used scheduling algorithms in real-time systems. It's
              optimal for certain task sets and offers strong deadline guarantees. The key insight
              is that <span className="font-semibold">frequent tasks are more urgent</span> and
              deserve higher priority.
            </p>
          </Section>

          <Section title="Key Concepts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⏱️ Execution Time (C)</p>
                <p className="text-gray-700 text-sm">
                  Time needed for one job instance to run to completion.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🔄 Period (T) = Deadline</p>
                <p className="text-gray-700 text-sm">
                  Time between successive job releases. Also the relative deadline.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🎯 Priority Assignment</p>
                <p className="text-gray-700 text-sm">
                  Priority ∝ 1/Period. Shorter period = Higher priority (P1, P2, P3, ...).
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🔄 Preemptive</p>
                <p className="text-gray-700 text-sm">
                  A higher-priority task can interrupt (preempt) a lower-priority task.
                </p>
              </div>
            </div>
          </Section>

          <Section title="The RMS Algorithm — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "Sort tasks by period in ascending order.",
                  d: "Shortest period → Highest priority (P1). Longest period → Lowest priority.",
                },
                {
                  n: 2,
                  t: "At each time unit, release tasks whose period expires.",
                  d: "When time % period == 0, release a new job instance of that task.",
                },
                {
                  n: 3,
                  t: "Build a ready queue of all unfinished jobs.",
                  d: "Include all jobs that have been released but not yet completed.",
                },
                {
                  n: 4,
                  t: "Execute the highest-priority ready task.",
                  d: "Run that task for one time unit, then decrement its remaining execution.",
                },
                {
                  n: 5,
                  t: "Handle preemption.",
                  d: "If a higher-priority task is released, preempt the current task.",
                },
                {
                  n: 6,
                  t: "Repeat for the hyperperiod.",
                  d: "Continue until all jobs in the hyperperiod complete.",
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

          <Section title="Key Formulas & Bounds">
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-indigo-700 mb-2">Priority Assignment Rule</p>
                <p className="text-sm text-gray-600">
                  Priority(i) ∝ 1 / Period(i)
                  <br />
                  Shorter period → Higher priority (P1 is highest)
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-yellow-700 mb-2">RMS Utilization Bound</p>
                <p className="text-sm text-gray-600">
                  For n periodic tasks: U = Σ(Ci / Ti) ≤ n(2^(1/n) - 1)
                  <br />
                  If utilization &lt; bound, all deadlines are guaranteed to be met.
                </p>
              </div>
            </div>
          </Section>

          <Section title="RMS vs Other Scheduling Algorithms">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Priority Rule</th>
                    <th className="px-4 py-2">Decision Time</th>
                    <th className="px-4 py-2">Optimality</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "RMS (Rate Monotonic)",
                      "Period (fixed)",
                      "Offline",
                      "Optimal for U ≤ 69%",
                    ],
                    [
                      "EDF (Earliest Deadline)",
                      "Deadline (dynamic)",
                      "At runtime",
                      "Optimal (always)",
                    ],
                    [
                      "Static Scheduling",
                      "Pre-computed offline",
                      "Offline",
                      "Optimal if feasible",
                    ],
                    [
                      "FCFS (First Come First Served)",
                      "Arrival order",
                      "At runtime",
                      "Not optimal",
                    ],
                  ].map(([alg, rule, time, optimal], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          alg === "RMS (Rate Monotonic)" ? "text-indigo-600" : "text-gray-700"
                        }`}
                      >
                        {alg}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{rule}</td>
                      <td className="px-4 py-2 text-gray-600">{time}</td>
                      <td className="px-4 py-2 text-gray-600">{optimal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Advantages & Disadvantages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-3">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Simple priority assignment rule (based on period)</li>
                  <li>Optimal for many practical task sets</li>
                  <li>Deadline guarantees if utilization is below bound</li>
                  <li>Proven algorithm, widely used in industry</li>
                  <li>Low scheduling overhead (fixed priorities)</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-3">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Not optimal for all task sets (unlike EDF)</li>
                  <li>Fixed priorities may be inefficient in some cases</li>
                  <li>Requires knowing periods in advance</li>
                  <li>Utilization bound is conservative (~69%)</li>
                  <li>Can suffer from priority inversion</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="When is RMS Used?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  icon: "🚗",
                  title: "Automotive Systems",
                  desc: "Engine control, ABS, powertrain where periodic sensing is critical.",
                },
                {
                  icon: "⚙️",
                  title: "Industrial Control",
                  desc: "Process monitoring, factory automation with fixed periodicities.",
                },
                {
                  icon: "🛡️",
                  title: "Embedded Systems",
                  desc: "IoT devices, microcontrollers with predictable workloads.",
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
                "✅ Tasks are sorted by period (ascending). Shortest = P1 (highest).",
                "✅ At each time unit, check for new job releases (time % period == 0).",
                "✅ Identify all ready (released but unfinished) jobs.",
                "✅ Execute the highest-priority ready job for 1 time unit.",
                "✅ If a higher-priority job is released, preempt the current job.",
                "✅ Lower-priority jobs never run while higher-priority jobs are ready.",
                "✅ All jobs complete within the hyperperiod without missing deadlines.",
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
              Each example shows the tasks with assigned priorities (P1, P2, P3...), a step-by-step
              explanation of the RMS logic, task statistics, an execution timeline visualization,
              and a detailed schedule table. Pay attention to how preemption works when high-priority
              tasks are released.
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
              Enter your own tasks with execution times and periods. The simulator will assign
              priorities based on period (shorter period = higher priority) and generate the RMS
              schedule showing preemptions and deadline safety.
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
              onClick={simulateRMS}
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
                    <p className="text-gray-600 text-sm">Busy Slots</p>
                    <p className="text-2xl font-bold text-indigo-600">{busySlots}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                    <p className="text-gray-600 text-sm">CPU Usage</p>
                    <p className="text-2xl font-bold text-indigo-600">{cpuUtil}%</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                    <p className="text-gray-600 text-sm">Tasks</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {[...new Set(schedule.filter((s) => s !== "-"))].length}
                    </p>
                  </div>
                </div>

                {/* Timeline chart */}
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <TimelineVisualization schedule={schedule} hyperperiod={hyperperiod} />
                </div>

                {/* Schedule table */}
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <ScheduleTable schedule={schedule} tasks={tasks} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RMS;