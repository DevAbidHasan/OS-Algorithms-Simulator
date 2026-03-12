import React from "react";

const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-900 text-white text-center py-6">
        <p className="text-sm">
          © {new Date().getFullYear()} OS Simulator — Built for learning
          Operating System algorithms.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
