export type CaseStatus = 'Pendiente' | 'En proceso' | 'En revisión' | 'Finalizado';
export type Priority = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type CaseType = 'Mercantil' | 'Laboral' | 'Penal' | 'Civil' | 'Familia' | 'Otro';

/** Entidad de dominio Expediente. Pura, sin framework. */
export class LegalCase {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly titulo: string,
    public readonly tipo: CaseType,
    public readonly cliente: string,
    public readonly abogado: string | null,
    public readonly estado: CaseStatus,
    public readonly prioridad: Priority,
    public readonly progreso: number,
    public readonly fechaApertura: Date,
    public readonly fechaVencimiento: Date,
    public readonly descripcion?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /** Reglas de transición de estado. */
  static nextProgressFor(estado: CaseStatus, current: number): number {
    if (estado === 'Finalizado') return 100;
    return current;
  }
}
