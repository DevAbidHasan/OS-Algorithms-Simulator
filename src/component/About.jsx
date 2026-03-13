import { Link } from "react-router";
import { SiReact, SiTailwindcss, SiVite, SiJavascript } from "react-icons/si";
import { SiDaisyui } from "react-icons/si";import { FaCode } from "react-icons/fa";

const TECH_STACK = [
  { name: "React", role: "UI Framework", icon: <SiReact size={18} className="text-sky-500" /> },
  { name: "JavaScript", role: "Core Language", icon: <SiJavascript size={18} className="text-yellow-400" /> },
  { name: "Vite", role: "Build Tool", icon: <SiVite size={18} className="text-purple-500" /> },
  { name: "Tailwind CSS", role: "Styling", icon: <SiTailwindcss size={18} className="text-cyan-500" /> },
  { name: "DaisyUI", role: "Component Library", icon: <SiDaisyui size={18} className="text-pink-500" /> },
  { name: "React Icons", role: "Icon Library", icon: <FaCode size={16} className="text-orange-400" /> },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex btn btn-outline items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition mb-10"
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-3 block">
            About
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OS Algorithms Simulator</h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl">
            An interactive, browser-based platform for exploring core operating system
            algorithms — built for cs students, by a student.
          </p>
        </div>

        {/* Divider */}
        <hr className="border-gray-100 mb-12" />

        {/* Project Summary */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Project summary</h2>
          <p className="text-gray-500 leading-relaxed text-sm">
            OS Algorithms Simulator lets you visualize and interact with the fundamental algorithms
            taught in every operating systems course — CPU scheduling (FCFS, SJF, Round Robin,
            Priority), disk scheduling (SCAN, C-SCAN, SSTF), and deadlock avoidance (Banker's
            Algorithm). Instead of reading about them in a textbook, you can run them, tweak
            inputs, and watch them work step by step in real time. Everything runs entirely in
            the browser — no installation, no backend, no account required.
          </p>
        </section>

        {/* Inspiration */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What inspired this</h2>
          <p className="text-gray-500 leading-relaxed text-sm mb-3">
            This project started as a course assignment. Our instructor suggested we explore
            existing OS visualizer tools online to better understand how algorithms behave
            in practice. After trying a few, I noticed most were either outdated, hard to
            use, or lacked proper explanations alongside the simulation.
          </p>
          <p className="text-gray-500 leading-relaxed text-sm">
            That became the motivation — to build something cleaner, more approachable, and
            genuinely useful for students going through the same material. What started as
            a course exercise turned into a full project.
          </p>
        </section>

        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Mission</h2>
          <div className="border-l-4 border-indigo-400 pl-5 py-1">
            <p className="text-gray-500 leading-relaxed text-sm">
              To make operating system concepts genuinely understandable — not just readable.
              Theory is important, but being able to interact with an algorithm, break it,
              tune it, and observe the result is what makes it stick. This tool exists to
              bridge that gap for CS students everywhere.
            </p>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tech stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TECH_STACK.map((t) => (
              <div
                key={t.name}
                className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 bg-gray-50"
              >
                {t.icon}
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-none mb-0.5">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What you can do */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What you can do</h2>
          <ul className="space-y-2 text-sm text-gray-500">
            {[
              "Simulate CPU scheduling algorithms with custom processes and priorities",
              "Visualize disk head movement across different disk scheduling strategies",
              "Run the Banker's Algorithm to check for safe states and deadlock conditions",
              "Read theory and worked examples alongside each simulation",
              "Use it entirely offline — no login, no account, no data sent anywhere",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By the numbers</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: "14+", label: "Algorithms" },
              { num: "3", label: "Major modules" },
              { num: "100%", label: "Browser-based" },
            ].map((s) => (
              <div
                key={s.label}
                className="border border-gray-100 rounded-xl p-5 text-center bg-gray-50"
              >
                <p className="text-2xl font-bold text-gray-900 mb-1">{s.num}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Built by */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Built by</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            This project was built by <a href="https://www.linkedin.com/in/abid-hasan-plabon-a4aa222a1/" target="_blank" className="text-blue-700 italic underline font-medium">Abid Hasan Plabon</a> as
            part of my university operating systems course and obviously for fun as well. It is open source and free to use for
            anyone learning OS concepts.
          </p>
        </section>

        <hr className="border-gray-100 mb-8" />

        <p className="text-center text-xs text-gray-400">
          Open source · Free to use · Built for learners
        </p>

      </div>
    </div>
  );
}