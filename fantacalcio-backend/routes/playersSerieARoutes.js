import express from 'express';
import SerieAPlayer from '../models/SerieAPlayer.js';
import { updateSerieAPlayers } from '../jobs/updateSerieAPlayersJob.js';

const router = express.Router();

// GET tutti i giocatori
router.get('/', async (req, res) => {
  try {
    const players = await SerieAPlayer.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET un giocatore specifico per ID
router.get('/:id', async (req, res) => {
  try {
    const player = await SerieAPlayer.findOne({ id: req.params.id });
    if (player) {
      res.json(player);
    } else {
      res.status(404).json({ message: 'Giocatore non trovato' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST per aggiornare il database (questo dovrebbe essere protetto e usato solo internamente o da un admin)
router.post('/update', async (req, res) => {
  try {
    await updateSerieAPlayers();
    res.json({ message: 'Database aggiornato con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/team/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    console.log(`Cercando giocatori per la squadra: ${teamName}`);
    
    // Usa una regex case-insensitive per la ricerca
    const players = await SerieAPlayer.find({ team: { $regex: new RegExp(teamName, 'i') } });
    
    console.log(`Trovati ${players.length} giocatori`);
    console.log('Primi 3 giocatori trovati:', players.slice(0, 3));
    
    res.json(players);
  } catch (error) {
    console.error('Errore nel recupero dei giocatori:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;