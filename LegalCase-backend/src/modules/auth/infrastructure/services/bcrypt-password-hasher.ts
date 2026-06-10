import * as bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../domain/ports/password-hasher.port';

/** Adaptador del puerto PasswordHasher usando bcryptjs. */
export class BcryptPasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> { return bcrypt.hash(plain, 10); }
  compare(plain: string, hash: string): Promise<boolean> { return bcrypt.compare(plain, hash); }
}
