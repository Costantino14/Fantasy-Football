import express from 'express';
import mongoose from 'mongoose';
import Team from '../models/Team.js';
import SerieAPlayer from '../models/SerieAPlayer.js';
import PlayerPerformance from '../models/PlayerPerformance.js';
import User from '../models/Users.js';
import MarketWindow from '../models/MarketWindow.js';
import { checkMarketOpen } from '../middlewares/checkMarketOpen.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { canSetFormation } from '../services/gameweekService.js';
import { calculateWeeklyScore } from '../services/scoreCalculationService.js';


const router = express.Router();

// Costanti per i limiti della squadra
const BUDGET_LIMIT = 300000000; // Budget totale in milioni
const TEAM_SIZE_LIMIT = 24;
const ROLE_LIMITS = {
  Goalkeeper: 3,
  Defender: 8,
  Midfielder: 8,
  Attacker: 5
};

// GET: Recupera lo stato del mercato
router.get('/market-status', async (req, res) => {
  try {
    const now = new Date();
    const activeWindow = await MarketWindow.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true
    });

    res.json({
      isOpen: !!activeWindow,
      message: activeWindow 
        ? "Il mercato è aperto." 
        : "Il mercato è attualmente chiuso.",
      nextOpeningDate: activeWindow ? null : await getNextOpeningDate()
    });
  } catch (error) {
    console.error('Errore nel recupero dello stato del mercato:', error);
    res.status(500).json({ message: "Errore nel recupero dello stato del mercato" });
  }
});

async function getNextOpeningDate() {
  const nextWindow = await MarketWindow.findOne({
    startDate: { $gt: new Date() },
    isActive: true
  }).sort('startDate');
  return nextWindow ? nextWindow.startDate : null;
}

// GET la squadra di un utente
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Ricerca team per userId:', userId);

    const team = await Team.findOne({ owner: userId });
    
    if (!team) {
      console.log('Nessun team trovato per userId:', userId);
      return res.status(404).json({ message: 'Squadra non trovata' });
    }

    console.log('Team trovato:', team);
    res.json(team);
  } catch (error) {
    console.error('Errore nel recupero della squadra:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// PATCH modifica la squadra aggiungendo un giocatore
router.patch('/:userId/players', authMiddleware, checkMarketOpen, async (req, res) => {
  try {
    const { userId } = req.params;
    const { playerId } = req.body;
    console.log(`Tentativo di acquisto: userId=${userId}, playerId=${playerId}`);
    

    // Trova lo slot del team associato all'utente
    const team = await Team.findOne({ owner: userId });
    if (!team) {
      return res.status(404).json({ message: "Team non trovato per questo utente" });
    }

    // Trova il giocatore che si sta cercando di acquistare
    const player = await SerieAPlayer.findOne({ _id: playerId });
    if (!player) {
      return res.status(404).json({ message: "Giocatore non trovato" });
    }
    console.log(`Posizione: ${player.position}, ${ROLE_LIMITS}, ${team.playerCounts}`)
    // 1. Controlla se il budget è sufficiente
    if (team.budget < player.price) {
      return res.status(400).json({ message: "Budget insufficiente per acquistare questo giocatore" });
    }

    // 2. Controlla il limite di giocatori per ruolo
    const currentPositionCount = team.playerCounts[player.position] || 0;
    if (currentPositionCount >= ROLE_LIMITS[player.position]) {
      return res.status(400).json({ message: `Hai raggiunto il limite massimo di giocatori per il ruolo ${player.position}` });
    }

    // 3. Controlla se il giocatore è già nella squadra
    if (team.players.some(p => p.player.toString() === player._id.toString())) {
      return res.status(400).json({ message: "Questo giocatore è già nella tua squadra" });
    }

    // 4. Controlla il limite totale di giocatori
    if (team.players.length >= TEAM_SIZE_LIMIT) {
      return res.status(400).json({ message: "Hai raggiunto il limite massimo di giocatori per la squadra" });
    }

    // Se tutte le condizioni sono soddisfatte, aggiorna il team
    team.players.push({ id: player.id, player: player._id, position: player.position });
    team.budget -= player.price;
    team.playerCounts[player.position] = (team.playerCounts[player.position] || 0) + 1;

    // Salva le modifiche
    await team.save();
    res.json({ 
      message: "Giocatore aggiunto con successo", 
      team: team 
    });
    
  } catch (error) {
    console.error('Errore nell\'aggiunta del giocatore:', error);
    res.status(500).json({ message: "Errore interno del server", error: error.message });
  }
});

// DELETE: Rimuove un giocatore dalla squadra
router.delete('/:userId/removePlayer/:playerId', authMiddleware, checkMarketOpen, async (req, res) => {
  try {
    const { userId, playerId } = req.params;
    console.log(`Tentativo di rimozione del giocatore: userId=${userId}, playerId=${playerId}`);

    const team = await Team.findOne({ owner: userId });
    console.log('Team trovato:', JSON.stringify(team, null, 2));

    if (!team) {
      return res.status(404).json({ message: "Squadra non trovata" });
    }

    const playerIndex = team.players.findIndex(p => p.player.toString() === playerId);
    console.log('Indice del giocatore trovato:', playerIndex);

    if (playerIndex === -1) {
      return res.status(404).json({ message: "Giocatore non trovato nella squadra" });
    }

    const removedPlayerRef = team.players[playerIndex];
    console.log('Riferimento al giocatore da rimuovere:', JSON.stringify(removedPlayerRef, null, 2));

    // Recupera i dati del giocatore dal database SerieAPlayer
    const playerData = await SerieAPlayer.findById(playerId);
    if (!playerData) {
      return res.status(404).json({ message: "Dati del giocatore non trovati nel database" });
    }
    console.log('Dati del giocatore recuperati:', JSON.stringify(playerData, null, 2));

    // Aggiorna il budget e il conteggio dei giocatori
    team.budget += playerData.price || 0;
    team.playerCounts[playerData.position]--;

    // Assicurati che il conteggio non diventi negativo
    if (team.playerCounts[playerData.position] < 0) {
      team.playerCounts[playerData.position] = 0;
    }

    // Rimuovi il giocatore dall'array
    team.players.splice(playerIndex, 1);

    console.log('Team prima del salvataggio:', JSON.stringify(team, null, 2));

    // Salva le modifiche
    await team.save();

    console.log('Team dopo il salvataggio:', JSON.stringify(team, null, 2));

    res.json({ 
      message: "Giocatore rimosso con successo", 
      team: team 
    });
  } catch (error) {
    console.error('Errore dettagliato nella rimozione del giocatore:', error);
    res.status(500).json({ message: "Errore interno del server", error: error.message });
  }
});

// GET tutti i giocatori disponibili
router.get('/market/players', authMiddleware, async (req, res) => {
  try {
    const allPlayers = await Player.find();
    res.json(allPlayers);
  } catch (error) {
    console.error('Errore nel recupero dei giocatori:', error);
    res.status(500).json({ message: "Errore nel recupero dei giocatori" });
  }
});

// POST crea o recupera il team di un utente
router.post('/getOrCreate', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(`Tentativo di recupero/creazione team per userId: ${userId}`);
    
    let team = await Team.findOne({ owner: userId });
    if (!team) {
      console.log(`Team non trovato, creazione nuovo team per userId: ${userId}`);
      team = new Team({
        owner: userId,
        name: `Team di ${userId}`,
        players: [],
        budget: BUDGET_LIMIT
      });
      await team.save();
      
      // Aggiorna l'utente con il riferimento al nuovo team
      await User.findByIdAndUpdate(userId, { team: team._id });
    } else {
      console.log(`Team esistente trovato per userId: ${userId}`);
    }
    
    console.log(`Team recuperato/creato:`, team);
    res.json(team);
  } catch (error) {
    console.error('Errore nel recupero/creazione del team:', error);
    res.status(500).json({ message: "Errore interno del server", error: error.message });
  }
});


// POST: Imposta la formazione per una gameweek
router.post('/:userId/formation', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { formation, lineup } = req.body;

    //Controlla se è possibile impostare la formazione
    const formationStatus = await canSetFormation();
    if (!formationStatus.canSet) {
      return res.status(400).json({ message: formationStatus.message });
    }
    //Contralla se esiste il team
    const team = await Team.findOne({ owner: userId });
    if (!team) {
      return res.status(404).json({ message: "Team non trovato" });
    }

    const formationIndex = team.activeFormations.findIndex(f => f.gameweek === formationStatus.gameweek);
    if (formationIndex > -1) {
      team.activeFormations[formationIndex] = { gameweek: formationStatus.gameweek, formation, lineup };
    } else {
      team.activeFormations.push({ gameweek: formationStatus.gameweek, formation, lineup });
    }

    await team.save();

    res.json({ 
      message: "Formazione salvata con successo", 
      gameweek: formationStatus.gameweek,
      deadline: formationStatus.deadline,
      formation: team.activeFormations.find(f => f.gameweek === formationStatus.gameweek) 
    });
  } catch (error) {
    res.status(500).json({ message: "Errore nel salvataggio della formazione", error: error.message });
  }
});

// GET: Recupera la formazione di un utente
router.get('/:userId/formation', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const team = await Team.findOne({ owner: userId });
    if (!team) {
      return res.status(404).json({ message: "Team non trovato" });
    }
    
    res.json(team.formation || null);
  } catch (error) {
    res.status(500).json({ message: "Errore nel recupero della formazione", error: error.message });
  }
});


// GET: Recupera lo stato della formazione
router.get('/:userId/formation-status', authMiddleware, async (req, res) => {
  try {
    const formationStatus = await canSetFormation();
    console.log('Stato formazione:', formationStatus);
    res.json(formationStatus);
  } catch (error) {
    console.error('Errore nel recupero dello stato della formazione:', error);
    res.status(500).json({ message: "Errore interno del server", error: error.message });
  }
});

// POST: Calcola il punteggio per una gameweek
router.post('/:userId/calculate-score', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { gameweek } = req.body;

    const team = await Team.findOne({ owner: userId });
    if (!team) {
      return res.status(404).json({ message: "Team non trovato" });
    }

    const activeFormation = team.activeFormations.find(f => f.gameweek === gameweek);
    if (!activeFormation) {
      return res.status(400).json({ message: "Formazione non trovata per questa gameweek" });
    }

    const performances = await PlayerPerformance.find({ gameweek });

    const weeklyScore = await calculateWeeklyScore(activeFormation, performances);

    // Aggiorna il punteggio settimanale
    const gameweekScoreIndex = team.gameweekScores.findIndex(gs => gs.gameweek === gameweek);
    if (gameweekScoreIndex > -1) {
      team.gameweekScores[gameweekScoreIndex].score = weeklyScore;
    } else {
      team.gameweekScores.push({ gameweek, score: weeklyScore });
    }

    // Aggiorna il punteggio totale
    team.totalScore = team.gameweekScores.reduce((total, gs) => total + gs.score, 0);

    await team.save();

    res.json({ 
      message: "Punteggio calcolato e aggiornato con successo",
      weeklyScore,
      totalScore: team.totalScore
    });
  } catch (error) {
    console.error('Errore nel calcolo del punteggio:', error);
    res.status(500).json({ message: "Errore interno del server", error: error.message });
  }
});


export default router;