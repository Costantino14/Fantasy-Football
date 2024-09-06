import React, { useState, useEffect } from 'react';
import { getUsers, getUserTeam } from '../services/api';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Leaderboard = () => {
  // Stato per memorizzare i dati della classifica
  const [leaderboard, setLeaderboard] = useState([]);
  // Stato per gestire il caricamento
  const [isLoading, setIsLoading] = useState(true);
  // Stato per gestire gli errori
  const [error, setError] = useState(null);

  // useEffect per caricare i dati della classifica all'avvio del componente
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        // Recupera tutti gli utenti
        const response = await getUsers();
        const users = response.users;

        // Recupera i dati del team per ogni utente
        const leaderboardPromises = users.map(async user => {
          try {
            const teamData = await getUserTeam(user._id);
            return {
              id: user._id,
              teamName: user.teamName,
              coachName: user.username,
              totalScore: teamData.totalScore || 0
            };
          } catch (error) {
            console.error(`Errore nel recupero del team per l'utente ${user._id}:`, error);
            return null;
          }
        });

        // Attende che tutte le promesse siano risolte
        const leaderboardData = await Promise.all(leaderboardPromises);
        // Filtra eventuali risultati null e ordina per punteggio totale
        const sortedLeaderboard = leaderboardData
          .filter(item => item !== null)
          .sort((a, b) => b.totalScore - a.totalScore);

        setLeaderboard(sortedLeaderboard);
      } catch (err) {
        setError('Errore nel caricamento della classifica');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []); // L'array vuoto assicura che questo effect venga eseguito solo una volta all'avvio

  // Rendering condizionale per lo stato di caricamento
  if (isLoading) return <LoadingSpinner />;
  // Rendering condizionale per lo stato di errore
  if (error) return <ErrorMessage message={error} />;

  // Rendering della classifica
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">Classifica Generale</h1>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Posizione</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Coach</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Punteggio</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {leaderboard.map((team, index) => (
              <tr key={team.id} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* Icone per le prime tre posizioni */}
                    {index === 0 && <FaTrophy className="text-yellow-400 mr-2" />}
                    {index === 1 && <FaMedal className="text-gray-400 mr-2" />}
                    {index === 2 && <FaMedal className="text-yellow-600 mr-2" />}
                    <span className="text-lg font-medium text-gray-300">{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-medium text-white">{team.teamName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg text-gray-300">{team.coachName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xl font-bold text-green-400">{team.totalScore}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;