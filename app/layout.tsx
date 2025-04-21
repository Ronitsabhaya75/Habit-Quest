import type React from "react"
import { ThemeProvider } from "../components/theme-provider"
import { AuthProvider } from "../context/auth-context"
import { TaskProvider } from "../components/task-context"
import { HabitProvider } from "../context/HabitContext"
import { EventProvider } from "../context/EventContext"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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

export const metadata = {
  generator: 'v0.dev'
};
