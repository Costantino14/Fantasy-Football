import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Coach from '../components/Coach';
import SerieAComponent from '../components/SerieAComponent';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  // Utilizziamo il hook useAuth per accedere al contesto di autenticazione
  const { user, isAuthenticated, isLoading } = useAuth();

  // Se l'applicazione sta ancora caricando i dati di autenticazione, mostriamo uno spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Rendering principale della pagina Home
  return (
    <>
      {/* Rendering condizionale basato sullo stato di autenticazione */}
      {/* Se l'utente è autenticato, mostra il componente Coach, altrimenti mostra il componente Login */}
      {isAuthenticated ? <Coach /> : <Login />}

      {/* Il componente SerieAComponent viene sempre renderizzato, indipendentemente dallo stato di autenticazione */}
      <SerieAComponent />
    </>
  );
}