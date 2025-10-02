import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RegistrationProvider } from "./context/RegistrationContext";
import Navbar from "./components/Navbar";
import Featured from "./components/Featured";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import LoginPage from "./pages/LoginPage";
import ParentRegistration, {
  CompanyRegistration,
  FreelancerRegistration,
} from "./pages/ParentRegistration";
import SimpleCompanyRegistration from "./pages/SimpleCompanyRegistration";
import CompanyDashboard from "./pages/CompanyDashboard";
import EditCompanyProfile from "./pages/EditCompanyProfile";
import EditFreelancerProfile from "./pages/EditFreelancerProfile";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import MyApplications from "./pages/MyApplications";
import Projects from "./pages/Projects";
import "./App.css";

// Component to conditionally render Navbar, Featured, and Footer
const AppContent = () => {
  const location = useLocation();

  // Pages where Navbar, Featured, and Footer should NOT be displayed
  const noLayoutPages = ["/register"];

  // Pages where only registration steps should not show layout
  const registrationStepPages = [
    "/register/company/step1",
    "/register/company/step2",
    "/register/company/step3",
    "/register/freelancer/step1",
    "/register/freelancer/step2",
    "/register/freelancer/step3",
    "/company-registration", // Add direct company registration
    "/freelancer-registration", // Add direct freelancer registration
  ];

  // Check if current path should show full layout
  const shouldShowLayout =
    !noLayoutPages.some((path) => location.pathname === path) &&
    !registrationStepPages.some((path) => location.pathname === path);

  // Check if current path should show navbar only (for dashboard pages)
  const dashboardPages = [
    "/company-dashboard",
    "/freelancer-dashboard",
    "/edit-company-profile",
    "/edit-freelancer-profile",
    "/jobs",
    "/post-job",
    "/my-applications",
    "/projects",
  ];

  const isDashboardPage = dashboardPages.some(
    (path) => location.pathname === path
  );

  // Show Featured component only on home page
  const shouldShowFeatured = location.pathname === "/";

  return (
    <div className="App">
      {/* Conditionally render Navbar */}
      {shouldShowLayout && <Navbar />}

      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <div>
              <Hero />
              <Featured />
            </div>
          }
        />

        {/* Authentication & Registration Routes - Integrated Login */}
        <Route path="/register" element={<ParentRegistration />} />
        <Route path="/register/company/*" element={<CompanyRegistration />} />
        <Route
          path="/register/freelancer/*"
          element={<FreelancerRegistration />}
        />

        {/* ADDED: Direct registration routes */}
        <Route
          path="/company-registration"
          element={<SimpleCompanyRegistration />}
        />

        {/* Dashboard Routes */}
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/freelancer-dashboard" element={<Jobs />} />

        {/* Profile Routes */}
        <Route path="/edit-company-profile" element={<EditCompanyProfile />} />
        <Route
          path="/edit-freelancer-profile"
          element={<EditFreelancerProfile />}
        />

        {/* Job Routes */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/projects" element={<Projects />} />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <div>
              <Hero />
              <Featured />
            </div>
          }
        />
      </Routes>

      {/* Conditionally render Footer */}
      {shouldShowLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <Router>
          <AppContent />
        </Router>
      </RegistrationProvider>
    </AuthProvider>
  );
}

export default App;
