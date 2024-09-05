import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUserTeam, getPlayerPerformances, getAllSerieAPlayers, calculateTeamScore } from '../services/api';
import axios from 'axios';
import ErrorMessage from '../components/ErrorMessage';

export default function GamePage() {
  const [team, setTeam] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [performances, setPerformances] = useState({});
  const [weeklyScore, setWeeklyScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [currentGameweek, setCurrentGameweek] = useState(3);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        setError(null);
        try {
          const [teamData, performancesData, allPlayersData] = await Promise.all([
            getUserTeam(user._id),
            getPlayerPerformances(currentGameweek),
            getAllSerieAPlayers()
          ]);

          setTeam(teamData);
          setAllPlayers(allPlayersData);
          
          const performancesObj = performancesData.reduce((acc, perf) => {
            acc[perf.playerId] = perf;
            return acc;
          }, {});
          setPerformances(performancesObj);

          const filteredPlayers = allPlayersData.filter(player => 
            teamData.players.some(teamPlayer => teamPlayer.id === player.id)
          );
          setTeamPlayers(filteredPlayers);

          try {
            const scoreData = await calculateTeamScore(user._id, currentGameweek);
            setWeeklyScore(scoreData.weeklyScore);
          } catch (scoreError) {
            if (axios.isAxiosError(scoreError) && scoreError.response?.status === 400) {
              console.log("Nessun punteggio disponibile per questa gameweek");
              setWeeklyScore(null);
            } else {
              throw scoreError;
            }
          }

        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Si è verificato un errore nel caricamento dei dati. Riprova più tardi.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user, currentGameweek]);

  const renderPlayerCard = (player, isInFormation = false) => {
    const performance = performances[player.id] || {};
    const positionColors = {
      Goalkeeper: 'bg-yellow-500',
      Defender: 'bg-blue-500',
      Midfielder: 'bg-green-500',
      Attacker: 'bg-red-500'
    };

    return (
      <div key={player.id} className={`${isInFormation ? 'border-2 border-purple-500' : ''} bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105`}>
        <div className={`${positionColors[player.position]} text-white p-2 flex justify-between items-center`}>
          <h3 className="text-lg font-semibold truncate">{player.name}</h3>
          <span className="text-xs font-bold bg-white text-gray-800 rounded-full px-2 py-1">
            {performance.fantasyScore?.toFixed(1) || '0.0'}
          </span>
        </div>
        <div className="p-3 text-white">
          <p className="text-xs mb-2">{player.teamName} - {player.position}</p>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <p>Min: {performance.minutesPlayed || 0}</p>
            <p>Goal: {performance.goals || 0}</p>
            <p>Assist: {performance.assists || 0}</p>
            <p>C. Giallo: {performance.yellowCards || 0}</p>
            <p>C. Rosso: {performance.redCards || 0}</p>
            <p>Tiri: {performance.shotsTotal || 0}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayers = (players, activeFormation) => {
    const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
    const starters = [];
    const reserves = [];

    positions.forEach(position => {
      const positionPlayers = players.filter(player => player.position === position);
      const startersForPosition = positionPlayers.filter(player => 
        activeFormation.lineup[position].some(id => id.toString() === player._id.toString())
      );
      const reservesForPosition = positionPlayers.filter(player => 
        !activeFormation.lineup[position].some(id => id.toString() === player._id.toString())
      );

      starters.push(...startersForPosition);
      reserves.push(...reservesForPosition);
    });

    return (
      <>
        <h2 className="text-2xl font-bold mb-4 text-white">Formazione Titolare</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {starters.map(player => renderPlayerCard(player, true))}
        </div>

        <h2 className="text-2xl font-bold mb-4 text-white">Riserve</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reserves.map(player => renderPlayerCard(player, false))}
        </div>
      </>
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const activeFormation = team?.activeFormations.find(f => f.gameweek === currentGameweek);

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-white">Performance della Squadra</h1>
      
      <div className="mb-6 flex justify-center items-center space-x-4">
        <label htmlFor="gameweek-input" className="text-white">Gameweek:</label>
        <input 
          id="gameweek-input"
          type="number" 
          value={currentGameweek}
          onChange={(e) => setCurrentGameweek(Number(e.target.value))}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-20"
          min="1"
        />
      </div>

      {weeklyScore !== null ? (
        <div className="text-2xl font-bold mb-6 text-center text-green-500">
          Punteggio Gameweek {currentGameweek}: {weeklyScore.toFixed(2)}
        </div>
      ) : (
        <div className="text-2xl font-bold mb-6 text-center text-yellow-500">
          Nessun punteggio disponibile per la Gameweek {currentGameweek}
        </div>
      )}

      {(!team || teamPlayers.length === 0 || !activeFormation) ? (
        <div className="bg-yellow-500 text-white p-4 rounded-lg text-center mb-6">
          <p className="text-lg font-semibold">
            Non ci sono dati disponibili per questa Gameweek.
          </p>
          <p>
            Forse non siamo ancora arrivati a questa settimana o non hai inserito la formazione per tempo.
          </p>
        </div>
      ) : (
        renderPlayers(teamPlayers, activeFormation)
      )}
    </div>
  );
}