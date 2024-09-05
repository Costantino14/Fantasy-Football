import express from 'express';
import { 
  updatePerformancesForDate, 
  getPlayerPerformances, 
  updateTeamScores 
} from '../../fantacalcio-frontend/src/services/apisport.js';

const router = express.Router();

// POST: Aggiorna le performance dei giocatori per una data specifica
router.post('/update', async (req, res) => {
  try {
    const { date } = req.body;
    await updatePerformancesForDate(new Date(date));
    res.json({ message: 'Performances updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Recupera le performance dei giocatori per una specifica gameweek
router.get('/gameweek/:gameweek', async (req, res) => {
  try {
    const { gameweek } = req.params;
    const performances = await getPlayerPerformances(parseInt(gameweek));
    res.json(performances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Aggiorna i punteggi delle squadre per una specifica gameweek
router.post('/update-team-scores', async (req, res) => {
  try {
    const { gameweek } = req.body;
    await updateTeamScores(gameweek);
    res.json({ message: 'Team scores updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;