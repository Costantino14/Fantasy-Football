// Importa il modulo mongoose per interagire con MongoDB
import mongoose from 'mongoose';

// Definisce lo schema per il modello SerieAPlayer
const serieAPlayerSchema = new mongoose.Schema({
  // ID univoco del giocatore, obbligatorio
  id: { type: Number, required: true },
  
  // Nome completo del giocatore, obbligatorio
  name: { type: String, required: true },
  
  // URL della foto del giocatore, se disponibile
  photo: { type: String, default: '' },
  
  // Età del giocatore
  age: { type: Number, default: 0 },
  
  // Nazionalità del giocatore
  nationality: { type: String, default: '' },
  
  // Ruolo del giocatore (es. "Attaccante", "Centrocampista", ecc.)
  position: { type: String, default: '' },
  
  // Indica se il giocatore è attualmente infortunato
  injured: { type: Boolean, default: false },
  
  // URL del logo della squadra del giocatore
  teamLogo: { type: String, default: '' },
  
  // Nome della squadra del giocatore
  teamName: { type: String, default: '' },
  
  // Altezza del giocatore
  height: { type: String, default: '' },
  
  // Statistiche di gioco
  totGoal: { type: Number, default: 0 },      // Totale gol segnati
  penalty: { type: Number, default: 0 },      // Rigori segnati
  assist: { type: Number, default: 0 },       // Assist forniti
  saved: { type: Number, default: 0 },        // Parate effettuate (per i portieri)
  goalConceded: { type: Number, default: 0 }, // Gol subiti (per i portieri)
  minutes: { type: Number, default: 0 },      // Minuti giocati
  appearences: { type: Number, default: 0 },  // Numero di presenze
  lineups: { type: Number, default: 0 },      // Numero di volte titolare
  passes: { type: Number, default: 0 },       // Passaggi totali
  passesKey: { type: Number, default: 0 },    // Passaggi chiave
  shots: { type: Number, default: 0 },        // Tiri totali
  shotsOn: { type: Number, default: 0 },      // Tiri in porta
  dribbles: { type: Number, default: 0 },     // Dribbling completati
  duels: { type: Number, default: 0 },        // Duelli vinti
  tackles: { type: Number, default: 0 },      // Tackle effettuati
  fouls: { type: Number, default: 0 },        // Falli commessi
  yellowCards: { type: Number, default: 0 },  // Cartellini gialli ricevuti
  redCards: { type: Number, default: 0 },     // Cartellini rossi ricevuti
  
  // Prezzo del giocatore nel fantasy football
  price: { type: Number, default: 0 },
  
  // Data dell'ultimo aggiornamento dei dati del giocatore
  lastUpdated: { type: Date, default: Date.now },
});

// Crea e esporta il modello Mongoose 'SerieAPlayer' basato sullo schema definito
export default mongoose.model('SerieAPlayer', serieAPlayerSchema);