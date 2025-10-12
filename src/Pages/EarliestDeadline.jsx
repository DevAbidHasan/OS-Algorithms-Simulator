// EarliestDeadline.jsx
import React, { useState } from "react";

const EarliestDeadline = () => {
  const [tasks, setTasks] = useState([{ name: "", execution: "", period: "" }]);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");

  // Add new task
  const addTask = () => {
    setTasks([...tasks, { name: "", execution: "", period: "" }]);
  };

  // Handle input changes
  const handleChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  // Simulate EDF Scheduling
  const simulateEDF = () => {
    if (tasks.some(t => !t.name || !t.execution || !t.period)) {
      setError("Please fill all fields for each task.");
      setTimeline([]);
      return;
    }
    setError("");

    const taskData = tasks.map(t => ({
      name: t.name,
      execution: parseInt(t.execution),
      period: parseInt(t.period),
      remaining: parseInt(t.execution),
      nextDeadline: parseInt(t.period)
    }));

    // Compute hyperperiod
    const lcm = (a, b) => {
      const gcd = (x, y) => (!y ? x : gcd(y, x % y));
      return (a * b) / gcd(a, b);
    };
    let hyperperiod = taskData[0].period;
    for (let i = 1; i < taskData.length; i++) {
      hyperperiod = lcm(hyperperiod, taskData[i].period);
    }

    const schedule = [];

    for (let time = 0; time < hyperperiod; time++) {
      // Release tasks at the start of their period
      taskData.forEach(task => {
        if (time % task.period === 0) {
          task.remaining = task.execution;
          task.nextDeadline = time + task.period;
        }
      });

      // Pick ready task with earliest deadline
      const readyTasks = taskData.filter(task => task.remaining > 0);
      if (readyTasks.length > 0) {
        readyTasks.sort((a, b) => a.nextDeadline - b.nextDeadline);
        const currentTask = readyTasks[0];
        schedule.push(currentTask.name);
        currentTask.remaining -= 1;
      } else {
        schedule.push("-"); // idle
      }
    }

    setTimeline(schedule);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Earliest Deadline First (EDF) Simulator</h1>

      {/* Tasks Input */}
      <div className="w-full max-w-3xl overflow-x-auto">
        <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-indigo-500 text-white">
            <tr>
              <th className="px-4 py-2">Task</th>
              <th className="px-4 py-2">Execution Time</th>
              <th className="px-4 py-2">Period</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    placeholder={`T${index + 1}`}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={task.execution}
                    onChange={(e) => handleChange(index, "execution", e.target.value)}
                    placeholder="Execution"
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={task.period}
                    onChange={(e) => handleChange(index, "period", e.target.value)}
                    placeholder="Period"
                    className="w-full p-2 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addTask}
          className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition"
        >
          Add Task
        </button>
      </div>

      {/* Simulate Button */}
      <button
        onClick={simulateEDF}
        className="mt-6 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
      >
        Simulate
      </button>

      {/* Output Timeline */}
      <div className="mt-6 w-full max-w-3xl">
        {error && <p className="text-red-500 font-semibold">{error}</p>}
        {timeline.length > 0 && (
          <div className="overflow-x-auto border p-4 rounded bg-white">
            <p className="font-semibold mb-2">Scheduled Timeline:</p>
            <div className="flex flex-wrap gap-2">
              {timeline.map((task, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-sm ${
                    task === "-" ? "bg-gray-200 text-gray-500" : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {task}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarliestDeadline;
