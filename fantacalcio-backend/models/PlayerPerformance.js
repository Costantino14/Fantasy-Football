// Importa il modulo mongoose per interagire con MongoDB
import mongoose from 'mongoose';

// Definisce lo schema per il modello PlayerPerformance
const playerPerformanceSchema = new mongoose.Schema({
  
  // Numero della gameweek in cui si è svolta la performance
  gameweek: { type: Number, required: true },
  
  // Data della partita
  date: { type: Date, required: true },
  
  // ID univoco del giocatore
  playerId: { type: Number, required: true },
  
  // Nome del giocatore
  name: { type: String, required: true },
  
  // Nome della squadra del giocatore
  team: { type: String, required: true },
  
  // Ruolo del giocatore (es. "Attaccante", "Centrocampista", ecc.)
  position: { type: String, required: true },
  
  // Valutazione complessiva della performance del giocatore
  rating: { type: Number, default: 0 },
  
  // Minuti giocati durante la partita
  minutesPlayed: { type: Number, default: 0 },
  
  // Numero di gol segnati
  goals: { type: Number, default: 0 },
  
  // Numero di assist effettuati
  assists: { type: Number, default: 0 },
  
  // Numero di cartellini gialli ricevuti
  yellowCards: { type: Number, default: 0 },
  
  // Numero di cartellini rossi ricevuti
  redCards: { type: Number, default: 0 },
  
  // Numero totale di tiri effettuati
  shotsTotal: { type: Number, default: 0 },
  
  // Numero di tiri nello specchio della porta
  shotsOn: { type: Number, default: 0 },
  
  // Numero totale di passaggi effettuati
  passes: { type: Number, default: 0 },
  
  // Numero di passaggi chiave effettuati
  keyPasses: { type: Number, default: 0 },
  
  // Numero di tackle effettuati
  tackles: { type: Number, default: 0 },
  
  // Numero di intercettazioni effettuate
  interceptions: { type: Number, default: 0 },
  
  // Numero di parate (per i portieri)
  saves: { type: Number, default: 0 },
  
  // Punteggio fantasy calcolato in base alla performance
  fantasyScore: { type: Number, default: 0 }
});

// Crea un indice composto unico su gameweek e playerId
// Questo assicura che non ci siano duplicati per lo stesso giocatore nella stessa gameweek
playerPerformanceSchema.index({ gameweek: 1, playerId: 1 }, { unique: true });

// Crea e esporta il modello Mongoose 'PlayerPerformance' basato sullo schema definito
export default mongoose.model('PlayerPerformance', playerPerformanceSchema);