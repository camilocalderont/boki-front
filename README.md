# 🚀 Boki Proxy - Guía de Instalación y Configuración

Este proyecto está compuesto por un **Backend** y un **Frontend**. Sigue esta guía paso a paso para configurar y ejecutar ambos componentes.

## 📋 Requisitos Previos

- **Node.js**: Versión 22.12 o superior
- **Docker**: Para la base de datos
- **Angular CLI**: Para el frontend
- **Cliente de Base de Datos**: (pgAdmin, DBeaver, etc.)

## 🔧 Configuración del Backend

### 1️⃣ Configurar la Base de Datos

Navega al directorio de la base de datos y levanta los servicios con Docker:

```bash
cd boki-api/BD
docker compose up -d
```

### 2️⃣ Crear la Base de Datos

Conéctate a tu cliente de base de datos y crea una nueva base de datos llamada `boki`.

### 3️⃣ Instalar Dependencias

Regresa al directorio raíz del backend e instala las dependencias:

```bash
cd ..
npm install
```

### 4️⃣ Ejecutar Migraciones

Ejecuta las migraciones para crear las tablas en la base de datos:

```bash
npm run migration:run
```

### 5️⃣ Poblar la Base de Datos

Ejecuta el seed para insertar datos iniciales:

```bash
npm run seed:personero
```

### 6️⃣ Iniciar el Servidor Backend

Inicia el servidor de desarrollo:

```bash
npm run start:dev
```

✅ **¡Backend configurado!** El servidor debería estar ejecutándose.

---

## 🎨 Configuración del Frontend

### 1️⃣ Instalar Dependencias

Navega al directorio del frontend e instala las dependencias:

```bash
cd boki-front
npm install
```

### 2️⃣ Iniciar el Servidor Frontend

Ejecuta el servidor de desarrollo de Angular:

```bash
ng serve
```

> ⚠️ **Nota importante**: Asegúrate de tener **Node.js versión 22.12** instalada.

✅ **¡Frontend configurado!** La aplicación debería estar disponible en `http://localhost:4200`

---

## 🏃‍♂️ Inicio Rápido

Una vez configurado todo, para iniciar el proyecto completo:

1. **Backend**: `npm run start:dev` (en el directorio `boki-api`)
2. **Frontend**: `ng serve` (en el directorio `boki-front`)

## 📚 Comandos Útiles

### Backend
```bash
# Desarrollo
npm run start:dev

# Migraciones
npm run migration:run

# Seeds
npm run seed:personero
```

### Frontend
```bash
# Desarrollo
ng serve

# Build para producción
ng build

# Tests
ng test
```

---

¡Ya tienes todo listo para comenzar a desarrollar! 🎉
