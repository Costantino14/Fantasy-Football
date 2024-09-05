import express from 'express';
import { sendEmail } from '../services/emailServices.js';

const router = express.Router();

// POST: Invia un'email
router.post('/send', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    // Invia l'email utilizzando il servizio emailServices
    await sendEmail(
      'costantino.grabesu14@gmail.com',  // Indirizzo email del destinatario
      `Nuovo messaggio da ${name} (${email})`,  // Oggetto dell'email
      `<p>${message}</p>`  // Corpo dell'email in HTML
    );
    res.status(200).json({ message: 'Email inviata con successo' });
  } catch (error) {
    console.error('Errore nell\'invio dell\'email:', error);
    res.status(500).json({ message: 'Errore nell\'invio dell\'email' });
  }
});

export default router;