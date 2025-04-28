/**
 * API Service Module
 * 
 * This module provides functions to interact with various API endpoints related to user profiles,
 * habits, and leaderboard functionalities. It uses the Fetch API to make HTTP requests and handles
 * responses, including error management.
 * 
 * Functions:
 * 
 * 1. fetchUserProfile(token)
 *    - Fetches the user's profile information.
 *    - Requires a Bearer token for authentication.
 * 
 * 2. fetchHabits(token)
 *    - Retrieves a list of habits for the authenticated user.
 *    - Requires a Bearer token for authentication.
 * 
 * 3. createHabit(habitData, token)
 *    - Creates a new habit for the authenticated user.
 *    - Requires a Bearer token for authentication and habit data in JSON format.
 * 
 * 4. completeHabit(habitId, date, token)
 *    - Marks a specified habit as completed on a given date.
 *    - Requires a Bearer token for authentication, habit ID, and completion date in JSON format.
 * 
 * 5. fetchLeaderboard()
 *    - Retrieves the top users from the leaderboard.
 *    - Does not require authentication.
 * 
 */
import { API_BASE_URL } from './config';

const apiService = {
  // User related API calls
  fetchUserProfile: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {  //GET request to endpoint
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  // Habit related API calls
  fetchHabits: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits`, {   //GET Request to endpoint
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  },
  
  createHabit: async (habitData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits`, {       //POST request to mark as completed
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(habitData)
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  },
  
  completeHabit: async (habitId, date, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${habitId}/complete`, {   //POST request to mark as completed
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error completing habit:', error);
      throw error;
    }
  },
  
  // Leaderboard related API calls
  fetchLeaderboard: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard/top-users?limit=10&_=${Date.now()}`, { //GET request to endpoint
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
};

export default apiService; 
