import { Role } from '../../../users/domain/entities/user.entity';

export interface AuthUserView {
  id: string;
  nombre: string;
  correo: string;
  rol: Role;
}

export interface AuthResponse {
  user: AuthUserView;
  token: string;
}
