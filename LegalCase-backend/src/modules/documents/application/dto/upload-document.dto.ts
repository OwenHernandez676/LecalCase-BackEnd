import { IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

const FOLDERS = ['pruebas', 'escritos', 'contratos', 'resoluciones'] as const;
const SIGN = ['firmado', 'pendiente', 'no_requerida'] as const;

/** Campos del formulario multipart que acompañan al archivo subido. */
export class UploadDocumentDto {
  @IsMongoId() expedienteId!: string;
  @IsString() subidoPor!: string;
  @IsOptional() @IsIn(FOLDERS) carpeta?: (typeof FOLDERS)[number];
  @IsOptional() @IsIn(SIGN) estadoFirma?: (typeof SIGN)[number];
  @IsOptional() @IsString() @MaxLength(180) nombre?: string;
}
