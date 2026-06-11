/**
 * Puerto de salida: contrato para el hashing de contraseñas.
 *
 * @typedef {object} PasswordHasher
 * @property {(plain: string) => Promise<string>} hash
 * @property {(plain: string, hash: string) => Promise<boolean>} compare
 */

module.exports = {};
