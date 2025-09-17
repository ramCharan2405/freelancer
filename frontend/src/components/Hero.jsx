import React from "react";
import leftImage from "../assets/image-left.png";
import rightImage from "../assets/image-right.png";

const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center px-4 py-8 md:py-15">
      {/* Container */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-5xl flex flex-col md:flex-row items-center overflow-hidden transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_40px_0_rgba(0,175,70,0.25)]">
        {/* Left Image Section */}
        <div className="hidden md:flex flex-col space-y-4 p-4">
          <img
            src={leftImage}
            alt="left"
            className="w-35 h-100 rounded-lg object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="flex-1 p-6 md:p-12 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 leading-tight">
            Discover opportunities and{" "}
            <span className="text-[#00af46]">grow your career</span> with us
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            Connect with top companies or talented freelancers. Let smart tools
            help you find the perfect match for your next big project.
          </p>
          {/* Button */}
          <div className="mt-6">
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full flex items-center mx-auto">
              🚀 Experience the future of work
            </button>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="hidden md:flex flex-col space-y-4 p-4">
          <img
            src={rightImage}
            alt="right"
            className="w-35 h-100 rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 flex flex-col md:flex-row items-center justify-center text-gray-700 space-y-4 md:space-y-0 md:space-x-4">
        <p className="text-lg">
          Your next project or job is just a click away.
        </p>
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:from-green-600 hover:to-green-700 hover:scale-105 transition duration-300 ease-in-out">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Hero;
