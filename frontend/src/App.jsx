import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { RegistrationProvider } from "./context/RegistrationContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Featured from "./components/Featured";
import TechTrends from "./components/TechTrends"; 
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import AIChatbot from "./components/AIChatbot";
import LoginPage from "./pages/LoginPage";
import ParentRegistration, {
  CompanyRegistration,
  FreelancerRegistration,
} from "./pages/ParentRegistration";
import SimpleCompanyRegistration from "./pages/SimpleCompanyRegistration";
import CompanyDashboard from "./pages/CompanyDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import EditCompanyProfile from "./pages/EditCompanyProfile";
import EditFreelancerProfile from "./pages/EditFreelancerProfile";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import MyApplications from "./pages/MyApplications";
import Projects from "./pages/Projects";
import Messages from "./pages/Messages";
import "./App.css";

const AppContent = () => {
  const location = useLocation();

  const noLayoutPages = ["/register"];
  const registrationStepPages = [
    "/register/company/step1",
    "/register/company/step2",
    "/register/company/step3",
    "/register/freelancer/step1",
    "/register/freelancer/step2",
    "/register/freelancer/step3",
    "/company-registration",
    "/freelancer-registration",
  ];
  const noFooterPages = ["/messages"];

  const shouldShowLayout =
    !noLayoutPages.some((path) => location.pathname === path) &&
    !registrationStepPages.some((path) => location.pathname === path);

  const shouldShowFooter =
    shouldShowLayout &&
    !noFooterPages.some((path) => location.pathname === path);

  return (
    <div className="App">
      {shouldShowLayout && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Hero />
              <TechTrends /> {/* ✅ ADD THIS - Shows before Featured */}
              <Featured />
            </div>
          }
        />
        <Route path="/register" element={<ParentRegistration />} />
        <Route path="/register/company/*" element={<CompanyRegistration />} />
        <Route
          path="/register/freelancer/*"
          element={<FreelancerRegistration />}
        />
        <Route
          path="/company-registration"
          element={<SimpleCompanyRegistration />}
        />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
        <Route path="/edit-company-profile" element={<EditCompanyProfile />} />
        <Route
          path="/edit-freelancer-profile"
          element={<EditFreelancerProfile />}
        />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/messages" element={<Messages />} />
        <Route
          path="*"
          element={
            <div>
              <Hero />
              <TechTrends /> {/* ✅ ADD THIS */}
              <Featured />
            </div>
          }
        />
      </Routes>

      {shouldShowFooter && <Footer />}

      <AIChatbot />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
