import React from "react";
import { Link } from "react-router";

const Hero = () => {
  return (
    <section className="bg-gradient-to-r pb-5 from-indigo-700 via-purple-700 to-violet-500 text-white min-h-[90vh] flex items-center justify-center px-6 md:px-16 lg:px-24 xl:px-32 relative overflow-hidden">
      {/* Decorative Background Blurs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-violet-400/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 w-full max-w-6xl">
        {/* Left Text Section */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 drop-shadow-lg">
            Master Operating System Concepts <br />
            <span className="text-yellow-300">Through Simulation</span>
          </h1>
          <p className="text-white/80 max-w-lg mx-auto lg:mx-0 mb-8 text-lg">
            Understand CPU scheduling, deadlock handling, and disk management
            algorithms through hands-on interactive simulations designed for
            Operating Systems Laboratory courses.
          </p>

          <div className="flex justify-center lg:justify-start gap-4">
            <Link
              to="/modules"
              className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Start Simulation
            </Link>
            <a target="_blank"
              href="https://github.com/DevAbidHasan/OS-Algorithms-Simulator"
              className="border border-white text-white px-6 py-3 rounded-full hover:bg-white/10 transition duration-300"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right Illustration Section */}
        <div className="flex-1 flex justify-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/9079/9079927.png"
            alt="OS Simulation"
            className="w-80 md:w-96 lg:w-[28rem] hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
