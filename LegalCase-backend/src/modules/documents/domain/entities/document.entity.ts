export type FileType = 'PDF' | 'DOCX' | 'XLSX';

export class LegalDocument {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly tipo: FileType,
    public readonly tamano: string,
    public readonly expedienteId: string,
    public readonly subidoPor: string,
    public readonly createdAt?: Date,
  ) {}
}
