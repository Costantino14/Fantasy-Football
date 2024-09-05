// Importa il modulo mongoose per interagire con MongoDB
import mongoose from 'mongoose';

// Definisce lo schema per il modello MarketWindow
const marketWindowSchema = new mongoose.Schema({

  // Data di inizio della finestra di mercato
  startDate: { type: Date, required: true },
  
  // Data di fine della finestra di mercato
  endDate: { type: Date, required: true },
  
  // Indica se la finestra di mercato è attualmente attiva
  isActive: { type: Boolean, default: true }
}, 
// Opzioni dello schema
{ timestamps: true });

// Crea e esporta il modello Mongoose 'MarketWindow' basato sullo schema definito
export default mongoose.model('MarketWindow', marketWindowSchema);