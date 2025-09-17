import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Hero from "./components/Hero";
import Featured from "./components/Featured";

import Footer from "./components/Footer";

import Projects from "./pages/Projects";
import LoginPage from "./pages/LoginPage";

import CompanyRegistration from "./pages/CompanyRegistration";

import Step1 from "./pages/Step1";
import Step2 from "./pages/Step2";
import Step3 from "./pages/Step3";
import Login from "./components/login";
import { RegistrationProvider } from "./context/RegistrationContext"; // Adjust the import path as necessary

import AddFreelancerProject from "./components/AddFreelancerProject";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Featured />
                </>
              }
            />
            <Route path="/projects" element={<Projects />} />

            <Route path="/loginPage" element={<LoginPage />} />

            <Route
              path="/company-registration"
              element={<CompanyRegistration />}
            />

            <Route path="/freelancer-registration" element={<Step1 />} />
            <Route path="/freelancer-personal-details" element={<Step2 />} />
            <Route path="/freelancer-skills" element={<Step3 />} />

            <Route path="/login/:role" element={<Login />} />
            <Route
              path="/add-freelancerproject"
              element={<AddFreelancerProject />}
            />
          </Routes>
          <Footer />
        </Router>
      </RegistrationProvider>
    </AuthProvider>
  );
}

export default App;
