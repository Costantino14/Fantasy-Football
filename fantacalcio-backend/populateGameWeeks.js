import { fetchFixtures } from '../fantacalcio-frontend/src/services/apisport.js';
import Gameweek from './models/Gameweek.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Definizione delle costanti
const SERIE_A_LEAGUE_ID = 135;
const CURRENT_SEASON = 2024;
const MONGODB_URI = process.env.MONGO_URI;
console.log(MONGODB_URI)

// Funzione per convertire una data UTC in CET/CEST
function convertToCET(date) {
  const cetOffset = 2; // Offset per CET/CEST (potrebbe essere 1 o 2 a seconda dell'ora legale)
  return new Date(date.getTime() + cetOffset * 60 * 60 * 1000);
}

export async function populateGameWeeks() {
  try {
    // Connessione al database MongoDB
    await mongoose.connect(MONGODB_URI);

    // Recupera le partite della Serie A
    const fixtures = await fetchFixtures(SERIE_A_LEAGUE_ID, CURRENT_SEASON);
    
    // Raggruppa le partite per gameweek
    const gameweeks = fixtures.reduce((acc, fixture) => {
      const round = fixture.league.round;
      const gameweek = parseInt(round.match(/\d+/)[0]);
      
      if (!acc[gameweek]) {
        acc[gameweek] = {
          dates: [],
          startDate: convertToCET(new Date(fixture.fixture.date)),
          endDate: convertToCET(new Date(fixture.fixture.date))
        };
      }
      
      const fixtureDate = convertToCET(new Date(fixture.fixture.date));
      acc[gameweek].dates.push(fixtureDate);
      
      // Aggiorna le date di inizio e fine della gameweek se necessario
      if (fixtureDate < acc[gameweek].startDate) {
        acc[gameweek].startDate = fixtureDate;
      }
      if (fixtureDate > acc[gameweek].endDate) {
        acc[gameweek].endDate = fixtureDate;
      }
      
      return acc;
    }, {});

    // Aggiorna o crea le gameweek nel database
    for (const [number, data] of Object.entries(gameweeks)) {
      await Gameweek.findOneAndUpdate(
        { number: parseInt(number) },
        {
          number: parseInt(number),
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: false,
          isCompleted: false
        },
        { upsert: true, new: true }
      );
    }

    console.log('GameWeeks populated successfully');
  } catch (error) {
    console.error('Error populating GameWeeks:', error);
    throw error; // Rilanciamo l'errore per gestirlo nel job schedulato
  } finally {
    await mongoose.disconnect();
  }
}

// Se il file viene eseguito direttamente, esegui la funzione
if (import.meta.url === `file://${process.argv[1]}`) {
  populateGameWeeks();
}