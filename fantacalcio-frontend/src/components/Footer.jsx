import React from 'react';
import { Link } from 'react-router-dom';
import { FaFutbol, FaInfoCircle, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral text-gray-300">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center">
          {/* Logo e nome dell'app */}
          <div className="flex items-center mb-4 lg:mb-0">
            <FaFutbol className="h-8 w-8 text-green-500 mr-2" />
            <span className="text-white font-bold text-xl">FantasyFootball</span>
          </div>
          {/* Links di navigazione */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <Link to="/market" className="text-sm text-gray-400 hover:text-white">Mercato</Link>
            <Link to="/serieA" className="text-sm text-gray-400 hover:text-white">Serie A</Link>
            <Link to="/classifica" className="text-sm text-gray-400 hover:text-white">Classifica</Link>
            <Link to="/istruzioni" className="text-sm text-gray-400 hover:text-white">
              <FaInfoCircle className="inline mr-1" />
              Istruzioni
            </Link>
            <Link to="/contact" className="text-sm text-gray-400 hover:text-white">
              <FaEnvelope className="inline mr-1" />
              Contattaci
            </Link>
          </div>
        </div>
        {/* Copyright e descrizione */}
        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap justify-between items-center">
          <p className="text-sm text-gray-400">
            La tua piattaforma di Fantacalcio per vivere il calcio con passione e strategia.
          </p>
          <p className="text-sm text-gray-400">
            &copy; {currentYear} FantasyFootball. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}