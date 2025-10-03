import React from "react";
import ChatList from "../components/ChatList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FreelancerDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Freelancer Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2">{}</div>

          {}
          <div className="lg:col-span-1">
            <ChatList />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreelancerDashboard;
