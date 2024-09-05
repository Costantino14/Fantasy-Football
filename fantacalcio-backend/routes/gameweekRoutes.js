import express from 'express';
import * as gameweekService from '../services/gameweekService.js';

const router = express.Router();

// GET: Recupera la gameweek corrente
router.get('/current', async (req, res) => {
  try {
    const currentGameweek = await gameweekService.getCurrentGameWeek();
    if (!currentGameweek) {
      return res.status(404).json({ message: "Nessuna gameweek attiva trovata" });
    }
    res.json(currentGameweek);
  } catch (error) {
    res.status(500).json({ message: "Errore nel recupero della gameweek corrente", error: error.message });
  }
});

// GET: Recupera tutte le gameweek
router.get('/all', async (req, res) => {
  try {
    const gameweeks = await gameweekService.getAllGameWeeks();
    res.json(gameweeks);
  } catch (error) {
    res.status(500).json({ message: "Errore nel recupero di tutte le gameweek", error: error.message });
  }
});

// POST: Imposta una gameweek come attiva
router.post('/set-active', async (req, res) => {
  try {
    const activeGameweek = await gameweekService.setActiveGameWeek();
    if (!activeGameweek) {
      return res.status(404).json({ message: "Nessuna gameweek attiva trovata per la data corrente" });
    }
    res.json(activeGameweek);
  } catch (error) {
    res.status(500).json({ message: "Errore nell'impostazione della gameweek attiva", error: error.message });
  }
});

// PUT: Aggiorna lo stato di una gameweek specifica
router.put('/:number/status', async (req, res) => {
  try {
    const { number } = req.params;
    const { isCompleted } = req.body;
    await gameweekService.updateGameWeekStatus(parseInt(number), isCompleted);
    res.json({ message: "Stato della gameweek aggiornato con successo" });
  } catch (error) {
    res.status(500).json({ message: "Errore nell'aggiornamento dello stato della gameweek", error: error.message });
  }
});

export default router;