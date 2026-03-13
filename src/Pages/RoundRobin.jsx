// RoundRobin.jsx
import React, { useState } from "react";

// ── Colours for processes ─────────────────────────────────────────────────────
const PROC_COLORS = [
  { bg: "bg-indigo-100",  text: "text-indigo-700",  hex: "#e0e7ff" },
  { bg: "bg-green-100",   text: "text-green-700",   hex: "#dcfce7" },
  { bg: "bg-pink-100",    text: "text-pink-700",    hex: "#fce7f3" },
  { bg: "bg-yellow-100",  text: "text-yellow-700",  hex: "#fef9c3" },
  { bg: "bg-purple-100",  text: "text-purple-700",  hex: "#f3e8ff" },
  { bg: "bg-orange-100",  text: "text-orange-700",  hex: "#ffedd5" },
];
const colorFor = (name, names) => {
  const idx = names.indexOf(name);
  return idx >= 0 ? PROC_COLORS[idx % PROC_COLORS.length] : { bg: "bg-gray-200", text: "text-gray-500", hex: "#e5e7eb" };
};

// ── Worked example data ───────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Example 1 — All arrive at time 0, Quantum = 2",
    quantum: 2,
    processes: [
      { name: "P1", arrival: 0, burst: 5 },
      { name: "P2", arrival: 0, burst: 3 },
      { name: "P3", arrival: 0, burst: 4 },
    ],
    explanation: [
      "All 3 processes arrive at t=0. Queue order: [P1, P2, P3]. Quantum = 2.",
      "t=0–2: Run P1 for 2 units. P1 remaining = 3. Queue: [P2, P3, P1].",
      "t=2–4: Run P2 for 2 units. P2 remaining = 1. Queue: [P3, P1, P2].",
      "t=4–6: Run P3 for 2 units. P3 remaining = 2. Queue: [P1, P2, P3].",
      "t=6–8: Run P1 for 2 units. P1 remaining = 1. Queue: [P2, P3, P1].",
      "t=8–9: Run P2 for 1 unit (last slice). P2 done ✅. Queue: [P3, P1].",
      "t=9–11: Run P3 for 2 units. P3 done ✅. Queue: [P1].",
      "t=11–12: Run P1 for 1 unit (last slice). P1 done ✅.",
      "Gantt: P1(2) → P2(2) → P3(2) → P1(2) → P2(1) → P3(2) → P1(1)",
    ],
  },
  {
    title: "Example 2 — Different arrival times, Quantum = 3",
    quantum: 3,
    processes: [
      { name: "P1", arrival: 0, burst: 6 },
      { name: "P2", arrival: 2, burst: 4 },
      { name: "P3", arrival: 5, burst: 2 },
    ],
    explanation: [
      "Quantum = 3. Processes arrive at different times.",
      "t=0: Only P1 has arrived. Queue: [P1].",
      "t=0–3: Run P1 for 3 units. P1 remaining = 3. At t=3, P2 has arrived. Queue: [P2, P1].",
      "t=3–6: Run P2 for 3 units. P2 remaining = 1. At t=6, P3 has arrived. Queue: [P1, P3, P2].",
      "t=6–9: Run P1 for 3 units. P1 done ✅. Queue: [P3, P2].",
      "t=9–11: Run P3 for 2 units (full burst, less than quantum). P3 done ✅. Queue: [P2].",
      "t=11–12: Run P2 for 1 unit (last slice). P2 done ✅.",
      "Gantt: P1(3) → P2(3) → P1(3) → P3(2) → P2(1)",
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
      if (last && last.name === "Idle") { last.duration += 1; last.end += 1; }
      else timeline.push({ name: "Idle", duration: 1, start: time, end: time + 1 });
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

  // Compute stats
  const stats = procList.map((p) => {
    const tat = p.finishTime - p.arrival;
    const wt  = tat - p.burst;
    return { name: p.name, arrival: p.arrival, burst: p.burst, finish: p.finishTime, tat, wt };
  });
  const avgTAT = stats.reduce((s, r) => s + r.tat, 0) / n;
  const avgWT  = stats.reduce((s, r) => s + r.wt,  0) / n;

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
  let cursor = timeline[0].start;
  return (
    <div>
      <p className="font-semibold mb-2">Gantt Chart:</p>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {timeline.map((slot, idx) => {
            const c = colorFor(slot.name, names);
            return (
              <div
                key={idx}
                className={`flex-shrink-0 text-center py-2 rounded text-sm font-semibold ${
                  slot.name === "Idle" ? "bg-gray-200 text-gray-500" : `${c.bg} ${c.text}`
                }`}
                style={{ width: `${Math.max(slot.duration * 40, 36)}px` }}
              >
                {slot.name}
                <br />
                <span className="text-xs font-normal">{slot.duration}u</span>
              </div>
            );
          })}
        </div>
        {/* Time axis */}
        <div className="flex gap-1 min-w-max mt-1">
          {timeline.map((slot, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 text-xs text-gray-400 text-left"
              style={{ width: `${Math.max(slot.duration * 40, 36)}px` }}
            >
              {slot.start}
            </div>
          ))}
          <div className="text-xs text-gray-400">
            {timeline[timeline.length - 1].end}
          </div>
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
      <p className="font-semibold mb-2">Process Statistics:</p>
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
            <td className="px-4 py-2" colSpan={4}>Average</td>
            <td className="px-4 py-2 text-blue-700">{avgTAT.toFixed(2)}</td>
            <td className="px-4 py-2 text-orange-700">{avgWT.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span><span className="font-semibold text-blue-600">Turnaround</span> = Finish − Arrival</span>
        <span><span className="font-semibold text-orange-600">Waiting</span> = Turnaround − Burst</span>
      </div>
    </div>
  );
}

// ── Queue trace table ─────────────────────────────────────────────────────────
function QueueTrace({ timeline, quantum }) {
  if (!timeline || timeline.length === 0) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-semibold mb-2">Execution Trace (time slice by time slice):</p>
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
                {slot.name === "Idle"
                  ? <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded">CPU idle — no process ready</span>
                  : slot.duration < quantum
                  ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">Last slice — process finishes ✅</span>
                  : <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Full quantum — goes back to queue</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Worked example block ──────────────────────────────────────────────────────
function WorkedExample({ ex }) {
  const { timeline, stats, avgTAT, avgWT } = runRR(ex.processes, ex.quantum);
  const names = ex.processes.map((p) => p.name);
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="font-bold text-indigo-600 mb-3">{ex.title}</h3>
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-semibold">Quantum: {ex.quantum}</span>
        {ex.processes.map((p, i) => (
          <span key={i} className={`px-2 py-1 rounded font-semibold ${PROC_COLORS[i % PROC_COLORS.length].bg} ${PROC_COLORS[i % PROC_COLORS.length].text}`}>
            {p.name} (arr={p.arrival}, burst={p.burst})
          </span>
        ))}
      </div>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
        {ex.explanation.map((line, i) => <li key={i}>{line}</li>)}
      </ol>
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
        <GanttChart timeline={timeline} names={names} />
      </div>
      <StatsTable stats={stats} avgTAT={avgTAT} avgWT={avgWT} names={names} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const RoundRobin = () => {
  const [processes, setProcesses] = useState([{ name: "", burst: "", arrival: "" }]);
  const [quantum, setQuantum]     = useState("");
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  const addProcess = () => setProcesses([...processes, { name: "", burst: "", arrival: "" }]);

  const handleChange = (index, field, value) => {
    const updated = [...processes];
    updated[index][field] = value;
    setProcesses(updated);
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
    { key: "theory",   label: "📖 Theory"  },
    { key: "examples", label: "🔍 Examples" },
    { key: "practice", label: "🧪 Practice" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 md:p-12">

      <h1 className="text-3xl font-bold mb-2 text-indigo-700">Round Robin Simulator</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xl text-sm">
        Every process gets an equal turn on the CPU. Learn how it works,
        study worked examples, then try it yourself.
      </p>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 bg-white border border-gray-300 rounded-lg p-1 w-full max-w-4xl">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 rounded-md font-semibold text-sm transition ${
              activeTab === t.key ? "bg-indigo-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ THEORY ══ */}
      {activeTab === "theory" && (
        <>
          <Section title="What is Round Robin Scheduling?">
            <p className="text-gray-700 leading-relaxed mb-3">
              <span className="font-bold text-indigo-600">Round Robin (RR)</span> is a CPU
              scheduling algorithm where every process gets a fixed slice of CPU time called
              a <span className="font-semibold">time quantum</span>. The CPU gives each
              process one turn, then moves to the next. If a process is not finished after
              its quantum, it goes to the back of the queue and waits for another turn.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of it like taking turns in a board game — every player gets exactly
              the same amount of time, and the game keeps going around the table until
              everyone is done.
            </p>
          </Section>

          <Section title="Key Terms — What Do They Mean?">
            <div className="space-y-3">
              {[
                { term: "Arrival Time",    color: "blue",   desc: "The time at which a process enters the system and becomes ready to run." },
                { term: "Burst Time",      color: "indigo", desc: "The total CPU time a process needs to finish completely." },
                { term: "Time Quantum",    color: "yellow", desc: "The fixed maximum time a process can run on the CPU in one turn. If it needs more, it goes back to the queue." },
                { term: "Ready Queue",     color: "green",  desc: "The list of processes waiting for their next turn on the CPU. New arrivals and preempted processes both join here." },
                { term: "Preemption",      color: "orange", desc: "When a process is forcibly removed from the CPU after its quantum expires, even if it is not finished." },
                { term: "Turnaround Time", color: "purple", desc: "Total time from when a process arrives to when it finishes. Turnaround = Finish Time − Arrival Time." },
                { term: "Waiting Time",    color: "pink",   desc: "Total time a process spends waiting in the queue. Waiting = Turnaround − Burst Time." },
              ].map(({ term, color, desc }) => (
                <div key={term} className="flex gap-3 items-start">
                  <span className={`bg-${color}-100 text-${color}-700 px-3 py-1 rounded-lg font-bold text-sm shrink-0 min-w-28 text-center`}>{term}</span>
                  <p className="text-gray-700 text-sm pt-1">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="How It Works — Step by Step">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 text-sm">
              <p className="font-bold text-indigo-700 mb-1">📐 The Two Key Formulas</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <p className="text-center font-bold text-indigo-700">Turnaround = Finish − Arrival</p>
                <p className="text-center font-bold text-indigo-700">Waiting = Turnaround − Burst</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                { n: 1, t: "Sort processes by arrival time.", d: "Processes that arrive first join the queue first." },
                { n: 2, t: "Pick the first process in the ready queue.", d: "This is the process that has been waiting the longest." },
                { n: 3, t: "Run it for one quantum (or less if it finishes sooner).", d: "If burst ≤ quantum → process finishes. If burst > quantum → process uses full quantum." },
                { n: 4, t: "Check for new arrivals during that quantum.", d: "Any process that arrived while the current one was running joins the queue now." },
                { n: 5, t: "If the process is not finished, put it back at the end of the queue.", d: "It will get another turn when the CPU comes back around." },
                { n: 6, t: "Repeat until all processes finish.", d: "If the queue is ever empty but some processes have not arrived yet, the CPU is idle." },
                { n: 7, t: "Calculate Turnaround and Waiting Time for each process.", d: "Use: Turnaround = Finish − Arrival. Waiting = Turnaround − Burst." },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex gap-3 items-start">
                  <span className="bg-indigo-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shrink-0">{n}</span>
                  <div>
                    <span className="font-semibold text-gray-800">{t}</span>{" "}
                    <span className="text-gray-600 text-sm">{d}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="How Quantum Size Affects Performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-bold text-blue-700 mb-2">⚡ Very Small Quantum</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Every process responds very quickly</li>
                  <li>Feels like all processes run at the same time</li>
                  <li>But: lots of context switching overhead</li>
                  <li>CPU spends more time switching than working</li>
                </ul>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="font-bold text-orange-700 mb-2">🐢 Very Large Quantum</p>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Short processes finish quickly (good)</li>
                  <li>Long processes may block shorter ones</li>
                  <li>Starts to behave like FIFO scheduling</li>
                  <li>Not truly fair anymore</li>
                </ul>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-bold text-green-700 mb-1">✅ The Sweet Spot</p>
              <p>A good quantum is slightly larger than the average CPU burst of a single interaction.
                 In practice, 10–100 milliseconds works well for most real systems.</p>
            </div>
          </Section>

          <Section title="Advantages & Disadvantages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">✅ Advantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Fair — every process gets equal CPU time</li>
                  <li>No starvation — every process eventually runs</li>
                  <li>Great for time-sharing systems</li>
                  <li>Short processes do not get stuck behind long ones forever</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-700 mb-2">❌ Disadvantages</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Higher average turnaround time than SJF</li>
                  <li>Context switching overhead (saving/restoring process state)</li>
                  <li>Performance depends heavily on quantum size</li>
                  <li>Not ideal for real-time systems</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Comparison with Other CPU Scheduling Algorithms">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Algorithm</th>
                    <th className="px-4 py-2">Preemptive?</th>
                    <th className="px-4 py-2">Starvation?</th>
                    <th className="px-4 py-2">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["FIFO / FCFS",   "No",  "No",  "Simple batch jobs"],
                    ["SJF",           "No",  "Yes", "Minimising average wait"],
                    ["Round Robin",   "Yes", "No",  "Time-sharing / interactive"],
                    ["Priority",      "Yes", "Yes", "Important tasks first"],
                    ["MLFQ",          "Yes", "No",  "General-purpose OS"],
                  ].map(([alg, pre, starv, best], i) => (
                    <tr key={alg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-4 py-2 font-semibold ${alg === "Round Robin" ? "text-indigo-600" : "text-gray-700"}`}>{alg}</td>
                      <td className={`px-4 py-2 font-semibold ${pre === "Yes" ? "text-orange-500" : "text-gray-500"}`}>{pre}</td>
                      <td className={`px-4 py-2 font-semibold ${starv === "Yes" ? "text-red-500" : "text-green-600"}`}>{starv}</td>
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
                "✅ Processes join the ready queue when their arrival time ≤ current time.",
                "✅ Each process runs for exactly min(remaining burst, quantum) at a time.",
                "✅ If a process finishes before the quantum expires, the CPU moves on immediately — no wasted time.",
                "✅ After each quantum, check if any new processes have arrived and add them to the queue before putting the preempted process back.",
                "✅ If the queue is empty but processes are still pending, the CPU idles until the next arrival.",
                "✅ Turnaround Time = Finish Time − Arrival Time.",
                "✅ Waiting Time = Turnaround Time − Burst Time.",
                "✅ Average = sum of all individual values ÷ number of processes.",
              ].map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </Section>
        </>
      )}

      {/* ══ EXAMPLES ══ */}
      {activeTab === "examples" && (
        <div className="w-full max-w-4xl">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">💡 How to read these examples</p>
            <p>Each example shows the input processes with arrival and burst times, a step-by-step
               queue trace explaining what happens at each time quantum, a colour-coded Gantt chart,
               and a stats table with Turnaround and Waiting time for each process.</p>
          </div>
          {EXAMPLES.map((ex, i) => <WorkedExample key={i} ex={ex} />)}
        </div>
      )}

      {/* ══ PRACTICE ══ */}
      {activeTab === "practice" && (
        <>
          <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
            <p className="font-bold mb-1">🧪 Try it yourself</p>
            <p>Add your processes with their arrival and burst times, set a time quantum, then
               click Simulate. You will see a colour-coded Gantt chart, an execution trace showing
               what happens at every time slice, and a stats table with Turnaround and Waiting
               times for each process.</p>
          </div>

          {/* Process table */}
          <div className="w-full max-w-3xl overflow-x-auto mb-4">
            <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-indigo-500 text-white">
                <tr>
                  <th className="px-4 py-2">Process</th>
                  <th className="px-4 py-2">Arrival Time</th>
                  <th className="px-4 py-2">Burst Time</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((proc, idx) => (
                  <tr key={idx} className="bg-white border-b">
                    <td className="px-4 py-2">
                      <input type="text" value={proc.name}
                        onChange={(e) => handleChange(idx, "name", e.target.value)}
                        placeholder={`P${idx + 1}`} className="w-full p-2 border rounded" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={proc.arrival}
                        onChange={(e) => handleChange(idx, "arrival", e.target.value)}
                        placeholder="Arrival" className="w-full p-2 border rounded" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={proc.burst}
                        onChange={(e) => handleChange(idx, "burst", e.target.value)}
                        placeholder="Burst" className="w-full p-2 border rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addProcess}
              className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition">
              Add Process
            </button>
          </div>

          {/* Quantum input */}
          <div className="w-full max-w-2xl mb-4">
            <label className="block mb-2 font-semibold">Time Quantum</label>
            <input type="number" value={quantum}
              onChange={(e) => setQuantum(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 2" />
          </div>

          <button onClick={simulateRR}
            className="mb-6 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition">
            Simulate
          </button>

          {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

          {result && (
            <div className="w-full max-w-4xl space-y-4">

              {/* Gantt chart */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <GanttChart timeline={result.timeline} names={result.names} />
              </div>

              {/* Stats table */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <StatsTable
                  stats={result.stats}
                  avgTAT={result.avgTAT}
                  avgWT={result.avgWT}
                  names={result.names}
                />
              </div>

              {/* Execution trace */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <QueueTrace timeline={result.timeline} quantum={result.q} />
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RoundRobin;