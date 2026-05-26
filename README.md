# Inventário App - Client

Aplicação frontend do sistema de inventário, construída com **Angular 18** em modo standalone.

---

## Stack

| Tecnologia      | Versão | Descrição                        |
|-----------------|--------|----------------------------------|
| Angular         | 18     | Framework frontend               |
| TypeScript      | 5.4+   | Tipagem estática                 |
| SCSS            | -      | Pré-processador CSS              |
| RxJS            | 7.8+   | Programação reativa              |
| Angular Router  | 18     | Roteamento SPA                   |
| HTTP Client     | 18     | Comunicação com a API REST       |

---

## Estrutura de Pastas

```
client/
├── src/
│   ├── app/
│   │   ├── core/           # Serviços e modelos globais
│   │   ├── shared/         # Componentes, diretivas e pipes reutilizáveis
│   │   ├── modules/        # Módulos de funcionalidade (auth, dashboard, etc.)
│   │   ├── layouts/        # Layouts da aplicação (main, auth)
│   │   ├── services/       # Serviços específicos
│   │   ├── guards/         # Guards de rota
│   │   └── interceptors/   # Interceptors HTTP
│   ├── assets/             # Imagens, ícones, fontes
│   ├── environments/       # Configurações por ambiente
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── public/                 # Arquivos públicos estáticos
├── angular.json
├── tsconfig.json
├── Dockerfile
├── nginx.conf
└── package.json
```

---

## Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20+

### Instalação

```bash
npm install
```

### Modo Desenvolvimento

```bash
npm start
```

O servidor de desenvolvimento iniciará em `http://localhost:4200`.

### Build

```bash
npm run build
```

Gera os arquivos otimizados na pasta `dist/inventario-frontend/`.

---

## Scripts

| Script     | Comando                        | Descrição                      |
|------------|--------------------------------|--------------------------------|
| `start`    | `ng serve`                     | Servidor de desenvolvimento   |
| `build`    | `ng build`                     | Build de produção             |
| `watch`    | `ng build --watch`             | Build com watch               |
| `test`     | `ng test`                      | Executa testes unitários      |
| `lint`     | `ng lint`                      | Verifica código               |

---

## Rotas Iniciais

| Rota    | Componente | Descrição        |
|---------|------------|------------------|
| `/`     | Login      | Redireciona p/ login |
| `/login`| Login      | Tela de login    |

> *Novas rotas serão adicionadas nas próximas etapas do projeto.*

---

## Docker

```bash
docker build -t inventario-client .
docker run -p 80:80 inventario-client
```

O container usa **nginx** para servir a aplicação Angular em produção.

---

## Estilos e Temas

- **SCSS** como linguagem de estilos
- Base para **dark mode** e **light mode** preparada em `styles.scss`
- Foco em produtividade logística: interface limpa, rápida e responsiva

---

## Padrões de Código

- **Standalone Components**: Angular 18 sem `NgModule`
- **Lazy Loading**: rotas carregadas sob demanda
- **Path Mapping**: imports via alias (`@core`, `@shared`, `@modules`)
- **RxJS**: observables para chamadas HTTP e estados reativos

---

## Comunicação com Backend

A API REST está configurada em `http://localhost:3000` (backend). Em produção, o nginx faz proxy interno.

---

## Autor

Projeto Inventário App
