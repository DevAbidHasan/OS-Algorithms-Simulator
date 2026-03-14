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
    title: "Example 1 — Basic Three-Task System",
    tasks: [
      { name: "Task A", execution: 2, period: 4 },
      { name: "Task B", execution: 1, period: 6 },
      { name: "Task C", execution: 2, period: 12 },
    ],
    explanation: [
      "Task A: C=2, T=4 → deadline at 4, 8, 12, ...",
      "Task B: C=1, T=6 → deadline at 6, 12, ...",
      "Task C: C=2, T=12 → deadline at 12, ...",
      "EDF always picks the task with the earliest deadline among ready jobs.",
      "Hyperperiod = LCM(4, 6, 12) = 12 time units.",
      "Schedule: At each time unit, execute the job with the earliest deadline.",
    ],
  },
  {
    title: "Example 2 — High-Frequency vs Low-Frequency",
    tasks: [
      { name: "Fast", execution: 1, period: 2 },
      { name: "Slow", execution: 2, period: 5 },
    ],
    explanation: [
      "Fast: C=1, T=2 → deadlines at 2, 4, 6, 8, 10, ...",
      "Slow: C=2, T=5 → deadlines at 5, 10, ...",
      "EDF prioritizes based on deadline urgency, not task frequency.",
      "The fast task often gets scheduled first due to earlier deadlines.",
      "Hyperperiod = LCM(2, 5) = 10 time units.",
      "Notice how deadlines drive the scheduling, ensuring nothing misses its deadline.",
    ],
  },
  {
    title: "Example 3 — Competing Deadlines",
    tasks: [
      { name: "T1", execution: 2, period: 3 },
      { name: "T2", execution: 1, period: 4 },
    ],
    explanation: [
      "T1: C=2, T=3 → tight deadline every 3 units",
      "T2: C=1, T=4 → less frequent, more relaxed",
      "At time 0: T1 (deadline 3) and T2 (deadline 4) both released.",
      "EDF picks T1 since 3 < 4. T1 executes at times 0 and 1.",
      "At time 3: T1 re-released (new deadline 6), T2 still executing.",
      "Hyperperiod = LCM(3, 4) = 12 time units.",
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

  const timelineData = schedule.map((task, idx) => ({
    time: idx,
    task: task === "-" ? null : task,
    taskName: task,
  }));

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
          Each block represents one time unit. Colored blocks = task execution, Gray blocks = idle.
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

  // Reconstruct job instances with deadlines
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  let hyperperiod = tasks[0].period;
  for (let i = 1; i < tasks.length; i++) {
    hyperperiod = lcm(hyperperiod, tasks[i].period);
  }

  const jobDetails = [];
  const jobQueue = {};

  for (let time = 0; time < hyperperiod; time++) {
    // Release new jobs
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

    // Execute job with earliest deadline
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
  // Calculate hyperperiod
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  let hyperperiod = ex.tasks[0].period;
  for (let i = 1; i < ex.tasks.length; i++) {
    hyperperiod = lcm(hyperperiod, ex.tasks[i].period);
  }

  // Generate schedule
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
const EarliestDeadline = () => {
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

  // ── Simulate EDF scheduling ────────────────────────────────────────────
  const simulateEDF = () => {
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

    // Generate EDF schedule
    const sched = [];
    const jobQueue = {};

    for (let time = 0; time < hp; time++) {
      // Release new job instances
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

      // Pick job with earliest deadline
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
        Earliest Deadline First (EDF) Scheduler
      </h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        A dynamic, optimal scheduling algorithm that always executes the task with the nearest
        deadline. Ideal for systems where deadline compliance is critical.
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
          <Section title="What is Earliest Deadline First (EDF)?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">EDF (Earliest Deadline First)</span> is
              a dynamic scheduling algorithm that always executes the ready job with the{" "}
              <span className="font-semibold">earliest absolute deadline</span>. Unlike static
              scheduling, EDF makes decisions <span className="font-semibold">at runtime</span>{" "}
              based on current job deadlines.
            </p>
            <p className="text-gray-700 leading-relaxed">
              EDF is <span className="font-bold">optimal</span> for preemptive scheduling: if any
              schedule can meet all deadlines, EDF will. This makes it a cornerstone of real-time
              systems.
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
                  Release time + period. EDF picks the job with the earliest deadline.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-bold text-indigo-700 mb-2">⚡ Dynamic Scheduling</p>
                <p className="text-gray-700 text-sm">
                  Decisions made at runtime, adapting to job arrivals and deadlines.
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
                  t: "Sort jobs by absolute deadline (ascending).",
                  d: "Deadline = release time + period.",
                },
                {
                  n: 4,
                  t: "Execute the job with the earliest deadline.",
                  d: "For one time unit, run that job and decrement its remaining execution.",
                },
                {
                  n: 5,
                  t: "Repeat for the entire hyperperiod.",
                  d: "Continue until all jobs in the hyperperiod are scheduled.",
                },
                {
                  n: 6,
                  t: "If no jobs are ready, the CPU is idle.",
                  d: "Mark that time unit as idle (no execution).",
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

          <Section title="Key Formula">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center mb-4">
              <p className="text-lg font-bold text-indigo-700">
                Absolute Deadline(job) = Release Time + Period
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Always execute the job with the smallest absolute deadline value.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-lg font-bold text-yellow-700">
                EDF is Optimal for Uniprocessor Systems
              </p>
              <p className="text-sm text-gray-600 mt-1">
                If any scheduling algorithm can meet all deadlines, EDF will too.
              </p>
            </div>
          </Section>

          <Section title="EDF vs Static Scheduling">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-bold text-blue-700 mb-3">📊 Static Scheduling</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Schedule computed offline before runtime</li>
                  <li>Zero runtime overhead</li>
                  <li>Less flexible, hard to add tasks</li>
                  <li>Hyperperiod must be computed</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-3">⚡ EDF (Dynamic)</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Decisions made at runtime by scheduler</li>
                  <li>Small runtime overhead per decision</li>
                  <li>Highly flexible, easily adapts to new jobs</li>
                  <li>Optimal: meets deadlines if any algorithm can</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Advantages & Disadvantages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-3">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Optimal for uniprocessor systems</li>
                  <li>Flexible — tasks can be added dynamically</li>
                  <li>High CPU utilization possible</li>
                  <li>Adapts to varying job loads</li>
                  <li>Guarantees deadline meeting if feasible</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-3">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Runtime overhead for scheduling decisions</li>
                  <li>Requires knowing deadlines in advance</li>
                  <li>Can preempt running tasks (if preemptive)</li>
                  <li>Not optimal for multiprocessor systems</li>
                  <li>Scheduling points add latency</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="When is EDF Used?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  icon: "📱",
                  title: "Mobile & Consumer Devices",
                  desc: "Android, iOS use variants of EDF for responsive UI scheduling.",
                },
                {
                  icon: "🎮",
                  title: "Real-time Multimedia",
                  desc: "Audio/video playback, gaming, VR — deadline-driven performance.",
                },
                {
                  icon: "🤖",
                  title: "Robotics & Autonomous Systems",
                  desc: "Sensor processing and control loops with time-critical deadlines.",
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
                "✅ At each time unit, identify all released and unfinished jobs.",
                "✅ Calculate absolute deadline for each job: release + period.",
                "✅ Pick the job with the smallest absolute deadline.",
                "✅ Execute that job for exactly 1 time unit.",
                "✅ Decrement its remaining execution time.",
                "✅ Repeat until all jobs in the hyperperiod are completed.",
                "✅ If no jobs are ready, mark that time as idle.",
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
              Each example shows the tasks, step-by-step explanation of EDF logic, task statistics,
              an execution timeline visualization, and a detailed schedule table. Pay close attention
              to how deadlines determine the scheduling order.
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
              Enter your own tasks with execution times and periods. The simulator will generate
              the EDF schedule by always selecting the job with the earliest deadline. Observe how
              deadlines drive the scheduling order, not task frequency or arrival order.
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
              onClick={simulateEDF}
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

export default EarliestDeadline;