import mongoose from "mongoose";

// Definizione dello schema per il modello Team
const teamSchema = new mongoose.Schema(
  {
    // Riferimento all'utente proprietario del team
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Array di giocatori nel team
    players: [{
        id: { type: Number, required: true },  // ID del giocatore
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'SerieAPlayer' },  // Riferimento al modello SerieAPlayer
        position: { type: String, enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'] }  // Ruolo del giocatore
    }],

    // Budget del team, default a 300 milioni
    budget: { type: Number, default: 300000000 },

    // Punteggio totale del team
    totalScore: { type: Number, default: 0 },

    // Conteggio dei giocatori per ruolo con limiti massimi
    playerCounts: {
      Goalkeeper: { type: Number, default: 0, max: 3 },
      Defender: { type: Number, default: 0, max: 8 },
      Midfielder: { type: Number, default: 0, max: 8 },
      Attacker: { type: Number, default: 0, max: 5 },
    },

    // Array delle formazioni attive per diverse gameweek
    activeFormations: [{
      gameweek: Number,  // Numero della gameweek
      formation: String, // Formazione utilizzata (es. "4-3-3")
      lineup: {
        // Lineup per ogni ruolo, con riferimenti ai giocatori
        Goalkeeper: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SerieAPlayer' }],
        Defender: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SerieAPlayer' }],
        Midfielder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SerieAPlayer' }],
        Attacker: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SerieAPlayer' }],
      }
    }],
    
    // Array dei punteggi per ogni gameweek
    gameweekScores: [{
      gameweek: Number,  // Numero della gameweek
      score: Number      // Punteggio ottenuto in quella gameweek
    }]
  },
  {
    timestamps: true,  // Aggiunge automaticamente i campi createdAt e updatedAt
    collection: "team", // Nome specifico della collezione nel database MongoDB
  }
);

// Crea e esporta il modello Mongoose 'Team' basato sullo schema definito
export default mongoose.model("Team", teamSchema);