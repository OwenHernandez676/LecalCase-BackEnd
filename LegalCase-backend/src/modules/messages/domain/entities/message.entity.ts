export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly expedienteId: string,
    public readonly emisor: string,
    public readonly receptor: string,
    public readonly texto: string,
    public readonly leido: boolean,
    public readonly createdAt?: Date,
  ) {}
}
