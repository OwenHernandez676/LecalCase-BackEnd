import { IsMongoId, IsString, MaxLength, MinLength } from 'class-validator';
export class SendMessageDto {
  @IsMongoId() expedienteId!: string;
  @IsString() emisor!: string;
  @IsString() receptor!: string;
  @IsString() @MinLength(1) @MaxLength(2000) texto!: string;
}
