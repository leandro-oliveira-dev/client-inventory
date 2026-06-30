/**
 * Variáveis de ambiente do frontend (produção/padrão).
 *
 * `apiUrl` aponta diretamente para o backend, pois o nginx que serve o SPA
 * não faz proxy de `/api` (ver client/nginx.conf e CLAUDE.md). Ajuste conforme
 * o host de produção.
 */
export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000/api',
};
