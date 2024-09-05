import React from 'react';
import { FaFutbol } from "react-icons/fa";

// Componente per mostrare un'animazione di caricamento
export default function LoadingSpinner() {
  return (
    // Contenitore a schermo intero con sfondo semi-trasparente
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="text-white text-center">
        {/* Animazione di rimbalzo dell'icona del pallone da calcio */}
        <div className="animate-bounce">
          <FaFutbol className="text-6xl md:text-8xl lg:text-9xl mx-auto mb-4" />
        </div>
        {/* Testo di caricamento */}
        <p className="text-lg md:text-xl lg:text-2xl font-bold">Caricamento in corso...</p>
      </div>
    </div>
  );
}