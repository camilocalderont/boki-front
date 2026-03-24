# Tasks: Company CRUD Modals

## Fase 1: Servicios API (branch CRUD faltante)

- [x] 1.1 Agregar create, update, delete a CompanyBranchService
- [x] 1.2 Actualizar modelo con campos reales del API (VcDescription, VcBranchManagerName, VcImage)

## Fase 2: Formularios

- [x] 2.1 Crear CompanyFormComponent (features/manage-company)
- [x] 2.2 Crear BranchFormComponent (features/manage-company)

## Fase 3: Página Company — integración

- [x] 3.1 Refactorizar company-page: contenido condicional por tab
- [x] 3.2 Tab "Datos de Empresa": modal crear/editar con CompanyForm
- [x] 3.3 Tab "Sedes": tabla + modal crear/editar/eliminar con BranchForm
- [x] 3.4 Tab "Consultorios": mensaje informativo (sin endpoints backend)

## Fase 4: Tests E2E

- [x] 4.1 Test Playwright: login + navegar a company
- [x] 4.2 Test Playwright: editar empresa (actualizar teléfono, verificar en tabla y BD)
- [x] 4.3 Test Playwright: CRUD de sedes (crear sede, verificar en tabla, eliminar, verificar en BD)
