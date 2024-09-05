import crypto from 'crypto';

//Serve solo a generare delle chiavi random per avere maggior sicurezza e unicità.
console.log(crypto.randomBytes(64).toString('hex'));