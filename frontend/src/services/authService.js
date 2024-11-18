// src/services/authService.js

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const authService = {
  axiosInstance: axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  }),

  setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  },

  // API endpoints
  async login(credentials) {
    try {
      const response = await this.axiosInstance.post('/login', credentials);
      const { token, data } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async register(userData) {
    try {
      const response = await this.axiosInstance.post('/add-account', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async forgotPassword(email) {
    try {
      const response = await this.axiosInstance.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await this.axiosInstance.post('/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const response = await this.axiosInstance.put(`/change-password/${userId}`, {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getProfile(userId) {
    try {
      const response = await this.axiosInstance.get(`/account/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateProfile(userId, profileData) {
    try {
      const response = await this.axiosInstance.post(`/create-profile/${userId}`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || 'An error occurred';
    return {
      error: true,
      message: errorMessage
    };
  },

  isTokenExpired() {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  },

  isAuthenticated() {
    return !this.isTokenExpired() && !!this.getCurrentUser();
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// Khởi tạo interceptors
authService.setupInterceptors();

export default authService;