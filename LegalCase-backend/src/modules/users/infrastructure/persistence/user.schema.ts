import { Schema, model, HydratedDocument } from 'mongoose';
import { Role } from '../../domain/entities/user.entity';

export interface UserRecord {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: Role;
  especialidad?: string;
  telefono?: string;
  cargaTrabajo?: number;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDoc = HydratedDocument<UserRecord>;

const userSchema = new Schema<UserRecord>(
  {
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contrasena: { type: String, required: true, select: false },
    rol: { type: String, required: true, enum: ['administrador', 'abogado', 'cliente'] },
    especialidad: { type: String },
    telefono: { type: String },
    cargaTrabajo: { type: Number, default: 0, min: 0, max: 100 },
    activo: { type: Boolean, default: true },
  },
  { collection: 'usuarios', timestamps: true },
);
userSchema.index({ rol: 1, activo: 1 });

export const UserModel = model<UserRecord>('User', userSchema);
