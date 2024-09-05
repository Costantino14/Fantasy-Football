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
- **Dashboard Amministratore**: 
  - Gestione degli utenti
  - Controllo delle finestre di mercato
  - Monitoraggio delle prestazioni del sistema

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

### Strumenti di Sviluppo
- ESLint per il linting del codice
- Prettier per la formattazione del codice
- Jest per i test unitari
- GitHub Actions per CI/CD

## Prerequisiti

- Node.js (v14.0.0 o superiore)
- MongoDB (v4.4 o superiore)
- NPM (v6.0.0 o superiore) o Yarn (v1.22.0 o superiore)
- Un account API-Football con chiave API valida

## Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/tuousername/fantasyfootball.git
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
PORT=5000
NODE_ENV=development
```

### Configurazione del Database

Il progetto utilizza MongoDB. Assicurati di avere un'istanza MongoDB in esecuzione e configura l'URI di connessione nel file `.env`.

## Uso

1. **Registrazione/Login**: 
   - Accedi alla homepage e clicca su "Registrati"
   - Compila il modulo di registrazione
   - Effettua il login con le credenziali appena create

2. **Creazione Squadra**:
   - Dopo il login, verrai reindirizzato alla pagina di creazione squadra
   - Scegli un nome per la tua squadra e inizia a selezionare i giocatori

3. **Mercato**:
   - Vai alla sezione "Mercato" per acquistare o vendere giocatori
   - Ricorda di rispettare il budget e i limiti di squadra

4. **Gestione Formazione**:
   - Accedi a "La Mia Squadra" per impostare la formazione
   - Seleziona 11 titolari e scegli la tattica

5. **Visualizzazione Classifica**:
   - Controlla la tua posizione nella sezione "Classifica"

6. **Dashboard Admin** (solo per amministratori):
   - Accedi con un account admin per gestire le finestre di mercato e altre impostazioni di sistema

## Struttura del Progetto

```
fantasyfootball/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── teamController.js
│   │   └── marketController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── ...
│   ├── models/
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── PlayerPerformance.js
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── teamRoutes.js
│   │   └── marketRoutes.js
│   ├── services/
│   │   └── apiFootballService.js
│   ├── utils/
│   │   └── jwtUtils.js
│   ├── tests/
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
│   │   └── App.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## API

Il backend espone le seguenti API principali:

- `/api/auth`: Gestione autenticazione (registrazione, login)
- `/api/users`: CRUD operazioni per gli utenti
- `/api/teams`: CRUD operazioni per le squadre
- `/api/market`: Operazioni di mercato (acquisto, vendita giocatori)
- `/api/serieaplayers`: Informazioni sui giocatori
- `/api/playerperformances`: Informazioni sulle performance dei giocatori

## Deployment

### Backend
1. Assicurati che tutte le variabili d'ambiente siano configurate correttamente
2. Esegui `npm run build` nella cartella backend
3. Avvia il server con `npm start`

### Frontend
1. Nella cartella frontend, esegui `npm run build`
2. Distribuisci la cartella `build` generata su un server web statico

Per istruzioni dettagliate sul deployment, consulta [DEPLOYMENT.md](DEPLOYMENT.md).

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
R: I punteggi sono calcolati in base alle prestazioni reali dei giocatori in Serie A, utilizzando un sistema di punti personalizzato. Per i dettagli completi, consulta la sezione "Calcolo Punteggi" nelle istruzioni del gioco.


## Contatti

[Il tuo Nome] - [@tuotwitter](https://twitter.com/tuotwitter) - email@example.com

Link del Progetto: [https://github.com/yourusername/fantasyfootball](https://github.com/yourusername/fantasyfootball)