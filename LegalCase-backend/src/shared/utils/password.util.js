const crypto = require('crypto');

/**
 * Genera una contraseña temporal aleatoria y legible para el cliente.
 * Formato: "Lex-XXXXXXXX" (8 caracteres base32 sin ambigüedades), siempre
 * cumple el mínimo de 8 caracteres exigido por CreateUserDto y contiene
 * mayúscula, minúscula y dígitos.
 *
 * @param {number} [len] Longitud del segmento aleatorio (por defecto 8).
 * @returns {string}
 */
function generateTempPassword(len = 8) {
  // Alfabeto sin caracteres ambiguos (0/O, 1/l/I) para evitar errores al teclear.
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return `Lex-${out}`;
}

module.exports = { generateTempPassword };
