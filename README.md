# Sistema Híbrido de Pesaje y Liquidación (SHPL)

Sistema web diseñado para la gestión y registro colaborativo de pesajes y liquidación. Esta aplicación está desarrollada bajo la arquitectura **Offline-First**, permitiendo trabajar en zonas de baja conectividad y sincronizar los datos automáticamente cuando se recupera la conexión a internet.

---

## 🚀 Características Principales

*   **Sincronización Offline-First:** Arquitectura robusta que guarda los datos localmente y sincroniza de forma transparente con la base de datos central.
*   **Gestión de Entidades:** Administración eficiente de socios, clientes y perfiles dentro del contexto de pesaje.
*   **Historial y Liquidación:** Módulo integrado para consultar historial de lotes y realizar el cálculo de liquidaciones.
*   **Interfaz Dinámica y Responsiva:** UI moderna y optimizada desarrollada con componentes modulares en React.
*   **Despliegue Automático:** Integración continua y hosting manejado a través de Vercel.

---

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React 19, TypeScript, Vite.
*   **Estilos:** CSS Modules / Flexbox.
*   **Backend / Base de Datos:** Firebase (Storage y Realtime).
*   **Gestor de Paquetes:** npm.
*   **Despliegue (Producción):** Vercel.

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalado en tu entorno local:

*   [Node.js](https://nodejs.org/) (versión 18+ recomendada).
*   Una cuenta y proyecto configurado en **Firebase**.
*   (Opcional pero recomendado) Vercel CLI para pruebas de despliegue local.

---

## 💻 Instalación y Uso Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/Jotures/Sistema_H-brido_de_Pesaje_y_Liquidaci-n_-SHPL-.git
   cd Sistema_H-brido_de_Pesaje_y_Liquidaci-n_-SHPL-
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   Crea un archivo `.env` en la raíz del proyecto y en el directorio `/backend` (si aplica) con tus credenciales de configuración de Firebase y otras variables necesarias para el sistema.

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible localmente, usualmente en `http://localhost:5173`.

---

## 📦 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

*   `npm run dev`: Inicia el servidor de desarrollo utilizando Vite con Hot-Module Replacement (HMR).
*   `npm run build`: Compila el proyecto con TypeScript y empaqueta la aplicación para producción.
*   `npm run lint`: Ejecuta ESLint para buscar posibles problemas en el código.
*   `npm run preview`: Sirve localmente la carpeta `dist` para probar la versión de producción antes de desplegar.

> **Nota sobre despliegue:** La rama `master` está automáticamente conectada a Vercel. Cualquier push a esta rama desencadenará un proceso de *build* y despliegue automático hacia producción.

---

## 📁 Estructura Principal del Proyecto

```text
├── src/
│   ├── assets/        # Imágenes, iconos y recursos estáticos.
│   ├── components/    # Componentes de UI reusables (Botones, ContextMenu, etc).
│   ├── context/       # Estados globales y contextos de React (SessionContext).
│   ├── features/      # Módulos principales separados por dominio lógico:
│   │   ├── session/   # Lógica de inicio de sesión y selectores de entidad.
│   │   └── weighing/  # Módulo principal de registro de pesajes e historial.
│   ├── hooks/         # Custom hooks de React (ej. useToast).
│   ├── services/      # Archivos de configuración y comunicación externa (API, Firebase).
│   ├── types/         # Definiciones de TypeScript e interfaces (Domain.ts).
│   └── utils/         # Funciones matemáticas y utilidades generales.
├── backend/           # Lógica y configuraciones del lado del servidor.
└── ...
```

---

## 🤝 Contribuir

Si deseas contribuir, por favor crea una rama nueva a partir de `master`, haz tus cambios y abre un Pull Request documentando tus integraciones. Mantén el código limpio y revisa las advertencias del linter antes de subir cambios.

**Creado y Mantenido por [Ruben J.]**
