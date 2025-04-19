import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fadeIn": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slideIn": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "slideInUp": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slideUp": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounceIn": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "70%": { transform: "scale(1.1)", opacity: "0.7" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "notificationTimer": {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },
        "scanning": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "100% 0%" },
        },
        "buttonGlowPulse": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(0, 255, 200, 0.5)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 255, 200, 0.8)" },
        },
        "progress": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "invalidShake": {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-8px)" },
          "50%": { transform: "translateX(8px)" },
          "75%": { transform: "translateX(-8px)" },
          "100%": { transform: "translateX(0)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.1" },
          "50%": { opacity: "1" },
        },
        "star-glow": {
          "0%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
          "100%": { opacity: "0.6", transform: "scale(1)" },
        },
        "slow-rotate": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%": { transform: "scale(1)", opacity: "0.6", boxShadow: "0 0 5px rgba(0, 255, 204, 0.5)" },
          "50%": { transform: "scale(1.05)", opacity: "0.8", boxShadow: "0 0 15px rgba(0, 255, 204, 0.8)" },
          "100%": { transform: "scale(1)", opacity: "0.6", boxShadow: "0 0 5px rgba(0, 255, 204, 0.5)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translate3d(0, 10px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "button-glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 15px #00ffc8" },
          "50%": { boxShadow: "0 0 25px #00ffc8, 0 0 40px rgba(0, 255, 200, 0.4)" },
        },
        "galaxy-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        hyperspace: {
          "0%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.5)", filter: "brightness(1.5)" },
          "100%": { transform: "scale(2)", filter: "brightness(2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fadeIn": "fadeIn 0.3s ease-in forwards",
        "slideIn": "slideIn 0.3s ease-out forwards",
        "pulse": "pulse 1.5s ease-in-out infinite",
        "spin": "spin 1s linear infinite",
        "slideInUp": "slideInUp 0.3s ease-out forwards",
        "slideUp": "slideUp 0.5s ease-out forwards",
        "bounceIn": "bounceIn 0.5s ease-out forwards",
        "notificationTimer": "notificationTimer 5s linear forwards",
        "scanning": "scanning 1.5s ease-in-out infinite",
        "button-glow-pulse": "button-glow-pulse 2s infinite",
        "progress": "progress 2s ease-out forwards",
        "invalid-shake": "invalidShake 0.5s ease forwards",
        twinkle: "twinkle 3s infinite ease-in-out",
        "star-glow": "star-glow 3s infinite ease-in-out",
        "slow-rotate": "slow-rotate 8s linear infinite",
        "pulse-glow": "pulse-glow 2s infinite ease-in-out",
        "fade-in": "fade-in 0.5s ease-out",
        "galaxy-rotate": "galaxy-rotate 240s linear infinite",
        hyperspace: "hyperspace 1.5s ease-in-out forwards",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      clipPath: {
        mountain1: "polygon(0% 100%, 50% 30%, 100% 100%)",
        mountain2: "polygon(0% 100%, 40% 20%, 80% 60%, 100% 100%)",
      },
      textShadow: {
        DEFAULT: "0 2px 4px rgba(0,0,0,0.5)",
        sm: "0 1px 2px rgba(0,0,0,0.5)",
        md: "0 2px 4px rgba(0,0,0,0.5)",
        lg: "0 4px 8px rgba(0,0,0,0.5)",
        xl: "0 8px 16px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    ({ addUtilities }) => {
      const newUtilities = {
        ".text-shadow": {
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        },
        ".text-shadow-sm": {
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        },
        ".text-shadow-md": {
          textShadow: "0 4px 8px rgba(0,0,0,0.5)",
        },
        ".text-shadow-lg": {
          textShadow: "0 8px 16px rgba(0,0,0,0.5)",
        },
        ".text-shadow-none": {
          textShadow: "none",
        },
      }
      addUtilities(newUtilities)
    },
  ],
} satisfies Config

export default config
