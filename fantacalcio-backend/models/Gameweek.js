// Importa il modulo mongoose per la gestione del database MongoDB
import mongoose from 'mongoose';

// Definisce lo schema per il modello Gameweek
const gameweekSchema = new mongoose.Schema({
  // Numero della gameweek, deve essere unico e obbligatorio
  number: { type: Number, required: true, unique: true },
  
  // Data di inizio della gameweek, campo obbligatorio
  startDate: { type: Date, required: true },
  
  // Data di fine della gameweek, campo obbligatorio
  endDate: { type: Date, required: true },
  
  // Indica se la gameweek è attualmente attiva, default è false
  isActive: { type: Boolean, default: false },
  
  // Indica se la gameweek è stata completata, default è false
  isCompleted: { type: Boolean, default: false }
});

// Crea e esporta il modello Mongoose 'Gameweek' basato sullo schema definito
export default mongoose.model('Gameweek', gameweekSchema);