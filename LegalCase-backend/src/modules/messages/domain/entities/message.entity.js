/** Entidad de dominio Mensaje de chat. Pura, sin framework. */
class ChatMessage {
  /**
   * @param {string} id
   * @param {string} expedienteId
   * @param {string} emisor
   * @param {string} receptor
   * @param {string} texto
   * @param {boolean} leido
   * @param {Date} [createdAt]
   * @param {{ nombre: string, tipo: string, tamano: string, mime: string }|null} [adjunto] Metadatos del adjunto (sin bytes).
   */
  constructor(id, expedienteId, emisor, receptor, texto, leido, createdAt, adjunto) {
    this.id = id;
    this.expedienteId = expedienteId;
    this.emisor = emisor;
    this.receptor = receptor;
    this.texto = texto;
    this.leido = leido;
    this.createdAt = createdAt;
    this.adjunto = adjunto ?? null;
  }
}

module.exports = { ChatMessage };
