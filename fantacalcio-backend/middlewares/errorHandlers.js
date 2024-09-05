// Gestore per gli errori di richiesta non valida (400)
export const badRequestHandler = (err, req, res, next) => {
    if (err.status === 400 || err.name === 'ValidationError') {
        res.status(400).json({
            error: 'Errore nella richiesta',
            message: err.message || 'I dati forniti non sono validi'
        });
    } else {
        next(err);
    }
};

// Gestore per gli errori di autenticazione (401)
export const unauthorizedHandler = (err, req, res, next) => {
    if (err.status === 401) {
        res.status(401).json({
            error: 'Non autorizzato',
            message: 'Accesso negato. Effettua nuovamente l autenticazione.'
        });
    } else {
        next(err);
    }
};

// Gestore per gli errori di autorizzazione (403)
export const forbiddenHandler = (err, req, res, next) => {
    if (err.status === 403) {
        res.status(403).json({
            error: 'Accesso vietato',
            message: 'Non hai i permessi necessari per accedere a questa risorsa'
        });
    } else {
        next(err);
    }
};

// Gestore per le risorse non trovate (404)
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: 'Risorsa non trovata',
        message: 'La risorsa richiesta non è stata trovata'
    });
};

// Gestore generico per gli errori del server (500)
export const genericErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: 'Errore interno del server',
        message: process.env.NODE_ENV === 'production' 
            ? 'Si è verificato un errore imprevisto' 
            : err.message
    });
};