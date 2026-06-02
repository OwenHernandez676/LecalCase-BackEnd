export class Activity {
  constructor(
    public readonly id: string, public readonly expedienteId: string,
    public readonly tipo: string, public readonly descripcion: string,
    public readonly autor: string, public readonly createdAt?: Date,
  ) {}
}
