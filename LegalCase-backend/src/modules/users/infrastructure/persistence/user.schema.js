const { Schema, model } = require('mongoose');

const userSchema = new Schema(
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

const UserModel = model('User', userSchema);

module.exports = { UserModel };
