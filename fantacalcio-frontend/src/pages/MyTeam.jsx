import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserTeam, saveFormation, getAllSerieAPlayers, getFormationStatus, getCurrentFormation } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FormationDisplay from '../components/FormationDisplay';
import ErrorMessage from '../components/ErrorMessage';

// Definizione delle formazioni disponibili e dei relativi limiti di giocatori per ruolo
const FORMATIONS = {
  '3-4-3': { Defender: 3, Midfielder: 4, Attacker: 3 },
  '4-4-2': { Defender: 4, Midfielder: 4, Attacker: 2 },
  '4-3-3': { Defender: 4, Midfielder: 3, Attacker: 3 },
  '5-3-2': { Defender: 5, Midfielder: 3, Attacker: 2 },
  '3-5-2': { Defender: 3, Midfielder: 5, Attacker: 2 },
};

// Componente per visualizzare la card di un giocatore
const PlayerCard = ({ player, onSelect, isSelected }) => (
  <div 
    className={`bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer ${isSelected ? 'border-2 border-green-500' : ''}`}
    onClick={() => onSelect(player)}
  >
    <img src={player.photo} alt={player.name} className="w-20 h-20 rounded-full object-cover mb-2" />
    <h3 className="text-lg font-semibold text-white">{player.name}</h3>
    <p className="text-sm text-gray-400">{player.position}</p>
    <p className="text-sm text-gray-400">{player.teamName}</p>
    <p className="text-sm font-bold text-green-500">€{(player.price / 1000000).toFixed(2)}M</p>
  </div>
);

export default function MyTeam() {

  //Configurazione stati e variabili
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [lineup, setLineup] = useState({
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Attacker: [],
  });
  const [formationStatus, setFormationStatus] = useState(null);
  const [currentFormation, setCurrentFormation] = useState(null);

  // Effetto per caricare i dati iniziali
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        //Richiama quattro Promise assegnate ai quattro stati
        const [teamData, playersData, statusData, currentFormationData] = await Promise.all([
          getUserTeam(user._id),
          getAllSerieAPlayers(),
          getFormationStatus(user._id),
          getCurrentFormation(user._id)
        ]);
        setTeam(teamData);
        setAllPlayers(playersData);
        setFormationStatus(statusData);

        //Se la formazione corrente esiste
        if (currentFormationData) {
          setCurrentFormation(currentFormationData);
          setSelectedFormation(currentFormationData.schema);
          setLineup(currentFormationData.lineup);
        }

        const playerIds = teamData.players.map(p => p.player);
        const filteredPlayers = playersData.filter(player => playerIds.includes(player._id));
        setTeamPlayers(filteredPlayers);
      } catch (err) {
        setError('Errore nel caricamento della squadra e dei giocatori');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Gestisce il cambio di formazione
  const handleFormationChange = (formation) => {
    setSelectedFormation(formation);
    if (!currentFormation) {
      setLineup({
        Goalkeeper: lineup.Goalkeeper,
        Defender: [],
        Midfielder: [],
        Attacker: [],
      });
    }
  };

  // Gestisce la selezione di un giocatore
  const handlePlayerSelect = (player) => {
    const position = player.position;
    const maxPlayers = position === 'Goalkeeper' ? 1 : FORMATIONS[selectedFormation][position];

    setLineup(prev => {
      if (prev[position].includes(player)) {
        return { ...prev, [position]: prev[position].filter(p => p !== player) };
      } else if (prev[position].length < maxPlayers) {
        return { ...prev, [position]: [...prev[position], player] };
      } else {
        const updatedPosition = [...prev[position].slice(0, -1), player];
        return { ...prev, [position]: updatedPosition };
      }
    });
  };

  // Verifica se la formazione è completa
  const isFormationComplete = () => {
    return lineup.Goalkeeper.length === 1 &&
           lineup.Defender.length === FORMATIONS[selectedFormation].Defender &&
           lineup.Midfielder.length === FORMATIONS[selectedFormation].Midfielder &&
           lineup.Attacker.length === FORMATIONS[selectedFormation].Attacker;
  };

  // Gestisce il salvataggio della formazione
  const handleSaveFormation = async () => {
    if (!formationStatus || !formationStatus.canSet) {
      alert(formationStatus ? formationStatus.message : 'Non puoi impostare la formazione in questo momento.');
      return;
    }
    //Se la formazione non è completa
    if (!isFormationComplete()) {
      alert('Devi selezionare tutti e 11 i giocatori prima di salvare la formazione.');
      return;
    }

    try {
      const savedFormation = await saveFormation(user._id, { 
        schema: selectedFormation, 
        lineup,
        gameweek: formationStatus.gameweek 
      });
      setCurrentFormation(savedFormation);
      alert(`Formazione salvata con successo per la gameweek ${formationStatus.gameweek}!`);
    } catch (error) {
      console.error('Errore nel salvataggio della formazione:', error);
      alert('Errore nel salvataggio della formazione');
    }
  };

  // Rendering condizionale basato sullo stato del componente
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <ErrorMessage message={'Effettua il login per vedere la tua squadra'} />;
  if (error) return <ErrorMessage message={error} />;
  if (!team || teamPlayers.length === 0) return <ErrorMessage message={'Nessuna squadra o giocatore trovato'} />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-4">{team.name}</h1>
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <p className="text-xl text-white">Budget rimanente: €{(team.budget / 1000000).toFixed(2)}M</p>
        <p className="text-lg text-gray-300">Totale giocatori: {teamPlayers.length}/24</p>
      </div>

      {/* Visualizzazione dello stato della formazione */}
      {formationStatus && (
        <div className="bg-blue-600 text-white p-4 rounded-lg mb-6">
          {formationStatus.canSet ? (
            <>
              <p className="font-bold">Puoi impostare la formazione per la gameweek {formationStatus.gameweek}</p>
              <p>Scadenza: {new Date(formationStatus.deadline).toLocaleString()}</p>
            </>
          ) : (
            <p className="font-bold">{formationStatus.message}</p>
          )}
        </div>
      )}

      {/* Selezione della formazione */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Seleziona Formazione</h2>
        <select 
          value={selectedFormation} 
          onChange={(e) => handleFormationChange(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        >
          {Object.keys(FORMATIONS).map(formation => (
            <option key={formation} value={formation}>{formation}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista dei giocatori disponibili */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Giocatori Disponibili</h2>
          {['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'].map(position => (
            <div key={position} className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">{position}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamPlayers
                  .filter(player => player.position === position)
                  .map(player => (
                    <PlayerCard 
                      key={player._id} 
                      player={player} 
                      onSelect={handlePlayerSelect}
                      isSelected={lineup[position].includes(player)}
                    />
                  ))
                }
              </div>
            </div>
          ))}
        </div>
        
        {/* Visualizzazione della formazione selezionata */}
        <div className="lg:sticky lg:top-4 self-start">
          <h2 className="text-2xl font-bold text-white mb-4">Formazione Selezionata</h2>
          <FormationDisplay lineup={lineup} formation={selectedFormation} />
          {['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'].map(position => (
            <div key={position} className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                {position} ({lineup[position].length}/{position === 'Goalkeeper' ? 1 : FORMATIONS[selectedFormation][position]})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lineup[position].map(player => (
                  <PlayerCard 
                    key={player._id} 
                    player={player} 
                    onSelect={handlePlayerSelect}
                    isSelected={true}
                  />
                ))}
              </div>
            </div>
          ))}
          {/* Pulsante per salvare la formazione */}
          <button 
            onClick={handleSaveFormation}
            className={`px-4 py-2 rounded mt-4 ${
              formationStatus && formationStatus.canSet && isFormationComplete() 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
            disabled={!formationStatus || !formationStatus.canSet || !isFormationComplete()}
          >
            Salva Formazione
          </button>
        </div>
      </div>
    </div>
  );
}