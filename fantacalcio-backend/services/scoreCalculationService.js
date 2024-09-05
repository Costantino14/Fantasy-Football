import SerieAPlayer from '../models/SerieAPlayer.js';

export const calculateWeeklyScore = async (formation, performances) => {
  let totalScore = 0;
  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

  // Otteniamo tutti i giocatori SerieA coinvolti nella formazione
  const lineupPlayerIds = Object.values(formation.lineup).flat();
  const serieAPlayers = await SerieAPlayer.find({ _id: { $in: lineupPlayerIds } });

  // Creiamo una mappa per una facile ricerca dei giocatori
  const idToSerieAPlayerMap = new Map(serieAPlayers.map(player => [player._id.toString(), player]));

  // Calcoliamo il punteggio per ogni posizione
  positions.forEach(position => {
    formation.lineup[position].forEach(lineupPlayerId => {
      const serieAPlayer = idToSerieAPlayerMap.get(lineupPlayerId.toString());
      if (serieAPlayer) {
        const performance = performances.find(p => p.playerId === serieAPlayer.id);
        if (performance) {
          totalScore += performance.fantasyScore;
        }
      }
    });
  });

  return totalScore;
};