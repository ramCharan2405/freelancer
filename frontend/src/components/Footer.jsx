import React from "react";
import { FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white/95 backdrop-blur-xl border-t border-green-100 px-8 py-10 rounded-t-3xl shadow-2xl">
      {/* Navigation Links */}
      <div className="flex flex-wrap justify-center gap-8 text-base text-green-700 mb-6 font-semibold tracking-wide">
        <a href="#" className="hover:text-green-500 hover:underline transition">
          Categories
        </a>
        <a href="#" className="hover:text-green-500 hover:underline transition">
          For Clients
        </a>
        <a href="#" className="hover:text-green-500 hover:underline transition">
          For Freelancers
        </a>
        <a href="#" className="hover:text-green-500 hover:underline transition">
          Business Solutions
        </a>
        <a href="#" className="hover:text-green-500 hover:underline transition">
          Admin
        </a>
        <a href="#" className="hover:text-green-500 hover:underline transition">
          Company
        </a>
      </div>

      {/* Divider */}
      <hr className="border-green-200 my-6" />

      {/* Logo & Tagline */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-3 shadow-lg">
            <span className="text-white font-bold text-2xl tracking-tight">
              F
            </span>
          </div> */}
          <p className="text-green-700 text-lg font-semibold">
            The World's Top Talent, On Demand{" "}
            <span className="text-green-400">®</span>
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-5 mt-6 md:mt-0">
          <a
            href="#"
            className="bg-green-100 hover:bg-green-500 hover:text-white text-green-600 rounded-full p-2 shadow transition"
          >
            <FaLinkedin size={22} />
          </a>
          <a
            href="#"
            className="bg-green-100 hover:bg-green-500 hover:text-white text-green-600 rounded-full p-2 shadow transition"
          >
            <FaInstagram size={22} />
          </a>
          <a
            href="#"
            className="bg-green-100 hover:bg-green-500 hover:text-white text-green-600 rounded-full p-2 shadow transition"
          >
            <FaFacebook size={22} />
          </a>
          <a
            href="#"
            className="bg-green-100 hover:bg-green-500 hover:text-white text-green-600 rounded-full p-2 shadow transition"
          >
            <FaYoutube size={22} />
          </a>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-green-200 my-6" />

      {/* Copyright & Policies */}
      <div className="text-center text-xs text-green-700 tracking-wide">
        <p className="mb-1">© 2010 - 2025 FreelanceHub. All rights reserved.</p>
        <p>
          <a
            href="#"
            className="hover:underline hover:text-green-500 transition"
          >
            Privacy Policy
          </a>{" "}
          |{" "}
          <a
            href="#"
            className="hover:underline hover:text-green-500 transition"
          >
            Website Terms
          </a>{" "}
          |{" "}
          <a
            href="#"
            className="hover:underline hover:text-green-500 transition"
          >
            Accessibility
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
