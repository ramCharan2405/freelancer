import React, { useEffect, useRef, useState } from "react";
import {
  FaDesktop,
  FaPenNib,
  FaCode,
  FaBullhorn,
  FaChartLine,
  FaVideo,
} from "react-icons/fa";
import { useInView } from "framer-motion";

const categories = [
  {
    name: "Graphics & Design",
    icon: <FaPenNib className="text-green-500 text-3xl mb-2" />,
  },
  {
    name: "Digital Marketing",
    icon: <FaBullhorn className="text-green-500 text-3xl mb-2" />,
  },
  {
    name: "Writing & Translation",
    icon: <FaDesktop className="text-green-500 text-3xl mb-2" />,
  },
  {
    name: "Programming & Tech",
    icon: <FaCode className="text-green-500 text-3xl mb-2" />,
  },
  {
    name: "Business & Finance",
    icon: <FaChartLine className="text-green-500 text-3xl mb-2" />,
  },
  {
    name: "Video & Animation",
    icon: <FaVideo className="text-green-500 text-3xl mb-2" />,
  },
];

// Counter animation hook
const useCounter = (end, inView, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration / 20);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return count;
};

const Featured = () => {
  const statsRef = useRef(null);
  const inView = useInView(statsRef, { once: true });

  const freelancers = useCounter(3000000, inView);
  const earnings = useCounter(150000000, inView);
  const minutes = useCounter(10, inView);

  return (
    <div className="p-6 md:p-12 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl shadow-lg">
      {/* Heading */}
      <h2 className="text-3xl font-extrabold text-center text-green-700 mb-8 tracking-tight">
        Browse Talent by Category
      </h2>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-center max-w-4xl mx-auto mb-10">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-7 flex flex-col items-center justify-center shadow-lg hover:shadow-2xl transition duration-200 border border-green-100 hover:border-green-300 cursor-pointer group"
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              {category.icon}
            </div>
            <h3 className="text-green-700 font-semibold text-base mt-2 group-hover:text-green-900 transition">
              {category.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Statistics Section */}
      <div
        ref={statsRef}
        className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white rounded-xl shadow-md py-6 px-4 md:px-12 max-w-3xl mx-auto"
      >
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-bold text-green-600">
            {freelancers.toLocaleString()}
          </span>
          <span className="text-gray-600 text-sm mt-1">Freelancers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-bold text-green-600">
            ${earnings.toLocaleString()}
          </span>
          <span className="text-gray-600 text-sm mt-1">Total Earnings</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-bold text-green-600">
            {minutes} min
          </span>
          <span className="text-gray-600 text-sm mt-1">Avg. Hiring Time</span>
        </div>
      </div>
    </div>
  );
};

export default Featured;
