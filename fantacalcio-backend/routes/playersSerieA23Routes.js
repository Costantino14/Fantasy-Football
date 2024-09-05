import express from 'express';
import SerieAPlayer23 from '../models/SerieAPlayer23.js';
import { updateSerieAPlayers } from '../jobs/updateSerieAPlayersJob.js';

const router = express.Router();

// GET: Recupera tutti i giocatori della Serie A 2023
router.get('/', async (req, res) => {
  try {
    const players = await SerieAPlayer23.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Recupera un giocatore specifico per ID
router.get('/:id', async (req, res) => {
  try {
    const player = await SerieAPlayer23.findOne({ id: req.params.id });
    if (player) {
      res.json(player);
    } else {
      res.status(404).json({ message: 'Giocatore non trovato' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Aggiorna il database dei giocatori (riservato all'admin)
router.post('/update', async (req, res) => {
  try {
    await updateSerieAPlayers();
    res.json({ message: 'Database aggiornato con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Recupera i giocatori di una squadra specifica
router.get('/team/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    console.log(`Cercando giocatori per la squadra: ${teamName}`);
    
    // Usa una regex case-insensitive per la ricerca
    const players = await SerieAPlayer23.find({ team: { $regex: new RegExp(teamName, 'i') } });
    
    console.log(`Trovati ${players.length} giocatori`);
    console.log('Primi 3 giocatori trovati:', players.slice(0, 3));
    
    res.json(players);
  } catch (error) {
    console.error('Errore nel recupero dei giocatori:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;