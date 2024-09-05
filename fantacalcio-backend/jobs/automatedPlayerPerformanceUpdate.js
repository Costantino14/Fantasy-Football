import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { updatePerformancesForDate } from '../../fantacalcio-frontend/src/services/apisport.js';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Ottiene l'URI di MongoDB dalle variabili d'ambiente
const MONGODB_URI = process.env.MONGO_URI;

// Funzione per connettersi al database MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Termina il processo in caso di errore di connessione
  }
}

// Funzione principale per aggiornare le performance dei giocatori
async function updatePlayerPerformances() {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  // Itera sugli ultimi 3 giorni (oggi, ieri e l'altro ieri)
  for (let date = twoDaysAgo; date <= today; date.setDate(date.getDate() + 1)) {
    console.log(`Updating performances for date: ${date.toISOString().split('T')[0]}`);
    try {
      // Chiama la funzione per aggiornare le performance per la data specifica
      await updatePerformancesForDate(date);
    } catch (error) {
      console.error(`Error updating performances for ${date.toISOString().split('T')[0]}:`, error);
    }
  }
}

// Funzione principale per configurare e avviare l'aggiornamento automatico
export const playerPerformancesUpdate = async () => {
  await connectToDatabase();

  // Pianifica il job per essere eseguito ogni giorno alle 0:30
  cron.schedule('30 0 * * *', async () => {
    console.log('Running daily update of player performances');
    try {
      await updatePlayerPerformances();
      console.log('Daily update completed successfully');
    } catch (error) {
      console.error('Error in daily update:', error);
    }
  });

  console.log('Automated player performance update scheduled');
}

// Avvia il processo di aggiornamento automatico
playerPerformancesUpdate().catch(console.error);

// Gestisce la chiusura del processo
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});