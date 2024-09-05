import React from 'react';
import { FaExclamationTriangle, FaFutbol } from 'react-icons/fa';

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] bg-red-100 border-2 border-red-400 rounded-lg p-6 m-4 text-center">
      {/* Icona di pallone e triangolo di avvertimento */}
      <div className="relative mb-4">
        <FaFutbol className="text-6xl text-red-500 animate-bounce" />
        <FaExclamationTriangle className="text-3xl text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      {/* Messaggio di errore */}
      <h2 className="text-2xl font-bold text-red-700 mb-2">Fallo! Errore in campo!</h2>
      <p className="text-red-600">{message}</p>
      {/* Pulsante per ricaricare la pagina */}
      <button 
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => window.location.reload()}
      >
        Riprova
      </button>
    </div>
  );
};

export default ErrorMessage;