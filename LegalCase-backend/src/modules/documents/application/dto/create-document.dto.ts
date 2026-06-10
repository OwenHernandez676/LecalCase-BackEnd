import { IsIn, IsMongoId, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateDocumentDto {
  @IsString() @MinLength(3) @MaxLength(160) nombre!: string;
  @IsIn(['PDF', 'DOCX', 'XLSX']) tipo!: 'PDF' | 'DOCX' | 'XLSX';
  @IsString() tamano!: string;
  @IsMongoId() expedienteId!: string;
  @IsString() subidoPor!: string;
}
