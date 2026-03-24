# Proposal: Company CRUD Modals

**Fecha:** 2026-03-23
**Status:** APPROVED
**Autor:** camilo + claude

## Intent

Los modales de crear/editar en `/dashboard/company` muestran "en desarrollo". Los 3 tabs (Empresa, Sedes, Consultorios) necesitan formularios CRUD funcionales con modales.

## Scope

### In Scope

- Formulario crear/editar empresa en modal
- Tab Sedes: tabla + crear/editar/eliminar sedes en modal
- Tab Consultorios: tabla + crear/editar/eliminar consultorios en modal
- Confirmación de eliminación
- Validación de formularios
- Tests E2E con Playwright

### Out of Scope

- Upload de logo/imágenes de empresa
- Prompts de empresa (tab separado o futuro)
- Cambios en el backend (endpoints ya existen)

## Approach

1. Crear 3 form components standalone (company-form, branch-form, room-form)
2. Crear servicios API faltantes (branch create/update/delete, room CRUD)
3. Agregar contenido condicional por tab con `@if (activeTab() === '...')`
4. Conectar formularios a modales existentes
5. Implementar delete con confirmación

## Success Criteria

- [ ] Crear empresa desde modal con validación
- [ ] Editar empresa desde modal
- [ ] Listar sedes en tab "Sedes"
- [ ] Crear/editar/eliminar sede desde modal
- [ ] Listar consultorios en tab "Consultorios"
- [ ] Crear/editar/eliminar consultorio desde modal
- [ ] Tests E2E pasan con Playwright
