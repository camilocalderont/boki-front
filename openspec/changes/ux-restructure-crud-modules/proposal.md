# Proposal: UX Restructure - CRUD Modules
**Date**: 2026-03-16
**Status**: APPROVED
**Author**: camilo + claude

## Intent
Reestructurar las vistas CRUD de boki-front de 10 opciones planas a 3 módulos agrupados por dominio, con crear/editar funcional en cada uno.

## Problem
- Crear y editar no funcionan en ninguna vista nueva (Sedes, Consultorios, Servicios, Profesionales, Horarios)
- 10 opciones de menú es excesivo para la cantidad de datos
- Los botones del header se ven grises en dark mode
- No hay formularios de creación/edición implementados

## Approach
Agrupar en 3 módulos con sub-navegación por tabs:

### Módulo 1: Empresa
- Tab "Datos": editar Company (datos principales, logo, prompt)
- Tab "Sedes": CRUD de CompanyBranch
- Tab "Consultorios": CRUD de CompanyBranchRoom (filtrado por sede)

### Módulo 2: Catálogo de Servicios
- Tab "Categorías": CRUD de CategoryService
- Tab "Servicios": CRUD de Service (agrupado por categoría)

### Módulo 3: Profesionales
- Tab "Perfil": CRUD de Professional (datos, foto, especialidad)
- Tab "Horarios": CRUD de ProfessionalBussinessHour (por profesional)
- Tab "Servicios": CRUD de ProfessionalService (asociar servicios)

### Menú resultante (6 opciones):
1. Dashboard
2. Empresa (Company + Sedes + Consultorios)
3. Servicios (Categorías + Servicios)
4. Profesionales (Perfil + Horarios + Servicios)
5. FAQs
6. Citas

## Scope
- Frontend only: nuevos componentes con tabs
- Backend: endpoints existentes cubren todo, solo falta cargar relaciones en algunos
- Fix: botones header dark mode, formularios crear/editar

## Risks
- Complejidad de tabs anidados → mitigar con componente tab reutilizable
- Formularios genéricos → usar patrón existente de create-company como base
