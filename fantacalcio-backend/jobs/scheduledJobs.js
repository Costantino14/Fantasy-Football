// import necessari
import cron from 'node-cron';
import { populateGameWeeks } from '../populateGameWeeks.js';

export function startScheduledJobs() {

  // Esegue l'aggiornamento delle gameweek ogni lunedì alle 01:00
  cron.schedule('0 1 * * 1', async () => {
    console.log('Esecuzione aggiornamento settimanale delle gameweek...');
    try {
      await populateGameWeeks();
      console.log('Aggiornamento delle gameweek completato con successo.');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento delle gameweek:', error);
    }
  });
}