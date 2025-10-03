import React, { useState } from "react";

const FreelancerDetails = () => {
  const [activeTab, setActiveTab] = useState("pastWork");

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-100">
      {}
      <div className="flex gap-4 mb-8 justify-center">
        {[
          { key: "pastWork", label: "Past Work" },
          { key: "pendingAmount", label: "Pending Amount/Project" },
          { key: "companies", label: "Companies Worked For" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-7 py-2 rounded-full font-semibold transition-all shadow ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white scale-105"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {}
      <div className="bg-green-50 p-8 rounded-2xl shadow-inner min-h-[120px] text-green-900 font-medium text-lg flex items-center justify-center">
        {activeTab === "pastWork" && <p>Show past work details here...</p>}
        {activeTab === "pendingAmount" && (
          <p>Show pending amount & projects here...</p>
        )}
        {activeTab === "companies" && <p>List of companies worked for...</p>}
      </div>

      {}
      <div className="mt-8 flex justify-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-md px-5 py-3 border border-green-200 rounded-full shadow focus:outline-none focus:border-green-500 transition text-green-700 bg-white"
        />
      </div>
    </div>
  );
};

export default FreelancerDetails;
