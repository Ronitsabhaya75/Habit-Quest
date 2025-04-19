"use client"

import { AuthProvider } from './auth-context';
import { HabitProvider } from './HabitContext';
import { EventProvider } from './EventContext';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <HabitProvider>
        <EventProvider>
          {children}
        </EventProvider>
      </HabitProvider>
    </AuthProvider>
  );
} 