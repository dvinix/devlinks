import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { UserResponse, AuthTokens } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setIsAuthenticated, logout: storeLogout } = useAuthStore();

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<UserResponse>('/auth/register', {
        email,
        password,
      });
      setUser(data);
      navigate('/login');
      return data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<AuthTokens>('/auth/login', {
        email,
        password,
      });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setIsAuthenticated(true);
      
      // Fetch user info
      const userResponse = await api.get<UserResponse>('/auth/me');
      setUser(userResponse.data);
      
      navigate('/dashboard');
      return data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFirebase = async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<AuthTokens>('/auth/firebase', {
        id_token: idToken,
      });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setIsAuthenticated(true);
      
      // Fetch user info
      const userResponse = await api.get<UserResponse>('/auth/me');
      setUser(userResponse.data);
      
      navigate('/dashboard');
      return data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Firebase login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        storeLogout();
        return null;
      }
      const { data } = await api.get<UserResponse>('/auth/me');
      setUser(data);
      setIsAuthenticated(true);
      return data;
    } catch {
      storeLogout();
      return null;
    }
  };

  const logout = () => {
    storeLogout();
    navigate('/');
  };

  return {
    register,
    login,
    loginWithFirebase,
    getCurrentUser,
    logout,
    isLoading,
    error,
  };
};
