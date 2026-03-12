import React from "react";
import { Link } from "react-router";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-indigo-700 to-violet-500 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          About OS Simulator
        </h1>

        <p className="max-w-3xl text-justify mx-auto text-lg text-white/90">
          OS Simulator is an interactive learning platform designed to help
          students understand Operating System algorithms through visual
          simulation and experimentation.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 bg-white text-indigo-700 px-8 py-3 rounded-full font-semibold hover:scale-105 transition"
        >
          ← Back to Home
        </Link>
      </section>

      {/* WHAT IS THIS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          What This Platform Does
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-4">
              Algorithm Visualization
            </h3>
            <p className="text-gray-600">
              Understand complex operating system algorithms through clear
              visual simulations that show how scheduling and disk management
              work internally.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-4">Interactive Learning</h3>
            <p className="text-gray-600">
              Students can input their own process data and observe how
              different algorithms behave under different scenarios.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-4">Educational Tool</h3>
            <p className="text-gray-600">
              The platform is built specifically to help computer science
              students grasp difficult OS concepts easily.
            </p>
          </div>
        </div>
      </section>

      {/* ALGORITHMS */}
      <section className="bg-white py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Algorithms Covered
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">
              Process Scheduling
            </h3>

            <ul className="space-y-2 text-gray-600">
              <li>
                •{" "}
                <Link to="/fcfs" className="text-blue-500 underline">
                  FCFS (First Come First Serve)
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/sjf" className="text-blue-500 underline">
                  SJF (Shortest Job First)
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/srtf" className="text-blue-500 underline">
                  SRTF (Shortest Remaining Time First)
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/rr" className="text-blue-500 underline">
                  Round Robin
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/priority" className="text-blue-500 underline">
                  Priority Scheduling
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/rate-monotonic" className="text-blue-500 underline">
                  Rate Monotonic Scheduling
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/edf" className="text-blue-500 underline">
                  Earliest Deadline First
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">
              Disk Scheduling
            </h3>

            <ul className="space-y-2 text-gray-600">
              <li>
                •{" "}
                <Link to="/fifo" className="text-blue-500 underline">
                  FIFO
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/sstf" className="text-blue-500 underline">
                  SSTF
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/scan" className="text-blue-500 underline">
                  SCAN
                </Link>
              </li>
                <li>
                •{" "}
                <Link to="/cscan" className="text-blue-500 underline">
                  CSCAN
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/look" className="text-blue-500 underline">
                  LOOK
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/clook" className="text-blue-500 underline">
                  CLOOK
                </Link>
              </li>
              <li>
                •{" "}
                <Link to="/LIFO" className="text-blue-500 underline">
                  LIFO
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section className="bg-gray-100 py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Technologies Used
        </h2>

        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-10 text-center">
          <div className="bg-white p-8 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">React</h3>
            <p className="text-gray-600 text-sm">
              Component-based frontend framework used to build the interface.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">Vite</h3>
            <p className="text-gray-600 text-sm">
              Fast build tool used for modern frontend development.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">Tailwind CSS</h3>
            <p className="text-gray-600 text-sm">
              Utility-first CSS framework used for responsive UI design.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">DaisyUI</h3>
            <p className="text-gray-600 text-sm">
              A prebuild component library of tailwind css.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Project Mission</h2>

        <p className="max-w-3xl text-justify mx-auto text-gray-600 text-lg">
          The goal of this project is to simplify operating system education by
          providing an interactive platform where students can experiment with
          algorithms and understand their behavior visually instead of only
          studying theoretical concepts.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p className="text-sm">
          © {new Date().getFullYear()} OS Simulator — Built for learning
          Operating System algorithms.
        </p>
      </footer>
    </div>
  );
};

export default About;
