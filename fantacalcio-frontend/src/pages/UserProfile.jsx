import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, getUserTeam, getFormationStatus } from '../services/api';
import { FaUser, FaEnvelope, FaFutbol, FaCoins, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

const UserProfile = () => {
    
    const navigate = useNavigate();
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [team, setTeam] = useState(null);
    const [formationStatus, setFormationStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDataResponse, teamResponse, formationStatusResponse] = await Promise.all([
          getUserData(),
          getUserTeam(user._id),
          getFormationStatus(user._id)
        ]);
        setUserData(userDataResponse);
        setTeam(teamResponse);
        setFormationStatus(formationStatusResponse);
      } catch (err) {
        setError("Errore nel caricamento dei dati del profilo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSetFormation = () => {
    navigate('/MyTeam'); 
  };

  if (loading) return <div className="text-center py-10 text-white">Caricamento...</div>;
  if (error) return <ErrorMessage message={error} />;
  if (!userData || !team) return <ErrorMessage message={'Nessun dato utente disponibile'} />;

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informazioni Utente */}
        <div className="col-span-1 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-2xl font-bold text-center text-green-400 mb-4">Profilo Utente</h2>
          <div className="flex flex-col items-center">
            <img src={userData.avatar || 'https://via.placeholder.com/150'} alt="Avatar" className="w-32 h-32 rounded-full mb-4" />
            <div className="flex items-center mb-2"><FaUser className="mr-2 text-blue-400" /> {userData.username}</div>
            <div className="flex items-center mb-2"><FaEnvelope className="mr-2 text-blue-400" /> {userData.email}</div>
            <div className="flex items-center"><FaFutbol className="mr-2 text-blue-400" /> {team.name}</div>
          </div>
        </div>

        {/* Statistiche Squadra */}
        <div className="col-span-1 md:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-2xl font-bold text-center text-green-400 mb-4">Statistiche Squadra</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <FaCoins className="text-4xl mx-auto mb-2 text-yellow-400" />
              <p className="text-lg font-semibold">Budget</p>
              <p>€{(team.budget / 1000000).toFixed(2)}M</p>
            </div>
            <div className="text-center">
              <FaUsers className="text-4xl mx-auto mb-2 text-blue-400" />
              <p className="text-lg font-semibold">Giocatori</p>
              <p>{team.players.length}/24</p>
            </div>
            <div className="text-center col-span-2">
              <p className="text-lg font-semibold">Punteggio Totale</p>
              <p className="text-3xl font-bold text-green-400">{team.totalScore || 0}</p>
            </div>
          </div>
        </div>

        {/* Stato Formazione */}
        <div className="col-span-1 md:col-span-3 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-2xl font-bold text-center text-green-400 mb-4">Stato Formazione</h2>
          {formationStatus ? (
            <div className="text-center">
              {formationStatus.canSet ? (
                <>
                  <p className="text-lg mb-2">Puoi impostare la formazione per la gameweek {formationStatus.gameweek}</p>
                  <p>Scadenza: {new Date(formationStatus.deadline).toLocaleString()}</p>
                  <button 
                  onClick={handleSetFormation}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    Imposta Formazione
                  </button>
                </>
              ) : (
                <p className="text-lg">{formationStatus.message}</p>
              )}
            </div>
          ) : (
            <p className="text-center">Informazioni sulla formazione non disponibili</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;