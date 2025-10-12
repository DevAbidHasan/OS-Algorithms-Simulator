import React, { useState } from "react";
import { Link } from "react-router";

const Menu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);
  const [periodicOpen, setPeriodicOpen] = useState(false);
  const [aperiodicOpen, setAperiodicOpen] = useState(false);
  const [discOpen, setDiscOpen] = useState(false);

  return (
    <nav className="h-[70px] relative w-full px-6 md:px-16 lg:px-24 xl:px-32 flex items-center justify-between z-30 bg-gradient-to-r from-indigo-700 to-violet-500 transition-all">
      {/* Logo */}
      <Link className="text-white font-bold text-lg md:text-3xl" to="/">
        OS Simulator
      </Link>

      {/* Desktop Menu */}
      <ul className="text-white md:flex hidden items-center gap-10 relative">
        <li>
          <Link className="hover:text-white/70 transition" to="/">
            Home
          </Link>
        </li>

        {/* Process Scheduling */}
        <li className="relative group">
          <button
            className="flex items-center gap-1 hover:text-white/70 transition"
            onClick={() => setProcessOpen(!processOpen)}
          >
            Process Scheduling
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transform transition-transform ${
                processOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {processOpen && (
            <ul className="absolute bg-white text-gray-800 mt-2 w-60 rounded-xl shadow-lg overflow-hidden z-40">
              {/* Periodic Section */}
              <li className="relative group">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => setPeriodicOpen(!periodicOpen)}
                >
                  Periodic
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transform transition-transform ${
                      periodicOpen ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {periodicOpen && (
                  <ul className="bg-white text-gray-700 w-60 mt-1 ml-2 rounded-lg shadow-lg overflow-hidden">
                    <li>
                      <Link
                        to="/basic-static"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Basic Static Scheduling
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/rate-monotonic"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Rate Monotonic Scheduling
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/edf"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Earliest Deadline First
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Aperiodic Section */}
              <li className="relative group">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => setAperiodicOpen(!aperiodicOpen)}
                >
                  Aperiodic
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transform transition-transform ${
                      aperiodicOpen ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {aperiodicOpen && (
                  <ul className="bg-white text-gray-700 w-60 mt-1 ml-2 rounded-lg shadow-lg overflow-hidden">
                    <li>
                      <Link to="/fcfs" className="block px-4 py-2 hover:bg-gray-100">
                        FCFS
                      </Link>
                    </li>
                    <li>
                      <Link to="/sjf" className="block px-4 py-2 hover:bg-gray-100">
                        SJF
                      </Link>
                    </li>
                    <li>
                      <Link to="/srtf" className="block px-4 py-2 hover:bg-gray-100">
                        SRTF
                      </Link>
                    </li>
                    <li>
                      <Link to="/rr" className="block px-4 py-2 hover:bg-gray-100">
                        Round Robin
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/priority"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Priority Scheduling
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          )}
        </li>

        {/* Bankers Algorithm */}
        <li>
          <Link className="hover:text-white/70 transition" to="/bankers-algorithm">
            Bankers Algorithm
          </Link>
        </li>

        {/* Disc Scheduling */}
        <li className="relative group">
          <button
            className="flex items-center gap-1 hover:text-white/70 transition"
            onClick={() => setDiscOpen(!discOpen)}
          >
            Disc Scheduling
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transform transition-transform ${
                discOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {discOpen && (
            <ul className="absolute bg-white text-gray-800 mt-2 w-56 rounded-xl shadow-lg overflow-hidden z-40">
              {[
                "FIFO",
                "SSTF",
                "SCAN",
                "CSCAN",
                "LOOK",
                "CLOOK",
                "LIFO",
              ].map((algo, index) => (
                <li key={index}>
                  <Link
                    to={`/${algo.toLowerCase()}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    {algo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>

      {/* Desktop Button */}
       <a href="#cta" className="hover:text-blue-600 text-black bg-white px-6 py-1.5 rounded-3xl transition">
            Contact
          </a>

      {/* Mobile Menu Button */}
      <button
        aria-label="menu-btn"
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="menu-btn inline-block md:hidden active:scale-90 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="#fff"
        >
          <path d="M3 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2z" />
        </svg>
      </button>

      {/* Mobile Menu */}
      <div
        className={`absolute top-[70px] left-0 w-full bg-gradient-to-r from-indigo-700 to-violet-500 p-6 transition-all duration-300 ${
          menuOpen ? "block" : "hidden"
        } md:hidden`}
      >
        <ul className="flex flex-col space-y-4 text-white text-lg">
          <li>
            <Link
              onClick={() => setMenuOpen(false)}
              to="/"
              className="text-sm hover:text-white/70"
            >
              Home
            </Link>
          </li>

          {/* Process Scheduling Mobile Nested */}
          <li>
            <button
              className="flex items-center justify-between w-full text-left text-sm hover:text-white/70"
              onClick={() => setProcessOpen(!processOpen)}
            >
              Process Scheduling
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transform transition-transform ${
                  processOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {processOpen && (
              <div className="pl-4 mt-2 space-y-2">
                {/* Periodic */}
                <button
                  className="flex items-center justify-between w-full text-left text-sm hover:text-white/70"
                  onClick={() => setPeriodicOpen(!periodicOpen)}
                >
                  Periodic
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transform transition-transform ${
                      periodicOpen ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {periodicOpen && (
                  <ul className="pl-4 mt-1 space-y-1">
                    <li>
                      <Link to="/basic-static">Basic Static Scheduling</Link>
                    </li>
                    <li>
                      <Link to="/rate-monotonic">Rate Monotonic Scheduling</Link>
                    </li>
                    <li>
                      <Link to="/edf">Earliest Deadline First</Link>
                    </li>
                  </ul>
                )}

                {/* Aperiodic */}
                <button
                  className="flex items-center justify-between w-full text-left text-sm hover:text-white/70"
                  onClick={() => setAperiodicOpen(!aperiodicOpen)}
                >
                  Aperiodic
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transform transition-transform ${
                      aperiodicOpen ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {aperiodicOpen && (
                  <ul className="pl-4 mt-1 space-y-1">
                    <li>
                      <Link to="/fcfs">FCFS</Link>
                    </li>
                    <li>
                      <Link to="/sjf">SJF</Link>
                    </li>
                    <li>
                      <Link to="/srtf">SRTF</Link>
                    </li>
                    <li>
                      <Link to="/rr">Round Robin</Link>
                    </li>
                    <li>
                      <Link to="/priority">Priority Scheduling</Link>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </li>

          {/* Bankers Algorithm */}
          <li>
            <Link
              onClick={() => setMenuOpen(false)}
              to="/bankers-algorithm"
              className="text-sm hover:text-white/70"
            >
              Bankers Algorithm
            </Link>
          </li>

          {/* Disc Scheduling Mobile */}
          <li>
            <button
              className="flex items-center justify-between w-full text-left text-sm hover:text-white/70"
              onClick={() => setDiscOpen(!discOpen)}
            >
              Disc Scheduling
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transform transition-transform ${
                  discOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {discOpen && (
              <ul className="pl-4 mt-2 space-y-1">
                {[
                  "FIFO",
                  "SSTF",
                  "SCAN",
                  "CSCAN",
                  "LOOK",
                  "CLOOK",
                  "LIFO",
                ].map((algo, index) => (
                  <li key={index}>
                    <Link to={`/${algo.toLowerCase()}`}>{algo}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Menu;
