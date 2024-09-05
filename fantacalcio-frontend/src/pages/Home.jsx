import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Coach from '../components/Coach';
import SerieAComponent from '../components/SerieAComponent';
import LoadingSpinner from '../components/LoadingSpinner'; // Assicurati di avere questo componente

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {isAuthenticated ? <Coach /> : <Login />}
      <SerieAComponent />
    </>
  );
}