"use client";

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function APITestPage() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Test task creation
  const testCreateTask = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Simple task payload with required fields
      const taskData = {
        title: "Test Task " + new Date().toISOString(),
        description: "This is a test task created from the API test page",
        dueDate: new Date().toISOString(),
        xpReward: 10,
        isHabit: false,
        isRecurring: false
      };

      console.log("Sending task data:", taskData);

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
        credentials: 'include' // Important: include cookies in the request
      });

      // Get response as text first
      const responseText = await response.text();
      
      // Log the raw response
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      console.log(`Response body:`, responseText);

      // Try to parse as JSON if possible
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(responseText);
        setResponse(jsonResponse);
      } catch (e) {
        setResponse({ rawText: responseText });
      }

      if (!response.ok) {
        setError(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test GET tasks
  const testGetTasks = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('/api/tasks', {
        method: 'GET',
        credentials: 'include' // Important: include cookies in the request
      });

      // Get response as text first
      const responseText = await response.text();
      
      // Log the raw response
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      console.log(`Response body:`, responseText);

      // Try to parse as JSON if possible
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(responseText);
        setResponse(jsonResponse);
      } catch (e) {
        setResponse({ rawText: responseText });
      }

      if (!response.ok) {
        setError(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include' // Important: include cookies in the request
      });

      // Get response as text first
      const responseText = await response.text();
      
      // Log the raw response
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      console.log(`Response body:`, responseText);

      // Try to parse as JSON if possible
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(responseText);
        setResponse(jsonResponse);
      } catch (e) {
        setResponse({ rawText: responseText });
      }

      if (!response.ok) {
        setError(`Authentication check failed: ${response.status}`);
      }
    } catch (err: any) {
      console.error('Auth check error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Testing Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button onClick={checkAuthStatus} variant="outline" disabled={loading}>
          {loading ? 'Checking...' : 'Check Authentication Status'}
        </Button>
        <Button onClick={testGetTasks} variant="outline" disabled={loading}>
          {loading ? 'Loading...' : 'Test GET Tasks'}
        </Button>
        <Button onClick={testCreateTask} variant="outline" disabled={loading}>
          {loading ? 'Creating...' : 'Test Create Task'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-red-600">{error}</pre>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap overflow-auto max-h-[60vh]">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}