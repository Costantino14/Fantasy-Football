import express from "express";
import Users from "../models/Users.js";
import Team from "../models/Team.js"; // Importa il modello Team
import { v2 as cloudinary } from "cloudinary";
import cloudinaryUploader from "../Config/cloudinaryConfig.js";
import { checkMarketOpen } from '../middlewares/checkMarketOpen.js'; // Importa il middleware per il controllo del mercato


const router = express.Router(); // Crea un router Express

//rotta per recuperare tutti gli utenti
router.get("/", async (req, res) => {
  try {
     const page = parseInt(req.query.page) || 1;
     const limit = parseInt(req.query.limit) || 10;
     const sort = req.query.sort || 'username';  
     const sortDirection = req.query.sortDirection === 'desc' ? -1 : 1;
     const skip= (page -1)*limit;
     const users =  await Users.find({}) // Trova tutti gli utenti nel database
      .sort({[sort]: sortDirection})
      .skip(skip)
      .limit(limit)

    const total= await Users.countDocuments();

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAuthors: total
  });

  } catch (err) {
    res.status(500).json({ message: err.message }); // Gestisce errori e risponde con un messaggio di errore
  }
});


// Rotta per ottenere un singolo utente
router.get("/:id", async (req, res) => {
  try {
    const user = await Users.findById(req.params.id); // Trova un utente per ID
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" }); // Se l'utente non esiste, risponde con un errore 404
    }
    res.json(user); // Risponde con i dati dell'utente in formato JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Gestisce errori e risponde con un messaggio di errore
  }
});

// Rotta per creare un nuovo utente
router.post('/', cloudinaryUploader.single('avatar'), async (req,res) => {
  try {
    const userData = req.body;
    if(req.file) {
      userData.avatar = req.file.path; // Cloudinary restituirà direttamente il suo url
    }
    const newUser = new Users(userData)
    await newUser.save();

   // Rimuovi la password dalla risposta per sicurezza
   const userResponse = newUser.toObject();
   delete userResponse.password;

    res.status(201).json(newUser)
  } catch (err) {

    console.error('errore nella creazione', err)
    res.status(400).json({ message: err.message }); // Gestisce errori di validazione e risponde con un messaggio di errore

  }
})


// Rotta per aggiornare un utente
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Restituisce il documento aggiornato anziché quello vecchio
    });
    if(!updatedUser) {
      return res.status(404).json({ message: "Utente non trovato" }); 
    } else {
    res.json(updatedUser); // Risponde con i dati dell'utente aggiornato in formato JSON
    }
  } catch (err) {
    res.status(400).json({ message: err.message }); // Gestisce errori di validazione e risponde con un messaggio di errore
  }
});

// Rotta per eliminare un utente
router.delete("/:id", async (req, res) => {
  try {
    const deleteUser = await Users.findByIdAndDelete(req.params.id); // Elimina un utente per ID
    if(!deleteUser) {
      return res.status(404).json({ message: "Utente non trovato" }); // Se l'utente non esiste, risponde con un errore 404
    } else {
    res.json({ message: "Utente Cancellato Dalla Lista" }); // Risponde con un messaggio di conferma
  }} 
  catch (err) {
    res.status(500).json({ message: err.message }); // Gestisce errori e risponde con un messaggio di errore
  }
});


// PATCH /authors/:authorId/avatar: carica un'immagine avatar per l'autore specificato
router.patch("/:id/avatar", cloudinaryUploader.single("avatar"), async (req, res) => {
  try {
    // Verifica se è stato caricato un file, se non l'ho caricato rispondo con un 400
    if (!req.file) {
      return res.status(400).json({ message: "Nessun file caricato" });
    }

    // Cerca l'autore nel database, se non esiste rispondo con una 404
    const user = await Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // Aggiorna l'URL dell'avatar dell'autore con l'URL fornito da Cloudinary
    user.avatar = req.file.path;

    // Salva le modifiche nel db
    await user.save();

    // Invia la risposta con l'autore aggiornato
    res.json(user);
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'avatar:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

router.get('/me', async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select('-password');
    res.json({
      ...user.toObject(),
      _id: user._id.toString() // Assicura che l'ID sia una stringa
    });
  } catch (error) {
    console.error('Errore nel recupero dei dati utente:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});


export default router; // Esporta il router per l'utilizzo in altri file