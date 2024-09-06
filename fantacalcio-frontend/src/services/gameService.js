// frontend/src/services/gameService.js

import api from './api';

// Funzione per ottenere la gameweek corrente
export const getCurrentGameweek = async () => {
  const response = await api.get('/gameweeks/current');
  return response.data;
};

// Funzione per verificare se un utente può impostare la formazione
export const canSetFormation = async (userId) => {
  const response = await api.get(`/teams/${userId}/can-set-formation`);
  return response.data.canSet;
};

// Funzione per impostare la formazione di un utente
export const setFormation = async (userId, formation, lineup) => {
  const response = await api.post(`/teams/${userId}/formation`, { formation, lineup });
  return response.data;
};

// Funzione per ottenere la formazione corrente di un utente
export const getFormation = async (userId) => {
  const response = await api.get(`/teams/${userId}/formation`);
  return response.data;
};

// Funzione per ottenere le performance dei giocatori di un utente
export const getPlayerPerformances = async (userId) => {
  const response = await api.get(`/teams/${userId}/player-performances`);
  return response.data;
};

// Funzione per ottenere il punteggio totale di un utente
export const getTotalScore = async (userId) => {
  const response = await api.get(`/teams/${userId}/total-score`);
  return response.data.totalScore;
};

// Funzione per verificare se la gameweek corrente è attiva
export const isGameweekActive = async () => {
  const response = await api.get('/gameweeks/is-active');
  return response.data.isActive;
};

// Oggetto che raggruppa tutte le funzioni del servizio
const gameService = {
  getCurrentGameweek,
  canSetFormation,
  setFormation,
  getFormation,
  getPlayerPerformances,
  getTotalScore,
  isGameweekActive
};

export default gameService;