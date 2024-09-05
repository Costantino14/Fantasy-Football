import React, { useState, useEffect, useMemo } from 'react';
import { fetchStandings, fetchFixtures, fetchTopScorers, fetchTopAssists } from '../services/apisport';
import { parseISO, format, compareAsc } from 'date-fns';
import { it } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

const StandingsTable = ({ teams }) => (
  <table className="table w-full">
    <thead>
      <tr>
        <th></th>
        <th>Squadra</th>
        <th>Punti</th>
        <th>G</th>
        <th>V</th>
        <th>P</th>
        <th>S</th>
        <th>GF</th>
        <th>GS</th>
      </tr>
    </thead>
    <tbody>
      {teams.map(team => (
        <tr key={team.team.id}>
          <td>{team.rank}</td>
          <td>
          <Link to={`/team/${encodeURIComponent(team.team.name)}`}>
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="mask mask-squircle h-12 w-12">
                  <img src={team.team.logo} alt={`${team.team.name} logo`} />
                </div>
              </div>
              <div className="font-bold">{team.team.name}</div>
            </div>
            </Link>
          </td>
          <td>{team.points}</td>
          <td>{team.all.played}</td>
          <td>{team.all.win}</td>
          <td>{team.all.draw}</td>
          <td>{team.all.lose}</td>
          <td>{team.all.goals.for}</td>
          <td>{team.all.goals.against}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const MatchFixture = ({ match }) => {
  const matchDate = parseISO(match.fixture.date);
  const formattedDate = format(matchDate, 'dd/MM/yyyy', { locale: it });
  const formattedTime = format(matchDate, 'HH:mm', { locale: it });

  return (
    <Link to={`/match/${match.fixture.id}`} className="block hover:bg-base-300 transition-colors">
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
    </Link>
  );
};

const MatchesByRound = ({ matches }) => {
  const [selectedRound, setSelectedRound] = useState(null);

  const matchesByRound = useMemo(() => {
    return matches.reduce((acc, match) => {
      const round = match.league.round;
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    }, {});
  }, [matches]);

  const sortedRounds = useMemo(() => {
    return Object.keys(matchesByRound).sort((a, b) => {
      const roundA = parseInt(a.match(/\d+/)[0]);
      const roundB = parseInt(b.match(/\d+/)[0]);
      return roundA - roundB;
    });
  }, [matchesByRound]);

  useEffect(() => {
    if (sortedRounds.length > 0 && !selectedRound) {
      setSelectedRound(sortedRounds[0]);
    }
  }, [sortedRounds, selectedRound]);

  return (
    <div>
      <div className="mb-4 relative">
        <div className="overflow-x-auto">
          <div className="flex space-x-2 pb-2 min-w-max">
            {sortedRounds.map((round) => (
              <button
                key={round}
                className={`btn btn-sm ${selectedRound === round ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedRound(round)}
              >
                {round}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-white via-white to-transparent w-8"></div>
      </div>
      {selectedRound && matchesByRound[selectedRound] && (
        <div>
          {matchesByRound[selectedRound]
            .sort((a, b) => compareAsc(parseISO(a.fixture.date), parseISO(b.fixture.date)))
            .map((match) => (
              <MatchFixture key={match.fixture.id} match={match} />
            ))}
        </div>
      )}
    </div>
  );
};

const TopPlayersList = ({ players, title, statKey }) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <h2 className="card-title">{title}</h2>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Giocatore</th>
            <th>Squadra</th>
            <th>{statKey === 'goals' ? 'Gol' : 'Assist'}</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td>{index + 1}</td>
              <td>
                <div className="flex items-center space-x-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <img src={player.photo} alt={`${player.name}`} />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{player.name}</div>
                  </div>
                </div>
              </td>
              <td>{player.team}</td>
              <td>{player[statKey]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MarcatoriStats = ({ topScorers, topAssists }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <TopPlayersList players={topScorers} title="Top 5 Marcatori" statKey="goals" />
    <TopPlayersList players={topAssists} title="Top 5 Assistman" statKey="assists" />
  </div>
);

export default function SerieAComponent() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [topAssists, setTopAssists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('classifica');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [standingsData, fixturesData, topScorersData, topAssistsData] = await Promise.all([
          fetchStandings(135, 2024),
          fetchFixtures(135, 2024),
          fetchTopScorers(),
          fetchTopAssists()
        ]);
        setTeams(standingsData);
        setMatches(fixturesData);
        setTopScorers(topScorersData.slice(0, 5));  // Prendi i primi 5
        setTopAssists(topAssistsData.slice(0, 5));  // Prendi i primi 5
      } catch (err) {
        setError('Abbiamo un problema con i server, ci scusiamo per il disagio. Prova a riavviare la pagina.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 mt-3">
      <div className="join mb-4">
        <input 
          className="btn btn-outline btn-success px-10 mx-2" 
          type="radio" 
          name="options" 
          aria-label="Classifica" 
          checked={activeTab === 'classifica'}
          onChange={() => setActiveTab('classifica')}
        />
        <input 
          className="btn btn-outline btn-success px-10 mx-2" 
          type="radio" 
          name="options" 
          aria-label="Calendario" 
          checked={activeTab === 'calendario'}
          onChange={() => setActiveTab('calendario')}
        />
        <input 
          className="btn btn-outline btn-success px-20 mx-2" 
          type="radio" 
          name="options" 
          aria-label="Marcatori/Assistman" 
          checked={activeTab === 'marcatori/assistman'}
          onChange={() => setActiveTab('marcatori/assistman')}
        />
      </div>

      {activeTab === 'classifica' && <StandingsTable teams={teams} />}
      {activeTab === 'calendario' && <MatchesByRound matches={matches} />}
      {activeTab === 'marcatori/assistman' && <MarcatoriStats topScorers={topScorers} topAssists={topAssists} />}
    </div>
  );
}