import express from "express";
import Users from "../models/Users.js";
import Team from "../models/Team.js";
import { generateJWT } from "../utils/jwt.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const FRONTEND_URL = 'http://localhost:5173'

const router = express.Router();

// POST: Gestisce il login dell'utente
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cerca l'utente nel database usando l'email
    const user = await Users.findOne({ email });
    if (!user) {
      // Se l'utente non viene trovato, restituisce un errore 401
      return res.status(401).json({ message: "Credenziali non valide, errore e-mail" });
    }

    // Verifica la password usando il metodo comparePassword definito nel modello User
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Se la password non corrisponde, restituisce un errore 401
      return res.status(401).json({ message: "Credenziali non valide, errore password" });
    }

    // Se le credenziali sono corrette, genera un token JWT
    const token = await generateJWT({ id: user._id });

    // Restituisce il token e un messaggio di successo
    res.json({ token, message: "Login effettuato con successo" });
  } catch (error) {
    // Gestisce eventuali errori del server
    console.error("Errore nel login:", error);
    res.status(500).json({ message: "Errore del server" });
  }
});

// GET: Recupera i dati dell'utente autenticato
router.get("/me", authMiddleware, (req, res) => {
  const userData = req.user.toObject();
  delete userData.password;  // Rimuove la password dai dati inviati
  res.json(userData);
});

export default router;