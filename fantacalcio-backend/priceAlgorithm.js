import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import SerieAPlayer from './models/SerieAPlayer.js';
import SerieAPlayer23 from './models/SerieAPlayer23.js';

// Ottiene il percorso del file corrente e la directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica le variabili d'ambiente dal file .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Funzione per connettersi al database MongoDB
async function connectToDatabase() {
  try {
    const dbUrl = process.env.MONGO_URI;
    if (!dbUrl) {
      throw new Error('MONGO_URI non è definito nelle variabili d\'ambiente');
    }
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Funzione principale per calcolare il prezzo di un giocatore
function calculatePlayerPrice(player, stats2023) {
  console.log(`Calculating price for ${player.name}`);
  console.log(`Player data:`, JSON.stringify(player, null, 2));
  console.log(`Stats 2023:`, JSON.stringify(stats2023, null, 2));

  // Prezzo base di 2 milioni di euro
  let basePrice = 2000000;

  // Funzione di utilità per convertire valori in numeri sicuri
  const safeNumber = (value) => {
    const num = isNaN(value) ? 0 : Number(value);
    console.log(`safeNumber: ${value} -> ${num}`);
    return num;
  };

  // Calcolo del fattore età
  const ageFactor = player.age <= 23 ? 1.5 :  // Giovani promesse
                    player.age <= 28 ? 1.8 :  // Prime della carriera
                    player.age <= 32 ? 1.3 :  // Giocatori esperti
                    1;                        // Giocatori più anziani
  console.log(`Age factor: ${ageFactor}`);

  // Calcolo del fattore ruolo
  const roleFactor = player.position.includes('A') ? 1.5 :  // Attaccanti
                     player.position.includes('M') ? 1.3 :  // Centrocampisti
                     player.position.includes('D') ? 1.2 :  // Difensori
                     player.position.includes('G') ? 1.1 :  // Portieri
                     1;
  console.log(`Role factor: ${roleFactor}`);

  // Calcolo del fattore prestazioni
  let performanceFactor = 1;
  if (stats2023) {
    // Usa le statistiche del 2023 se disponibili
    const appearances = safeNumber(stats2023.appearences);
    const minutes = safeNumber(stats2023.minutes);
    console.log(`Appearances: ${appearances}, Minutes: ${minutes}`);

    if (player.position !== "G") {
      // Calcolo per giocatori di movimento
      const goals = safeNumber(stats2023.totGoal);
      const assists = safeNumber(stats2023.assist);
      console.log(`Goals: ${goals}, Assists: ${assists}`);
      
      performanceFactor += (goals * 0.5) + (assists * 0.3);
      
      // Bonus per l'efficienza nel segnare
      if (appearances > 0) {
        const goalsPerGame = goals / appearances;
        console.log(`Goals per game: ${goalsPerGame}`);
        if (goalsPerGame > 0.5) performanceFactor *= 1.5;
        else if (goalsPerGame > 0.3) performanceFactor *= 1.3;
      }
    } else {
      // Calcolo per i portieri
      const cleanSheets = safeNumber(stats2023.saved);
      const goalsConceded = safeNumber(stats2023.goalConceded);
      console.log(`Clean sheets: ${cleanSheets}, Goals conceded: ${goalsConceded}`);
      
      performanceFactor += (cleanSheets * 0.2) - (goalsConceded * 0.05);
    }
    
    // Fattore basato sui minuti giocati
    const minutesFactor = 1 + (minutes / 3000);  // 3000 minuti è circa una stagione completa
    console.log(`Minutes factor: ${minutesFactor}`);
    performanceFactor *= minutesFactor;

    // Penalità per poche apparizioni
    if (appearances < 10) {
      performanceFactor *= 0.5;
      console.log(`Applied penalty for few appearances`);
    }
  } else {
    // Usa i dati correnti se le statistiche del 2023 non sono disponibili
    console.log(`No 2023 stats found for ${player.name}, using current data`);
    const appearances = safeNumber(player.appearences);
    const goals = safeNumber(player.totGoal);
    const assists = safeNumber(player.assist);
    const minutes = safeNumber(player.minutes);

    performanceFactor += (goals * 0.5) + (assists * 0.3);
    performanceFactor *= 1 + (minutes / 3000);

    if (appearances < 10) performanceFactor *= 0.5;
  }
  console.log(`Performance factor: ${performanceFactor}`);

  // Calcolo del prezzo finale
  let finalPrice = basePrice * ageFactor * roleFactor * performanceFactor;
  console.log(`Final price before rounding: ${finalPrice}`);

  // Arrotondamento del prezzo finale al 100.000 più vicino, con un minimo di 1 milione
  finalPrice = Math.max(Math.round(finalPrice / 100000) * 100000, 1000000);
  console.log(`Final price after rounding: ${finalPrice}`);

  return finalPrice;
}

// Funzione per aggiornare i prezzi di tutti i giocatori nel database
async function updatePlayerPricesInDatabase() {
  try {
    // Ottiene tutti i giocatori dal database attuale
    const players = await SerieAPlayer.find();
    console.log(`Found ${players.length} players in the current database`);

    for (const player of players) {
      console.log(`Processing player: ${player.name}`);
      
      // Cerca le statistiche del 2023 per questo giocatore
      const stats2023 = await SerieAPlayer23.findOne({ name: player.name });

      // Calcola il nuovo prezzo
      const newPrice = calculatePlayerPrice(player, stats2023);
      
      // Aggiorna il prezzo e la data di ultimo aggiornamento nel database
      await SerieAPlayer.findByIdAndUpdate(player._id, { 
        price: newPrice,
        lastUpdated: new Date()
      });
      console.log(`Updated price for ${player.name}: €${(newPrice / 1000000).toFixed(2)}M`);
    }

    console.log('All player prices have been updated.');
  } catch (error) {
    console.error('Error updating player prices:', error);
  } finally {
    // Chiude la connessione al database
    await mongoose.connection.close();
  }
}

// Funzione principale che avvia il processo
async function main() {
  await connectToDatabase();
  await updatePlayerPricesInDatabase();
}

// Avvia il programma e gestisce eventuali errori non catturati
main().catch(console.error);