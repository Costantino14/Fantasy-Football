import express from 'express';
import MarketWindow from '../models/MarketWindow.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Middleware condizionale per proteggere le route admin
router.use((req, res, next) => {
  // Applica autenticazione e middleware admin a tutte le route tranne /market-status
  if (req.path !== '/market-status') {
    authMiddleware(req, res, () => {
      adminMiddleware(req, res, next);
    });
  } else {
    next();
  }
});

// GET: Recupera tutte le finestre di mercato
router.get('/market-windows', async (req, res) => {
  try {
    const windows = await MarketWindow.find().sort({ startDate: 1 });
    res.json(windows);
  } catch (error) {
    console.error('Errore nel recupero delle finestre di mercato:', error);
    res.status(500).json({ 
      message: "Errore nel recupero delle finestre di mercato",
      error: error.message 
    });
  }
});

// POST: Crea una nuova finestra di mercato
router.post('/market-windows', async (req, res) => {
  try {
    console.log('Dati ricevuti:', req.body);
    const { startDate, endDate, isActive } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Le date di inizio e fine sono obbligatorie" });
    }

    const newWindow = new MarketWindow({ startDate, endDate, isActive });
    console.log('Nuova finestra creata:', newWindow);
    
    await newWindow.save();
    console.log('Finestra salvata nel database');
    
    res.status(201).json(newWindow);
  } catch (error) {
    console.error('Errore nella creazione della finestra di mercato:', error);
    res.status(400).json({ message: "Errore nella creazione della finestra di mercato", error: error.message });
  }
});

// PUT: Aggiorna una finestra di mercato esistente
router.put('/market-windows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, isActive } = req.body;
    const updatedWindow = await MarketWindow.findByIdAndUpdate(
      id, 
      { startDate, endDate, isActive },
      { new: true }
    );
    res.json(updatedWindow);
  } catch (error) {
    res.status(400).json({ message: "Errore nell'aggiornamento della finestra di mercato" });
  }
});

// GET: Recupera lo stato corrente del mercato
router.get('/market-status', async (req, res) => {
  try {
    console.log('Richiesta GET /market-status ricevuta');
    const now = new Date();
    const activeWindow = await MarketWindow.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true
    });

    console.log('Finestra attiva trovata:', activeWindow);

    const response = {
      isOpen: !!activeWindow,
      message: activeWindow ? "Il mercato è aperto." : "Il mercato è chiuso.",
      nextOpeningDate: activeWindow ? null : await getNextOpeningDate()
    };

    console.log('Risposta market-status:', response);
    res.json(response);
  } catch (error) {
    console.error('Errore nel recupero dello stato del mercato:', error);
    res.status(500).json({ message: "Errore nel recupero dello stato del mercato", error: error.message });
  }
});

// Funzione helper per ottenere la data della prossima apertura del mercato
async function getNextOpeningDate() {
  const now = new Date();
  const nextWindow = await MarketWindow.findOne({
    startDate: { $gt: now },
    isActive: true
  }).sort('startDate');
  return nextWindow ? nextWindow.startDate : null;
}

export default router;