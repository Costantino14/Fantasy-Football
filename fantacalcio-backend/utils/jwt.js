// Importa la libreria jsonwebtoken per gestire i JSON Web Tokens
import jwt from "jsonwebtoken";

// Funzione per generare un token JWT
export const generateJWT = (payload) => {
  return new Promise((resolve, reject) =>
    jwt.sign(
      payload, 
      process.env.JWT_SECRET,
      { expiresIn: "1 day" }, 
      (err, token) => {
        // Callback che gestisce il risultato dell'operazione
        if (err) reject(err);
        else resolve(token);
      }
    )
  );
};

// Funzione per verificare un token JWT
export const verifyJWT = (token) => {
  return new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded); 
    })
  );
};