import GameWeek from '../models/Gameweek.js';

// Recupera la gameweek corrente e la prossima
export const getCurrentAndNextGameWeek = async () => {
  const now = new Date();
  // Trova la gameweek corrente
  const currentGameWeek = await GameWeek.findOne({
    startDate: { $lte: now },
    endDate: { $gte: now }
  });

  let nextGameWeek = null;
  if (currentGameWeek) {
    // Se c'è una gameweek corrente, trova la prossima
    nextGameWeek = await GameWeek.findOne({
      number: currentGameWeek.number + 1
    });
  } else {
    // Se non c'è una gameweek corrente, trova la prossima gameweek disponibile
    nextGameWeek = await GameWeek.findOne({
      startDate: { $gt: now }
    }).sort('startDate');
  }

  return { currentGameWeek, nextGameWeek };
};

// Verifica se è possibile impostare la formazione
export const canSetFormation = async () => {
  const { currentGameWeek, nextGameWeek } = await getCurrentAndNextGameWeek();
  const now = new Date();

  // Non si può impostare la formazione durante una gameweek attiva
  if (currentGameWeek && now >= currentGameWeek.startDate && now <= currentGameWeek.endDate) {
    return { canSet: false, message: "Non puoi modificare la formazione durante una gameweek attiva." };
  }

  // Si può impostare la formazione per la prossima gameweek
  if (nextGameWeek && now < nextGameWeek.startDate) {
    return { canSet: true, gameweek: nextGameWeek.number, deadline: nextGameWeek.startDate };
  }

  // Nessuna gameweek disponibile per impostare la formazione
  return { canSet: false, message: "Nessuna gameweek disponibile per impostare la formazione." };
};