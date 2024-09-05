import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFutbol, FaUsers, FaChartLine, FaTrophy, FaLightbulb } from 'react-icons/fa';

const InstructionSection = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        className="w-full p-4 flex items-center justify-between text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {icon}
          <h2 className="text-xl font-bold ml-3">{title}</h2>
        </div>
        <span className="text-2xl">{isOpen ? '−' : '+'}</span>
      </button>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden bg-white"
      >
        <div className="p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
};

const GameInstructions = () => {
  return (
    <div className="container mx-auto px-4 py-8 bg-dark-100 min-h-screen">
      <motion.h1
        className="text-4xl font-extrabold text-center mb-10 text-green-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Domina il Fantacalcio! 🏆
      </motion.h1>

      <InstructionSection title="Registrati per accedere a tutte le funzioni:" icon={<FaUsers className="text-2xl" />}>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Vai nella sezione Registrazione</li>
          <li>⚠️ Importante, inserisci tutti i dati, specialmente:
            <ul className="list-circle pl-5 mt-2 space-y-1">
              <li>UserName</li>
              <li>Nome del Team</li>
              <li>Una tua foto</li>
            </ul>
          </li>
          <li>Una volta in Home fai l'accesso con la tua email e password</li>
          <li>Ora sei pronto per la tua avventura da allenatore! 👍</li>
        </ul>
      </InstructionSection>
      <InstructionSection title="Crea la Tua Squadra dei Sogni" icon={<FaUsers className="text-2xl" />}>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Parti con un budget di €300 milioni 💰</li>
          <li>Scegli 24 campioni:
            <ul className="list-circle pl-5 mt-2 space-y-1">
              <li>3 portieri 🧤</li>
              <li>8 difensori 🛡️</li>
              <li>8 centrocampisti ⚙️</li>
              <li>5 attaccanti ⚽</li>
            </ul>
          </li>
          <li>Fai mercato nelle finestre "Mercato" per rafforzare la squadra 📈</li>
          <li>Ricorda, il mercato ha due sessione, quello estivo e quelllo invernale!</li>
        </ul>
      </InstructionSection>

      <InstructionSection title="Schiera la Formazione Vincente" icon={<FaFutbol className="text-2xl" />}>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Ogni gameweek, scegli i tuoi 11 titolari 🏟️</li>
          <li>Moduli disponibili: 3-4-3, 3-5-2, 4-3-3, 4-4-2, 4-5-1, 5-3-2, 5-4-1 📋</li>
          <li>Imposta la formazione prima del fischio d'inizio della prima partita ⏰</li>
          <li>Niente cambi dopo l'inizio della gameweek! 🚫</li>
        </ul>
      </InstructionSection>

      <InstructionSection title="Accumula Punti e Domina" icon={<FaChartLine className="text-2xl" />}>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>I tuoi giocatori guadagnano punti in base alle prestazioni reali 📊</li>
          <li>Gol, assist, clean sheet... tutto conta! 🎯</li>
          <li>Solo i punti degli 11 titolari contano per il tuo score 📈</li>
          <li>Il tuo punteggio di gameweek è la somma dei punti dei titolari 🧮</li>
        </ul>
      </InstructionSection>

      <InstructionSection title="Scala la Classifica" icon={<FaTrophy className="text-2xl" />}>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>La classifica generale si basa sul punteggio totale della stagione 🏆</li>
          <li>Sfida i tuoi amici e diventa il re del Fantacalcio! 👑</li>
        </ul>
      </InstructionSection>

      <InstructionSection title="Consigli da Pro" icon={<FaLightbulb className="text-2xl" />}>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Segui le news della Serie A per essere sempre un passo avanti 📰</li>
          <li>Se clicchi su una squadra di Serie A, potrai accedere alle statistiche dei giocatori 📈</li>
          <li>Analizza il calendario: chi ha le partite più facili? 🗓️</li>
          <li>Analizza le partite giocate fin ora: guarda i giocatori più in forma</li>
          <li>Non dimenticare mai di impostare la formazione! ⚠️</li>
          <li>Usa le finestre di mercato per correggere gli errori e rinforzarti 💪</li>
        </ul>
      </InstructionSection>
    </div>
  );
};

export default GameInstructions;