import MarketWindow from '../models/MarketWindow.js';

// Middleware per verificare se il mercato è attualmente aperto
export const checkMarketOpen = async (req, res, next) => {
 
  // Ottiene la data e l'ora corrente
  const now = new Date();

  // Cerca una finestra di mercato attiva nel database
  const activeWindow = await MarketWindow.findOne({
    startDate: { $lte: now },  // La data di inizio è minore o uguale a ora
    endDate: { $gte: now },    // La data di fine è maggiore o uguale a ora
    isActive: true             // La finestra è contrassegnata come attiva
  });

  // Se non viene trovata una finestra di mercato attiva
  if (!activeWindow) {
    // Restituisce una risposta 403 (Forbidden) con un messaggio
    return res.status(403).json({ message: "Il mercato è attualmente chiuso." });
  }

  // Se viene trovata una finestra attiva, passa al prossimo middleware
  next();
};