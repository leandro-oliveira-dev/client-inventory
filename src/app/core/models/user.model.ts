/**
 * Modelos de usuário e autenticação (frontend).
 *
 * Espelham os DTOs retornados pelo backend (Parte 2), garantindo tipagem
 * forte em toda a aplicação Angular.
 */

/** Papéis disponíveis no sistema, idênticos aos do backend. */
export enum UserRole {
  ADMIN = 'ADMIN',
  CONTADOR = 'CONTADOR',
}

/** Representação pública e segura de um usuário (sem senha). */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** Credenciais enviadas no login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Resposta de autenticação retornada pelo backend (login e refresh). */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
