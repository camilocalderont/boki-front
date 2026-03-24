# Credenciales de Desarrollo — boki-front

## Backend API

| Campo | Valor |
|-------|-------|
| **Base URL** | `http://localhost:3000/api/v1` |
| **Header API Token** | `x-api-token: SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs` |
| **Swagger Docs** | `http://localhost:3000/api-docs` |

## Usuarios de prueba

### dev@boki.com (ACTIVO)
| Campo | Valor |
|-------|-------|
| **Email** | `dev@boki.com` |
| **Password** | `BokiDev2026!` |
| **Nombre** | Developer Boki |
| **ID** | 4 |

### admin@boki.com
| Campo | Valor |
|-------|-------|
| **Email** | `admin@boki.com` |
| **Password** | _(desconocida)_ |
| **ID** | 2 |

### e2e@test.com
| Campo | Valor |
|-------|-------|
| **Email** | `e2e@test.com` |
| **Password** | _(desconocida — posiblemente E2E22025* o variante)_ |
| **ID** | 3 |

## Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/users/login` | Login (body: `{VcEmail, VcPassword}`) |
| POST | `/users` | Crear usuario (público) |
| GET | `/users` | Listar usuarios |
| GET | `/companies` | Listar empresas |
| GET | `/category-services` | Listar categorías |
| GET | `/services` | Listar servicios |
| GET | `/professionals` | Listar profesionales |
| GET | `/faqs` | Listar FAQs |
| GET | `/appointments` | Listar citas |

## Docker Services

| Servicio | Puerto | Estado |
|----------|--------|--------|
| boki-api | 3000 | `docker compose up -d boki-api` |
| postgres | 5433→5432 | `docker compose up -d postgres` |
| mongo_boki | 27017 | `docker compose up -d mongo_boki` |
| ng serve (dev) | 4200 | `npx ng serve --port 4200` |
