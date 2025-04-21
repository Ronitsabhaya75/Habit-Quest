import type React from "react"
import { ThemeProvider } from "../components/theme-provider"
import { AuthProvider } from "../context/auth-context"
import { TaskProvider } from "../components/task-context"
import { HabitProvider } from "../context/HabitContext"
import { EventProvider } from "../context/EventContext"
import "./globals.css"

export const metadata = {
  generator: 'v0.dev',
  title: 'Golden Warriors',
  description: 'Gamified productivity app'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-[#0d1520] min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <HabitProvider>
              <EventProvider>
                <TaskProvider>{children}</TaskProvider>
              </EventProvider>
            </HabitProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
