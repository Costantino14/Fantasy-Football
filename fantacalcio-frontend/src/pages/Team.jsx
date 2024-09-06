import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAllSerieAPlayers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import ErrorMessage from '../components/ErrorMessage';

// Componente per visualizzare il logo della squadra
const TeamLogo = ({ src, alt, teamName }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effetto per caricare l'immagine del logo
  useEffect(() => {
    setIsLoading(true);
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageSrc(null);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  // Mostra un placeholder durante il caricamento
  if (isLoading) {
    return <div className="w-14 h-14 rounded-full bg-gray-600 animate-pulse"></div>;
  }

  // Non mostrare nulla se l'immagine non può essere caricata
  if (!imageSrc) {
    return null;
  }

  // Lista di squadre con loghi scuri che necessitano di uno sfondo chiaro
  const teamsWithDarkLogos = ['juventus', 'inter', /* altre squadre con loghi scuri */];
  const specialLogoClass = teamsWithDarkLogos.some(team => teamName.toLowerCase().includes(team))
    ? 'bg-white p-1 rounded-full' 
    : 'bg-transparent';

  return (
    <div className={`w-14 h-14 flex items-center justify-center ${specialLogoClass}`}>
      <img
        src={imageSrc}
        alt={alt}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

export default function Team() {
  // Estrae il nome della squadra dai parametri dell'URL
  const { id: teamName } = useParams();
  
  // Stati per gestire i dati e lo stato dell'UI
  const [allPlayers, setAllPlayers] = useState([]);
  const [groupedPlayers, setGroupedPlayers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePlayer, setActivePlayer] = useState(null);
  const [teamLogo, setTeamLogo] = useState('');

  // Effetto per caricare tutti i giocatori all'avvio del componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const playerData = await getAllSerieAPlayers();
        setAllPlayers(playerData);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Errore nel caricamento dei giocatori. Riprova più tardi.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effetto per filtrare e raggruppare i giocatori quando i dati cambiano
  useEffect(() => {
    if (allPlayers.length > 0 && teamName) {
      // Filtra i giocatori per la squadra specifica
      const filteredPlayers = allPlayers.filter(
        player => player.teamName.toLowerCase() === decodeURIComponent(teamName).toLowerCase()
      );
      
      // Raggruppa i giocatori per ruolo
      const grouped = filteredPlayers.reduce((acc, player) => {
        const position = player.position[0]; // Assume che la posizione sia "G", "D", "M", o "A"
        if (!acc[position]) acc[position] = [];
        acc[position].push(player);
        return acc;
      }, {});

      setGroupedPlayers(grouped);

      // Imposta il logo della squadra
      if (filteredPlayers.length > 0) {
        setTeamLogo(filteredPlayers[0].teamLogo);
      }
    }
  }, [allPlayers, teamName]);

  // Gestisce il click su un giocatore per mostrare/nascondere i dettagli
  const handlePlayerClick = (player) => {
    setActivePlayer(activePlayer === player ? null : player);
  };

  // Renderizza la card di un singolo giocatore
  const renderPlayerCard = (player, index) => (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer`}
      onClick={() => handlePlayerClick(player)}
      style={{
        background: `linear-gradient(45deg, #FFD700, #FFA500)`,
        border: '4px solid #FFD700',
      }}
    >

      {/* Immagine e dettagli principali del giocatore */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={player.photo} 
          alt={player.name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute top-0 left-0 m-2 bg-white bg-opacity-80 rounded-full p-2">
          <img src={player.teamLogo} alt="Club logo" className="w-8 h-8" />
        </div>
        <div className="absolute top-0 right-0 m-2 bg-red-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">
          {player.position[0]}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-70">
          <h2 className="text-2xl font-bold text-white mb-1">{player.name}</h2>
          <p className="text-yellow-400 font-semibold">{player.position}</p>
        </div>
      </div>

      {/* Statistiche di base del giocatore */}
      <div className="p-4 bg-black">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            {player.position !== "Goalkeeper" ? <>
            <span className="font-bold">Goals:</span>
            <span>{player.totGoal}</span>
            </> : <>
            <span className="font-bold">Parate:</span>
            <span>{player.saved}</span>
            </>}
          </div>
          <div className="flex justify-between">
          {player.position !== "Goalkeeper" ? <>
            <span className="font-bold">Assists:</span>
            <span>{player.assist}</span></> : <>
            <span className="font-bold">G. Subiti:</span>
            <span>{player.goalConceded}</span>
            </>}
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Apps:</span>
            <span>{player.appearences}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Minuti:</span>
            <span>{player.minutes}</span>
          </div>
        </div>
      </div>

      {/* Statistiche dettagliate del giocatore (visualizzate al click) */}
      {activePlayer === player && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black bg-opacity-90 p-4 text-white overflow-y-auto"
        >
          <h3 className="text-lg font-semibold mb-2">Statistiche dettagliate</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {/* Dettagli statistici del giocatore */}
            <p>Età: {player.age}</p>
            <p>Nazionalità: {player.nationality}</p>
            <p>Altezza: {player.height}</p>
            <p>Infortunato: {player.injured ? 'Sì' : 'No'}</p>
            <p>Presenze: {player.appearences}</p>
            <p>Titolare: {player.lineups}</p>
            <p>Minuti: {player.minutes}</p>
            {player.position !== "Goalkeeper" ? 
            <>
            <p>Goal: {player.totGoal}</p>
            <p>Rigori: {player.penalty}</p>
            <p>Assist: {player.assist}</p>
            </> : <>
            <p>Parate: {player.saved}</p>
            <p>Goal Subiti: {player.goalConceded}</p>
            </>}
            
            <p>Passaggi: {player.passes}</p>
            <p>Passaggi chiave: {player.passesKey}</p>
            <p>Tiri: {player.shots}</p>
            <p>Tackle: {player.tackles}</p>
            <p>Falli: {player.fouls}</p>
            <p>Cartellini gialli: {player.yellowCards}</p>
            <p>Cartellini rossi: {player.redCards}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // Renderizza una sezione per un ruolo specifico
  const renderPositionSection = (position, title) => (
    groupedPlayers[position] && groupedPlayers[position].length > 0 && (
      <div key={position} className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {groupedPlayers[position].map((player, index) => renderPlayerCard(player, index))}
        </div>
      </div>
    )
  );

  // Renderizza un loader mentre i dati vengono caricati
  if (isLoading) return <LoadingSpinner />;
  
  // Renderizza un messaggio di errore se il caricamento fallisce
  if (error) return <ErrorMessage message={error} />;

  // Renderizza il componente principale
  return (
    <div className="container mx-auto my-8 px-4 min-h-screen py-10">
      {/* Header con logo e nome della squadra */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center mb-10"
      >
        <TeamLogo 
          src={teamLogo} 
          alt={`${teamName} logo`} 
          teamName={teamName}
        />
        <h1 className="text-5xl font-bold text-white ml-4">{decodeURIComponent(teamName)}</h1>
      </motion.div>

      {/* Renderizza le sezioni per ogni ruolo */}
      {renderPositionSection('G', 'Portieri')}
      {renderPositionSection('D', 'Difensori')}
      {renderPositionSection('M', 'Centrocampisti')}
      {renderPositionSection('A', 'Attaccanti')}
    </div>
  );
}