/**
 * Modelos do módulo de contadores (Parte 5) no frontend.
 */

/** Contador cadastrado. */
export interface Counter {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

/** Dados para cadastrar um contador. */
export interface CreateCounter {
  name: string;
  email: string;
  password: string;
}
