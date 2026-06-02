export type FileType = 'PDF' | 'DOCX' | 'XLSX';
export type DocumentFolder = 'pruebas' | 'escritos' | 'contratos' | 'resoluciones';
export type SignatureStatus = 'firmado' | 'pendiente' | 'no_requerida';

export class LegalDocument {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly tipo: FileType,
    public readonly tamano: string,
    public readonly expedienteId: string,
    public readonly subidoPor: string,
    public readonly carpeta: DocumentFolder = 'escritos',
    public readonly estadoFirma: SignatureStatus = 'no_requerida',
    public readonly url?: string,
    public readonly createdAt?: Date,
  ) {}
}
