/**
 * Puerto para emisión y verificación de tokens de sesión.
 *
 * @typedef {object} TokenPayload
 * @property {string} sub Id del usuario.
 * @property {string} rol Rol del usuario (administrador | abogado | cliente).
 * @property {string} correo Correo del usuario.
 *
 * @typedef {object} TokenSigner
 * @property {(payload: TokenPayload) => Promise<string>} sign
 * @property {(token: string) => Promise<TokenPayload>} verify
 */

module.exports = {};
