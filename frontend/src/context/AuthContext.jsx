// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";

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

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  token: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  UPDATE_USER: "UPDATE_USER",
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        loading: false,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: { user, token },
        });
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Login function
  const login = (userData, token) => {
    try {
      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: userData, token },
      });

      console.log("✅ Login successful in AuthContext:", userData);
      return true;
    } catch (error) {
      console.error("❌ Login failed in AuthContext:", error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Remove from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      // Update state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      console.log("✅ Logout successful");
      return true;
    } catch (error) {
      console.error("❌ Logout failed:", error);
      return false;
    }
  };

  // Update user function
  const updateUser = (updatedData) => {
    try {
      const updatedUser = { ...state.user, ...updatedData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedData,
      });

      return true;
    } catch (error) {
      console.error("❌ Update user failed:", error);
      return false;
    }
  };

  // Get token function
  const getToken = () => {
    return state.token || localStorage.getItem("token");
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    token: state.token,

    // Functions
    login,
    logout,
    updateUser,
    getToken,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
