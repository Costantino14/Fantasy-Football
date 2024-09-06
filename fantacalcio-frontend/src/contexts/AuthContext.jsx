import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData, loginUser, registerUser } from '../services/api';

// Creazione del contesto di autenticazione
const AuthContext = createContext(null);

// Provider del contesto di autenticazione
export const AuthProvider = ({ children }) => {
  // Stati per gestire le informazioni dell'utente e lo stato di autenticazione
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Effetto per controllare lo stato di autenticazione all'avvio dell'applicazione
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Se c'è un token, recupera i dati dell'utente
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

  // Funzione per gestire il login dell'utente
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

  // Funzione per gestire il logout dell'utente
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Funzione per gestire la registrazione di un nuovo utente
  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      localStorage.setItem('token', response.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Funzione per aggiornare i dati del team dell'utente
  const updateUserTeam = (team) => {
    setUser(prevUser => ({ ...prevUser, team }));
  };

  // Oggetto contenente tutti i valori e le funzioni da fornire attraverso il contesto
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUserTeam,
  };

  // Restituzione del Provider del contesto con i valori
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizzato per utilizzare il contesto di autenticazione
export const useAuth = () => useContext(AuthContext);