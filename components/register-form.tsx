"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../context/auth-context"

interface RegisterFormProps {
  step: number
  onStepChange: (step: number) => void
  onSuccess: () => void
  onAssistantMessage: (message: string) => void
}

export default function RegisterForm({ step, onStepChange, onSuccess, onAssistantMessage }: RegisterFormProps) {
  const { register } = useAuth()

  // Form state
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Validation states
  const [scanningFields, setScanningFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const [validFields, setValidFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const [invalidFields, setInvalidFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  // Input focus handlers
  const handleInputFocus = (field: string) => {
    setScanningFields((prev) => ({ ...prev, [field]: true }))

    // Generate a quirky assistant message based on field
    const messages: Record<string, string[]> = {
      username: [
        "Scanning for cool explorer names...",
        "What should the cosmos call you?",
        "Searching the star registry for your identity...",
      ],
      email: [
        "Establishing cosmic communication lines...",
        "Where should we send your space memos?",
        "Setting up your interstellar mailbox...",
      ],
      password: [
        "Creating your security force field...",
        "Make it strong enough to withstand asteroid impacts!",
        "Setting up your cosmic vault codes...",
      ],
      confirmPassword: [
        "Double-checking your security protocols...",
        "Confirming your force field patterns...",
        "Making sure your airlock codes match...",
      ],
    }

    // Select random message for the field
    const fieldMessages = messages[field] || ["Scanning cosmic data..."]
    const randomMessage = fieldMessages[Math.floor(Math.random() * fieldMessages.length)]

    onAssistantMessage(randomMessage)
  }

  const handleInputBlur = (field: string, value: string) => {
    setScanningFields((prev) => ({ ...prev, [field]: false }))
    validateInput(field, value)
  }

  // Handle input change with validation
  const handleInputChange = (field: string, value: string) => {
    // Update the field value
    switch (field) {
      case "username":
        setUsername(value)
        break
      case "email":
        setEmail(value)
        break
      case "password":
        setPassword(value)
        break
      case "confirmPassword":
        setConfirmPassword(value)
        break
      default:
        break
    }

    // Quick validation during typing
    let isValid = true

    if (field === "username" && (!value || value.length < 3)) {
      isValid = false
    } else if (field === "email" && (!value || !/\S+@\S+\.\S+/.test(value))) {
      isValid = false
    } else if (field === "password" && (!value || value.length < 6)) {
      isValid = false
    } else if (field === "confirmPassword" && value !== password) {
      isValid = false
    }

    // Update validity states for dynamic feedback
    if (value && value.length > 0) {
      if (isValid) {
        setValidFields((prev) => ({ ...prev, [field]: true }))
        setInvalidFields((prev) => ({ ...prev, [field]: false }))

        // Show validating scanning state briefly
        setScanningFields((prev) => ({ ...prev, [field]: true }))
        setTimeout(() => {
          setScanningFields((prev) => ({ ...prev, [field]: false }))
        }, 800)
      } else {
        setValidFields((prev) => ({ ...prev, [field]: false }))
        setInvalidFields((prev) => ({ ...prev, [field]: true }))
      }
    } else {
      // Empty field
      setValidFields((prev) => ({ ...prev, [field]: false }))
      setInvalidFields((prev) => ({ ...prev, [field]: false }))
    }
  }

  // Validate input
  const validateInput = (field: string, value: string) => {
    let isValid = true

    if (field === "username" && (!value || value.length < 3)) {
      isValid = false
    } else if (field === "email" && (!value || !/\S+@\S+\.\S+/.test(value))) {
      isValid = false
    } else if (field === "password" && (!value || value.length < 6)) {
      isValid = false
    } else if (field === "confirmPassword" && value !== password) {
      isValid = false
    }

    setInvalidFields((prev) => ({ ...prev, [field]: !isValid }))
    setValidFields((prev) => ({ ...prev, [field]: isValid && value && value.length > 0 }))

    if (!isValid && value && value.length > 0) {
      // Update assistant message for validation errors
      if (field === "username") {
        onAssistantMessage("Your explorer name should be at least 3 characters long!")
      } else if (field === "email") {
        onAssistantMessage("Please enter a valid email address for mission communications!")
      } else if (field === "password") {
        onAssistantMessage("Your password should be at least 6 characters for better security!")
      } else if (field === "confirmPassword") {
        onAssistantMessage("Your passwords don't match! Double-check for cosmic typos.")
      }
    } else if (isValid && value && value.length > 0) {
      // Positive feedback for valid input
      const successMessages: Record<string, string[]> = {
        username: [
          "Perfect name for an explorer!",
          "Great choice, it suits you!",
          "That's a name the stars will remember!",
        ],
        email: [
          "Excellent! Your space mail is all set.",
          "Perfect communication coordinates!",
          "Cosmic transmissions will reach you there!",
        ],
        password: [
          "Strong force field activated!",
          "Security protocols looking good!",
          "That's a secure airlock code!",
        ],
        confirmPassword: [
          "Passwords match perfectly!",
          "Security confirmation complete!",
          "Your cosmic vault is secured!",
        ],
      }

      const fieldMessages = successMessages[field] || ["That looks great!"]
      const randomMessage = fieldMessages[Math.floor(Math.random() * fieldMessages.length)]

      onAssistantMessage(randomMessage)
    }

    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      const isUsernameValid = validateInput("username", username)
      const isEmailValid = validateInput("email", email)

      if (isUsernameValid && isEmailValid) {
        onStepChange(2)
        return
      } else {
        return
      }
    }

    // Step 2 validation
    const isPasswordValid = validateInput("password", password)
    const isConfirmPasswordValid = validateInput("confirmPassword", confirmPassword)

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return
    }

    try {
      setError(null)
      setLoading(true)

      // Register with backend API
      const result = await register(username, email, password)

      if (result.success) {
        onSuccess()
      } else {
        setError(result.message || "Registration failed. Please try again.")
        onAssistantMessage(result.message || "Launch sequence aborted! Check your systems and try again.")
      }
    } catch (error) {
      setError("Registration failed. Please try again.")
      onAssistantMessage("Launch sequence aborted! Check your systems and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[rgba(20,27,56,0.3)] p-10 rounded-r-xl backdrop-blur-xl border border-[rgba(255,255,255,0.1)] w-[400px] max-w-[90%] text-white shadow-[0_8px_32px_rgba(14,21,47,0.3),0_0_0_1px_rgba(0,255,200,0.1),inset_0_1px_1px_rgba(255,255,255,0.05),0_0_15px_rgba(0,255,200,0.2)] text-center transition-all hover:shadow-[0_8px_32px_rgba(14,21,47,0.4),0_0_0_1px_rgba(0,255,200,0.2),inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(0,255,200,0.3)] relative"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,200,0.05)] via-[rgba(0,255,200,0.05)] to-[rgba(0,180,160,0.05)] rounded-r-xl opacity-50 z-[-1] pointer-events-none"></div>

      <h2 className="text-2xl font-bold text-white mb-2 font-orbitron flex items-center justify-center gap-2 text-shadow-[0_0_10px_rgba(0,255,200,0.5)]">
        {step === 1 ? "Start Your Journey" : "Complete Launch Sequence"}
      </h2>

      <p className="text-[rgba(255,255,255,0.7)] mb-6 text-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
        {step === 1 ? "Create your account to begin" : "Just a few more details to lift off"}
      </p>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {step === 1 ? (
        <>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              onFocus={() => handleInputFocus("username")}
              onBlur={() => handleInputBlur("username", username)}
              disabled={loading}
              className={`w-full p-3 my-4 bg-[rgba(15,32,39,0.6)] border ${
                invalidFields.username
                  ? "border-red-500/80 animate-invalid-shake shadow-[0_0_10px_rgba(255,77,77,0.3)]"
                  : validFields.username
                    ? "border-[rgba(0,255,200,0.8)] shadow-[0_0_10px_rgba(0,255,200,0.5)]"
                    : "border-[rgba(0,255,200,0.3)]"
              } rounded-lg text-white text-base transition-all focus:outline-none focus:border-[rgba(0,255,200,0.8)] focus:shadow-[0_0_15px_rgba(0,255,200,0.4)] focus:-translate-y-1 ${
                scanningFields.username
                  ? "bg-gradient-to-r from-[rgba(15,32,39,0.6)] via-[rgba(0,255,200,0.1)] to-[rgba(15,32,39,0.6)] bg-[length:200%_100%] animate-scanning"
                  : ""
              }`}
              required
            />
            {validFields.username && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ffc8] text-xl">✓</div>
            )}
            {invalidFields.username && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">✗</div>
            )}
            {scanningFields.username && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">🛸</div>}
          </div>
          <p className="text-[0.85rem] text-[rgba(255,255,255,0.7)] mt-1 mb-4 flex items-center gap-1 pl-6 relative">
            <span className="absolute left-0 text-[0.9rem]">🧑‍🚀</span>
            Choose a unique explorer name
          </p>

          <div className="relative w-full">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onFocus={() => handleInputFocus("email")}
              onBlur={() => handleInputBlur("email", email)}
              disabled={loading}
              className={`w-full p-3 my-4 bg-[rgba(15,32,39,0.6)] border ${
                invalidFields.email
                  ? "border-red-500/80 animate-invalid-shake shadow-[0_0_10px_rgba(255,77,77,0.3)]"
                  : validFields.email
                    ? "border-[rgba(0,255,200,0.8)] shadow-[0_0_10px_rgba(0,255,200,0.5)]"
                    : "border-[rgba(0,255,200,0.3)]"
              } rounded-lg text-white text-base transition-all focus:outline-none focus:border-[rgba(0,255,200,0.8)] focus:shadow-[0_0_15px_rgba(0,255,200,0.4)] focus:-translate-y-1 ${
                scanningFields.email
                  ? "bg-gradient-to-r from-[rgba(15,32,39,0.6)] via-[rgba(0,255,200,0.1)] to-[rgba(15,32,39,0.6)] bg-[length:200%_100%] animate-scanning"
                  : ""
              }`}
              required
            />
            {validFields.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ffc8] text-xl">✓</div>
            )}
            {invalidFields.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">✗</div>
            )}
            {scanningFields.email && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">🛸</div>}
          </div>
          <p className="text-[0.85rem] text-[rgba(255,255,255,0.7)] mt-1 mb-4 flex items-center gap-1 pl-6 relative">
            <span className="absolute left-0 text-[0.9rem]">📡</span>
            We'll send mission updates here
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 mt-6 bg-gradient-to-r from-[#00ffc8] to-[#00a3ff] text-white rounded-lg font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_15px_#00ffc8] relative overflow-hidden animate-button-glow-pulse flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-orbitron"
          >
            {loading ? "Processing..." : "Continue to Launch 🚀"}
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></span>
          </button>

          <Link
            href="/login"
            className="text-[rgba(0,255,200,0.9)] flex items-center justify-center mt-6 text-[0.9rem] transition-all hover:text-[rgba(0,255,200,1)] hover:-translate-y-1 hover:text-shadow-[0_0_8px_rgba(0,255,200,0.5)] gap-2 before:content-['🚀'] before:text-[1.1rem]"
          >
            Already onboard? Dock back in
          </Link>
        </>
      ) : (
        <>
          <div className="relative w-full">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onFocus={() => handleInputFocus("password")}
              onBlur={() => handleInputBlur("password", password)}
              disabled={loading}
              className={`w-full p-3 my-4 bg-[rgba(15,32,39,0.6)] border ${
                invalidFields.password
                  ? "border-red-500/80 animate-invalid-shake shadow-[0_0_10px_rgba(255,77,77,0.3)]"
                  : validFields.password
                    ? "border-[rgba(0,255,200,0.8)] shadow-[0_0_10px_rgba(0,255,200,0.5)]"
                    : "border-[rgba(0,255,200,0.3)]"
              } rounded-lg text-white text-base transition-all focus:outline-none focus:border-[rgba(0,255,200,0.8)] focus:shadow-[0_0_15px_rgba(0,255,200,0.4)] focus:-translate-y-1 ${
                scanningFields.password
                  ? "bg-gradient-to-r from-[rgba(15,32,39,0.6)] via-[rgba(0,255,200,0.1)] to-[rgba(15,32,39,0.6)] bg-[length:200%_100%] animate-scanning"
                  : ""
              }`}
              required
            />
            {validFields.password && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ffc8] text-xl">✓</div>
            )}
            {invalidFields.password && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">✗</div>
            )}
            {scanningFields.password && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">🛸</div>}
          </div>
          <p className="text-[0.85rem] text-[rgba(255,255,255,0.7)] mt-1 mb-4 flex items-center gap-1 pl-6 relative">
            <span className="absolute left-0 text-[0.9rem]">🔒</span>
            At least 6 characters recommended
          </p>

          <div className="relative w-full">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              onFocus={() => handleInputFocus("confirmPassword")}
              onBlur={() => handleInputBlur("confirmPassword", confirmPassword)}
              disabled={loading}
              className={`w-full p-3 my-4 bg-[rgba(15,32,39,0.6)] border ${
                invalidFields.confirmPassword
                  ? "border-red-500/80 animate-invalid-shake shadow-[0_0_10px_rgba(255,77,77,0.3)]"
                  : validFields.confirmPassword
                    ? "border-[rgba(0,255,200,0.8)] shadow-[0_0_10px_rgba(0,255,200,0.5)]"
                    : "border-[rgba(0,255,200,0.3)]"
              } rounded-lg text-white text-base transition-all focus:outline-none focus:border-[rgba(0,255,200,0.8)] focus:shadow-[0_0_15px_rgba(0,255,200,0.4)] focus:-translate-y-1 ${
                scanningFields.confirmPassword
                  ? "bg-gradient-to-r from-[rgba(15,32,39,0.6)] via-[rgba(0,255,200,0.1)] to-[rgba(15,32,39,0.6)] bg-[length:200%_100%] animate-scanning"
                  : ""
              }`}
              required
            />
            {validFields.confirmPassword && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ffc8] text-xl">✓</div>
            )}
            {invalidFields.confirmPassword && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">✗</div>
            )}
            {scanningFields.confirmPassword && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">🛸</div>
            )}
          </div>
          <p className="text-[0.85rem] text-[rgba(255,255,255,0.7)] mt-1 mb-4 flex items-center gap-1 pl-6 relative">
            <span className="absolute left-0 text-[0.9rem]">✅</span>
            Make sure passwords match
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 mt-6 bg-gradient-to-r from-[#00ffc8] to-[#00a3ff] text-white rounded-lg font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_15px_#00ffc8] relative overflow-hidden animate-button-glow-pulse flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-orbitron"
          >
            {loading ? "Preparing for Launch..." : "Complete Registration 🚀"}
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></span>
          </button>

          <button
            type="button"
            onClick={() => onStepChange(1)}
            disabled={loading}
            className="w-full p-3 mt-4 bg-[rgba(255,255,255,0.1)] border border-[rgba(0,255,200,0.3)] text-white rounded-lg font-bold transition-all hover:bg-[rgba(255,255,255,0.2)] hover:border-[rgba(0,255,200,0.5)] hover:shadow-[0_0_15px_rgba(0,255,200,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Return to Earth Base
          </button>
        </>
      )}
    </form>
  )
}
