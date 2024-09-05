// Middleware per la verifica dei privilegi di amministratore
export const adminMiddleware = (req, res, next) => {
  // Indirizzo email dell'amministratore
  const ADMIN_EMAIL = 'costantino.grabesu14@gmail.com';
  
  // Verifica se l'utente è autenticato e se la sua email corrisponde a quella dell'amministratore
  if (req.user && req.user.email === ADMIN_EMAIL) {
    // Se l'utente è l'amministratore, passa al prossimo middleware o alla route handler
    next();
  } else {
    // Se l'utente non è l'amministratore, invia una risposta di errore 403 (Forbidden)
    res.status(403).json({ message: "Accesso negato. Solo l'amministratore può accedere a questa risorsa." });
  }
};