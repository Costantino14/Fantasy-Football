import Gameweek from '../models/Gameweek';
import Team from '../models/Team';
import PlayerPerformance from '../models/PlayerPerformance';

class GameService {
  // Recupera la gameweek attualmente attiva
  async getCurrentGameweek() {
    const currentGameweek = await Gameweek.findOne({ isActive: true });
    if (!currentGameweek) {
      throw new Error("Nessuna gameweek attiva trovata");
    }
    return currentGameweek;
  }

  // Verifica se l'utente può impostare la formazione
  async canSetFormation(userId) {
    const currentGameweek = await this.getCurrentGameweek();
    const now = new Date();
    return now < currentGameweek.startDate; // Può impostare se la data attuale è prima dell'inizio della gameweek
  }

  // Imposta la formazione per l'utente
  async setFormation(userId, formation, lineup) {
    const currentGameweek = await this.getCurrentGameweek();
    const team = await Team.findOne({ owner: userId });
    if (!team) {
      throw new Error("Team non trovato");
    }

    // Aggiorna o aggiunge la formazione per la gameweek corrente
    const formationIndex = team.activeFormations.findIndex(f => f.gameweek === currentGameweek.number);
    if (formationIndex > -1) {
      team.activeFormations[formationIndex] = { gameweek: currentGameweek.number, formation, lineup };
    } else {
      team.activeFormations.push({ gameweek: currentGameweek.number, formation, lineup });
    }

    await team.save();
    return team.activeFormations.find(f => f.gameweek === currentGameweek.number);
  }

  // Recupera la formazione dell'utente per la gameweek corrente
  async getFormation(userId) {
    const currentGameweek = await this.getCurrentGameweek();
    const team = await Team.findOne({ owner: userId }).populate('activeFormations');
    return team.activeFormations.find(f => f.gameweek === currentGameweek.number);
  }

  // Recupera le performance dei giocatori nella formazione dell'utente
  async getPlayerPerformances(userId) {
    const currentGameweek = await this.getCurrentGameweek();
    const formation = await this.getFormation(userId);
    if (!formation) {
      throw new Error("Nessuna formazione trovata per questa gameweek");
    }

    const playerIds = [
      ...formation.lineup.Goalkeeper,
      ...formation.lineup.Defender,
      ...formation.lineup.Midfielder,
      ...formation.lineup.Attacker
    ].map(p => p.toString());

    return PlayerPerformance.find({
      gameweek: currentGameweek.number,
      playerId: { $in: playerIds }
    });
  }

  // Calcola il punteggio della gameweek per l'utente
  async calculateGameweekScore(userId) {
    const performances = await this.getPlayerPerformances(userId);
    return performances.reduce((total, perf) => total + perf.fantasyScore, 0);
  }

  // Aggiorna il punteggio totale dell'utente
  async updateTotalScore(userId) {
    const team = await Team.findOne({ owner: userId });
    const currentGameweek = await this.getCurrentGameweek();
    const gameweekScore = await this.calculateGameweekScore(userId);

    team.gameweekScores.push({ gameweek: currentGameweek.number, score: gameweekScore });
    team.totalScore += gameweekScore;
    await team.save();

    return team.totalScore;
  }

  // Verifica se la gameweek è attualmente attiva
  async isGameweekActive() {
    const currentGameweek = await this.getCurrentGameweek();
    const now = new Date();
    return now >= currentGameweek.startDate && now <= currentGameweek.endDate;
  }

  // Passa alla gameweek successiva
  async moveToNextGameweek() {
    const currentGameweek = await this.getCurrentGameweek();
    currentGameweek.isActive = false;
    currentGameweek.isCompleted = true;
    await currentGameweek.save();

    const nextGameweek = await Gameweek.findOneAndUpdate(
      { number: currentGameweek.number + 1 },
      { isActive: true },
      { new: true }
    );

    if (!nextGameweek) {
      throw new Error("Nessuna gameweek successiva trovata");
    }

    return nextGameweek;
  }
}

export default new GameService();