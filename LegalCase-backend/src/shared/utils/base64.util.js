/**
 * Utilidades para manejar archivos enviados como base64 (o data URL) en JSON.
 * Permiten persistir el contenido binario real en MongoDB sin depender de
 * almacenamiento en disco ni de librerías de subida (multipart).
 */

/**
 * Convierte una cadena base64 — admite el prefijo `data:<mime>;base64,` — en un
 * Buffer. Devuelve null si la entrada no es válida.
 * @param {string} input
 * @returns {Buffer|null}
 */
function base64ToBuffer(input) {
  if (typeof input !== 'string' || input.length === 0) return null;
  const comma = input.indexOf(',');
  const data = input.startsWith('data:') && comma !== -1 ? input.slice(comma + 1) : input;
  try {
    const buf = Buffer.from(data, 'base64');
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  }
}

/** Extrae el tipo MIME de un data URL (`data:application/pdf;base64,...`) o null. */
function mimeFromDataUrl(input) {
  if (typeof input !== 'string' || !input.startsWith('data:')) return null;
  const match = /^data:([^;,]+)[;,]/.exec(input);
  return match ? match[1] : null;
}

module.exports = { base64ToBuffer, mimeFromDataUrl };
