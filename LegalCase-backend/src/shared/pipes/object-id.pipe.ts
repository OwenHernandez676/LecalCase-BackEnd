import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

/** Valida que un parámetro de ruta sea un ObjectId de MongoDB válido. */
@Injectable()
export class ObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) throw new BadRequestException(`'${value}' no es un identificador válido`);
    return value;
  }
}
