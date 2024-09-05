import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Interceptor per includere il token in tutte le richieste
api.interceptors.request.use(
  (config) => {
    // Recupera il token dalla memoria locale
    const token = localStorage.getItem("token");
    if (token) {
      // Se il token esiste, aggiungilo all'header di autorizzazione
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Token inviato:", token); 
    }
    return config; 
  },
  (error) => {
    // Gestisce eventuali errori durante l'invio della richiesta
    return Promise.reject(error);
  }
);


// Funzioni per le chiamate API esistenti

export const getUsers = async (page = 1, limit = 10, sort = 'username', sortDirection = 'asc') => {
  try {
    const response = await api.get("/users", {
      params: { page, limit, sort, sortDirection }
    });
    return response.data;
  } catch (error) {
    console.error("Errore nel recupero degli utenti:", error);
    throw error;
  }
};

//
export const getUser = (id) => api.get(`/users/${id}`);

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Errore nella registrazione:", error);
    throw error;
  }
};


export const getUserTeam = async (userId) => {
  if (!userId) {
    console.error("getUserTeam chiamato senza userId");
    throw new Error("ID utente non fornito");
  }
  try {
    console.log("Richiesta team per user ID:", userId);
    const response = await api.get(`/teams/${userId}`);
    console.log("Dati team ricevuti:", response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero del team utente:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrCreateTeam = async (userId) => {
  if (!userId) {
    throw new Error("ID utente non fornito");
  }
  try {
    const response = await api.post('/teams/getOrCreate', { userId });
    console.log("Dati team ricevuti/creati:", response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero/creazione del team:', error.response?.data || error.message);
    throw error;
  }
};

export const buyPlayer = async (userId, playerId) => {
  try {
    console.log(`Chiamata API per acquisto: userId=${userId}, playerId=${playerId}`);
    const response = await api.patch(`/teams/${userId}/players`, { playerId });
    console.log('Risposta acquisto:', response.data);
    return response.data.team;
  } catch (error) {
    console.error('Errore nell\'acquisto del giocatore:', error.response?.data || error.message);
    throw error;
  }
};

export const sellPlayer = async (userId, playerId) => {
  try {
    console.log(`Tentativo di vendita giocatore: userId=${userId}, playerId=${playerId}`);
    const response = await api.delete(`/teams/${userId}/removePlayer/${playerId}`);
    console.log('Risposta vendita giocatore:', response.data);
    return response.data.team;
  } catch (error) {
    console.error('Errore nella vendita del giocatore:', error);
    if (error.response) {
      console.error('Dettagli errore:', error.response.data);
      throw new Error(error.response.data.message || 'Errore nella vendita del giocatore');
    } else if (error.request) {
      console.error('Nessuna risposta ricevuta:', error.request);
      throw new Error('Nessuna risposta ricevuta dal server');
    } else {
      console.error('Errore di configurazione della richiesta:', error.message);
      throw error;
    }
  }
};

//
export const updateUser = (id, userData) =>
  api.put(`/users/${id}`, userData);

//
export const deleteUser = (id) => api.delete(`/users/${id}`);



// Funzione per effettuare il login di un utente
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials); 
    console.log("Risposta API login:", response.data); 
    return response.data; 
  } catch (error) {
    console.error("Errore nella chiamata API di login:", error); 
    throw error; 
  }
};

//Funzione per ottenere i dati dell'utente attualmente autenticato
//
export const getMe = () =>
  api.get("/users/me").then((response) => response.data);

// Funzione per ottenere i dati dell'utente attualmente autenticato con gestione degli errori
export const getUserData = async () => {
  try {
    const response = await api.get("/users/me"); 
    return response.data;
  } catch (error) {
    console.error("Errore nel recupero dei dati utente:", error); 
    throw error; 
  }
};


export const getAllSerieAPlayers = async () => {
  try {
    const response = await api.get("/playersSerieA");
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei giocatori della Serie A:', error);
    throw error;
  }
};

//
export const getPlayersByTeam = async (teamName) => {
  console.log('Chiamata API per la squadra:', teamName);
  try {
    const response = await api.get(`/playersSerieA/team/${teamName}`);
    console.log('Risposta API ricevuta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei giocatori:', error);
    console.error('Dettagli errore:', error.response ? error.response.data : 'Nessun dettaglio disponibile');
    throw error;
  }
};

export const getMarketStatus = async () => {
  try {
    const response = await api.get('/admin/market-status');
    console.log('Risposta getMarketStatus:', response.data);
    return {
      isOpen: response.data.isOpen,
      message: response.data.message || (response.data.isOpen ? "Il mercato è aperto." : "Il mercato è chiuso."),
      nextOpeningDate: response.data.nextOpeningDate
    };
  } catch (error) {
    console.error('Errore nel recupero dello stato del mercato:', error);
    return {
      isOpen: false,
      message: "Impossibile recuperare lo stato del mercato. Riprova più tardi.",
      nextOpeningDate: null
    };
  }
};


export const getMarketWindows = async () => {
  const response = await api.get('/admin/market-windows');
  return response.data;
};

export const createMarketWindow = async (windowData) => {
  try {
    console.log('Invio dati al server:', windowData);
    const response = await api.post('/admin/market-windows', windowData);
    console.log('Risposta dal server:', response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nella chiamata API:', error.response?.data || error.message);
    throw error;
  }
};

export const updateMarketWindow = async (id, windowData) => {
  const response = await api.put(`/admin/market-windows/${id}`, windowData);
  return response.data;
};


export const saveFormation = async (userId, formationData) => {
  try {
    const response = await api.post(`/teams/${userId}/formation`, formationData);
    return response.data;
  } catch (error) {
    console.error('Errore nel salvataggio della formazione:', error);
    throw error;
  }
};

export const getFormationStatus = async (userId) => {
  try {
    const response = await api.get(`/teams/${userId}/formation-status`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dello stato della formazione:', error);
    throw error;
  }
};



///////////////////////////////////////////////////////////////////////////////

export const getPlayerPerformances = async (gameweek) => {
  try {
    const response = await api.get(`/performances/gameweek/${gameweek}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle prestazioni dei giocatori:', error);
    throw error;
  }
};


export const calculateTeamScore = async (userId, gameweek) => {
  try {
    const response = await api.post(`/teams/${userId}/calculate-score`, { gameweek });
    console.log(response)
    return response.data;
  } catch (error) {
    console.error('Errore nel calcolo del punteggio della squadra:', error);
    throw error;
  }
};

export const getCurrentFormation = async (userId) => {
  try {
    const response = await api.get(`/teams/${userId}/formation`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero della formazione corrente:', error);
    return null;
  }
};


export default api;