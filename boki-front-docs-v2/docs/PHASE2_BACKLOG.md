# FASE 2 — Backlog de issues conocidos (NO resolver ahora)

## Multi-empresa: Filtro por empresa

### Problema
Los seeders del backend (NestJS) tienen datos de múltiples empresas mezclados:
- Personería de El Colegio (Carlos Enciso Navarro)
- Sala de uñas / BokiBot Platform

Actualmente las vistas de Servicios, Profesionales, Categorías, etc. muestran TODOS los datos sin filtrar por empresa.

### Solución requerida (Fase 2)

**Backend (NestJS)**:
- Asociar cada `User` a una o más `Company` (relación many-to-many con tabla pivote `user_companies`)
- Agregar `companyId` como filtro en todos los endpoints de listado
- El token JWT debe incluir `companyId` activo (o lista de empresas permitidas)
- Crear endpoint `GET /api/companies/mine` que retorne empresas del usuario logueado

**Frontend (boki-front)**:
- Agregar selector de empresa activa en el header (si el usuario tiene acceso a más de una)
- Almacenar `activeCompanyId` en `AuthStore` o `CompanyStore`
- Todas las llamadas API deben enviar `companyId` como query param o header
- Las tablas de Servicios, Profesionales, etc. deben filtrar por empresa activa
- El formulario de creación solo debe mostrar la empresa a la que el usuario tiene permiso

### Modelo de datos sugerido

```typescript
// entities/company/model/company.model.ts
interface Company {
  id: string;
  name: string;
  nit: string;
  logo?: string;
}

// entities/user/model/user.model.ts  
interface User {
  id: string;
  email: string;
  fullName: string;
  companies: Company[];       // Empresas a las que tiene acceso
  activeCompanyId: string;    // Empresa activa en sesión
}
```

### UI del selector de empresa

En el header, si `user.companies.length > 1`:
```html
<bk-select
  [options]="user.companies"
  [value]="activeCompanyId()"
  (change)="switchCompany($event)"
  labelKey="name"
  valueKey="id"
/>
```

Si `user.companies.length === 1`: no mostrar selector, usar esa empresa automáticamente.

---

## Otros issues para Fase 2

- [ ] Implementar CRUD completo de Profesionales con formulario
- [ ] Implementar CRUD de FAQs con editor de texto
- [ ] Implementar gestión de Citas con calendario
- [ ] Agregar búsqueda global en el header
- [ ] Implementar sistema de permisos por rol (admin, operador, viewer)
- [ ] Agregar paginación server-side en las tablas (actualmente es client-side)
- [ ] Implementar export a Excel/PDF desde las tablas
- [ ] Dark mode persistente por usuario (actualmente solo localStorage)
