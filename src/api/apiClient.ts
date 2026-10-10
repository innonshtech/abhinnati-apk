import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';

export const apiClient = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'API Request Failed');
      }
      return json.data;
    } catch (error) {
      console.error(`API Error [GET ${endpoint}]:`, error);
      throw error;
    }
  },
  post: async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'API Request Failed');
      }
      return json.data;
    } catch (error) {
      console.error(`API Error [POST ${endpoint}]:`, error);
      throw error;
    }
  }
};
