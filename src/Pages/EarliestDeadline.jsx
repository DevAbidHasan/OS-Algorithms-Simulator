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
    title: "Example 1 — Basic Three-Task System (Fundamental EDF Concept)",
    tasks: [
      { name: "Task A", execution: 2, period: 4 },
      { name: "Task B", execution: 1, period: 6 },
      { name: "Task C", execution: 2, period: 12 },
    ],
    explanation: [
      "Task A: C=2, T=4 → deadline at 4, 8, 12, 16, ...",
      "Task B: C=1, T=6 → deadline at 6, 12, 18, ...",
      "Task C: C=2, T=12 → deadline at 12, 24, ...",
      "EDF ALWAYS picks the job with the earliest (smallest) absolute deadline.",
      "Hyperperiod = LCM(4, 6, 12) = 12 time units.",
      "Key difference from RMS: EDF looks at actual deadlines, not task periods.",
      "At t=0: All released. Deadlines: A(4), B(6), C(12). Pick A (deadline 4).",
      "At t=2: A done. B has deadline 6, C has deadline 12. Pick B (deadline 6).",
      "At t=3: B done. C has deadline 12. Pick C.",
      "At t=5: C finishes. A re-released (deadline 8), B re-released (deadline 12).",
      "Schedule continues by always picking earliest deadline.",
      "Key: EDF is OPTIMAL — if any schedule meets deadlines, EDF will too!",
    ],
  },
  {
    title: "Example 2 — High-Frequency vs Low-Frequency (Deadline-Driven Priority)",
    tasks: [
      { name: "Fast", execution: 1, period: 2 },
      { name: "Slow", execution: 2, period: 5 },
    ],
    explanation: [
      "Fast: C=1, T=2 → deadlines at 2, 4, 6, 8, 10, 12, ...",
      "Slow: C=2, T=5 → deadlines at 5, 10, 15, ...",
      "Unlike RMS which gives fixed priority to Fast (shorter period),",
      "EDF dynamically chooses based on which job's deadline is sooner.",
      "Hyperperiod = LCM(2, 5) = 10 time units.",
      "Timeline:",
      "  t=0: Both released. Deadlines: Fast(2), Slow(5). Pick Fast (deadline 2).",
      "  t=1: Fast done. Slow deadline 5. Slow runs.",
      "  t=2: Fast re-released (deadline 4). Slow still running (deadline 5).",
      "  Since 4 < 5, EDF preempts Slow! Fast runs.",
      "  t=3: Fast done. Slow resumes (deadline 5).",
      "  t=4: Fast re-released (deadline 6). Slow still running (deadline 5).",
      "  Since 5 < 6, Slow continues (it's more urgent).",
      "  t=5: Slow finishes (met deadline at t=5 ✓). Fast runs.",
      "  t=6: Fast finishes (met deadline at t=6 ✓). Both released.",
      "Key: EDF automatically prioritizes whoever has sooner deadline, no fixed priority needed.",
    ],
  },
  {
    title: "Example 3 — Competing Deadlines (Tight Constraints)",
    tasks: [
      { name: "T1", execution: 2, period: 3 },
      { name: "T2", execution: 1, period: 4 },
    ],
    explanation: [
      "T1: C=2, T=3 → tight deadline every 3 units",
      "T2: C=1, T=4 → less tight, every 4 units",
      "Hyperperiod = LCM(3, 4) = 12 time units.",
      "Timeline:",
      "  t=0: Both released. Deadlines: T1(3), T2(4). Pick T1 (deadline 3 < 4).",
      "  t=1: T1 still running. T1(1 remaining), T2(deadline 4). Pick T1.",
      "  t=2: T1 finishes. T2 deadline 4. T2 runs.",
      "  t=3: T1 re-released (deadline 6). T2 still has deadline 4.",
      "  Since 4 < 6, T2 continues.",
      "  t=4: T2 finishes (met deadline ✓). T1 deadline 6, now T2 re-released (deadline 8).",
      "  Since 6 < 8, T1 runs.",
      "  t=5: T1 finishes (met deadline ✓). T2 deadline 8. T2 runs.",
      "  t=6: T1 re-released (deadline 9). T2 still deadline 8.",
      "  Since 8 < 9, T2 continues.",
      "  t=7: T2 finishes (met deadline ✓). T1 deadline 9. T1 runs.",
      "  t=8: T1 finishes (met deadline ✓). Both released.",
      "  t=9: T2 re-released. T1 deadline 12. T2 deadline 12. Tie! Use order.",
      "Key: EDF handles tight deadlines elegantly by always picking most urgent job.",
    ],
  },
  {
    title: "Example 4 — EDF Optimality (Meets All Deadlines)",
    tasks: [
      { name: "Critical", execution: 1, period: 2 },
      { name: "Normal", execution: 2, period: 5 },
    ],
    explanation: [
      "Critical: C=1, T=2 → deadlines at 2, 4, 6, 8, 10, ...",
      "Normal: C=2, T=5 → deadlines at 5, 10, ...",
      "Utilization: U = 1/2 + 2/5 = 0.5 + 0.4 = 0.9 = 90%",
      "Hyperperiod = LCM(2, 5) = 10 time units.",
      "This task set is feasible (90% ≤ 100%). EDF will schedule it optimally.",
      "Timeline:",
      "  t=0: Both released. Deadlines: Critical(2), Normal(5). Pick Critical.",
      "  t=1: Critical done. Normal deadline 5. Normal runs.",
      "  t=2: Critical re-released (deadline 4). Normal deadline 5.",
      "  4 < 5, so preempt Normal. Critical runs.",
      "  t=3: Critical done. Normal deadline 5 (1 unit left). Normal runs.",
      "  t=4: Critical re-released (deadline 6). Normal deadline 5.",
      "  5 < 6, so Normal continues (must meet deadline at t=5).",
      "  t=5: Normal finishes (deadline met ✓). Critical deadline 6. Critical runs.",
      "  t=6: Critical finishes (deadline met ✓). Both re-released.",
      "  t=7: Critical (deadline 8). Normal (deadline 10). Pick Critical.",
      "  t=8: Critical done (deadline met ✓). Normal runs.",
      "  t=9: Normal still running (1 unit left).",
      "  t=10: Normal finishes (deadline met ✓).",
      "ALL DEADLINES MET! EDF successfully scheduled a 90% utilization system.",
      "Key: EDF is OPTIMAL. If any algorithm can meet deadlines, EDF will.",
    ],
  },
  {
    title: "Example 5 — EDF Under Stress (High Utilization, Just Feasible)",
    tasks: [
      { name: "Task1", execution: 2, period: 3 },
      { name: "Task2", execution: 2, period: 4 },
    ],
    explanation: [
      "Task1: C=2, T=3 → deadlines at 3, 6, 9, 12, ...",
      "Task2: C=2, T=4 → deadlines at 4, 8, 12, ...",
      "Utilization: U = 2/3 + 2/4 = 0.667 + 0.5 = 1.167 = 116.7%",
      "Since 116.7% > 100%, this system is INFEASIBLE!",
      "No scheduler (RMS, EDF, or any other) can meet all deadlines.",
      "Hyperperiod = LCM(3, 4) = 12 time units.",
      "Timeline (shows failure):",
      "  t=0: Both released. Deadlines: Task1(3), Task2(4). Pick Task1.",
      "  t=1: Task1 still running. Both same. Pick Task1.",
      "  t=2: Task1 finishes. Task2 deadline 4. Task2 runs.",
      "  t=3: Task1 re-released (deadline 6). Task2 deadline 4.",
      "  4 < 6, so Task2 continues.",
      "  t=4: Task2 finishes (deadline met ✓). Task1 deadline 6. Task1 runs.",
      "  t=5: Task1 still running. Task1 deadline 6. Task1 runs.",
      "  t=6: Task1 finishes (deadline met ✓). Both re-released.",
      "  At t=6: Task1 deadline 9, Task2 deadline 8. Pick Task2.",
      "  t=7: Task2 still running.",
      "  t=8: Task2 finishes (deadline met ✓). Task1 deadline 9.",
      "  t=9: Task1 still running.",
      "  t=10: Task1 still running (1 unit left).",
      "  t=11: Task1 finishes BUT deadline was 9! DEADLINE MISSED! ❌",
      "  t=12: Both re-released.",
      "Again at t=12, Task1 released but can't finish by t=15.",
      "System CANNOT meet all deadlines despite EDF's optimality.",
      "Key: Even EDF can't fix infeasible systems. Need more CPU capacity.",
    ],
  },
  {
    title: "Example 6 — Deadline Tie-Breaking (Same Deadline)",
    tasks: [
      { name: "Job1", execution: 1, period: 4 },
      { name: "Job2", execution: 2, period: 4 },
      { name: "Job3", execution: 1, period: 8 },
    ],
    explanation: [
      "All Job1 and Job2 have same period (4), so same deadline every cycle.",
      "Job1: C=1, T=4 → deadlines at 4, 8, 12, ...",
      "Job2: C=2, T=4 → deadlines at 4, 8, 12, ...",
      "Job3: C=1, T=8 → deadlines at 8, 16, ...",
      "Hyperperiod = LCM(4, 4, 8) = 8 time units.",
      "When Job1 and Job2 have same deadline, use tie-breaking: arbitrary or input order.",
      "Timeline:",
      "  t=0: All released. Deadlines: Job1(4), Job2(4), Job3(8).",
      "  Job1 and Job2 tie at deadline 4. Break tie: pick Job1 (first).",
      "  t=1: Job1 done. Job2(deadline 4), Job3(deadline 8). Pick Job2.",
      "  t=2: Job2 still running (1 unit left).",
      "  t=3: Job2 finishes (deadline met ✓). Job3 deadline 8. Job3 runs.",
      "  t=4: Job1 re-released (deadline 8). Job3 deadline 8. Tie!",
      "  By input order, pick Job1.",
      "  t=5: Job1 done. Job3 deadline 8 (1 unit left). Job3 runs.",
      "  t=6: Job3 finishes (deadline met ✓). Job2 re-released (deadline 8).",
      "  t=7: Job2 still running (1 unit left).",
      "  t=8: Job2 finishes (deadline met ✓). All re-released.",
      "All deadlines met despite ties. Tie-breaking is straightforward.",
      "Key: When deadlines tie, use consistent tie-breaker (input order, ID, etc.).",
    ],
  },
  {
    title: "Example 7 — Dynamic Arrival Pattern (EDF Adaptability)",
    tasks: [
      { name: "Reactive", execution: 1, period: 2 },
      { name: "Batch", execution: 3, period: 6 },
    ],
    explanation: [
      "Reactive: C=1, T=2 → frequent short jobs at deadlines 2, 4, 6, 8, 10, ...",
      "Batch: C=3, T=6 → occasional long jobs at deadlines 6, 12, ...",
      "Utilization: U = 1/2 + 3/6 = 0.5 + 0.5 = 1.0 = 100% (fully utilized)",
      "Hyperperiod = LCM(2, 6) = 6 time units.",
      "EDF dynamically adapts to the workload pattern.",
      "Timeline:",
      "  t=0: Both released. Deadlines: Reactive(2), Batch(6). Pick Reactive.",
      "  t=1: Reactive done. Batch deadline 6. Batch runs.",
      "  t=2: Reactive re-released (deadline 4). Batch deadline 6.",
      "  4 < 6, so preempt Batch. Reactive runs.",
      "  t=3: Reactive done. Batch deadline 6 (2 units left). Batch runs.",
      "  t=4: Reactive re-released (deadline 6). Batch deadline 6. Tie!",
      "  By input order, pick Reactive.",
      "  t=5: Reactive done. Batch deadline 6 (1 unit left). Batch runs.",
      "  t=6: Batch finishes (deadline met ✓). Reactive deadline 8.",
      "  Both complete exactly at their deadlines.",
      "ALL DEADLINES MET at exactly 100% CPU utilization!",
      "This shows EDF's ability to pack the schedule tightly.",
      "Key: EDF automatically adapts to deadline urgency. Highly responsive scheduling.",
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

  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  let hyperperiod = tasks[0].period;
  for (let i = 1; i < tasks.length; i++) {
    hyperperiod = lcm(hyperperiod, tasks[i].period);
  }

  const jobDetails = [];
  const jobQueue = {};

  for (let time = 0; time < hyperperiod; time++) {
    tasks.forEach((task) => {
      if (time % task.period === 0) {
        const jobId = `${task.name}-${time}`;
        jobQueue[jobId] = {
          name: task.name,
          released: time,
          deadline: time + task.period,
          remaining: task.execution,
        };
      }
    });

    const readyJobs = Object.values(jobQueue).filter((j) => j.remaining > 0);
    if (readyJobs.length > 0) {
      readyJobs.sort((a, b) => a.deadline - b.deadline);
      const executedJob = readyJobs[0];
      executedJob.remaining -= 1;
      jobDetails.push({
        time,
        task: executedJob.name,
        deadline: executedJob.deadline,
        remaining: executedJob.remaining,
      });
    } else {
      jobDetails.push({
        time,
        task: "—",
        deadline: "—",
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
            <th className="px-4 py-2">Nearest Deadline</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobDetails.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 font-semibold text-gray-700">{item.time}</td>
              <td className="px-4 py-2 font-semibold text-indigo-700">
                {item.task}
              </td>
              <td className="px-4 py-2 text-gray-600">{item.deadline}</td>
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

  const schedule = [];
  const jobQueue = {};

  for (let time = 0; time < hyperperiod; time++) {
    ex.tasks.forEach((task) => {
      if (time % task.period === 0) {
        const jobId = `${task.name}-${time}`;
        jobQueue[jobId] = {
          name: task.name,
          remaining: task.execution,
          deadline: time + task.period,
        };
      }
    });

    const readyJobs = Object.values(jobQueue).filter((j) => j.remaining > 0);
    if (readyJobs.length > 0) {
      readyJobs.sort((a, b) => a.deadline - b.deadline);
      const currentJob = readyJobs[0];
      schedule.push(currentJob.name);
      currentJob.remaining -= 1;
    } else {
      schedule.push("-");
    }
  }

  const busySlots = schedule.filter((t) => t !== "-").length;
  const cpuUtil = ((busySlots / hyperperiod) * 100).toFixed(1);
  const utilization = ex.tasks.reduce((sum, t) => sum + t.execution / t.period, 0);

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
          <p>CPU usage exceeds 100%. Even EDF cannot meet all deadlines.</p>
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
const EearliestDeadline = () => {
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

  const simulateEDF = () => {
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

    let hp = taskData[0].period;
    for (let i = 1; i < taskData.length; i++) {
      hp = lcm(hp, taskData[i].period);
    }

    if (hp > 500) {
      setError("Hyperperiod is too large (>500). Try smaller periods.");
      setSchedule([]);
      return;
    }

    const sched = [];
    const jobQueue = {};

    for (let time = 0; time < hp; time++) {
      taskData.forEach((task) => {
        if (time % task.period === 0) {
          const jobId = `${task.name}-${time}`;
          jobQueue[jobId] = {
            name: task.name,
            remaining: task.execution,
            deadline: time + task.period,
          };
        }
      });

      const readyJobs = Object.values(jobQueue).filter((j) => j.remaining > 0);
      if (readyJobs.length > 0) {
        readyJobs.sort((a, b) => a.deadline - b.deadline);
        const currentJob = readyJobs[0];
        sched.push(currentJob.name);
        currentJob.remaining -= 1;
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
        Earliest Deadline First (EDF) Scheduler
      </h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        A dynamic, optimal scheduling algorithm that always executes the task with the nearest
        deadline. Ideal for systems where deadline compliance is critical and workload changes dynamically.
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
          <Section title="What is Earliest Deadline First (EDF)?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">EDF (Earliest Deadline First)</span> is a
              <span className="font-semibold"> dynamic, optimal scheduling algorithm</span> that always executes
              the ready job with the <span className="font-bold">earliest absolute deadline</span>. Unlike static
              or priority-based scheduling, EDF makes decisions <span className="font-semibold">at runtime</span>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              EDF is <span className="font-bold">optimal for uniprocessor systems:</span> if any schedule can meet
              all deadlines, EDF will. This makes it the gold standard for real-time systems where deadline
              compliance is absolutely critical.
            </p>
          </Section>

          <Section title="Key Concepts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⏱️ Execution Time (C)</p>
                <p className="text-gray-700 text-sm">
                  Time needed for one job instance to complete execution.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🔄 Period (T)</p>
                <p className="text-gray-700 text-sm">
                  Time between successive job releases. Also the relative deadline.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">🎯 Absolute Deadline</p>
                <p className="text-gray-700 text-sm">
                  Release time + period. The actual deadline for this specific job instance.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⚡ Dynamic Scheduling</p>
                <p className="text-gray-700 text-sm">
                  Decisions made at runtime, adapting to deadline urgency in real-time.
                </p>
              </div>
            </div>
          </Section>

          <Section title="The EDF Algorithm — Step by Step">
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  t: "At each time unit, check for new job releases.",
                  d: "When time % period == 0, release a new instance of that task.",
                },
                {
                  n: 2,
                  t: "Build a ready queue of all unfinished jobs.",
                  d: "Include all jobs that have been released but not yet completed.",
                },
                {
                  n: 3,
                  t: "Calculate absolute deadline for each job.",
                  d: "Deadline = release time + period.",
                },
                {
                  n: 4,
                  t: "Sort jobs by absolute deadline (ascending).",
                  d: "The job with the smallest deadline is most urgent.",
                },
                {
                  n: 5,
                  t: "Execute the job with the earliest deadline.",
                  d: "For one time unit, run that job and decrement its remaining execution.",
                },
                {
                  n: 6,
                  t: "Repeat for the entire hyperperiod.",
                  d: "Continue until all jobs are scheduled. If no jobs ready, CPU is idle.",
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

          <Section title="Key Formulas & Optimality">
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-indigo-700 mb-2">Absolute Deadline Formula</p>
                <p className="text-sm text-gray-600">
                  Deadline(job) = Release Time + Period
                  <br />
                  Always execute the job with the smallest absolute deadline value.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-yellow-700 mb-2">EDF is Optimal</p>
                <p className="text-sm text-gray-600">
                  For uniprocessor preemptive scheduling: If ANY algorithm can meet all deadlines,
                  EDF will too. This is a proven mathematical property.
                </p>
              </div>
            </div>
          </Section>

          <Section title="EDF vs Other Scheduling Algorithms">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Decision Rule</th>
                    <th className="px-4 py-2">Decision Time</th>
                    <th className="px-4 py-2">Optimality</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["EDF", "Earliest deadline (dynamic)", "Runtime", "Optimal"],
                    ["RMS", "Period-based priority (fixed)", "Offline", "Optimal for U ≤ 69%"],
                    ["Static Scheduling", "Pre-computed offline", "Offline", "Optimal if feasible"],
                    ["FCFS", "Arrival order", "Runtime", "Not optimal"],
                  ].map(([alg, rule, time, optimal], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "EDF" ? "text-indigo-600" : "text-gray-700"}`}>
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
                "✅ At each time unit, identify all released and unfinished jobs.",
                "✅ Calculate absolute deadline: release time + period.",
                "✅ Pick the job with the SMALLEST absolute deadline.",
                "✅ Execute that job for exactly 1 time unit.",
                "✅ Decrement its remaining execution time.",
                "✅ Repeat until all jobs in the hyperperiod are completed.",
                "✅ Handle deadline ties with consistent tie-breaker (e.g., input order).",
                "✅ EDF is optimal: if feasible, EDF will meet all deadlines.",
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
            <p className="font-bold mb-1">💡 7 Complete Examples (All Critical EDF Cases)</p>
            <p className="mb-2">
              <strong>Ex 1-3:</strong> Basic concept, frequency vs deadline, competing deadlines.
            </p>
            <p className="mb-2">
              <strong>Ex 4-5:</strong> EDF optimality (meets all), system overload (failure).
            </p>
            <p>
              <strong>Ex 6-7:</strong> Tie-breaking strategy, dynamic workload adaptability.
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
              Enter your own tasks with execution times and periods. The simulator will generate the EDF
              schedule by always selecting the job with the earliest (smallest) deadline. Observe how EDF
              dynamically adapts to deadline urgency.
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
                        Period (T) = Deadline
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
              onClick={simulateEDF}
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

export default EearliestDeadline;