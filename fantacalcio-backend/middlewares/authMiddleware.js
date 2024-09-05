//Import che mi servono
import { verifyJWT } from "../utils/jwt.js";
import Users from "../models/Users.js";

// Middleware di autenticazione
export const authMiddleware = async (req, res, next) => {
  try {
    // Estrai il token dall'header Authorization, prevengo l'errore con l'operatore ?. e rimuovo il prefisso 'Bearer ' dal token
    const token = req.headers.authorization?.replace("Bearer ", "");

    // Controllo se esiste il token
    if (!token) {
      return res.status(401).send("Token mancante")
    }
    
    const decoded = await verifyJWT(token);

    const user = await Users.findById(decoded.id).select("-password");

    // Se l'utente non viene trovato nel database, restituisce un errore 401
    if (!user) {
      return res.status(401).send("Utente non trovato");
    }

    // Aggiungo l'oggetto user alla richiesta
    req.user = user;

    // Passa al prossimo middleware 
    next();
  } catch (error) {
    
    res.status(401).send("Token non valido");
  }
};