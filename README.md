# FantasyFootball

FantasyFootball è una piattaforma web interattiva che offre un'esperienza di fantacalcio coinvolgente e realistica basata sulla Serie A italiana. Gli utenti possono creare la propria squadra, partecipare al mercato dei giocatori, gestire le formazioni e competere con altri appassionati in un ambiente dinamico e aggiornato in tempo reale.

## Caratteristiche Principali

- **Autenticazione Utente**: Sistema di registrazione e login sicuro con JWT.
- **Creazione e Gestione Squadra**: 
  - Creazione di una squadra personalizzata
  - Budget iniziale di 300 milioni
  - Limite di 24 giocatori per squadra
- **Mercato Giocatori**: 
  - Sistema di acquisto e vendita di giocatori
  - Aggiornamento automatico dei prezzi dei giocatori
  - Finestre di mercato gestite dall'amministratore
- **Gestione Formazioni**: 
  - Impostazione della formazione per ogni giornata
  - Diverse tattiche disponibili (es. 4-4-2, 3-5-2, etc.)
- **Statistiche in Tempo Reale**: 
  - Aggiornamenti live sulle prestazioni dei giocatori
  - Calcolo automatico dei punteggi
- **Classifica**: 
  - Classifica generale della lega
  - Classifiche per giornata
- **Serie A**: 
  - Classifica
  - Tutti i match con dettagli delle singole partite
  - Classifica dei marcatori e degli assistman
  - Reparto delle squadre con le schede aggiornate delle statistiche dei giocatori
- **Dashboard Amministratore**: 
  - Controllo delle finestre di mercato

## Tecnologie Utilizzate

### Frontend
- React.js 18.x
- Tailwind CSS 3.x
- React Router 6.x
- Axios
- Framer Motion

### Backend
- Node.js 16.x
- Express.js 4.x
- MongoDB 5.x
- Mongoose ORM
- JSON Web Tokens (JWT) per l'autenticazione

### API Esterne
- API-Football per dati in tempo reale della Serie A


## Prerequisiti

- Node.js (v14.0.0 o superiore)
- MongoDB (v4.4 o superiore)
- Account API-Football con chiave API valida 

## Installazione

1. Clona il repository:
   ```bash
   cd fantasyfootball
   ```

2. Installa le dipendenze per il backend:
   ```bash
   cd fantacalcio-backend
   npm install
   ```

3. Installa le dipendenze per il frontend:
   ```bash
   cd fantacalcio-frontend
   npm install
   ```

4. Crea un file `.env` nella cartella backend.

5. Avvia il server backend in modalità di sviluppo:
   ```bash
   node server.js
   ```

6. In un nuovo terminale, avvia l'applicazione frontend:
   ```bash
   npm run dev
   ```

L'applicazione sarà accessibile all'indirizzo `http://localhost:5001`.

## Configurazione

### Variabili d'Ambiente

Crea un file `.env` nella cartella `backend` con le seguenti variabili:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
API_FOOTBALL_KEY=your_api_football_key
PORT=5001
NODE_ENV=development
```

### Configurazione del Database

Il progetto utilizza MongoDB. 

## Uso

1. **Registrazione/Login**: 
   - Accedi alla homepage e clicca su "Registrati"
   - Compila il modulo di registrazione
   - Effettua il login con le credenziali appena create

2. **Creazione Squadra**:
   - Dopo il login, comparirà il componente Coach con un pulsante per creare la squadra

3. **Mercato**:
   - Vai alla sezione "Mercato" per acquistare o vendere giocatori
   - Ricorda di rispettare il budget e i limiti di squadra

4. **Gestione Formazione**:
   - Accedi a "La Mia Squadra" per impostare la formazione
   - Scegli la tattica e seleziona gli 11 titolari

5. **Visualizzazione delle prestazioni e della Classifica**:
   - Controlla la performance della tua squadra su GamePlay
   - Controlla la tua posizione nella sezione "Classifica"

6. **Dashboard Admin** (solo per amministratori):
   - Accedi con un account admin per gestire le finestre di mercato e altre impostazioni di sistema

## Struttura del Progetto

```
fantasyfootball/
│
├── backend/
│   ├── config/
│   │   └── cloudinaryConfig.js
│   ├── jobs/
│   │   ├── automatedPlayerPerformanceUpdate.js
│   │   ├── marketWindowJob.js
│   │   ├── scheduledJobs.js
│   │   └── updateSerieAPlayersJob.js
│   ├── middlewares/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── checkMarketOpen.js
│   │   └── errorHandlers.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── PlayerPerformance.js
│   │   ├── SerieAPlayer.js
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── userRoutes.js
│   │   └── ...
│   ├── services/
│   │   ├── emailServices.js
│   │   ├── scoreCalculationService.js
│   │   └── ...
│   ├── utils/
│   │   └── jwt.js
│   ├── priceAlgorithm.js
│   ├── initializeSerieADatabase.js
│   ├── populateGameWeeks.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Market.jsx
│   │   │   ├── MyTeam.jsx
│   │   │   ├── SerieA.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── apisport.js
│   │   │   └── gameService.js
│   │   ├── App.jsx
│   │   └── main.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## API

Il backend espone le seguenti API principali:

- `/api/users`: CRUD operazioni per gli utenti
- `/api/teams`: CRUD operazioni per le proprie squadre
- `/api/marketwindow`: Informazioni sulle sessioni di mercato
- `/api/serieaplayers`: Informazioni sui giocatori della serie A 2024
- `/api/serieaplayers23`: Informazioni sui giocatori della serie A 2023
- `/api/playerperformances`: Informazioni sulle performance dei giocatori
- `/api/gameweek`: Informazioni sulle settimane di gioco

## Deployment

### Backend
1. Assicurati che tutte le variabili d'ambiente siano configurate correttamente
2. Esegui `npm run build` nella cartella backend
3. Avvia il server con `node server.js`

### Frontend
1. Nella cartella frontend, esegui `npm run build`
2. Distribuisci la cartella `build` generata su un server web statico

## Roadmap

- [ ] Implementazione di leghe private
- [ ] Sistema di notifiche push per aggiornamenti in tempo reale
- [ ] Integrazione con social media per la condivisione dei risultati
- [ ] App mobile (iOS/Android)
- [ ] Supporto per multiple leghe (es. Premier League, La Liga)

## FAQ

**D: Come posso reimpostare la mia password?**
R: Al momento, contatta l'amministratore per reimpostare la password. Stiamo lavorando su una funzionalità di reset password self-service.

**D: Quante volte posso modificare la mia formazione?**
R: Puoi modificare la tua formazione fino a 5 minuti prima dell'inizio della prima partita di ogni giornata di campionato.

**D: Come vengono calcolati i punteggi?**
R: I punteggi sono calcolati in base alle prestazioni reali dei giocatori in Serie A, utilizzando un sistema di punti personalizzato. Per i dettagli completi, consulta la sezione "Accumula Punti e Domina" nelle istruzioni del gioco.


## Contatti

Costantino Grabesu - costantino.grabesu14@gmail.com

Link del Progetto: https://https://github.com/Costantino14/Fantasy-Football