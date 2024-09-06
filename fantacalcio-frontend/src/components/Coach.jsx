import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getOrCreateTeam } from '../services/api';

// Array di frasi celebri di allenatori
const phrases = [
  "Per diventare un buon allenatore non bisogna essere stati per forza dei campioni; un fantino non ha mai fatto il... cavallo.",
  "Solo uno tra ventuno non voleva darmi la laurea honoris causa, ma è normale, neanche Gesù piaceva a tutti.",
  "Alcuni giocatori si lamentano che faccio correre troppo? A Pescara vivo sul lungomare, e ogni mattina vedo un sacco di persone che corrono. E non li paga nessuno loro.",
  "Faticoso è alzarsi alle 6 per andare in fabbrica. Qui serve solo armonia di movimenti e di tempo.",
  "La classifica è come il sesso degli angeli: non c'importa.",
  "I rigori li sbaglia solo chi ha il coraggio di tirarli.",
  "O la mia strada o l’autostrada.",
  "Rigore è quando arbitro fischia.",
  "Non sono il migliore del mondo, ma penso che nessuno sia meglio di me.",
  "Ti intendi di ippica? Nei cavalli basta mettere il musetto davanti, non di 100 metri. Foto, corto muso, chi perde di corto muso è secondo, chi vince si così è primo.",
  "Il calcio è molto semplice: bisogna fare due cose, la fase offensiva e quella difensiva, e bisogna farle bene tutte e due. Lo spettacolo è al circo: noi dobbiamo vincere le partite e fare i tre punti.",
  "Non dire gatto se non ce l'hai nel sacco.",
  "In Italia si vuole l'uovo, il culo caldo e la gallina, ma quando la gallina ha fatto l'uovo va via eh? Quindi non può avere il culo caldo. Noi vogliamo tutto e subito. Coccodè coccodè and go. You understand?",
  "Non si può mangiare con 10 euro in un ristorante da 100 euro.",
  "Ronaldinho aveva il permesso fino alle 5, è tornato alle 3. Non si stava divertendo."
];

export default function Coach() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [randomPhrase, setRandomPhrase] = useState('');

  // Effetto per selezionare una frase casuale all'avvio del componente
  useEffect(() => {
    setRandomPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  // Funzione per gestire il logout
  const handleLogout = () => {
    logout();
    navigate('/');
  }

  // Funzione per creare un nuovo team
  const handleCreateTeam = async () => {
    try {
      await getOrCreateTeam(user._id);
      navigate('/market');
    } catch (error) {
      console.error("Errore nella creazione del team:", error);
      alert("Si è verificato un errore nella creazione del team. Riprova.");
    }
  };

  // Rendering del componente
  return (
    <>
    <div className="hero bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          {/* Avatar dell'utente */}
          <img
            src={user.avatar || "https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"}
            className="max-w-sm rounded-lg shadow-2xl" 
            alt="User avatar"
          />
          {/* Frase casuale */}
          <div className="chat chat-end">
            <div className="chat-bubble">{randomPhrase}</div>
          </div>
          <div>
            <h1 className="text-5xl font-bold">Benvenuto, Coach {user.username}!</h1>
            <p className="py-6">
              {user.team ? 
                `Sei pronto a guidare la tua squadra ${user.teamName} verso la vittoria?` :
                "Sembra che tu non abbia ancora una squadra. Che ne dici di crearne una e iniziare la tua avventura?"
              }
            </p>
            <div className="flex space-x-4 mt-8">
              {/* Controllo se sei loggato */}
              {!user.team ? (
                <button className="btn btn-primary" onClick={handleCreateTeam}>
                  Crea la tua squadra
                </button>
              ) : (
              <Link to="/MyTeam" className="btn btn-primary ">La mia squadra</Link>
              )}
              <button className="btn btn-neutral ms-2" onClick={handleLogout}>Logout</button>
            </div>  
          </div>
        </div>
    </div>
    </>
  )
}