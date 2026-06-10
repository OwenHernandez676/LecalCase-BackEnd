/** Puerto de salida: contrato para el hashing de contraseñas. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
