import React from "react";
import { FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 bg-slate-800/40 backdrop-blur-2xl border-t border-emerald-500/20 px-8 py-12 shadow-2xl">
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-8 text-base text-gray-400 mb-8 font-medium">
          <a
            href="#"
            className="hover:text-emerald-400 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-emerald-500/10 backdrop-blur-sm border border-transparent hover:border-emerald-500/20"
          >
            Categories
          </a>
          <a
            href="#"
            className="hover:text-emerald-400 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-emerald-500/10 backdrop-blur-sm border border-transparent hover:border-emerald-500/20"
          >
            For Clients
          </a>
          <a
            href="#"
            className="hover:text-emerald-400 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-emerald-500/10 backdrop-blur-sm border border-transparent hover:border-emerald-500/20"
          >
            For Freelancers
          </a>
          <a
            href="#"
            className="hover:text-emerald-400 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-emerald-500/10 backdrop-blur-sm border border-transparent hover:border-emerald-500/20"
          >
            Business Solutions
          </a>
          <a
            href="#"
            className="hover:text-emerald-400 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-emerald-500/10 backdrop-blur-sm border border-transparent hover:border-emerald-500/20"
          >
            Admin
          </a>
          <a
            href="#"
            className="hover:text-emerald-400 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-emerald-500/10 backdrop-blur-sm border border-transparent hover:border-emerald-500/20"
          >
            Company
          </a>
        </div>

        {/* Divider */}
        <hr className="border-emerald-500/20 my-8" />

        {/* Logo & Tagline */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl p-4 shadow-2xl border border-emerald-500/30">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <p className="text-gray-200 text-xl font-semibold">
              The World's Top Talent, On Demand{" "}
              <span className="text-emerald-400">®</span>
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-6 md:mt-0">
            <a
              href="#"
              className="group bg-slate-700/60 backdrop-blur-2xl hover:bg-gradient-to-r hover:from-emerald-400 hover:to-teal-500 text-gray-400 hover:text-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3 border border-emerald-500/20 hover:border-emerald-400/40"
            >
              <FaLinkedin
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </a>
            <a
              href="#"
              className="group bg-slate-700/60 backdrop-blur-2xl hover:bg-gradient-to-r hover:from-teal-400 hover:to-lime-500 text-gray-400 hover:text-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3 border border-emerald-500/20 hover:border-emerald-400/40"
            >
              <FaInstagram
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </a>
            <a
              href="#"
              className="group bg-slate-700/60 backdrop-blur-2xl hover:bg-gradient-to-r hover:from-lime-400 hover:to-emerald-500 text-gray-400 hover:text-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3 border border-emerald-500/20 hover:border-emerald-400/40"
            >
              <FaFacebook
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </a>
            <a
              href="#"
              className="group bg-slate-700/60 backdrop-blur-2xl hover:bg-gradient-to-r hover:from-emerald-400 hover:to-lime-500 text-gray-400 hover:text-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3 border border-emerald-500/20 hover:border-emerald-400/40"
            >
              <FaYoutube
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </a>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-emerald-500/20 my-8" />

        {/* Copyright & Policies */}
        <div className="text-center text-sm text-gray-500">
          <p className="mb-3">
            © 2010 - 2025 FreelanceHub. All rights reserved.
          </p>
          <p className="space-x-4">
            <a
              href="#"
              className="hover:text-emerald-400 hover:underline transition-all duration-300"
            >
              Privacy Policy
            </a>
            <span>|</span>
            <a
              href="#"
              className="hover:text-emerald-400 hover:underline transition-all duration-300"
            >
              Website Terms
            </a>
            <span>|</span>
            <a
              href="#"
              className="hover:text-emerald-400 hover:underline transition-all duration-300"
            >
              Accessibility
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
