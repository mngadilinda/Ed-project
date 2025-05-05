// src/api/learn.js
const API_URL = 'http://localhost:8000';

export const fetchLesson = async (token, programId, lessonId) => {
  const response = await fetch(`${API_URL}/learn/${programId}/${lessonId}/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch lesson');
  }
  
  return await response.json();
};

export const completeLesson = async (token, programId, lessonId) => {
  const response = await fetch(`${API_URL}/learn/${programId}/${lessonId}/complete/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark lesson as complete');
  }
  
  return await response.json();
};