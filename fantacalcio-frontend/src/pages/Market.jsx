import React, { useState, useEffect, useMemo } from 'react';
import { getAllSerieAPlayers, getOrCreateTeam, buyPlayer, sellPlayer, getMarketStatus  } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Funzione di utilità per caricare l'immagine con retry
const loadImage = (src, fallbackSrc, maxRetries = 3) => {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const attemptLoad = () => {
      const img = new Image();
      // Se l'immagine si carica con successo, risolve la promessa con l'URL originale
      img.onload = () => resolve(src);
      img.onerror = () => {
        if (retries < maxRetries) {
          // Se ci sono ancora tentativi disponibili, riprova dopo 1 secondo
          retries++;
          setTimeout(attemptLoad, 1000);
        } else if (fallbackSrc) {
          // Se tutti i tentativi falliscono e c'è un'immagine di fallback, usa quella
          resolve(fallbackSrc);
        } else {
          // Se non c'è un'immagine di fallback, rifiuta la promessa
          reject(new Error('Impossibile caricare l\'immagine'));
        }
      };
      // Avvia il caricamento dell'immagine
      img.src = src;
    };
    // Inizia il primo tentativo di caricamento
    attemptLoad();
  });
};

// Componente React personalizzato per visualizzare l'immagine del giocatore
const PlayerImage = ({ src, alt, fallbackSrc }) => {
  // Stato per memorizzare l'URL dell'immagine caricata
  const [imageSrc, setImageSrc] = useState(null);
  // Stato per tracciare se l'immagine è in fase di caricamento
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Imposta lo stato di caricamento a true quando inizia il caricamento
    setIsLoading(true);
    // Tenta di caricare l'immagine usando la funzione loadImage
    loadImage(src, fallbackSrc)
      .then(resolvedSrc => {
        // Se il caricamento ha successo, imposta l'URL dell'immagine e termina il caricamento
        setImageSrc(resolvedSrc);
        setIsLoading(false);
      })
      .catch(() => {
        // Se il caricamento fallisce, imposta l'URL a null e termina il caricamento
        setImageSrc(null);
        setIsLoading(false);
      });
  }, [src, fallbackSrc]); // L'effetto si attiva quando src o fallbackSrc cambiano

  // Mostra un placeholder animato durante il caricamento
  if (isLoading) {
    return <div className="w-20 h-20 rounded-full bg-gray-600 animate-pulse"></div>;
  }

  // Se non c'è un'immagine caricata, mostra le iniziali del giocatore
  if (!imageSrc) {
    return (
      <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  // Mostra l'immagine caricata
  return (
    <img
      src={imageSrc}
      alt={alt}
      className="w-20 h-20 rounded-full object-cover"
    />
  );
};

// Componente React per visualizzare il logo della squadra
const TeamLogo = ({ src, alt, teamName }) => {
  // Stato per memorizzare l'URL dell'immagine caricata
  const [imageSrc, setImageSrc] = useState(null);
  // Stato per tracciare se l'immagine è in fase di caricamento
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Imposta lo stato di caricamento a true quando inizia il caricamento
    setIsLoading(true);
    // Tenta di caricare l'immagine usando la funzione loadImage
    // Nota: qui non viene fornito un fallbackSrc, quindi passa null come secondo argomento
    loadImage(src, null)
      .then(resolvedSrc => {
        // Se il caricamento ha successo, imposta l'URL dell'immagine e termina il caricamento
        setImageSrc(resolvedSrc);
        setIsLoading(false);
      })
      .catch(() => {
        // Se il caricamento fallisce, imposta l'URL a null e termina il caricamento
        setImageSrc(null);
        setIsLoading(false);
      });
  }, [src]); // L'effetto si attiva quando src cambia

  // Mostra un placeholder animato durante il caricamento
  if (isLoading) {
    return <div className="w-14 h-14 rounded-full bg-gray-600 animate-pulse"></div>;
  }

  // Se non c'è un'immagine caricata, non mostra nulla
  if (!imageSrc) {
    return null;
  }

  // Lista di squadre con loghi scuri che necessitano di uno sfondo bianco
  const teamsWithDarkLogos = ['juventus', 'inter'];
  // Determina se applicare uno sfondo bianco al logo
  const specialLogoClass = teamsWithDarkLogos.some(team => teamName.toLowerCase().includes(team))
    ? 'bg-white p-1 rounded-full' 
    : 'bg-transparent';

  // Renderizza il logo della squadra
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

// Funzione di utilità per formattare il prezzo in milioni
const formatPrice = (price) => {
  // Se non c'è un prezzo, restituisce 'N/A'
  if (!price) return 'N/A';
  // Converte il prezzo in milioni
  const millions = price / 1000000;
  // Restituisce il prezzo formattato con due decimali e il suffisso 'M'
  return `${millions.toFixed(2)}M`;
};

// Componente PlayerCard: rappresenta una carta giocatore nel mercato
const PlayerCard = ({ player, onBuy, onSell, isInUserTeam, disabled }) => {
  // URL di fallback per l'immagine del giocatore, utilizzando un servizio di avatar generati
  const fallbackImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random`;

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center">
      {/* Componente immagine del giocatore con gestione del fallback */}
      <PlayerImage
        src={player.photo}
        alt={player.name}
        fallbackSrc={fallbackImageUrl}
      />
      {/* Nome del giocatore */}
      <p className="text-sm font-medium text-white text-center mt-2">{player.name}</p>
      {/* Nome della squadra del giocatore */}
      <p className="text-xs text-gray-400 text-center">{player.teamName}</p>
      {/* Contenitore per posizione e prezzo */}
      <div className="mt-2 flex justify-between w-full">
        {/* Posizione del giocatore */}
        <span className="text-xs font-semibold text-gray-300">{player.position}</span>
        {/* Prezzo del giocatore formattato */}
        <span className="text-xs font-semibold text-gray-300">${formatPrice(player.price)}</span>
      </div>
      {/* Rendering condizionale del pulsante Vendi/Compra */}
      {isInUserTeam ? (
        // Pulsante Vendi se il giocatore è nella squadra dell'utente
        <button 
          onClick={() => onSell(player)}
          className={`mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        >
          Vendi
        </button>
      ) : (
        // Pulsante Compra se il giocatore non è nella squadra dell'utente
        <button 
          onClick={() => onBuy(player)}
          className={`mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        >
          Compra
        </button>
      )}
    </div>
  );
};

// Componente Market principale
export default function Market() {
  // Stato e contesto dell'utente
  const { user } = useAuth();
  // Stati per gestire i dati dei giocatori, della squadra e del mercato
  const [allPlayers, setAllPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [userTeam, setUserTeam] = useState(null);
  const [budget, setBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketStatus, setMarketStatus] = useState({
    isOpen: false,
    message: "Stato del mercato non disponibile.",
    nextOpeningDate: null
  });

  // Stati per i filtri di ricerca
  const [nameFilter, setNameFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Effetto per recuperare e aggiornare periodicamente lo stato del mercato
  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const status = await getMarketStatus();
        setMarketStatus(status);
      } catch (error) {
        console.error('Errore nel recupero dello stato del mercato:', error);
        setMarketStatus(prevStatus => ({
          ...prevStatus,
          message: "Impossibile recuperare lo stato del mercato. Riprova più tardi."
        }));
      }
    };

    fetchMarketStatus();
    const intervalId = setInterval(fetchMarketStatus, 60000); // Aggiorna ogni minuto
    return () => clearInterval(intervalId);
  }, []);

  // Funzione per recuperare i dati iniziali dei giocatori e della squadra
  const fetchData = async () => {
    if (!user || !user._id) {
      setError("Dati utente non disponibili. Effettua nuovamente il login.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [players, team] = await Promise.all([
        getAllSerieAPlayers(),
        getOrCreateTeam(user._id)
      ]);

      setAllPlayers(players);
      setUserTeam(team);
      setBudget(team.budget);
      updateAvailablePlayers(players, team.players);
    } catch (err) {
      console.error("Errore nel caricamento dei dati:", err);
      setError('Errore nel caricamento dei dati. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Effetto per caricare i dati iniziali quando l'utente è disponibile
  useEffect(() => {
    if (user && user._id) {
      fetchData();
    }
  }, [user]);

  // Funzione per aggiornare la lista dei giocatori disponibili
  const updateAvailablePlayers = (allPlayers, teamPlayers) => {
    const teamPlayerIds = teamPlayers.map(p => p.player.toString());
    setAvailablePlayers(allPlayers.filter(p => !teamPlayerIds.includes(p._id)));
  };

  // Funzione per gestire l'acquisto di un giocatore
  const handleBuyPlayer = async (player) => {
    if (!marketStatus.isOpen) {
      alert(marketStatus.message || "Il mercato è attualmente chiuso. Non è possibile effettuare acquisti in questo momento.");
      return;
    }
    if (budget < player.price) {
      alert("Budget insufficiente!");
      return;
    }
    try {
      const updatedTeam = await buyPlayer(user._id, player._id);
      setUserTeam(updatedTeam);
      setBudget(updatedTeam.budget);
      updateAvailablePlayers(allPlayers, updatedTeam.players);
      // Aggiorna immediatamente allPlayers con il nuovo giocatore acquistato
      setAllPlayers(prevPlayers => prevPlayers.map(p => 
        p._id === player._id ? { ...p, inUserTeam: true } : p
      ));
      alert(`Giocatore ${player.name} acquistato con successo!`);
    } catch (error) {
      console.error("Errore nell'acquisto del giocatore:", error);
      alert("Errore nell'acquisto del giocatore: " + (error.response?.data?.message || error.message));
    }
  };

 // Funzione per gestire la vendita di un giocatore
 const handleSellPlayer = async (player) => {
  try {
    const updatedTeam = await sellPlayer(user._id, player._id);
    setUserTeam(updatedTeam);
    setBudget(updatedTeam.budget);
    updateAvailablePlayers(allPlayers, updatedTeam.players);
    alert(`Giocatore ${player.name} venduto con successo!`);
  } catch (error) {
    console.error("Errore nella vendita del giocatore:", error);
    alert("Errore nella vendita del giocatore: " + (error.response?.data?.message || error.message));
  }
};

// Filtra i giocatori in base ai criteri di ricerca
const filteredPlayers = useMemo(() => {
  return availablePlayers.filter(player => {
    const nameMatch = player.name.toLowerCase().includes(nameFilter.toLowerCase());
    const teamMatch = !teamFilter || player.teamName === teamFilter;
    const positionMatch = !positionFilter || player.position === positionFilter;
    const priceMatch = (!minPrice || player.price >= parseInt(minPrice)) &&
                       (!maxPrice || player.price <= parseInt(maxPrice));
    return nameMatch && teamMatch && positionMatch && priceMatch;
  });
}, [availablePlayers, nameFilter, teamFilter, positionFilter, minPrice, maxPrice]);

// Estrae la lista unica delle squadre
const teams = useMemo(() => [...new Set(allPlayers.map(player => player.teamName))], [allPlayers]);
const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

// Raggruppa i giocatori per squadra e posizione
const groupPlayersByTeamAndPosition = (players) => {
  const groupedPlayers = {};
  players.forEach(player => {
    if (!groupedPlayers[player.teamName]) {
      groupedPlayers[player.teamName] = {
        Goalkeeper: [],
        Defender: [],
        Midfielder: [],
        Attacker: [],
        logo: player.teamLogo
      };
    }
    groupedPlayers[player.teamName][player.position].push(player);
  });
  return groupedPlayers;
};

const groupedPlayers = groupPlayersByTeamAndPosition(filteredPlayers);

// Rendering condizionale basato sullo stato di caricamento e sugli errori
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
if (!user || !user._id) return <ErrorMessage message={'Dati utente non disponibili. Effettua nuovamente il login.'} />;

return (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-4 text-white">Mercato Serie A</h1>
    
    {/* Informazioni sul budget e stato del mercato */}
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <p className="text-xl font-semibold text-white">Budget disponibile: €{formatPrice(budget)}</p>
      <p className="text-lg text-gray-300">Giocatori in squadra: {userTeam?.players.length || 0}/24</p>
      <p className={`text-lg ${marketStatus.isOpen ? 'text-green-500' : 'text-red-500'}`}>
        {marketStatus.message}
      </p>
      {/* Mostra la prossima apertura del mercato se chiuso */}
      {!marketStatus.isOpen && marketStatus.nextOpeningDate && (
        <p className="text-sm text-gray-400">
          Prossima apertura: {new Date(marketStatus.nextOpeningDate).toLocaleString()}
        </p>
      )}
    </div>

    {/* Filtri di ricerca per i giocatori */}
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <input
        type="text"
        placeholder="Nome giocatore"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white"
      />
      <select
        value={teamFilter}
        onChange={(e) => setTeamFilter(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white"
      >
        <option value="">Tutte le squadre</option>
        {teams.map(team => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>
      <select
        value={positionFilter}
        onChange={(e) => setPositionFilter(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white"
      >
        <option value="">Tutte le posizioni</option>
        {positions.map(position => (
          <option key={position} value={position}>{position}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Prezzo minimo"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white"
      />
      <input
        type="number"
        placeholder="Prezzo massimo"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white"
      />
    </div>

    {/* Layout a due colonne: giocatori disponibili e squadra dell'utente */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Colonna dei giocatori disponibili */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Giocatori disponibili</h2>
        {/* Raggruppa i giocatori per squadra */}
        {Object.entries(groupedPlayers).map(([teamName, teamData]) => (
          <div key={teamName} className="mb-8">
            <div className="flex items-center mb-2">
              <TeamLogo 
                src={teamData.logo} 
                alt={`${teamName} logo`} 
                teamName={teamName}
              />
              <h3 className="text-2xl font-semibold text-white ml-4">{teamName}</h3>
            </div>
            {/* Raggruppa i giocatori per posizione all'interno di ogni squadra */}
            {positions.map(position => (
              teamData[position].length > 0 && (
                <div key={position} className="mb-4">
                  <h4 className="text-xl font-medium mb-2 text-white">{position}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamData[position].map(player => (
                      <PlayerCard 
                        key={player._id} 
                        player={player} 
                        onBuy={handleBuyPlayer}
                        isInUserTeam={false}
                        disabled={!marketStatus.isOpen || budget < player.price}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ))}
      </div>
      
      {/* Colonna della squadra dell'utente */}
      <div className="sticky top-0 self-start overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-white">La tua squadra</h2>
        {/* Raggruppa i giocatori della squadra dell'utente per posizione */}
        {positions.map(position => (
          <div key={position}>
            <h3 className="text-xl font-semibold mb-2 text-white">{position}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {userTeam && userTeam.players
                .filter(playerInfo => {
                  const player = allPlayers.find(p => p._id === playerInfo.player.toString());
                  return player && player.position === position;
                })
                .map(playerInfo => {
                  const player = allPlayers.find(p => p._id === playerInfo.player.toString());
                  return player ? (
                    <PlayerCard
                      key={player._id}
                      player={player}
                      onSell={handleSellPlayer}
                      isInUserTeam={true}
                      disabled={!marketStatus.isOpen}
                    />
                  ) : null;
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}