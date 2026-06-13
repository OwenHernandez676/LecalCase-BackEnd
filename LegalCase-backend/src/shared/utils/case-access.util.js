/**
 * Regla de acceso a un expediente según el rol del usuario autenticado.
 * - administrador: acceso total.
 * - abogado: solo expedientes asignados a él (abogadoId === sub).
 * - cliente: solo sus expedientes (clienteId === sub).
 *
 * @param {{ clienteId?: string, abogadoId?: string }} legalCase Expediente (entidad de dominio).
 * @param {{ sub: string, rol: string }} [user] Usuario del JWT.
 * @returns {boolean}
 */
function canAccessCase(legalCase, user) {
  if (!legalCase) return false;
  if (!user) return true; // sin contexto (llamadas internas): no se restringe
  if (user.rol === 'administrador') return true;
  if (user.rol === 'abogado') return legalCase.abogadoId === user.sub;
  if (user.rol === 'cliente') return legalCase.clienteId === user.sub;
  return false;
}

module.exports = { canAccessCase };
