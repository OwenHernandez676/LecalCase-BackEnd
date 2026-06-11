/** DTO de entrada para login. */
const LoginDto = {
  correo: { type: 'email' },
  contrasena: { type: 'string', minLength: 6, maxLength: 72 },
};

module.exports = { LoginDto };
