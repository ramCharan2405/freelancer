// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    // Check for existing auth on mount
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        const userId = localStorage.getItem("userId");
        const userRole = localStorage.getItem("userRole");

        console.log("🔍 AuthContext Init:", {
          hasToken: !!token,
          hasUser: !!storedUser,
          userId,
          userRole,
          timestamp: new Date().toISOString(),
        });

        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);

            // Ensure role is set
            if (!parsedUser.role && userRole) {
              parsedUser.role = userRole;
            }

            // Ensure id is set
            if (!parsedUser.id && userId) {
              parsedUser.id = userId;
            }

            console.log("✅ Restoring auth state:", {
              userId: parsedUser.id,
              email: parsedUser.email,
              role: parsedUser.role,
              name: parsedUser.fullName || parsedUser.companyName,
            });

            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("❌ Error parsing stored user:", parseError);
            // Clear corrupted data
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userRole");
          }
        } else {
          console.log("ℹ️ No stored auth found");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
        console.log(" Auth initialization complete");
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (userData, token) => {
    try {
      console.log("🔄 Login called with:", {
        userData: userData ? { ...userData, password: undefined } : null,
        hasToken: !!token,
      });

      if (!token) {
        console.error(" No token provided to login");
        return false;
      }

      if (!userData) {
        console.error(" No user data provided to login");
        return false;
      }

      // Store token
      localStorage.setItem("token", token);

      // Store user ID
      const userId = userData.id || userData._id;
      if (userId) {
        localStorage.setItem("userId", userId);
        console.log(" Stored userId:", userId);
      } else {
        console.warn(" No userId found in userData");
      }

      // Store user role
      const userRole = userData.role;
      if (userRole) {
        localStorage.setItem("userRole", userRole);
        console.log("✅ Stored userRole:", userRole);
      } else {
        console.warn(" No role found in userData");
      }

      // Ensure userData has both id and role
      const normalizedUser = {
        ...userData,
        id: userId,
        role: userRole,
      };

      // Store full user object
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      // Update state
      setUser(normalizedUser);
      setIsAuthenticated(true);

      console.log("✅ Login successful. Final state:", {
        userId: localStorage.getItem("userId"),
        userRole: localStorage.getItem("userRole"),
        hasToken: !!localStorage.getItem("token"),
        hasUser: !!localStorage.getItem("user"),
        authState: { isAuthenticated: true, user: normalizedUser },
      });

      return true;
    } catch (error) {
      console.error(" Login error:", error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    console.log("🔄 Logging out...");

    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");

    setUser(null);
    setIsAuthenticated(false);

    console.log("✅ Logout complete");
  };

  // Update user function
  const updateUser = (updatedData) => {
    console.log("🔄 Updating user data:", updatedData);

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Update role if changed
    if (updatedData.role) {
      localStorage.setItem("userRole", updatedData.role);
    }

    // Update userId if changed
    if (updatedData.id || updatedData._id) {
      localStorage.setItem("userId", updatedData.id || updatedData._id);
    }

    console.log("✅ User data updated");
  };

  const value = {
    // State
    user,
    isAuthenticated,
    loading,

    // Functions
    login,
    logout,
    updateUser,
  };

  // Show loading state while initializing
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
