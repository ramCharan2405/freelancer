import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust the path as needed

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { role: routeRole } = useParams();
  const [role, setRole] = useState(routeRole || "company");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when typing

  };

  useEffect(() => {
    if (routeRole !== "company" && routeRole !== "freelancer") {
      setRole("company"); 
    }
  }, [routeRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        role === "company"
          ? "http://localhost:8000/api/companies/login"
          : "http://localhost:8000/api/freelancers/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Allow cookies
        body: JSON.stringify({
          email: formData.email.trim(), // Trim whitespace
          password: formData.password.trim(), // Trim whitespace
        }),
      });
      if (response.ok) {
        const data = await response.json();
       
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);        // if needed
        localStorage.setItem("userModel", data.model);  // "Freelancer" or "Company"
        localStorage.setItem("userId", data.userId);

        login();
        navigate("/");

      } else {
        setError( "Login failed. Please try again.");
      }
    } catch (error) {
      setError("Server error. Please try again later: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <hr className="border-gray-300 my-4" />

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleLogin}>
          {/* Role Info - Hidden Input or Display */}
          <div className="mb-4">
            <label className="block text-md text-green-800">Logging in as {role}</label>
            <p className="text-md font-medium capitalize"></p>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-lg font-semibold">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded-lg focus:outline-none"
              value={formData.email.toLowerCase()}
              onChange={handleChange}
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-lg font-semibold">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg focus:outline-none"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;