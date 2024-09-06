import axios from 'axios';
import PlayerPerformance from '../../../fantacalcio-backend/models/PlayerPerformance.js';
import Team from '../../../fantacalcio-backend/models/Team.js';


// Vecchie Chiavi'51359a0e1e98395b680398d164617249','e34be750ace0565de34bc91ff1c7112a','dfbed93db51276f477fd33c666a2f9db','f999eefeb22ef86d1b15f56ce1d1f911', '69b6dac7fa977bff6a8bfb4d5f2da069','757eacb3c8189beb6908a2bb3bb67faf','8275bbd2b3f2949d1472563cf96433bd'
// Chiavi API per l'autenticazione
const API_KEYS = ['03cc38b86dfac37d95d78223677ea20f', '03cc38b86dfac37d95d78223677ea20f', '03cc38b86dfac37d95d78223677ea20f', ];
const API_HOST = 'v3.football.api-sports.io';
const SERIE_A_LEAGUE_ID = 135;
const CURRENT_SEASON = 2024;

// Funzione per creare un'istanza di Axios configurata per l'API
const createApiInstance = (apiKey) => {
  return axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': API_HOST
    },
    timeout: 10000 // Aggiungiamo un timeout per evitare attese infinite

  });
};

// Funzione di utilità per creare un ritardo
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Funzione per effettuare chiamate API con fallback su multiple chiavi
const apiCallWithFallback = async (endpoint, params) => {
  let lastError;
  for (let i = 0; i < API_KEYS.length; i++) {
    const api = createApiInstance(API_KEYS[i]);
    try {
      console.log(`Tentativo con la chiave API ${i + 1}`);
      const response = await api.get(endpoint, { params });
      
      // Controlla se la risposta indica che la chiave ha esaurito le chiamate
      if (response.data.errors && response.data.errors.requests) {
        console.warn(`La chiave API ${i + 1} ha esaurito le chiamate`);
        continue; // Passa alla chiave successiva
      }
      
      if (response.status === 200 && response.data.results > 0) {
        console.log(`Successo con la chiave API ${i + 1}`);
        return response.data;
      } else {
        console.warn(`Risposta non valida dalla chiave API ${i + 1}`);
        continue; // Passa alla chiave successiva
      }
    } catch (error) {
      console.warn(`Fallimento con la chiave API ${i + 1}: ${error.message}`);
      
      // Se l'errore è dovuto al limite di chiamate raggiunto, passa alla chiave successiva
      if (error.response && error.response.status === 429) {
        console.warn(`Limite di chiamate raggiunto per la chiave API ${i + 1}`);
        continue; // Passa alla chiave successiva
      }
      
      lastError = error;
    }
    
    if (i < API_KEYS.length - 1) {
      console.log(`Attesa prima di provare la prossima chiave...`);
      await delay(2000);
    }
  }
  
  console.error('Tutte le chiavi API hanno fallito');
  throw lastError || new Error('Fallimento di tutte le chiavi API');
};

// Funzione per recuperare la classifica
export const fetchStandings = async (league, season) => {
  try {
    const data = await apiCallWithFallback('/standings', { league, season });
    return data.response[0]?.league.standings[0] || [];
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
};

// Funzione per recuperare le partite
export const fetchFixtures = async (league, season) => {
  try {
    const data = await apiCallWithFallback('/fixtures', { league, season });
    console.log(data.response)
    return data.response || [];
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    throw error;
  }
};

// Funzione per recuperare i giocatori della Serie A
export const fetchSerieAPlayers = async (startPage = 1) => {
  let allPlayers = [];
  let currentPage = startPage;
  let hasMorePages = true;
  let consecutiveEmptyPages = 0;
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 5000; // 5 secondi
  const LONG_PAUSE = 60000; // 1 minuto

  while (hasMorePages && consecutiveEmptyPages < 3) {
    let retries = 0;
    let success = false;

    // Pausa lunga ogni 10 pagine
    if ((currentPage - startPage) % 10 === 0 && currentPage !== startPage) {
      console.log(`Pausa lunga di ${LONG_PAUSE / 1000} secondi dopo 10 pagine...`);
      await delay(LONG_PAUSE);
    }

    while (!success && retries < MAX_RETRIES) {
      try {
        console.log(`Fetching page ${currentPage}... (Attempt ${retries + 1})`);
        const data = await apiCallWithFallback('/players', {
          league: SERIE_A_LEAGUE_ID,
          season: CURRENT_SEASON,
          page: currentPage
        });

        const { response: players, paging } = data;
        
        if (players.length === 0) {
          consecutiveEmptyPages++;
          console.log(`Empty page received. Consecutive empty pages: ${consecutiveEmptyPages}`);
        } else {
          consecutiveEmptyPages = 0;
          const formattedPlayers = players.map(player => ({
            // Mapping dei dati del giocatore
            id: player.player.id,
            name: player.player.name,
            photo: player.player.photo || '',
            age: player.player.age || 0,
            nationality: player.player.nationality || '',
            position: player.statistics[0]?.games?.position || '',
            injured: player.player.injured || false,
            teamLogo: player.statistics[0]?.team?.logo || '',
            teamName: player.statistics[0]?.team?.name || '',
            height: player.player.height || '',
            totGoal: player.statistics[0]?.goals?.total || 0,
            penalty: player.statistics[0]?.penalty?.scored || 0,
            assist: player.statistics[0]?.goals?.assists || 0,
            saved: player.statistics[0]?.goals?.saves || 0,
            goalConceded: player.statistics[0]?.goals?.conceded || 0,
            minutes: player.statistics[0]?.games?.minutes || 0,
            appearences: player.statistics[0]?.games?.appearences || 0,
            lineups: player.statistics[0]?.games?.lineups || 0,
            passes: player.statistics[0]?.passes?.total || 0,
            passesKey: player.statistics[0]?.passes?.key || 0,
            shots: player.statistics[0]?.shots?.total || 0,
            shotsOn: player.statistics[0]?.shots?.on || 0,
            dribbles: player.statistics[0]?.dribbles?.success || 0,
            duels: player.statistics[0]?.duels?.won || 0,
            tackles: player.statistics[0]?.tackles?.total || 0,
            fouls: player.statistics[0]?.fouls?.committed || 0,
            yellowCards: player.statistics[0]?.cards?.yellow || 0,
            redCards: player.statistics[0]?.cards?.red || 0,
          }));
          allPlayers = [...allPlayers, ...formattedPlayers];
        }
        
        console.log(`Fetched ${players.length} players from page ${currentPage}. Total players: ${allPlayers.length}`);
        
        if (paging.total && currentPage >= paging.total) {
          hasMorePages = false;
        } else {
          currentPage++;
        }

        success = true;
      } catch (error) {
        retries++;
        console.error(`Error fetching page ${currentPage} (Attempt ${retries}):`, error.message);
        if (retries < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
          await delay(RETRY_DELAY);
        } else {
          console.error(`Failed to fetch page ${currentPage} after ${MAX_RETRIES} attempts. Moving to next page.`);
          currentPage++;
          break;
        }
      }
    }

    await delay(3000); // Rispetta l'API rate limits
  }

  console.log(`Total Serie A players fetched: ${allPlayers.length}`);
  return { players: allPlayers, lastPage: currentPage - 1 };
};

// Funzione per recuperare i migliori marcatori
export const fetchTopScorers = async (league = SERIE_A_LEAGUE_ID, season = CURRENT_SEASON) => {
  try {
    const data = await apiCallWithFallback('/players/topscorers', { league, season });
    return data.response.map(player => ({
      id: player.player.id,
      name: player.player.name,
      photo: player.player.photo,
      team: player.statistics[0].team.name,
      goals: player.statistics[0].goals.total || 0
    }));
  } catch (error) {
    console.error('Error fetching top scorers:', error);
    throw error;
  }
};

// Funzione per recuperare i migliori assistmans
export const fetchTopAssists = async (league = SERIE_A_LEAGUE_ID, season = CURRENT_SEASON) => {
  try {
    const data = await apiCallWithFallback('/players/topassists', { league, season });
    return data.response.map(player => ({
      id: player.player.id,
      name: player.player.name,
      photo: player.player.photo,
      team: player.statistics[0].team.name,
      assists: player.statistics[0].goals.assists || 0
    }));
  } catch (error) {
    console.error('Error fetching top assists:', error);
    throw error;
  }
};

// Funzione per recuperare gli eventi di una partita
export const fetchMatchEvents = async (fixtureId) => {
  try {
    const data = await apiCallWithFallback('/fixtures/events', { fixture: fixtureId });
    return data.response || [];
  } catch (error) {
    console.error('Error fetching match events:', error);
    throw error;
  }
};

// Funzione per recuperare le lineups di una partita
export const fetchMatchLineups = async (fixtureId) => {
  try {
    const data = await apiCallWithFallback('/fixtures/lineups', { fixture: fixtureId });
    return data.response || [];
  } catch (error) {
    console.error('Error fetching match lineups:', error);
    throw error;
  }
};



// Funzione per aggiornare le performance dei giocatori per una data specifica
export const updatePerformancesForDate = async (date) => {
  const fixturesData = await getFixturesForDate(date);
  
  console.log('Fixtures data:', JSON.stringify(fixturesData, null, 2));

  const fixtures = Array.isArray(fixturesData.response) ? fixturesData.response : [];

  if (fixtures.length === 0) {
    console.log(`Nessuna partita trovata per la data ${date}`);
    return;
  }

  for (const fixture of fixtures) {
    const round = fixture.league.round;
    const gameweek = parseInt(round.match(/\d+/)[0]);
    console.log(`Aggiornamento performance per la giornata ${gameweek}`);
    await updatePerformancesForFixture(fixture.fixture.id, date, gameweek);
  }
};

// Funzione per aggiornare le performance dei giocatori per una partita specifica
const updatePerformancesForFixture = async (fixtureId, date, gameweek) => {
  const data = await apiCallWithFallback('/fixtures/players', { fixture: fixtureId });

  for (const team of data.response) {
    for (const player of team.players) {
      if (player.statistics[0].games.minutes > 0) {
        const performance = processPlayerData(player, team.team.name, gameweek, date);
        await PlayerPerformance.findOneAndUpdate(
          { gameweek, playerId: performance.playerId },
          performance,
          { upsert: true, new: true }
        );
      }
    }
  }
};

// Funzione per recuperare le partite per una data specifica
const getFixturesForDate = async (date) => {
  const formattedDate = date.toISOString().split('T')[0];
  return await apiCallWithFallback('/fixtures', {
    league: SERIE_A_LEAGUE_ID,
    season: CURRENT_SEASON,
    date: formattedDate
  });
};

// Funzione per processare i dati di un giocatore
const processPlayerData = (player, teamName, gameweek, date) => {
  const stats = player.statistics[0];
  console.log('Dati del giocatore:', JSON.stringify(player, null, 2));
  console.log('Statistiche del giocatore:', JSON.stringify(stats, null, 2));
  return {
    gameweek,
    date,
    playerId: player.player.id,
    name: player.player.name,
    team: teamName,
    position: stats.games.position,
    rating: stats.games.rating || 0,
    minutesPlayed: stats.games.minutes || 0,
    goals: stats.goals.total || 0,
    assists: stats.goals.assists || 0,
    yellowCards: stats.cards.yellow || 0,
    redCards: stats.cards.red || 0,
    shotsTotal: stats.shots.total || 0,
    shotsOn: stats.shots.on || 0,
    passes: stats.passes.total || 0,
    keyPasses: stats.passes.key || 0,
    tackles: stats.tackles.total || 0,
    interceptions: stats.tackles.interceptions || 0,
    saves: stats.goals.saves || 0,
    fantasyScore: calculateFantasyScore(stats)
  };
};

// Funzione per calcolare il punteggio fantasy di un giocatore
const calculateFantasyScore = (stats) => {
  let score = parseFloat(stats.games.rating) || 0;
  console.log('Rating iniziale:', score);

  //Si aggiunge il punteggio in base alle stats ricevute dal giocatore nella partita
  score += (stats.goals.total || 0) * 3;
  score += (stats.goals.assists || 0) * 2;
  score -= (stats.cards.yellow || 0) * 1;
  score -= (stats.cards.red || 0) * 3;
  score += (stats.goals.saves || 0) * 1;
  score -= (stats.goals.conceded || 0) * 1;
  score += (stats.penalty.scored || 0) * 1;
  score += (stats.penalty.saved || 0) * 3;
  score -= (stats.penalty.missed || 0) * 3;

   // Arrotondamento personalizzato
   let roundedScore;
   if (score < 1) {
     roundedScore = 1;
   } else {
     const decimalPart = score - Math.floor(score);
     if (decimalPart < 0.5) {
       roundedScore = Math.floor(score);
     } else if (decimalPart >= 0.5 && decimalPart < 0.9) {
       roundedScore = Math.floor(score) + 0.5;
     } else {
       roundedScore = Math.ceil(score);
     }
   }
 
   return roundedScore;
};

// Funzione per aggiornare i punteggi delle squadre
export const updateTeamScores = async (gameweek) => {
  const teams = await Team.find().populate('players');
  for (const team of teams) {
    const playerPerformances = await PlayerPerformance.find({
      gameweek,
      playerId: { $in: team.players.map(p => p.player) }
    });
    
    const gameweekScore = playerPerformances.reduce((sum, perf) => sum + perf.fantasyScore, 0);
    team.totalScore += gameweekScore;
    await team.save();
  }
};

// Funzione di utilità per ottenere le performance dei giocatori per una gameweek specifica
export const getPlayerPerformances = async (gameweek) => {
  try {
    return await PlayerPerformance.find({ gameweek: parseInt(gameweek) });
  } catch (error) {
    console.error('Error fetching player performances:', error);
    throw error;
  }
};