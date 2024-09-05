import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import session from "express-session";
import dotenv from 'dotenv';
import listEndpoints from 'express-list-endpoints';
import { scheduleMarketWindowJobs } from './jobs/marketWindowJob.js';
import { startScheduledJobs } from './jobs/scheduledJobs.js';
import { badRequestHandler, unauthorizedHandler, forbiddenHandler, notFoundHandler, genericErrorHandler } from './middlewares/errorHandlers.js';

import { authMiddleware } from './middlewares/authMiddleware.js';
import teamRoutes from './routes/teamRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import playersSerieARoutes from './routes/playersSerieARoutes.js';
import playersSerieA23Routes from './routes/playersSerieA23Routes.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/emailRoutes.js'
import performanceRoutes from './routes/performanceRoutes.js';
import { playerPerformancesUpdate } from './jobs/automatedPlayerPerformanceUpdate.js';

// Carica le variabili d'ambiente
dotenv.config();

const app = express();

// Middleware di base
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione della sessione
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Connessione al database MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso'))
  .catch((err) => console.error('MongoDB: errore di connessione.', err));

// Definizione delle routes
app.use('/api/users', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/playersSerieA', playersSerieARoutes);
app.use('/api/playersSerieA23', playersSerieA23Routes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/performances', performanceRoutes);
app.use('/api/email', emailRoutes);

// Endpoints di esempio
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public endpoint' });
});

app.get('/api/protected', (req, res) => {
  res.json({ message: 'This is a protected endpoint' });
});

// Middleware per la gestione degli errori
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

const PORT = process.env.PORT || 5000;

// Avvio del server
const server = app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
  console.log("Rotte disponibili:");
  console.table(listEndpoints(app).map((route) => ({
    path: route.path,
    methods: route.methods.join(", "),
  })));

  // Avvia i job schedulati dopo che il server è stato avviato
  scheduleMarketWindowJobs();
  startScheduledJobs();
  playerPerformancesUpdate();
});

// Gestione della chiusura del server
process.on('SIGTERM', () => {
  console.log('SIGTERM ricevuto. Chiusura del server...');
  server.close(() => {
    console.log('Server chiuso.');
    mongoose.connection.close(false, () => {
      console.log('Connessione MongoDB chiusa.');
      process.exit(0);
    });
  });
});