/**
 * Mini-librería de validación de DTOs en JavaScript puro (sin class-validator).
 *
 * Cada DTO de la capa de aplicación declara un esquema plano:
 *   { campo: { type, optional, enum, minLength, maxLength, min, max } }
 *
 * Tipos soportados:
 *   'string' | 'email' | 'boolean' | 'number' | 'int' | 'date' | 'mongoId'
 *
 * validateSchema aplica whitelist (solo conserva campos declarados),
 * puede rechazar campos extra (body) y coercionar strings (query).
 */

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONGO_ID_RX = /^[a-f\d]{24}$/i;

/** Coerciona valores que llegan como string (query params) al tipo declarado. */
function coerceValue(value, rule) {
  if (typeof value !== 'string') return value;
  if (rule.type === 'boolean') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  if ((rule.type === 'number' || rule.type === 'int') && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

/**
 * Valida un campo contra su regla. Devuelve la lista de errores (vacía si es válido).
 * @param {string} name Nombre del campo (para los mensajes).
 * @param {*} value Valor recibido.
 * @param {object} rule Regla declarada en el esquema del DTO.
 * @returns {string[]}
 */
function validateField(name, value, rule) {
  const errors = [];

  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') return [`${name} debe ser un texto`];
      break;
    case 'email':
      if (typeof value !== 'string' || !EMAIL_RX.test(value)) return [`${name} debe ser un correo válido`];
      break;
    case 'boolean':
      if (typeof value !== 'boolean') return [`${name} debe ser booleano`];
      break;
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) return [`${name} debe ser un número`];
      break;
    case 'int':
      if (!Number.isInteger(value)) return [`${name} debe ser un número entero`];
      break;
    case 'date':
      if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) return [`${name} debe ser una fecha válida (ISO 8601)`];
      break;
    case 'mongoId':
      if (typeof value !== 'string' || !MONGO_ID_RX.test(value)) return [`${name} debe ser un ObjectId válido`];
      break;
    default:
      break;
  }

  if (rule.enum && !rule.enum.includes(value)) {
    errors.push(`${name} debe ser uno de: ${rule.enum.join(', ')}`);
  }
  if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
    errors.push(`${name} debe tener al menos ${rule.minLength} caracteres`);
  }
  if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
    errors.push(`${name} debe tener como máximo ${rule.maxLength} caracteres`);
  }
  if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
    errors.push(`${name} debe ser mayor o igual a ${rule.min}`);
  }
  if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
    errors.push(`${name} debe ser menor o igual a ${rule.max}`);
  }
  return errors;
}

/**
 * Valida un objeto completo contra el esquema de un DTO.
 * @param {object} schema Esquema del DTO ({ campo: regla }).
 * @param {object} input Objeto recibido (req.body o req.query).
 * @param {{ coerce?: boolean, forbidExtra?: boolean }} [options]
 * @returns {{ value: object, errors: string[] }} Objeto whitelisted + errores.
 */
function validateSchema(schema, input, options = {}) {
  const { coerce = false, forbidExtra = false } = options;
  const errors = [];
  const value = {};

  if (forbidExtra) {
    for (const key of Object.keys(input)) {
      if (!(key in schema)) errors.push(`el campo '${key}' no está permitido`);
    }
  }

  for (const [name, rule] of Object.entries(schema)) {
    let v = input[name];
    if (v === undefined || v === null) {
      if (!rule.optional) errors.push(`${name} es requerido`);
      continue;
    }
    if (coerce) v = coerceValue(v, rule);
    const fieldErrors = validateField(name, v, rule);
    if (fieldErrors.length > 0) errors.push(...fieldErrors);
    else value[name] = v;
  }

  return { value, errors };
}

module.exports = { validateSchema, validateField };
