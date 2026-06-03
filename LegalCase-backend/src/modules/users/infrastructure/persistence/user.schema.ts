import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../domain/entities/user.entity';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ collection: 'usuarios', timestamps: true })
export class UserModel {
  @Prop({ required: true, trim: true }) nombre!: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) correo!: string;
  @Prop({ required: true, select: false }) contrasena!: string;
  @Prop({ required: true, enum: ['administrador', 'abogado', 'cliente'] }) rol!: Role;
  @Prop() especialidad?: string;
  @Prop() telefono?: string;
  @Prop({ default: 0, min: 0, max: 100 }) cargaTrabajo?: number;
  @Prop({ default: true }) activo!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
UserSchema.index({ rol: 1, activo: 1 });
