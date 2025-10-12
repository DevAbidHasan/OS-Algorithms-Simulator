import React from "react";
import CountUp from "react-countup";
import { FaUsers, FaCrown, FaUserCheck } from "react-icons/fa";

const communityStats = [
  {
    title: "Total Users",
    count: 3500,
    icon: <FaUsers className="text-4xl text-indigo-600 mb-4" />,
    text: "Learners and enthusiasts exploring operating system simulations worldwide.",
  },
  {
    title: "Premium Users",
    count: 780,
    icon: <FaCrown className="text-4xl text-yellow-500 mb-4" />,
    text: "Members with early access to advanced simulation tools and features.",
  },
  {
    title: "Active Contributors",
    count: 120,
    icon: <FaUserCheck className="text-4xl text-green-600 mb-4" />,
    text: "Community members actively contributing to OS projects and improvements.",
  },
];

const Community = () => {
  return (
    <section className="bg-white py-20 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Community & Users
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A growing community of students, developers, and researchers learning and experimenting with real OS concepts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {communityStats.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 p-10 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
          >
            <div className="flex justify-center">{item.icon}</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {item.title}
            </h3>
            <div className="text-4xl font-extrabold text-indigo-600 mb-3">
              <CountUp end={item.count} duration={2.5} />
              +
            </div>
            <p className="text-gray-600 text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Community;
