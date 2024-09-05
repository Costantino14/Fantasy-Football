// import necessari
import cron from 'node-cron';
import MarketWindow from '../models/MarketWindow.js';

export const scheduleMarketWindowJobs = () => {
  // Esegue ogni ora il controllo
  cron.schedule('0 * * * *', async () => {
    const now = new Date();
    
    // Attiva le finestre che dovrebbero iniziare
    await MarketWindow.updateMany(
      { startDate: { $lte: now }, endDate: { $gt: now }, isActive: false },
      { isActive: true }
    );

    // Disattiva le finestre che sono terminate
    await MarketWindow.updateMany(
      { endDate: { $lte: now }, isActive: true },
      { isActive: false }
    );
  });
};