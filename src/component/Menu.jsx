import React, { useState } from "react";
import { Link } from "react-router";

const Menu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const [mobileProcessOpen, setMobileProcessOpen] = useState(false);
  const [mobileDiskOpen, setMobileDiskOpen] = useState(false);

  const closeMenus = () => {
    setActiveMenu(null);
    setMenuOpen(false);
    setMobileProcessOpen(false);
    setMobileDiskOpen(false);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="h-[70px] w-full px-6 md:px-16 lg:px-24 xl:px-32 flex items-center justify-between bg-gradient-to-r from-indigo-700 to-violet-500 text-white shadow-lg relative z-40">

        {/* Logo */}
        <Link
          to="/"
          onMouseEnter={() => setActiveMenu(null)}
          className="font-bold text-lg md:text-3xl tracking-wide"
        >
          OS Simulator
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-10 font-medium">

          <li>
            <Link
              to="/"
              onMouseEnter={() => setActiveMenu(null)}
              className="hover:text-white/70 transition"
            >
              Home
            </Link>
          </li>

          {/* Process Scheduling */}
          <li
            className="flex items-center gap-1 cursor-pointer hover:text-white/70"
            onMouseEnter={() => setActiveMenu("process")}
          >
            Process Scheduling

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transform transition ${
                activeMenu === "process" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </li>

          {/* Bankers */}
          <li>
            <Link
              to="/bankers-algorithm"
              onMouseEnter={() => setActiveMenu(null)}
              className="hover:text-white/70 transition"
            >
              Bankers Algorithm
            </Link>
          </li>

          {/* Disk Scheduling */}
          <li
            className="flex items-center gap-1 cursor-pointer hover:text-white/70"
            onMouseEnter={() => setActiveMenu("disk")}
          >
            Disk Scheduling

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transform transition ${
                activeMenu === "disk" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </li>

        </ul>

        {/* Contact */}
        <Link
          to="about"
          className="btn btn-secondary w-[120px]"
        >
          About
        </Link>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>

      </nav>

      {/* PROCESS DRAWER */}
      {activeMenu === "process" && (
        <div
          onMouseEnter={() => setActiveMenu("process")}
          onMouseLeave={() => setActiveMenu(null)}
          className="absolute top-[70px] left-0 w-full bg-white shadow-2xl border-t z-30"
        >
          <div className="max-w-7xl mx-auto px-10 py-12 grid md:grid-cols-2 gap-16">

            {/* Periodic */}
            <div>
              <h3 className="text-lg font-semibold text-purple-500 mb-6">
                Periodic Scheduling
              </h3>

              <ul className="space-y-3 text-gray-600">

                <li>
                  <Link onClick={closeMenus} to="/basic-static"
                  className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600">
                    Basic Static Scheduling
                  </Link>
                </li>

                <li>
                  <Link onClick={closeMenus} to="/rate-monotonic"
                  className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600">
                    Rate Monotonic Scheduling
                  </Link>
                </li>

                <li>
                  <Link onClick={closeMenus} to="/edf"
                  className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600">
                    Earliest Deadline First
                  </Link>
                </li>

              </ul>
            </div>

            {/* Aperiodic */}
            <div>
              <h3 className="text-lg font-semibold text-purple-500 mb-6">
                Aperiodic Scheduling
              </h3>

              <ul className="space-y-3 text-gray-600">

                <li><Link onClick={closeMenus} to="/fcfs" className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600">FCFS</Link></li>

                <li><Link onClick={closeMenus} to="/sjf" className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600">SJF</Link></li>

                <li><Link onClick={closeMenus} to="/srtf" className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600">SRTF</Link></li>

                <li><Link onClick={closeMenus} to="/rr" className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600">Round Robin</Link></li>

                <li><Link onClick={closeMenus} to="/priority" className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600">Priority Scheduling</Link></li>

              </ul>
            </div>

          </div>
        </div>
      )}

      {/* DISK DRAWER */}
      {activeMenu === "disk" && (
        <div
          onMouseEnter={() => setActiveMenu("disk")}
          onMouseLeave={() => setActiveMenu(null)}
          className="absolute top-[70px] left-0 w-full bg-white shadow-2xl border-t z-30"
        >
          <div className="max-w-7xl mx-auto px-10 py-12">

            <h3 className="text-lg font-semibold text-center text-purple-600 mb-6">
              Disk Scheduling Algorithms
            </h3>

            <ul className="space-y-3 grid grid-cols-2 text-center text-gray-600">

              {["FIFO","SSTF","SCAN","CSCAN","LOOK","CLOOK","LIFO"].map((algo,index)=>(
                <li key={index}>
                  <Link
                    to={`/${algo.toLowerCase()}`}
                    onClick={closeMenus}
                    className="hover:bg-gray-200 p-1 text-md rounded-md hover:text-indigo-600"
                  >
                    {algo}
                  </Link>
                </li>
              ))}

            </ul>

          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-gradient-to-r from-indigo-700 to-violet-500 text-white p-6 space-y-4">

         <div className="">
           <Link className="" onClick={closeMenus} to="/">Home</Link>
         </div>
        
          <div className="border-t border-white/30 pt-4">
            <Link onClick={closeMenus} to="/bankers-algorithm">
            Bankers Algorithm
          </Link>
          </div>

          {/* Process */}
          <div className="border-t border-white/30 pt-4">

            <button
              onClick={() => setMobileProcessOpen(!mobileProcessOpen)}
              className="flex justify-between w-full font-semibold"
            >
              Process Scheduling
              <span>{mobileProcessOpen ? "−" : "+"}</span>
            </button>

            {mobileProcessOpen && (
              <div className="pl-4 mt-3 grid grid-cols-1 space-y-2 text-sm">

                <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" onClick={closeMenus} to="/basic-static">Basic Static</Link>
                <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" onClick={closeMenus} to="/rate-monotonic">Rate Monotonic</Link>
                <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" onClick={closeMenus} to="/edf">EDF</Link>
                <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" onClick={closeMenus} to="/fcfs">FCFS</Link>
                <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" onClick={closeMenus} to="/sjf">SJF</Link>
                <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" onClick={closeMenus} to="/srtf">SRTF</Link>
                <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" onClick={closeMenus} to="/rr">Round Robin</Link>
                <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" onClick={closeMenus} to="/priority">Priority</Link>

              </div>
            )}

          </div>

          {/* Disk */}
          <div className="border-t border-white/30 pt-4">

            <button
              onClick={() => setMobileDiskOpen(!mobileDiskOpen)}
              className="flex justify-between w-full font-semibold"
            >
              Disk Scheduling
              <span>{mobileDiskOpen ? "−" : "+"}</span>
            </button>

            {mobileDiskOpen && (
              <div className="pl-4 mt-3  grid grid-cols-1 space-y-2 text-sm">

                {["FIFO","SSTF","SCAN","CSCAN","LOOK","CLOOK","LIFO"].map((algo,index)=>(
                  <Link className="bg-indigo-400 p-2 rounded-md hover:bg-indigo-500 transition-all duration-200 font-semibold" key={index} onClick={closeMenus} to={`/${algo.toLowerCase()}`}>
                    {algo}
                  </Link>
                ))}

              </div>
            )}

          </div>
          <div className="btn btn-secondary w-full">
            About
          </div>

        </div>
      )}
    </>
  );
};

export default Menu;