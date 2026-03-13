import { useState, useEffect } from "react";
import { MdKeyboardDoubleArrowUp  } from "react-icons/md";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 z-50 p-2 hover:cursor-pointer rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 transition"
        >
          <MdKeyboardDoubleArrowUp size={25} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;