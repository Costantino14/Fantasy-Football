import React from 'react';

// Componente per visualizzare l'icona del giocatore
const PlayerIcon = ({ player }) => (
  <div className="flex flex-col items-center">
    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
      <img 
        src={player.photo} 
        alt={player.name} 
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/150?text=' + player.name.charAt(0);
        }}
      />
    </div>
    <div className="mt-1 text-[8px] sm:text-[10px] md:text-xs text-white text-center font-bold bg-black bg-opacity-50 px-1 rounded truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px]">
      {player.name}
    </div>
  </div>
);

const FormationDisplay = ({ lineup, formation }) => {

  // Definizione delle posizioni dei giocatori per ogni formazione
  const gridPositions = {
    '4-4-2': {
      Goalkeeper: ['col-start-3 row-start-7'],
      Defender: ['col-start-1 row-start-5', 'col-start-2 row-start-6', 'col-start-4 row-start-6', 'col-start-5 row-start-5'],
      Midfielder: ['col-start-1 row-start-3', 'col-start-2 row-start-4', 'col-start-4 row-start-4', 'col-start-5 row-start-3'],
      Attacker: ['col-start-2 row-start-1', 'col-start-4 row-start-1'],
    },
    '3-4-3': {
      Goalkeeper: ['col-start-3 row-start-7'],
      Defender: ['col-start-1 row-start-5', 'col-start-3 row-start-6', 'col-start-5 row-start-5'],
      Midfielder: ['col-start-1 row-start-3', 'col-start-2 row-start-4', 'col-start-4 row-start-4', 'col-start-5 row-start-3'],
      Attacker: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-5 row-start-1'],
    },
    '4-3-3': {
      Goalkeeper: ['col-start-3 row-start-7'],
      Defender: ['col-start-1 row-start-5', 'col-start-2 row-start-6', 'col-start-4 row-start-6', 'col-start-5 row-start-5'],
      Midfielder: ['col-start-2 row-start-3', 'col-start-3 row-start-4', 'col-start-4 row-start-3'],
      Attacker: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-5 row-start-1'],
    },
    '5-3-2': {
      Goalkeeper: ['col-start-3 row-start-7'],
      Defender: ['col-start-1 row-start-5', 'col-start-2 row-start-6', 'col-start-3 row-start-5', 'col-start-4 row-start-6', 'col-start-5 row-start-5'],
      Midfielder: ['col-start-2 row-start-3', 'col-start-3 row-start-4', 'col-start-4 row-start-3'],
      Attacker: ['col-start-2 row-start-1', 'col-start-4 row-start-1'],
    },
    '3-5-2': {
      Goalkeeper: ['col-start-3 row-start-7'],
      Defender: ['col-start-1 row-start-5', 'col-start-3 row-start-6', 'col-start-5 row-start-5'],
      Midfielder: ['col-start-1 row-start-3', 'col-start-2 row-start-4', 'col-start-3 row-start-2', 'col-start-4 row-start-4', 'col-start-5 row-start-3'],
      Attacker: ['col-start-2 row-start-1', 'col-start-4 row-start-1'],
    },
  };

  return (
    <div className="w-full max-w-md mx-auto bg-green-600 aspect-[2/3] grid grid-cols-5 grid-rows-7 gap-1 p-2 relative">
      {/* Linea di centrocampo */}
      <div className="absolute inset-x-0 top-1/2 border-b border-white opacity-70"></div>
      
      {/* Cerchio di centrocampo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border border-white opacity-70"></div>
      </div>
      
      {/* Area di rigore */}
      <div className="absolute inset-x-1/4 bottom-0 h-1/5 w-2/4 border-t border-x border-white opacity-70"></div>

      {/* Renderizza i giocatori nelle loro posizioni */}
      {Object.entries(lineup).map(([position, players]) =>
        players.map((player, index) => (
          <div key={player._id} className={`${gridPositions[formation][position][index]} flex items-center justify-center`}>
            <PlayerIcon player={player} />
          </div>
        ))
      )}
    </div>
  );
};

export default FormationDisplay;
