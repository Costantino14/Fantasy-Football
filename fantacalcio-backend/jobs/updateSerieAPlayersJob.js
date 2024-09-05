import mongoose from 'mongoose';
import { fetchSerieAPlayers } from '../../fantacalcio-frontend/src/services/apisport.js';
import SerieAPlayer from '../models/SerieAPlayer.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Ottiene l'URI di MongoDB dalle variabili d'ambiente
const MONGODB_URI = process.env.MONGO_URI;

export async function updateSerieAPlayers() {
  try {
    // Connessione al database MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connesso al database MongoDB');

    let currentPage = 1;
    let hasMorePages = true;
    let totalUpdatedPlayers = 0;

    // Ciclo di aggiornamento dei giocatori
    while (hasMorePages) {
      console.log(`Inizio aggiornamento dei giocatori della Serie A dalla pagina ${currentPage}...`);
      // Recupera i dati dei giocatori dalla API esterna
      const { players, lastPage } = await fetchSerieAPlayers(currentPage);
      
      console.log(`Elaborazione di ${players.length} giocatori dalla pagina ${currentPage}...`);
      
      let updatedPlayersCount = 0;

      // Aggiorna o inserisce ogni giocatore nel database
      for (const player of players) {
        const result = await SerieAPlayer.findOneAndUpdate(
          { id: player.id },
          player,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Conta solo gli aggiornamenti, non le nuove inserzioni
        if (!result.isNew) {
          updatedPlayersCount++;
        }
      }

      totalUpdatedPlayers += updatedPlayersCount;
      
      console.log(`Pagina ${currentPage} completata.`);
      console.log(`Giocatori aggiornati: ${updatedPlayersCount}`);

      // Controlla se ci sono altre pagine da elaborare
      if (currentPage >= lastPage) {
        hasMorePages = false;
      } else {
        currentPage++;
      }

      // Pausa di 2 secondi tra le richieste per evitare di sovraccaricare l'API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Pausa di 1 minuto ogni 10 pagine per rispettare i limiti dell'API
      if (currentPage % 10 === 0) {
        console.log('Pausa di 1 minuto per rispettare i limiti dell\'API...');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    }

    console.log('Aggiornamento completato con successo.');
    console.log(`Totale giocatori aggiornati: ${totalUpdatedPlayers}`);

    // Conta e mostra il numero totale di giocatori nel database
    const totalPlayers = await SerieAPlayer.countDocuments();
    console.log(`Totale giocatori nel database: ${totalPlayers}`);

  } catch (error) {
    console.error('Errore durante l\'aggiornamento del database:', error);
  } finally {
    // Chiude la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
  }
}

// Pianifica l'esecuzione dell'aggiornamento ogni giorno alle 01:30
cron.schedule('30 1 * * *', async () => {
  console.log('Avvio aggiornamento giornaliero dei giocatori Serie A...');
  await updateSerieAPlayers();
});

console.log('Job di aggiornamento Serie A pianificato.');

export default updateSerieAPlayers;