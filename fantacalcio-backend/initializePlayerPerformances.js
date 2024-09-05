import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { updatePerformancesForDate } from '../fantacalcio-frontend/src/services/apisport.js';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Ottiene l'URI di MongoDB dalle variabili d'ambiente
const MONGODB_URI = process.env.MONGO_URI;

async function initializePlayerPerformances() {
  try {
    // Connessione al database MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connesso al database MongoDB');

    // Definizione delle date delle partite
    const matchDays = [
      { start: '2024-08-17', end: '2024-08-19' },
      { start: '2024-08-24', end: '2024-08-26' },
      { start: '2024-08-30', end: '2024-08-31' }
    ];

    // Iterazione su ogni giornata di partite
    for (const matchDay of matchDays) {
      const startDate = new Date(matchDay.start);
      const endDate = new Date(matchDay.end);

      // Aggiorna le prestazioni per ogni giorno della giornata di partite
      for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        console.log(`Aggiornamento prestazioni per la data: ${date.toISOString().split('T')[0]}`);
        await updatePerformancesForDate(date);
      }
    }

    console.log('Inizializzazione completata con successo.');

  } catch (error) {
    console.error('Errore durante l\'inizializzazione:', error);
  } finally {
    // Chiude la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegue la funzione di inizializzazione
initializePlayerPerformances();