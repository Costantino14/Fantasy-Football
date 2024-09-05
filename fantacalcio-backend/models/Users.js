// Importiamo le dipendenze necessarie
import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt"; 

// Definizione dello schema dell'utente utilizzando il costruttore Schema di Mongoose
const userSchema = new mongoose.Schema(
  {
    // Nome utente, obbligatorio e unico
    username: { type: String, required: true, unique: true },
    
    // Indirizzo email, obbligatorio e unico
    email: { type: String, required: true, unique: true },
    
    // Password dell'utente, obbligatoria
    password: { type: String, required: true },
    
    // URL dell'avatar dell'utente, opzionale
    avatar: {type: String },
    
    // ID di Google per l'autenticazione OAuth, opzionale
    googleId: { type: String },
    
    // Nome della squadra dell'utente, obbligatorio e unico
    teamName: { type: String, required: true, unique: true },
    
    // Riferimento al documento Team dell'utente, unico
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', unique: true }
  },
  {
    // Opzioni dello schema:
    timestamps: true,  // Aggiunge automaticamente i campi createdAt e updatedAt
    collection: "users", // Nome della collezione nel database MongoDB
  }
);

// Metodo per confrontare le password
// Questo metodo viene aggiunto ai metodi dell'istanza del documento
userSchema.methods.comparePassword = function(candidatePassword) {
  // Utilizza bcrypt per confrontare la password fornita con quella hashata nel database
  return bcrypt.compare(candidatePassword, this.password);
};

// Middleware per l'hashing delle password prima del salvataggio
// Questo hook viene eseguito prima di ogni operazione di salvataggio
userSchema.pre("save", async function (next) {
  // Se la password non è stata modificata, passa al prossimo middleware
  if (!this.isModified("password")) return next();
  
  try {
    // Genera un salt per l'hashing
    const salt = await bcrypt.genSalt(10);
    // Hash la password con il salt generato
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    // Se si verifica un errore, passa l'errore al prossimo middleware
    next(error);
  }
});

// Crea e esporta il modello Mongoose 'Users' basato sullo schema definito
export default mongoose.model("Users", userSchema);