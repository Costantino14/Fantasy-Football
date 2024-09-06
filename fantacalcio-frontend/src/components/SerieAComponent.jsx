import React, { useState, useEffect, useMemo } from 'react';
import { fetchStandings, fetchFixtures } from '../services/apisport';
import { Link } from 'react-router-dom';
import { format, parseISO, isAfter, isWithinInterval , isBefore, addHours  } from 'date-fns';
import { it } from 'date-fns/locale';
import ErrorMessage from './ErrorMessage';

// Componente per visualizzare una singola partita
const MatchFixture = ({ match }) => {
  const matchDate = parseISO(match.fixture.date);
  const formattedDate = format(matchDate, 'dd/MM/yyyy', { locale: it });
  const formattedTime = format(matchDate, 'HH:mm', { locale: it });

  return (
    <div className="grid grid-cols-7 gap-2 items-center mb-2 bg-base-200 p-2 rounded-lg">
      <div className="col-span-1 text-center">
        <div className="text-sm">{formattedDate}</div>
        <div className="text-lg font-bold">{formattedTime}</div>
      </div>
      <div className="col-span-2 flex items-center justify-end">
        <span className="font-semibold mr-2">{match.teams.home.name}</span>
        <img src={match.teams.home.logo} alt={`${match.teams.home.name} logo`} className="h-8 w-8" />
      </div>
      <div className="col-span-1 text-center text-xl font-bold">
        {match.goals.home ?? '-'} : {match.goals.away ?? '-'}
      </div>
      <div className="col-span-2 flex items-center justify-start">
        <img src={match.teams.away.logo} alt={`${match.teams.away.name} logo`} className="h-8 w-8 mr-2" />
        <span className="font-semibold">{match.teams.away.name}</span>
      </div>
      <div className="col-span-1 text-center text-sm">
        {match.fixture.status.short}
      </div>
    </div>
  );
};

// Componente per visualizzare le prossime partite di detterminate squadre
const NextMatches = ({ matches }) => {
  const topTeams = ['Juventus', 'Inter', 'AC Milan', 'Napoli', 'Atalanta'];
  const today = new Date();

  const currentOrNextRound = useMemo(() => {
    // Raggruppa le partite per round
    const groupedMatches = matches.reduce((acc, match) => {
      const round = match.league.round;
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    }, {});
    console.log('Grouped Matches:', groupedMatches);

    // Ordina i round per data della prima partita
    const sortedRounds = Object.entries(groupedMatches).sort(([, matchesA], [, matchesB]) => {
      return parseISO(matchesA[0].fixture.date) - parseISO(matchesB[0].fixture.date);
    });
    console.log('Sorted Rounds:', sortedRounds);

    // Trova il round corrente o il prossimo
    return sortedRounds.find(([, roundMatches]) => {
      // Ordina le partite del round per data
      const sortedMatches = roundMatches.sort((a, b) => 
        parseISO(a.fixture.date) - parseISO(b.fixture.date)
      );

      const firstMatchDate = parseISO(sortedMatches[0].fixture.date);
      const lastMatchDate = parseISO(sortedMatches[sortedMatches.length - 1].fixture.date);

      console.log('Round:', roundMatches[0].league.round);
      console.log('First match:', firstMatchDate);
      console.log('Last match:', lastMatchDate);

      // Se oggi è all'interno del periodo del round
      if (isWithinInterval(today, { start: firstMatchDate, end: lastMatchDate })) {
        return true;
      }

      // Se il round non è ancora iniziato
      if (isAfter(firstMatchDate, today)) {
        return true;
      }

      // Se l'ultima partita del round è finita da meno di 6 ore
      const sixHoursAfterLastMatch = addHours(lastMatchDate, 6);
      if (isBefore(today, sixHoursAfterLastMatch)) {
        return true;
      }

      return false;
    });
  }, [matches, today]);

  // Se non esiste
  if (!currentOrNextRound) return <div>Nessun match disponibile</div>;

  const [roundName, roundMatches] = currentOrNextRound;

  // Filtra per top team e ordina le partite del round per data
  const filteredAndSortedMatches = roundMatches
    .filter(match => 
      topTeams.includes(match.teams.home.name) || topTeams.includes(match.teams.away.name)
    )
    .sort((a, b) => parseISO(a.fixture.date) - parseISO(b.fixture.date));

  // Prendi le prime 5 partite dopo il filtraggio e l'ordinamento
  const matchesToShow = filteredAndSortedMatches.slice(0, 5);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">{roundName}</h2>
      {matchesToShow.map(match => (
        <MatchFixture key={match.fixture.id} match={match} />
      ))}
    </div>
  );
};


// Componente principale SerieAComponent
export default function SerieAComponent() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effetto per caricare i dati all'avvio del componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [standingsData, fixturesData] = await Promise.all([
          fetchStandings(135, 2024),
          fetchFixtures(135, 2024)
        ]);
        setTeams(standingsData);
        setMatches(fixturesData);
      } catch (err) {
        setError('Abbiamo un problema con i server, ci scusiamo per il disagio. Prova a riavviare la pagina.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gestione dello stato di caricamento e degli errori
  if (isLoading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Sezione Classifica */}
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">Classifica</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Pos</th>
                  <th className="px-4 py-2">Squadra</th>
                  <th className="px-4 py-2">Punti</th>
                  <th className="px-4 py-2">G</th>
                  <th className="px-4 py-2">V</th>
                  <th className="px-4 py-2">P</th>
                  <th className="px-4 py-2">S</th>
                </tr>
              </thead>
              <tbody>
                {teams.slice(0, 5).map(team => (
                  <tr key={team.team.id}>
                    <td className="px-4 py-2">{team.rank}</td>
                    <Link to={`/team/${encodeURIComponent(team.team.name)}`}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10">
                            <img src={team.team.logo} alt={`${team.team.name} logo`} />
                          </div>
                        </div>
                        <div className="font-bold">{team.team.name}</div>
                      </div>
                    </td>
                    </Link>
                    <td className="px-4 py-2">{team.points}</td>
                    <td className="px-4 py-2">{team.all.played}</td>
                    <td className="px-4 py-2">{team.all.win}</td>
                    <td className="px-4 py-2">{team.all.draw}</td>
                    <td className="px-4 py-2">{team.all.lose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Link di navigazione */}
          <Link to="/SerieA" className="btn btn-primary mt-8">Vai alla Serie A</Link>
        </div>
        {/* Sezione Prossime Partite delle migliori 5*/}
        <div className="w-full">
          <NextMatches matches={matches} />
        </div>
      </div>
    </div>
  );
}