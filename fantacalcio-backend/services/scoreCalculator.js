import Team from '../models/Team.js';
import PlayerPerformance from '../models/PlayerPerformance.js';

export const calculateScores = async (gameweek) => {
  // Recupera tutti i team con le formazioni attive popolate
  const teams = await Team.find().populate('activeFormations.lineup.Goalkeeper activeFormations.lineup.Defender activeFormations.lineup.Midfielder activeFormations.lineup.Attacker');
  
  for (const team of teams) {
    // Trova la formazione attiva per la gameweek specificata
    const activeFormation = team.activeFormations.find(f => f.gameweek === gameweek);
    if (activeFormation) {
      let gameweekScore = 0;
      
      // Calcola il punteggio per ogni posizione
      for (const position of ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker']) {
        for (const player of activeFormation.lineup[position]) {
          // Trova la performance del giocatore per questa gameweek
          const performance = await PlayerPerformance.findOne({
            gameweek,
            playerId: player.id
          });
          
          if (performance) {
            gameweekScore += performance.fantasyScore;
          }
        }
      }
      
      // Aggiorna il punteggio del team per questa gameweek
      team.gameweekScores.push({ gameweek, score: gameweekScore });
      team.totalScore += gameweekScore;
      await team.save();
      
      console.log(`Team ${team._id} score updated. Gameweek score: ${gameweekScore}, Total score: ${team.totalScore}`);
    }
  }
};

export default {
  calculateScores
};