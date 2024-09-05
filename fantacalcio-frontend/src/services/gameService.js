// frontend/src/services/gameService.js

import api from './api';

export const getCurrentGameweek = async () => {
  const response = await api.get('/gameweeks/current');
  return response.data;
};

export const canSetFormation = async (userId) => {
  const response = await api.get(`/teams/${userId}/can-set-formation`);
  return response.data.canSet;
};

export const setFormation = async (userId, formation, lineup) => {
  const response = await api.post(`/teams/${userId}/formation`, { formation, lineup });
  return response.data;
};

export const getFormation = async (userId) => {
  const response = await api.get(`/teams/${userId}/formation`);
  return response.data;
};

export const getPlayerPerformances = async (userId) => {
  const response = await api.get(`/teams/${userId}/player-performances`);
  return response.data;
};

export const getTotalScore = async (userId) => {
  const response = await api.get(`/teams/${userId}/total-score`);
  return response.data.totalScore;
};

export const isGameweekActive = async () => {
  const response = await api.get('/gameweeks/is-active');
  return response.data.isActive;
};

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