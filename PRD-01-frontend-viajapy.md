# PRD 01 — ViajaPy Frontend

**Producto:** ViajaPy  
**Stack:** Vite + ReactJS + JavaScript + React Compiler  
**Hosting:** Vercel  
**Estado:** Especificación inicial para MVP  
**Versión:** 1.0

## 1. Resumen

ViajaPy es una plataforma web de turismo y gamificación para descubrir Paraguay. El frontend será una SPA responsive desplegada en Vercel que consumirá la API Laravel mediante una URL HTTPS pública generada por ngrok.

La experiencia combina un asistente de IA para planificar viajes, un mapa dinámico que se completa al explorar y un perfil con puntos, niveles y medallas.

## 2. Objetivo

Permitir que una persona pueda:

- Descubrir destinos, regiones y experiencias de Paraguay.
- Solicitar un itinerario personalizado mediante IA.
- Guardar y completar trayectos.
- Registrar visitas o check-ins.
- Visualizar su progreso geográfico en un mapa.
- Ganar puntos, subir de nivel y desbloquear medallas.

## 3. Usuarios objetivo

### Viajero local

Busca escapadas cercanas, lugares nuevos y una forma de registrar lo que ya conoce.

### Turista extranjero

Necesita recomendaciones simples, rutas contextualizadas y una experiencia clara en español.

### Explorador gamificado

Disfruta completar zonas, desbloquear medallas, subir de nivel y visualizar estadísticas.

## 4. Alcance del MVP

### Incluido

- Landing pública.
- Registro, login, logout y protección de rutas.
- Dashboard con puntos, nivel, medallas y avance.
- Explorador de destinos con búsqueda y filtros.
- Detalle de destino.
- Mapa dinámico de Paraguay con zonas exploradas y pendientes.
- Creación de itinerario usando el asistente de IA.
- Guardado y consulta de itinerarios.
- Check-in manual de destinos o zonas.
- Medallas, misiones y progreso del usuario.
- Diseño responsive para desktop, tablet y mobile.
- Estados de loading, error, vacío y sesión expirada.

### Fuera del MVP

- Reservas y pagos.
- Tracking GPS en segundo plano.
- Chat entre usuarios.
- Marketplace para prestadores.
- App nativa Android/iOS.
- Moderación social avanzada.

## 5. Navegación

```text
/                         Landing pública
/explorar                 Destinos y experiencias
/destinos/:slug           Detalle de destino
/rutas                    Itinerarios del usuario
/rutas/nueva              Crear ruta con IA
/mapa                     Mapa de progreso
/perfil                   Perfil, estadísticas y medallas
/login                    Inicio de sesión
/registro                 Crear cuenta
```

En mobile se recomienda una barra inferior con acceso a Explorar, Mapa, Crear ruta y Perfil.

## 6. Requisitos funcionales

### RF-01 — Explorar destinos

Mostrar nombre, imagen, departamento, categoría, dificultad, duración, puntos disponibles y estado de exploración.

Filtros mínimos:

- Departamento o región.
- Naturaleza, cultura, arte, aventura, gastronomía o descanso.
- Duración.
- Dificultad.
- Explorados, pendientes o recomendados.

### RF-02 — Detalle de destino

Debe incluir descripción, imágenes, ubicación, actividades, tiempo recomendado, dificultad, destinos cercanos, puntos, guardar, agregar a ruta y registrar visita.

### RF-03 — Asistente de IA

El asistente debe solicitar cantidad de días, origen, presupuesto, intereses, nivel de actividad y tipo de compañía.

El resultado debe devolver una ruta estructurada con días, paradas, orden, duración, explicación y puntos potenciales. El frontend debe mostrar un aviso para verificar horarios, accesos y disponibilidad antes de viajar.

### RF-04 — Mapa dinámico

El mapa debe:

- Mostrar Paraguay dividido en regiones o zonas.
- Diferenciar zonas completadas, parciales y pendientes.
- Permitir seleccionar una zona.
- Mostrar porcentaje de avance.
- Mostrar hitos o medallas relacionados.
- Actualizarse luego de un check-in.

La sección de rutas debe incluir un botón `Mi mapa` alineado a la derecha. Al activarlo, debe abrir un panel/modal con el mapa estilizado de Paraguay, rutas sugeridas, lugares desbloqueados en verde/lima, zonas bloqueadas en gris, leyenda, porcentaje de exploración y próximo desafío.

Se recomienda GeoJSON + Leaflet o MapLibre. La capa visual debe poder reemplazarse sin cambiar la lógica de negocio.

### RF-05 — Check-in

El usuario puede registrar manualmente una visita. El backend valida el check-in y calcula puntos y medallas. El frontend debe actualizar el estado recibido y evitar duplicados visuales, sin tomar decisiones de negocio.

### RF-06 — Gamificación

Mostrar puntos, nivel, progreso al siguiente nivel, medallas obtenidas y bloqueadas, misiones activas y avance por departamento.

Cada viaje completado debe sumar `+10 puntos`. El apartado “Puntos” debe mostrar saldo, progreso hacia la siguiente recompensa y promociones canjeables en bares, hoteles y comercios gastronómicos. El canje real y la validación del saldo pertenecen al backend.

Las reglas siempre pertenecen al backend; el frontend solo representa el estado de la API.

### RF-07 — Perfil

Mostrar avatar o iniciales, nombre, nivel, puntos, departamentos explorados, destinos completados, medallas y rutas guardadas.

## 7. Arquitectura técnica

### Base del proyecto

- Vite.
- ReactJS con JavaScript.
- React Compiler habilitado.
- React Router.
- ESLint y Prettier.
- TanStack Query para cache y mutaciones contra la API.
- Zustand o Context para sesión y estado global pequeño.

### Estructura sugerida

```text
src/
  app/                    router.jsx, providers.jsx
  components/             ui, layout, map, gamification
  features/               auth, destinations, itineraries, assistant, profile
  pages/
  services/               api.js y servicios por dominio
  hooks/
  store/
  lib/
  styles/
```

### Variable de entorno

```env
# Desarrollo local
VITE_API_URL=http://127.0.0.1:8000/api/v1

# Integración con Laravel expuesto por ngrok
VITE_API_URL=https://<subdominio-ngrok>.ngrok-free.app/api/v1
```

No guardar secretos ni claves del proveedor de IA en el frontend.

## 8. Contrato mínimo esperado del backend

Respuesta exitosa:

```json
{
  "data": {},
  "message": "Operación realizada correctamente",
  "meta": {}
}
```

Respuesta de error:

```json
{
  "message": "No se pudo completar la operación",
  "errors": {
    "field": ["Mensaje de validación"]
  }
}
```

Endpoints que debe consumir el frontend:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /me
GET    /destinations
GET    /destinations/{slug}
GET    /map/progress
POST   /check-ins
GET    /achievements
GET    /me/achievements
GET    /itineraries
POST   /itineraries
GET    /itineraries/{id}
POST   /assistant/itineraries
```

## 9. Diseño visual

La interfaz debe sentirse exploratoria, cálida y contemporánea:

- Paleta visual basada en colores naturales de Paraguay: Azul Guaraní `#1A73E8`, Verde Yerba Mate `#34D399`, Naranja Tierra Roja `#F97316`, Amarillo Maíz `#FACC15` y Rojo Lapacho `#EF4444`.
- Slogan principal: `Reescubriendo Nuestra Tierra`.
- La palabra `Nuestra` debe utilizar el Verde Yerba Mate `#34D399`.
- La imagen de referencia de Viaja Paraguay se utiliza como asset local del hero.
- El catálogo inicial muestra Misiones Jesuíticas (Cultura), Parque Ybycuí (Naturaleza) y Cerámica de Areguá (Arte).
- El filtro de destinos debe contemplar también la categoría Arte.
- Azul Guaraní para navegación, confianza y estructura.
- Amarillo Maíz para puntos, medallas y acciones positivas.
- Naranja Tierra Roja y Rojo Lapacho para hero, recompensas y acentos.
- Fondos crema y arena para una estética editorial.
- Fotografías grandes y tarjetas con jerarquía clara.
- Sans-serif para datos y serif editorial para títulos.
- Microinteracciones al completar destinos, ganar puntos y desbloquear medallas.

La gamificación debe ser visible sin sentirse infantil.

### Asistente flotante

El frontend debe incluir un chatbot fijo en la esquina inferior derecha:

- Botón flotante visible durante todo el scroll.
- Panel expandible sin abandonar la página.
- Estado visual de asistente en línea.
- Mensaje inicial y sugerencias rápidas.
- Campo para enviar preguntas.
- En mobile debe reducirse a un botón circular para no tapar el contenido.
- El panel debe consumir posteriormente los endpoints `/assistant/*` del backend.

## 10. Seguridad, accesibilidad y performance

- Proteger rutas privadas.
- Usar cookie HttpOnly con Sanctum si la configuración de dominios lo permite.
- Si se usa Bearer Token, documentar expiración y rotación.
- Mostrar errores amigables sin stack traces.
- Validar formularios antes de enviar.
- Foco visible, labels, contraste y navegación por teclado.
- Lazy loading de imágenes.
- Code splitting por ruta.
- No hardcodear URLs de API fuera de variables de entorno.

## 11. Integración Vercel + ngrok

1. Vercel ejecuta `npm run build`.
2. `VITE_API_URL` se configura en las variables de Vercel.
3. Laravel corre localmente.
4. ngrok expone el puerto de Laravel mediante HTTPS.
5. Laravel permite el origen exacto de Vercel en CORS.
6. Laravel responde solicitudes `OPTIONS` preflight.
7. Si la URL de ngrok cambia, se actualiza la variable y se redeploya Vercel.

Se recomienda reservar un dominio de ngrok para evitar cambiar la configuración en cada reinicio.

## 12. Criterios de aceptación

- La aplicación carga desde Vercel.
- El usuario puede registrarse, iniciar sesión y cerrar sesión.
- Las rutas privadas redirigen al login sin sesión.
- El catálogo consume datos reales de Laravel.
- La búsqueda y los filtros actualizan resultados.
- El mapa representa el progreso recibido.
- Un check-in actualiza puntos, medallas y mapa.
- El usuario puede pedir y guardar un itinerario.
- El asistente maneja loading, error y respuesta vacía.
- La interfaz funciona en mobile y desktop.
- No hay errores críticos de consola.
- La integración funciona con la URL HTTPS de ngrok configurada en Vercel.

## 13. Métricas iniciales

- Visitantes que inician un itinerario.
- Usuarios que completan su primer check-in.
- Zonas exploradas por usuario.
- Retorno semanal.
- Usuarios que desbloquean su primera medalla.
- Tiempo hasta la primera acción significativa.

## 14. Entregables

- Repositorio Vite/React.
- Componentes reutilizables y sistema visual.
- Mapa GeoJSON integrado.
- Servicios de API.
- Tests de componentes y flujos críticos.
- Build de producción funcionando.
- Proyecto configurado en Vercel.
- Documentación de variables de entorno y despliegue.
