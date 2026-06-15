import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { sanitizeInput } from "../utils/validation";

const AuthContext = createContext(null);

const API_BASE_URL = "https://tama-chain-patentguard-api.hf.space/api/v1";

// Session storage is used instead of localStorage so the auth token
// does not persist beyond the browser tab's life, reducing the window
// for token theft via XSS / shared-device exposure.
const TOKEN_KEY = "pg_auth_token";
const USER_KEY = "pg_auth_user";

function getStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token);

  // Keep storage in sync
  useEffect(() => {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore storage errors (e.g. private mode) */
    }
  }, [token]);

  useEffect(() => {
    try {
      if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  }, [user]);

  /**
   * Attempts to log the user in.
   * identifier: username or email
   * password: plain text password (sent over HTTPS only)
   */
  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    setError(null);

    const cleanIdentifier = sanitizeInput(identifier);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials are sent over HTTPS in body; never put creds in URL/query
        body: JSON.stringify({ identifier: cleanIdentifier, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data?.detail ||
          (response.status === 401
            ? "Invalid username/email or password."
            : "Login failed. Please try again.");
        setError(message);
        setLoading(false);
        return { success: false, message };
      }

      const accessToken = data.access_token || data.token;
      const userInfo = data.user || { name: cleanIdentifier };

      if (!accessToken) {
        const message = "Unexpected server response. Please try again.";
        setError(message);
        setLoading(false);
        return { success: false, message };
      }

      setToken(accessToken);
      setUser(userInfo);
      setLoading(false);
      return { success: true };
    } catch (err) {
      const message = "Unable to connect to the server. Please try again.";
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        clearError,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
