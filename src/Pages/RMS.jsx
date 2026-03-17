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
    title: "Example 1 — Simple Three-Task System (Basic RMS Concept)",
    tasks: [
      { name: "Task A", execution: 2, period: 4 },
      { name: "Task B", execution: 1, period: 6 },
      { name: "Task C", execution: 2, period: 12 },
    ],
    explanation: [
      "Priority assignment by RMS rule (Period-based):",
      "  Task A: T=4 → P1 (shortest period, highest priority)",
      "  Task B: T=6 → P2 (medium period)",
      "  Task C: T=12 → P3 (longest period, lowest priority)",
      "RMS principle: shorter period = more frequent = higher priority.",
      "Utilization: U = 2/4 + 1/6 + 2/12 = 0.5 + 0.167 + 0.167 = 83.3%",
      "RMS bound for n=3: 3(2^(1/3) - 1) ≈ 77.9%",
      "Since 83.3% > 77.9%, RMS bound is VIOLATED, but system might still be feasible.",
      "Hyperperiod = LCM(4, 6, 12) = 12 time units.",
      "Key: Task A's high frequency ensures it doesn't wait for C.",
    ],
  },
  {
    title: "Example 2 — High-Frequency vs Low-Frequency Tasks (Sensor/Actuator)",
    tasks: [
      { name: "Sensor", execution: 1, period: 2 },
      { name: "Process", execution: 2, period: 4 },
      { name: "Log", execution: 1, period: 8 },
    ],
    explanation: [
      "Real-world scenario: Data acquisition system with mixed frequencies.",
      "Priority assignment (by period, ascending order):",
      "  Sensor: T=2 → P1 (high-frequency sampling, critical)",
      "  Process: T=4 → P2 (medium-frequency processing)",
      "  Log: T=8 → P3 (low-frequency logging, least critical)",
      "Utilization: U = 1/2 + 2/4 + 1/8 = 0.5 + 0.5 + 0.125 = 112.5%",
      "Since 112.5% > 100%, CPU is OVERLOADED. System is INFEASIBLE!",
      "Not enough processor capacity to handle all tasks.",
      "Hyperperiod = LCM(2, 4, 8) = 8 time units (but tasks won't all complete).",
      "Key: High-frequency critical tasks protected by RMS priority, but system needs more CPU.",
    ],
  },
  {
    title: "Example 3 — Preemption Demonstration (High Priority Interrupts Low)",
    tasks: [
      { name: "High", execution: 1, period: 2 },
      { name: "Low", execution: 3, period: 6 },
    ],
    explanation: [
      "Demonstrates RMS preemption: how high-priority interrupts low-priority mid-execution.",
      "Priority assignment:",
      "  High: T=2 → P1 (runs every 2 units, high priority)",
      "  Low: T=6 → P2 (runs every 6 units, low priority)",
      "Utilization: U = 1/2 + 3/6 = 0.5 + 0.5 = 100% (fully utilized)",
      "RMS bound for n=2: 2(√2 - 1) ≈ 82.8%",
      "Since 100% > 82.8%, bound violated, but check if actually feasible.",
      "Timeline breakdown:",
      "  t=0: Both released. High (P1) runs. 0→1.",
      "  t=1: High finishes. Low (P2) starts. 1→2 (1 of 3 units).",
      "  t=2: High released again! PREEMPTION occurs.",
      "  Low is PAUSED. High runs. 2→3.",
      "  t=3: High finishes. Low resumes. 3→5 (finishes remaining 2 units).",
      "  t=4: High released again. But Low still running. Wait for High's turn.",
      "  t=5: High released, waiting. Low finishes at t=5. High runs. 5→6.",
      "  t=6: Both released. High runs. 6→7. Low released at t=6.",
      "  t=7: High finishes. Low runs. 7→9 (2 units). Mid-execution at t=8.",
      "  t=8: High released. PREEMPTS Low again. High runs. 8→9.",
      "  t=9: High finishes. Low resumes/finishes. 9→10.",
      "Hyperperiod = LCM(2, 6) = 6 time units.",
      "Preemption ensures High meets its 2-unit deadline despite Low's longer execution.",
      "Key: RMS preemption guarantee ensures deadline safety.",
    ],
  },
  {
    title: "Example 4 — Optimal RMS Case (All Deadlines Guaranteed)",
    tasks: [
      { name: "T1", execution: 1, period: 3 },
      { name: "T2", execution: 2, period: 6 },
    ],
    explanation: [
      "Carefully designed task set that RMS handles optimally with guaranteed deadlines.",
      "Priority assignment:",
      "  T1: T=3 → P1 (short period, high priority)",
      "  T2: T=6 → P2 (long period, low priority)",
      "Utilization: U = 1/3 + 2/6 = 0.333 + 0.333 = 66.7%",
      "RMS utilization bound for n=2: 2(√2 - 1) ≈ 82.8%",
      "Since 66.7% < 82.8%, RMS GUARANTEES all deadlines are met!",
      "This is a sufficient condition for deadline safety.",
      "Hyperperiod = LCM(3, 6) = 6 time units.",
      "Schedule:",
      "  t=0: T1, T2 both released. T1 (P1) runs. 0→1.",
      "  t=1: T1 finishes. T2 runs. 1→3 (2 units).",
      "  t=2: (T2 still running, 1 unit left)",
      "  t=3: T1 released again! PREEMPTS T2 (only 1 unit left).",
      "  T1 runs. 3→4. T2 resumes. 4→5 (finishes remaining 1 unit).",
      "  t=4: (T2 resuming from preemption at t=3)",
      "  t=5: T2 finishes. Both tasks complete by deadlines.",
      "  t=6: Period repeats.",
      "All tasks complete by their deadlines (end of period = deadline).",
      "Key: RMS utilization bound provides mathematical guarantee of feasibility.",
    ],
  },
  {
    title: "Example 5 — Multiple Periods Equal (Tie-Breaking Strategy)",
    tasks: [
      { name: "ProcessA", execution: 1, period: 4 },
      { name: "ProcessB", execution: 2, period: 4 },
      { name: "ProcessC", execution: 1, period: 8 },
    ],
    explanation: [
      "What happens when multiple tasks have the SAME period?",
      "Priority assignment (by period, then by order):",
      "  ProcessA: T=4 → P1 (shorter period, higher priority)",
      "  ProcessB: T=4 → P1 (same period as A, tied)",
      "  ProcessC: T=8 → P2 (longer period, lower priority)",
      "When periods equal, use tie-breaking: alphabetical order or input order.",
      "Utilization: U = 1/4 + 2/4 + 1/8 = 0.25 + 0.5 + 0.125 = 87.5%",
      "RMS bound for n=3: 3(2^(1/3) - 1) ≈ 77.9%",
      "Since 87.5% > 77.9%, bound violated, but feasibility unknown.",
      "Hyperperiod = LCM(4, 4, 8) = 8 time units.",
      "Timeline:",
      "  t=0: All released. ProcessA (earliest P1) runs. 0→1.",
      "  t=1: ProcessA finishes. ProcessB runs. 1→3 (2 units).",
      "  t=2: (ProcessB still running, 1 unit left)",
      "  t=3: ProcessB finishes. ProcessC runs. 3→4.",
      "  t=4: ProcessA, ProcessB released again. ProcessA runs (tie-break). 4→5.",
      "  t=5: ProcessA finishes. ProcessB runs. 5→7 (2 units).",
      "  t=6: (ProcessB still running, 1 unit left)",
      "  t=7: ProcessB finishes. ProcessC already released at t=4, waiting.",
      "  ProcessC continues. 7→8.",
      "  t=8: End of hyperperiod.",
      "Key: Tie-breaking strategy is crucial when periods are equal.",
    ],
  },
  {
    title: "Example 6 — RMS Bound Violated But Still Feasible",
    tasks: [
      { name: "Heavy", execution: 2, period: 3 },
      { name: "Light", execution: 1, period: 3 },
    ],
    explanation: [
      "Case where RMS utilization bound is VIOLATED, but system still works.",
      "Priority assignment (both same period, so tie-break):",
      "  Heavy: T=3 → P1 (first in order)",
      "  Light: T=3 → P1 (second, same period as Heavy)",
      "Utilization: U = 2/3 + 1/3 = 3/3 = 100% (FULL CPU!)",
      "RMS bound for n=2: 2(√2 - 1) ≈ 82.8%",
      "Since 100% > 82.8%, RMS bound is VIOLATED.",
      "BUT: The system might still be feasible (bound is sufficient, not necessary).",
      "Hyperperiod = LCM(3, 3) = 3 time units.",
      "Schedule:",
      "  t=0: Both released. Heavy (P1, 2 units) runs. 0→2.",
      "  t=1: (Heavy still running, 1 unit left)",
      "  t=2: Heavy finishes. Light runs. 2→3 (1 unit).",
      "  t=3: Both complete by deadline (period = 3).",
      "  Both released again at t=3. Cycle repeats.",
      "All tasks complete within their 3-unit deadlines. System IS feasible!",
      "Key: RMS utilization bound is SUFFICIENT (guaranteed) but not NECESSARY.",
      "Below bound = definitely feasible. Above bound = must check actual schedule.",
    ],
  },
  {
    title: "Example 7 — RMS Failure Case (Misses Deadline)",
    tasks: [
      { name: "Task1", execution: 2, period: 2 },
      { name: "Task2", execution: 2, period: 3 },
    ],
    explanation: [
      "Case where RMS FAILS to meet deadlines despite being 'optimal'.",
      "Priority assignment:",
      "  Task1: T=2 → P1 (short period, high priority)",
      "  Task2: T=3 → P2 (long period, low priority)",
      "Utilization: U = 2/2 + 2/3 = 1.0 + 0.667 = 166.7%",
      "Since 166.7% > 100%, CPU is OVERLOADED. System INFEASIBLE.",
      "Not enough processor time to complete all tasks.",
      "Hyperperiod = LCM(2, 3) = 6 time units.",
      "Timeline (showing deadline misses):",
      "  t=0: Both released. Task1 (P1) runs. 0→2 (finishes by deadline at t=2).",
      "  t=2: Task1 released again (new period). Task2 (P2) waiting.",
      "  Task1 has priority. Task1 runs. 2→4 (completes at t=4, before t=4 deadline).",
      "  t=3: Task2 should have finished by now (deadline = period = 3)!",
      "  At t=3, Task2 has not run at all. DEADLINE MISSED!",
      "  t=4: Task1 finishes. Task2 finally runs. 4→6 (2 units).",
      "  t=6: Task2 finishes, but deadline was at t=3. FAILURE!",
      "Again at t=6, both released. Task1 runs. t=6→8, but cycle repeats.",
      "System cannot handle the workload. Multiple deadline misses.",
      "Key: When U > 100%, system is mathematically infeasible.",
      "RMS cannot save an infeasible system. Need more CPU or reduce work.",
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
    sortedTasks.forEach((t, idx) => {
      if (time % t.period === 0) remaining[idx] = t.execution;
    });

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
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  let hyperperiod = ex.tasks[0].period;
  for (let i = 1; i < ex.tasks.length; i++) {
    hyperperiod = lcm(hyperperiod, ex.tasks[i].period);
  }

  const sortedTasks = [...ex.tasks].sort((a, b) => a.period - b.period);

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
  const utilization = sortedTasks.reduce((sum, t) => sum + t.execution / t.period, 0);

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
      <div className={`grid grid-cols-4 gap-2 mb-4 text-sm ${utilization > 1 ? "opacity-75" : ""}`}>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Hyperperiod</p>
          <p className="font-bold text-indigo-600">{hyperperiod}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 text-center">
          <p className="text-gray-600 text-xs">Busy Slots</p>
          <p className="font-bold text-indigo-600">{busySlots}</p>
        </div>
        <div className={`rounded p-2 text-center ${utilization > 1 ? "bg-red-50 border border-red-200" : "bg-white border border-gray-200"}`}>
          <p className="text-gray-600 text-xs">CPU Usage</p>
          <p className={`font-bold ${utilization > 1 ? "text-red-600" : "text-indigo-600"}`}>{cpuUtil}%</p>
        </div>
        <div className={`rounded p-2 text-center ${utilization > 1 ? "bg-red-50 border border-red-200" : "bg-white border border-gray-200"}`}>
          <p className="text-gray-600 text-xs">Utilization</p>
          <p className={`font-bold ${utilization > 1 ? "text-red-600" : "text-indigo-600"}`}>{(utilization * 100).toFixed(1)}%</p>
        </div>
      </div>

      {utilization > 1 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          <p className="font-bold">❌ System OVERLOADED or INFEASIBLE!</p>
          <p>CPU usage exceeds 100%. Not all tasks can complete in time.</p>
        </div>
      )}

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

  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  const addTask = () => {
    setTasks([...tasks, { name: "", execution: "", period: "" }]);
  };

  const deleteTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const simulateRMS = () => {
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

    const taskData = tasks.map((t) => ({
      name: t.name,
      execution: parseInt(t.execution),
      period: parseInt(t.period),
    }));

    if (taskData.some((t) => t.execution <= 0 || t.period <= 0)) {
      setError("Execution time and period must be positive integers.");
      setSchedule([]);
      return;
    }

    const sortedTasks = [...taskData].sort((a, b) => a.period - b.period);

    let hp = sortedTasks[0].period;
    for (let i = 1; i < sortedTasks.length; i++) {
      hp = lcm(hp, sortedTasks[i].period);
    }

    if (hp > 500) {
      setError("Hyperperiod is too large (>500). Try smaller periods.");
      setSchedule([]);
      return;
    }

    const sched = [];
    const remaining = sortedTasks.map((t) => 0);

    for (let time = 0; time < hp; time++) {
      sortedTasks.forEach((t, idx) => {
        if (time % t.period === 0) remaining[idx] = t.execution;
      });

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
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">
        Rate Monotonic Scheduling (RMS)
      </h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        A fixed-priority scheduling algorithm where task priority is inversely proportional to its period.
        Learn why shorter periods get higher priority, preemption, and mathematical deadline guarantees.
      </p>

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
              <span className="font-bold text-indigo-600">RMS (Rate Monotonic Scheduling)</span> is a
              <span className="font-semibold"> fixed-priority scheduling algorithm</span> for periodic
              real-time tasks. It assigns priority based on period: tasks with <span className="font-bold">
              shorter periods get higher priority</span>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              RMS is one of the most widely used scheduling algorithms in real-time systems. The key insight
              is that <span className="font-semibold">frequent tasks are more urgent</span> and deserve
              higher priority. RMS is optimal for many task sets and provides mathematical deadline guarantees.
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
                  A higher-priority task can interrupt a lower-priority task mid-execution.
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

          <Section title="Key Formulas & Utilization Bound">
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
                  If U &lt; bound, all deadlines are GUARANTEED to be met (sufficient condition).
                  <br />
                  If U ≥ bound, system MIGHT still be feasible (need to check schedule).
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
                    ["RMS", "Period (fixed)", "Offline", "Optimal for U ≤ 69%"],
                    ["EDF", "Deadline (dynamic)", "Runtime", "Optimal (always)"],
                    ["Static Scheduling", "Pre-computed", "Offline", "Optimal if feasible"],
                    ["FCFS", "Arrival order", "Runtime", "Not optimal"],
                  ].map(([alg, rule, time, optimal], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "RMS" ? "text-indigo-600" : "text-gray-700"}`}>
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

          <Section title="Quick Verification Checklist">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              {[
                "✅ Tasks sorted by period (ascending). Shortest = P1 (highest).",
                "✅ At each time unit, check for new job releases (time % period == 0).",
                "✅ Identify all ready (released but unfinished) jobs.",
                "✅ Execute the highest-priority ready job for 1 time unit.",
                "✅ If a higher-priority job is released, preempt the current job.",
                "✅ Lower-priority jobs never run while higher-priority jobs are ready.",
                "✅ Calculate utilization: U = Σ(Ci / Ti). Check against RMS bound.",
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
            <p className="font-bold mb-1">💡 7 Complete Examples (All Critical RMS Cases)</p>
            <p className="mb-2">
              <strong>Ex 1-3:</strong> Basic RMS, high/low frequency mix, preemption in action.
            </p>
            <p className="mb-2">
              <strong>Ex 4-5:</strong> Optimal case (guaranteed deadlines), tie-breaking (equal periods).
            </p>
            <p>
              <strong>Ex 6-7:</strong> Bound violated but feasible, system overload/failure.
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
              Enter your own tasks with execution times and periods. The simulator will assign priorities
              based on period (shorter = higher) and generate the RMS schedule with preemptions, deadline safety,
              and utilization analysis.
            </p>
          </div>

          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg border border-gray-300 p-6 mb-4">
              <h3 className="font-bold text-gray-800 mb-4">Define Your Tasks</h3>

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

            <button
              onClick={simulateRMS}
              className="w-full bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-bold text-lg transition mb-6"
            >
              Simulate
            </button>

            {error && (
              <p className="text-red-600 font-semibold mb-4 bg-red-50 border border-red-200 p-3 rounded">
                {error}
              </p>
            )}

            {schedule.length > 0 && (
              <div className="space-y-4">
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

                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <TimelineVisualization schedule={schedule} hyperperiod={hyperperiod} />
                </div>

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