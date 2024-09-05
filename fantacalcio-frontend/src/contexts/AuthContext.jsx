import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getUserData();
          setUser({
            id: userData._id.toString(),
            ...userData
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      localStorage.setItem('token', response.token);
      const userData = await getUserData();
      setUser({
        id: userData._id.toString(),
        ...userData
      });
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      localStorage.setItem('token', response.token);

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updateUserTeam = (team) => {
    setUser(prevUser => ({ ...prevUser, team }));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUserTeam,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);