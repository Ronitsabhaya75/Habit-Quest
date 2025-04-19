"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Create context
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in
  useEffect(() => {
    async function loadUserFromCookies() {
      try {
        const res = await fetch("/api/user/profile")

        if (!res.ok) {
          console.log("Not authenticated or API error:", res.status)
          setLoading(false)
          return
        }

        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("API returned non-JSON response:", contentType)
          setLoading(false)
          return
        }

        const data = await res.json()
        if (data.success) {
          setUser(data.data)
        }
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserFromCookies()
  }, [])

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true)
      setUser(null) // Clear previous user data
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        // Add cache control to avoid stale responses
        cache: "no-store"
      })

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
          console.error("Login error response:", errorData);
        } catch (parseError) {
          const errorText = await res.text();
          console.error("Login error response (text):", errorText);
          errorData = { message: `Login failed with status ${res.status}` };
        }
        
        return {
          success: false,
          message: errorData.message || `Login failed with status ${res.status}`,
        };
      }

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Login API returned non-JSON response:", contentType)
        return {
          success: false,
          message: "Server returned an invalid response",
        }
      }

      const data = await res.json()

      if (data.success) {
        setUser(data.data)
        
        // Check for redirect URL in query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('from');
        
        // Use a setTimeout to ensure state updates are processed before navigation
        setTimeout(() => {
          if (redirectPath && !redirectPath.includes('/login') && !redirectPath.includes('/register')) {
            router.push(redirectPath);
          } else {
            router.push("/dashboard");
          }
        }, 100);
        
        return { success: true };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: error.message || "An error occurred during login" }
    } finally {
      setLoading(false)
    }
  }

  // Register
  const register = async (username, email, password) => {
    try {
      setLoading(true)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Registration error response:", errorData);
        return {
          success: false,
          message: errorData.message || `Registration failed with status ${res.status}`,
        };
      }

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Registration API returned non-JSON response:", contentType)
        return {
          success: false,
          message: "Server returned an invalid response",
        }
      }

      const data = await res.json()

      if (data.success) {
        // After successful registration, automatically log the user in
        const loginResult = await login(email, password)

        if (loginResult.success) {
          return { success: true, message: "Registration successful!" }
        } else {
          return {
            success: false,
            message: "Registration successful, but automatic login failed. Please log in manually.",
          }
        }
      } else {
        return { success: false, message: data.message || "Registration failed" }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: error.message || "An error occurred during registration" }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      setLoading(true)
      await fetch("/api/auth/logout")
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update user data
  const updateUser = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)
