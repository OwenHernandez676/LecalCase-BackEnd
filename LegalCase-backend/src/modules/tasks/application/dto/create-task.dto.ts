import { IsDateString, IsIn, IsMongoId, IsString, MaxLength } from 'class-validator';
export class CreateTaskDto {
  @IsString() @MaxLength(160) titulo!: string;
  @IsMongoId() expedienteId!: string;
  @IsString() asignadoA!: string;
  @IsIn(['Baja', 'Media', 'Alta', 'Crítica']) prioridad!: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  @IsDateString() fechaLimite!: string;
}
