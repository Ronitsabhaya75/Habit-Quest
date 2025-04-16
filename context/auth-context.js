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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Login error response:", errorText)
        return {
          success: false,
          message: `Login failed with status ${res.status}`,
        }
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
        router.push("/dashboard")
        return { success: true }
      } else {
        return { success: false, message: data.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
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
        const errorText = await res.text()
        console.error("Registration error response:", errorText)
        return {
          success: false,
          message: `Registration failed with status ${res.status}`,
        }
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
          return { success: true }
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
      return { success: false, message: "An error occurred during registration" }
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
