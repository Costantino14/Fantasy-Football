import mongoose from 'mongoose';
import { fetchSerieAPlayers } from '../fantacalcio-frontend/src/services/apisport.js';
import SerieAPlayer from './models/SerieAPlayer.js';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

async function initializeDatabase() {
  try {
    // Connessione al database MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connesso al database MongoDB');

    let currentPage = 1;
    let hasMorePages = true;
    let totalNewPlayers = 0;
    let totalUpdatedPlayers = 0;

    // Ciclo di recupero e aggiornamento dei dati dei giocatori
    while (hasMorePages) {
      console.log(`Inizio caricamento dei giocatori della Serie A dalla pagina ${currentPage}...`);
      const { players, lastPage } = await fetchSerieAPlayers(currentPage);
      
      console.log(`Elaborazione di ${players.length} giocatori dalla pagina ${currentPage}...`);
      
      let newPlayersCount = 0;
      let updatedPlayersCount = 0;

      // Aggiorna o inserisce ogni giocatore nel database
      for (const player of players) {
        const result = await SerieAPlayer.findOneAndUpdate(
          { id: player.id },
          player,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (result.isNew) {
          newPlayersCount++;
        } else {
          updatedPlayersCount++;
        }
      }

      totalNewPlayers += newPlayersCount;
      totalUpdatedPlayers += updatedPlayersCount;
      
      console.log(`Pagina ${currentPage} completata.`);
      console.log(`Nuovi giocatori aggiunti: ${newPlayersCount}`);
      console.log(`Giocatori aggiornati: ${updatedPlayersCount}`);

      if (currentPage >= lastPage) {
        hasMorePages = false;
      } else {
        currentPage++;
      }

      // Pausa di 2 secondi tra le richieste per evitare di sovraccaricare l'API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('Caricamento completato con successo.');
    console.log(`Totale nuovi giocatori aggiunti: ${totalNewPlayers}`);
    console.log(`Totale giocatori aggiornati: ${totalUpdatedPlayers}`);

    // Conta totale dei giocatori nel database
    const totalPlayers = await SerieAPlayer.countDocuments();
    console.log(`Totale giocatori nel database: ${totalPlayers}`);

  } catch (error) {
    console.error('Errore durante l\'inizializzazione del database:', error);
  } finally {
    // Chiude la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
    process.exit(0);
  }
}

// Esegue la funzione di inizializzazione
initializeDatabase();