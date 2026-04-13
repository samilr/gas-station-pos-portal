# Modulo Dispensadoras — Documentacion Completa de API

> Referencia tecnica para el equipo frontend. Cubre todos los endpoints del modulo de dispensadoras
> expuestos por el backend (proxy del controlador PTS-2). El frontend **nunca** habla directamente
> al hardware PTS — siempre a traves de este API.
>
> Generado el: 2026-04-12

---

## Prompt para construir el modulo en el Frontend

Copia y pega este prompt en tu agente de frontend (Claude, Cursor, etc.) junto con este archivo completo para que construya todas las pantallas:


```
Necesito que modifiques el modulo llamado "Dispensadoras" en mi aplicacion.

## Estructura del Modulo

El modulo vive en `/dashboard/dispensers` y tiene 9 sub-modulos con sus propias rutas:

| Sub-modulo | Ruta | Descripcion |
|---|---|---|
| Monitor | `/dashboard/dispensers/monitor` | Vista en tiempo real de las 18 dispensadoras. Polling cada 2 segundos. Tarjetas con estado visual (verde=disponible, naranja=despachando, rojo=bloqueada, gris=offline, azul=fin de transaccion). |
| Control | `/dashboard/dispensers/control` | Panel de control: bloquear/desbloquear individual o todas, autorizar despacho (por monto, volumen, o tanque lleno), parada de emergencia, suspender/reanudar. |
| Precios | `/dashboard/dispensers/prices` | Ver y editar precios de combustible globales y por bomba. Programador de cambios de precio. |
| Tanques | `/dashboard/dispensers/tanks` | Nivel de combustible en tanques (sondas). Grafica de barras con nivel actual, alertas de nivel bajo. Configuracion de tanques. |
| Sistema | `/dashboard/dispensers/system` | Info del controlador PTS (bateria, temperatura CPU, firmware, GPS). Ajustar fecha/hora. Reiniciar. |
| Hardware | `/dashboard/dispensers/hardware` | Configuracion de bombas, mangueras, grados de combustible, lectores, tableros de precios. |
| Tags RFID | `/dashboard/dispensers/tags` | Gestionar tags RFID: listar, agregar, editar, eliminar. Leer tag de un lector. |
| Reportes | `/dashboard/dispensers/reports` | Reportes del PTS: transacciones de bombas, mediciones de tanques, entregas en tanque. Filtros por fecha. |
| Transacciones | `/dashboard/dispensers/transactions` | Historial de transacciones de combustible de la BD. Tabla paginada con filtros (bomba, manguera, tipo de combustible, fecha). |



## Requisitos de UI

### Monitor (la pantalla principal)
- Grid responsivo de 18 tarjetas (6x3 en desktop, 3x6 en tablet, 2x9 en mobile)
- Cada tarjeta muestra: numero de bomba, estado (icono + color + texto), ultimo despacho (volumen, monto, producto), tag RFID si hay
- Las tarjetas de bombas "despachando" tienen una animacion de pulso
- Las tarjetas de bombas "bloqueadas" tienen un icono de candado
- Boton de "Bloquear Todas" y "Desbloquear Todas" en la parte superior
- Auto-refresh via polling cada 2 segundos (usar useQuery con refetchInterval)

### Control
- Seleccionar una o multiples bombas
- Modal de "Autorizar Despacho" con formulario: tipo (monto fijo / volumen fijo / tanque lleno), valor, manguera/grado de combustible
- Botones de accion: Lock, Unlock, Stop, Emergency Stop, Suspend, Resume, Close Transaction
- Confirmacion antes de acciones destructivas (Emergency Stop, Lock All)
- Indicadores de estado en tiempo real

### Precios
- Tabla de grados de combustible con precios actuales
- Formulario de edicion inline
- Seccion de programacion de cambios de precio (scheduler)
- Preview antes de aplicar cambios

### Tanques
- Visualizacion tipo "tanque" con nivel actual (barra vertical coloreada)
- Datos: altura del producto, volumen, temperatura, nivel de agua
- Alertas visuales si el nivel esta por debajo del minimo configurado

### Sistema
- Dashboard con cards de info: Bateria (mV), Temperatura CPU (°C), Firmware, ID unico, GPS
- Formulario de fecha/hora con boton de sincronizar
- Boton de reiniciar con confirmacion

### Hardware
- Tabs o accordion para cada tipo de configuracion
- Formularios de edicion con validacion
- Preview de cambios antes de guardar

### Tags RFID
- Tabla con busqueda/filtro
- Modal de agregar tag
- Lectura de tag en tiempo real desde un lector

### Reportes
- Selector de tipo de reporte
- Filtros de fecha (date picker range)
- Tabla de resultados con export a CSV/Excel

### Transacciones
- Tabla paginada server-side
- Filtros: bomba, manguera, tipo combustible, rango de fechas
- Ordenamiento por columnas
- Detalle expandible por fila

## API Base URL
- Dev: `http://localhost:5274`
- Auth: Bearer token via login

## Importante
- Todos los endpoints estan documentados en el archivo adjunto con request/response JSON exactos
- Usar `{ successful: true, data: ... }` como shape de respuesta standard
- Los endpoints PTS devuelven `{ successful: true, data: { Protocol: "jsonPTS", Packets: [...] } }`
- El estado de la bomba viene en `Packets[n].Type` que puede ser: PumpIdleStatus, PumpFillingStatus, PumpOfflineStatus, PumpEndOfTransactionStatus
- Para saber si una bomba esta bloqueada, verificar `Data.Request === "PumpLock"` en PumpIdleStatus
```

---

## Tabla de Contenido

1. [Informacion General](#1-informacion-general)
2. [Productos de Combustible](#2-productos-de-combustible)
3. [Estructura de Respuesta](#3-estructura-de-respuesta)
4. [Resumen de Endpoints](#4-resumen-de-endpoints)
5. [Modulo 1 — Monitor de Dispensadoras](#5-modulo-1--monitor-de-dispensadoras)
6. [Modulo 2 — Control de Dispensadoras](#6-modulo-2--control-de-dispensadoras)
7. [Modulo 3 — Precios de Combustible](#7-modulo-3--precios-de-combustible)
8. [Modulo 4 — Tanques y Sondas](#8-modulo-4--tanques-y-sondas)
9. [Modulo 5 — Configuracion del Sistema](#9-modulo-5--configuracion-del-sistema)
10. [Modulo 6 — Configuracion de Hardware](#10-modulo-6--configuracion-de-hardware)
11. [Modulo 7 — Tags RFID](#11-modulo-7--tags-rfid)
12. [Modulo 8 — Reportes](#12-modulo-8--reportes)
13. [Modulo 9 — Historial de Transacciones](#13-modulo-9--historial-de-transacciones)
14. [Endpoint Raw (Avanzado)](#14-endpoint-raw-avanzado)
15. [Guia de Polling y Manejo de Errores](#15-guia-de-polling-y-manejo-de-errores)

---

## 1. Informacion General

### URLs Base

| Entorno | URL |
|---------|-----|
| Desarrollo | `http://localhost:5274` |
| Produccion | `https://isladominicana-pos-mobile-api.azurewebsites.net` |

### Autenticacion

Todos los endpoints requieren JWT Bearer token obtenido via `POST /api/auth/login`.

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Rutas del Frontend

| Modulo | Ruta |
|--------|------|
| Monitor de Dispensadoras | `/dashboard/dispensers/monitor` |
| Control de Dispensadoras | `/dashboard/dispensers/control` |
| Precios de Combustible | `/dashboard/dispensers/prices` |
| Tanques y Sondas | `/dashboard/dispensers/tanks` |
| Configuracion del Sistema | `/dashboard/dispensers/system` |
| Configuracion de Hardware | `/dashboard/dispensers/hardware` |
| Tags RFID | `/dashboard/dispensers/tags` |
| Reportes | `/dashboard/dispensers/reports` |
| Historial de Transacciones | `/dashboard/dispensers/transactions` |

---

## 2. Productos de Combustible

Mapeo de `FuelGradeId` a producto. Usar en todas las pantallas que muestran tipo de combustible.

| FuelGradeId | Codigo | Nombre |
|-------------|--------|--------|
| `1` | `1-001` | GASOLINA REGULAR |
| `2` | `1-025` | GASOLINA V-POWER |
| `3` | `2-001` | DIESEL REGULAR |
| `4` | `2-025` | DIESEL V-POWER |

> Los IDs exactos dependen de la configuracion del PTS. Siempre obtener la lista maestra
> de `GET /api/dispensers/config/fuel-grades` al iniciar la aplicacion.

---

## 3. Estructura de Respuesta

Todos los endpoints del modulo de dispensadoras devuelven el mismo envelope:

```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpGetStatus",
        "Data": { ... },
        "Message": null
      }
    ]
  }
}
```

En caso de error:
```json
{
  "successful": false,
  "error": "Descripcion del error"
}
```

**Nota sobre `Packets`:** El array `Packets` puede contener multiples respuestas cuando se
consultan varios pumps o varias operaciones en paralelo (ej. `GET /api/dispensers/status`
devuelve 18 packets, uno por bomba).

### Tipos de Estado de Bomba (`Type` en la respuesta)

| Tipo | Descripcion | Color UI |
|------|-------------|----------|
| `PumpIdleStatus` | Bomba inactiva, esperando autorizacion | Verde |
| `PumpFillingStatus` | Bomba dispensando combustible | Naranja |
| `PumpOfflineStatus` | Bomba desconectada o sin comunicacion | Gris |
| `PumpEndOfTransactionStatus` | Transaccion recien terminada (estado transiente) | Azul |

---

## 4. Resumen de Endpoints

| # | Metodo | Endpoint | Descripcion | Modulo |
|---|--------|----------|-------------|--------|
| 1 | GET | `/api/dispensers/status` | Estado de todas las bombas (18) | Monitor |
| 2 | GET | `/api/dispensers/status/{pump}` | Estado de una bomba | Monitor |
| 3 | POST | `/api/dispensers/{pump}/lock` | Bloquear bomba | Control |
| 4 | POST | `/api/dispensers/{pump}/unlock` | Desbloquear bomba | Control |
| 5 | POST | `/api/dispensers/lock-all` | Bloquear todas las bombas | Control |
| 6 | POST | `/api/dispensers/unlock-all` | Desbloquear todas las bombas | Control |
| 7 | POST | `/api/dispensers/{pump}/authorize` | Autorizar bomba (monto/volumen/full) | Control |
| 8 | POST | `/api/dispensers/{pump}/stop` | Parar bomba | Control |
| 9 | POST | `/api/dispensers/{pump}/emergency-stop` | Parada de emergencia | Control |
| 10 | POST | `/api/dispensers/{pump}/suspend` | Suspender dispensado | Control |
| 11 | POST | `/api/dispensers/{pump}/resume` | Reanudar dispensado | Control |
| 12 | POST | `/api/dispensers/{pump}/close-transaction` | Cerrar transaccion | Control |
| 13 | GET | `/api/dispensers/{pump}/transaction` | Info de transaccion activa | Control |
| 14 | GET | `/api/dispensers/{pump}/totals` | Totales del pump | Control |
| 15 | GET | `/api/dispensers/{pump}/prices` | Precios del pump | Precios |
| 16 | PUT | `/api/dispensers/{pump}/prices` | Actualizar precios del pump | Precios |
| 17 | GET | `/api/dispensers/{pump}/display` | Datos de pantalla del pump | Monitor |
| 18 | GET | `/api/dispensers/{pump}/tag` | Tag RFID activo del pump | Tags |
| 19 | PUT | `/api/dispensers/{pump}/lights` | Encender/apagar luces | Control |
| 20 | GET | `/api/dispensers/{pump}/automatic-operation` | Estado de operacion automatica | Control |
| 21 | PUT | `/api/dispensers/{pump}/automatic-operation` | Configurar operacion automatica | Control |
| 22 | POST | `/api/dispensers/{pump}/command` | Comando generico por tipo | Avanzado |
| 23 | GET | `/api/dispensers/probes/{probe}/measurements` | Mediciones de sonda (tanque) | Tanques |
| 24 | GET | `/api/dispensers/probes/{probe}/volume-table` | Tabla volumetrica de tanque | Tanques |
| 25 | GET | `/api/dispensers/system/info` | Info del sistema (bateria, CPU, firmware) | Sistema |
| 26 | GET | `/api/dispensers/system/datetime` | Fecha y hora del sistema | Sistema |
| 27 | PUT | `/api/dispensers/system/datetime` | Configurar fecha y hora | Sistema |
| 28 | POST | `/api/dispensers/system/restart` | Reiniciar controlador PTS | Sistema |
| 29 | GET | `/api/dispensers/system/gps` | Datos GPS | Sistema |
| 30 | GET | `/api/dispensers/config/pumps` | Configuracion de bombas | Hardware |
| 31 | PUT | `/api/dispensers/config/pumps` | Actualizar config de bombas | Hardware |
| 32 | GET | `/api/dispensers/config/nozzles` | Configuracion de pistolas | Hardware |
| 33 | PUT | `/api/dispensers/config/nozzles` | Actualizar config de pistolas | Hardware |
| 34 | GET | `/api/dispensers/config/fuel-grades` | Configuracion de grados de combustible | Hardware |
| 35 | PUT | `/api/dispensers/config/fuel-grades` | Actualizar config de grados | Hardware |
| 36 | GET | `/api/dispensers/config/fuel-prices` | Precios globales por grado | Precios |
| 37 | PUT | `/api/dispensers/config/fuel-prices` | Actualizar precios globales | Precios |
| 38 | GET | `/api/dispensers/config/prices-scheduler` | Programador de precios | Precios |
| 39 | PUT | `/api/dispensers/config/prices-scheduler` | Actualizar programador de precios | Precios |
| 40 | GET | `/api/dispensers/config/tanks` | Configuracion de tanques | Hardware |
| 41 | PUT | `/api/dispensers/config/tanks` | Actualizar config de tanques | Hardware |
| 42 | GET | `/api/dispensers/config/probes` | Configuracion de sondas | Hardware |
| 43 | PUT | `/api/dispensers/config/probes` | Actualizar config de sondas | Hardware |
| 44 | GET | `/api/dispensers/config/readers` | Configuracion de lectores RFID | Hardware |
| 45 | PUT | `/api/dispensers/config/readers` | Actualizar config de lectores | Hardware |
| 46 | GET | `/api/dispensers/config/price-boards` | Configuracion de paneles de precios | Hardware |
| 47 | PUT | `/api/dispensers/config/price-boards` | Actualizar config de paneles | Hardware |
| 48 | GET | `/api/dispensers/config/users` | Usuarios del PTS | Sistema |
| 49 | PUT | `/api/dispensers/config/users` | Actualizar usuarios del PTS | Sistema |
| 50 | GET | `/api/dispensers/config/network` | Configuracion de red del PTS | Sistema |
| 51 | PUT | `/api/dispensers/config/network` | Actualizar configuracion de red | Sistema |
| 52 | GET | `/api/dispensers/config/decimal-digits` | Digitos decimales del sistema | Sistema |
| 53 | PUT | `/api/dispensers/config/decimal-digits` | Actualizar digitos decimales | Sistema |
| 54 | GET | `/api/dispensers/reports/pump-transactions` | Reporte de transacciones de bomba | Reportes |
| 55 | POST | `/api/dispensers/reports/pump-transactions` | Reporte con filtro de fechas | Reportes |
| 56 | GET | `/api/dispensers/reports/tank-measurements` | Reporte de mediciones de tanque | Reportes |
| 57 | POST | `/api/dispensers/reports/tank-measurements` | Reporte mediciones con fechas | Reportes |
| 58 | GET | `/api/dispensers/reports/in-tank-deliveries` | Reporte de entregas en tanque | Reportes |
| 59 | POST | `/api/dispensers/reports/in-tank-deliveries` | Reporte entregas con fechas | Reportes |
| 60 | GET | `/api/dispensers/tags` | Lista de tags RFID | Tags |
| 61 | POST | `/api/dispensers/tags` | Reemplazar lista de tags | Tags |
| 62 | POST | `/api/dispensers/tags/add` | Agregar tags a la lista | Tags |
| 63 | GET | `/api/dispensers/tags/count` | Numero total de tags | Tags |
| 64 | GET | `/api/dispensers/tags/{tagId}` | Info de un tag especifico | Tags |
| 65 | GET | `/api/dispensers/readers/{reader}/tag` | Leer tag del lector RFID | Tags |
| 66 | POST | `/api/dispensers/raw` | Envio de paquetes raw al PTS | Avanzado |
| 67 | GET | `/api/fuel-transactions` | Historial paginado de transacciones | Transacciones |
| 68 | GET | `/api/fuel-transactions/{id}` | Transaccion por ID | Transacciones |
| 69 | PUT | `/api/fuel-transactions/{id}` | Actualizar tag/ptsId de transaccion | Transacciones |
| 70 | DELETE | `/api/fuel-transactions/{id}` | Eliminar transaccion | Transacciones |

---

## 5. Modulo 1 — Monitor de Dispensadoras

**Ruta:** `/dashboard/dispensers/monitor`

El monitor hace polling cada **2 segundos** a `GET /api/dispensers/status` y renderiza
el estado visual de las 18 bombas.

---

### `GET /api/dispensers/status` — Estado de todas las bombas

Retorna un packet por cada bomba (18 packets en total). Cada packet puede ser de tipo
`PumpIdleStatus`, `PumpFillingStatus`, `PumpOfflineStatus` o `PumpEndOfTransactionStatus`.

**Sin body de request.**

**Response — Bomba en Idle (verde):**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpIdleStatus",
        "Data": {
          "Pump": 1,
          "NozzleUp": false,
          "Nozzle": 0,
          "Request": "",
          "NozzlePrices": [
            { "Nozzle": 1, "FuelGradeId": 1, "FuelGradeName": "GASOLINA REGULAR", "Price": 295.00 },
            { "Nozzle": 2, "FuelGradeId": 2, "FuelGradeName": "GASOLINA V-POWER", "Price": 320.00 }
          ],
          "LastNozzle": 1,
          "LastVolume": 12.543,
          "LastPrice": 295.00,
          "LastAmount": 3700.19,
          "LastTransaction": 4821,
          "LastFuelGradeId": 1,
          "LastFuelGradeName": "GASOLINA REGULAR",
          "LastTotalVolume": 98432.11,
          "LastTotalAmount": 29037452.00,
          "LastDateTimeStart": "2026-04-12T08:15:00",
          "LastDateTime": "2026-04-12T08:16:23",
          "LastFlowRate": 45.2,
          "LastUser": 0,
          "User": 0
        },
        "Message": null
      },
      {
        "Id": 2,
        "Type": "PumpFillingStatus",
        "Data": {
          "Pump": 2,
          "Nozzle": 1,
          "FuelGradeId": 1,
          "FuelGradeName": "GASOLINA REGULAR",
          "Volume": 8.241,
          "Price": 295.00,
          "Amount": 2431.20,
          "Transaction": 4822,
          "DateTimeStart": "2026-04-12T09:04:11",
          "FlowRate": 48.7,
          "IsSuspended": false,
          "OrderedType": "Amount",
          "OrderedDose": 2000.00,
          "User": 633
        },
        "Message": null
      },
      {
        "Id": 3,
        "Type": "PumpOfflineStatus",
        "Data": {
          "Pump": 3,
          "State": "Offline",
          "NozzleUp": false,
          "Nozzle": 0,
          "LastFlowRate": 0.0,
          "Request": "",
          "LastNozzle": 0,
          "LastVolume": 0.0,
          "LastPrice": 0.0,
          "LastAmount": 0.0,
          "LastTransaction": 0,
          "LastFuelGradeId": 0,
          "LastFuelGradeName": "",
          "LastTotalVolume": 0.0,
          "LastTotalAmount": 0.0,
          "LastDateTimeStart": null,
          "LastDateTime": null,
          "LastUser": 0,
          "User": 0
        },
        "Message": null
      },
      {
        "Id": 4,
        "Type": "PumpIdleStatus",
        "Data": {
          "Pump": 4,
          "NozzleUp": false,
          "Nozzle": 0,
          "Request": "PumpLock",
          "NozzlePrices": [
            { "Nozzle": 1, "FuelGradeId": 3, "FuelGradeName": "DIESEL REGULAR", "Price": 215.00 }
          ],
          "LastNozzle": 1,
          "LastVolume": 30.000,
          "LastPrice": 215.00,
          "LastAmount": 6450.00,
          "LastTransaction": 4799,
          "LastFuelGradeId": 3,
          "LastFuelGradeName": "DIESEL REGULAR",
          "LastTotalVolume": 55821.44,
          "LastTotalAmount": 12001610.00,
          "LastDateTimeStart": "2026-04-11T17:22:00",
          "LastDateTime": "2026-04-11T17:30:15",
          "LastFlowRate": 41.1,
          "LastUser": 0,
          "User": 0
        },
        "Message": null
      }
    ]
  }
}
```

**Nota sobre `Request: "PumpLock"`:** Cuando `Request` es `"PumpLock"` la bomba esta en
estado Idle pero bloqueada (mostrar en rojo). Cuando `Request` es `""` esta libre (verde).

---

### `GET /api/dispensers/status/{pump}` — Estado de una bomba

**Parametros de ruta:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `pump` | int | Numero de bomba (1-18) |

**Response (bomba dispensando):**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpFillingStatus",
        "Data": {
          "Pump": 5,
          "Nozzle": 2,
          "FuelGradeId": 2,
          "FuelGradeName": "GASOLINA V-POWER",
          "Volume": 15.320,
          "Price": 320.00,
          "Amount": 4902.40,
          "Transaction": 4850,
          "DateTimeStart": "2026-04-12T09:30:00",
          "FlowRate": 52.1,
          "IsSuspended": false,
          "OrderedType": "Volume",
          "OrderedDose": 20.000,
          "User": 633
        },
        "Message": null
      }
    ]
  }
}
```

**Response (fin de transaccion — estado transiente):**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpEndOfTransactionStatus",
        "Data": {
          "Pump": 5,
          "Nozzle": 2,
          "FuelGradeId": 2,
          "FuelGradeName": "GASOLINA V-POWER",
          "Volume": 20.000,
          "Price": 320.00,
          "Amount": 6400.00,
          "Transaction": 4850,
          "DateTime": "2026-04-12T09:38:42",
          "DateTimeStart": "2026-04-12T09:30:00",
          "Tag": "A1B2C3D4",
          "User": 633,
          "TotalVolume": 102451.23,
          "TotalAmount": 32784393.60,
          "FlowRate": 48.9
        },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/{pump}/display` — Datos de pantalla del pump

Muestra los valores que aparecen en la pantalla del dispensador en tiempo real.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpDisplayData",
        "Data": {
          "Pump": 2,
          "UnitPrice": 295.00,
          "Volume": 8.241,
          "Amount": 2431.20,
          "FuelGradeName": "GASOLINA REGULAR"
        },
        "Message": null
      }
    ]
  }
}
```

---

## 6. Modulo 2 — Control de Dispensadoras

**Ruta:** `/dashboard/dispensers/control`

---

### `POST /api/dispensers/{pump}/lock` — Bloquear bomba

**Sin body.** Bloquea la bomba especificada para impedir dispensado.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpLockConfirmation",
        "Data": { "Pump": 1 },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/{pump}/unlock` — Desbloquear bomba

**Sin body.** Desbloquea la bomba.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpUnlockConfirmation",
        "Data": { "Pump": 1 },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/lock-all` — Bloquear todas las bombas

**Sin body.** Envia `PumpLock` a las 18 bombas en un solo request. Retorna 18 packets.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      { "Id": 1, "Type": "PumpLockConfirmation", "Data": { "Pump": 1 }, "Message": null },
      { "Id": 2, "Type": "PumpLockConfirmation", "Data": { "Pump": 2 }, "Message": null },
      { "Id": 3, "Type": "PumpOfflineStatus", "Data": { "Pump": 3, "State": "Offline" }, "Message": null }
    ]
  }
}
```

> Las bombas offline retornan `PumpOfflineStatus` en vez de confirmacion. Ignorar en UI.

---

### `POST /api/dispensers/unlock-all` — Desbloquear todas las bombas

**Sin body.** Igual que `lock-all` pero desbloquea.

**Response:** Igual que `lock-all` pero con `PumpUnlockConfirmation`.

---

### `POST /api/dispensers/{pump}/authorize` — Autorizar bomba

Autoriza el dispensado. Soporta tres modalidades: monto fijo, volumen fijo, o tanque lleno.

**Request body — Autorizar por monto (RD$2,000):**
```json
{
  "Type": "Amount",
  "Dose": 2000.00,
  "Nozzle": 1
}
```

**Request body — Autorizar por volumen (20 litros):**
```json
{
  "Type": "Volume",
  "Dose": 20.000,
  "Nozzle": 1
}
```

**Request body — Tanque lleno:**
```json
{
  "Type": "FullTank",
  "Dose": 0,
  "Nozzle": 1
}
```

**Request body — Por grado de combustible (en lugar de pistola especifica):**
```json
{
  "Type": "Amount",
  "Dose": 5000.00,
  "FuelGradeId": 1
}
```

**Request body — Por multiples pistolas:**
```json
{
  "Type": "Volume",
  "Dose": 30.000,
  "Nozzles": [1, 2]
}
```

**Request body — Con precio especifico (override):**
```json
{
  "Type": "Amount",
  "Dose": 2000.00,
  "Nozzle": 1,
  "Price": 295.00
}
```

**Campos del request:**

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `Type` | string | Si | `"FullTank"`, `"Amount"` o `"Volume"` |
| `Dose` | number | Si | Monto en RD$ o volumen en litros (0 para `FullTank`) |
| `Nozzle` | int | Condicional | Numero de pistola (alternativo a `Nozzles` o `FuelGradeId`) |
| `Nozzles` | int[] | Condicional | Array de pistolas |
| `FuelGradeId` | int | Condicional | ID del grado de combustible |
| `FuelGradeIds` | int[] | Condicional | Array de grados de combustible |
| `Price` | number | No | Precio por litro override (opcional) |

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpAuthorizeConfirmation",
        "Data": { "Pump": 2 },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/{pump}/stop` — Parar bomba

**Sin body.** Para el dispensado normalmente (registra la transaccion).

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpStopConfirmation",
        "Data": { "Pump": 2 },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/{pump}/emergency-stop` — Parada de emergencia

**Sin body.** Para el dispensado de forma inmediata. Usar solo en emergencias.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpEmergencyStopConfirmation",
        "Data": { "Pump": 2 },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/{pump}/suspend` — Suspender dispensado

**Sin body.** Pausa temporalmente el dispensado (la bomba queda en `IsSuspended: true`).

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpSuspendConfirmation",
        "Data": { "Pump": 2 },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/{pump}/resume` — Reanudar dispensado

**Sin body.** Reanuda un dispensado suspendido.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpResumeConfirmation",
        "Data": { "Pump": 2 },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/{pump}/close-transaction` — Cerrar transaccion

**Sin body.** Cierra la transaccion activa del pump. Usar cuando hay una transaccion
pendiente que debe cerrarse manualmente.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpCloseTransactionConfirmation",
        "Data": { "Pump": 2 },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/{pump}/transaction` — Info de transaccion activa

Obtiene la informacion de la transaccion en curso o la ultima transaccion del pump.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpTransactionInformation",
        "Data": {
          "Pump": 2,
          "Nozzle": 1,
          "FuelGradeId": 1,
          "FuelGradeName": "GASOLINA REGULAR",
          "Volume": 10.000,
          "Price": 295.00,
          "Amount": 2950.00,
          "Transaction": 4860,
          "DateTime": "2026-04-12T10:05:33",
          "DateTimeStart": "2026-04-12T10:00:00",
          "Tag": "A1B2C3D4",
          "User": 633,
          "TotalVolume": 102461.23,
          "TotalAmount": 30234393.60,
          "FlowRate": 47.3
        },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/{pump}/totals` — Totales del pump

Retorna los totales acumulados del pump (volumen y monto total desde el ultimo reset).

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpTotals",
        "Data": {
          "Pump": 2,
          "Nozzle": 1,
          "FuelGradeId": 1,
          "FuelGradeName": "GASOLINA REGULAR",
          "Volume": 102461.23,
          "Amount": 30234393.60
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/{pump}/lights` — Encender/apagar luces

**Request body:**
```json
{
  "Lights": "On"
}
```

| Campo | Tipo | Valores |
|-------|------|---------|
| `Lights` | string | `"On"` o `"Off"` |

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpSetLightsConfirmation",
        "Data": { "Pump": 2 },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/{pump}/automatic-operation` — Estado de operacion automatica

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpAutomaticOperation",
        "Data": {
          "Pump": 2,
          "State": "Off"
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/{pump}/automatic-operation` — Configurar operacion automatica

**Request body:**
```json
{
  "State": "On"
}
```

| Campo | Tipo | Valores |
|-------|------|---------|
| `State` | string | `"On"` o `"Off"` |

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpSetAutomaticOperationConfirmation",
        "Data": { "Pump": 2 },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/{pump}/tag` — Tag RFID activo del pump

Obtiene el tag RFID que actualmente tiene la bomba asignado (si hay uno activo).

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpTag",
        "Data": {
          "Pump": 2,
          "Nozzle": 1,
          "Tag": "A1B2C3D4E5F6"
        },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/{pump}/command` — Comando generico

Envia cualquier tipo de comando PTS a una bomba. Usar para comandos no cubiertos por
los endpoints dedicados.

**Query params:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `type` | string | Tipo de comando PTS (ej. `"PumpGetStatus"`) |

**Ejemplo:** `POST /api/dispensers/5/command?type=PumpGetStatus`

**Sin body.**

**Response:** Depende del tipo de comando enviado.

---

## 7. Modulo 3 — Precios de Combustible

**Ruta:** `/dashboard/dispensers/prices`

---

### `GET /api/dispensers/{pump}/prices` — Precios del pump

Obtiene los precios configurados por pistola para un pump especifico.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpPrices",
        "Data": {
          "Pump": 1,
          "NozzlePrices": [
            {
              "Nozzle": 1,
              "FuelGradeId": 1,
              "FuelGradeName": "GASOLINA REGULAR",
              "Price": 295.00
            },
            {
              "Nozzle": 2,
              "FuelGradeId": 2,
              "FuelGradeName": "GASOLINA V-POWER",
              "Price": 320.00
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/{pump}/prices` — Actualizar precios del pump

Actualiza los precios de las pistolas de un pump especifico.

**Request body:**
```json
{
  "NozzlePrices": [
    {
      "Nozzle": 1,
      "FuelGradeId": 1,
      "Price": 298.00
    },
    {
      "Nozzle": 2,
      "FuelGradeId": 2,
      "Price": 323.00
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "PumpSetPricesConfirmation",
        "Data": { "Pump": 1 },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/fuel-prices` — Precios globales por grado

Obtiene los precios globales configurados en el sistema para cada grado de combustible.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetFuelGradesPrices",
        "Data": {
          "FuelGradesPrices": [
            { "FuelGradeId": 1, "Price": 295.00 },
            { "FuelGradeId": 2, "Price": 320.00 },
            { "FuelGradeId": 3, "Price": 215.00 },
            { "FuelGradeId": 4, "Price": 240.00 }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/fuel-prices` — Actualizar precios globales

Actualiza los precios globales de los grados de combustible. Esta accion afecta todos
los pumps que no tengan precio individual configurado.

**Request body:**
```json
{
  "FuelGradesPrices": [
    { "FuelGradeId": 1, "Price": 298.00 },
    { "FuelGradeId": 2, "Price": 323.00 },
    { "FuelGradeId": 3, "Price": 218.00 },
    { "FuelGradeId": 4, "Price": 243.00 }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetFuelGradesPricesConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/prices-scheduler` — Programador de precios

Obtiene la configuracion del scheduler de precios (cambios automaticos de precio por fecha/hora).

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetPricesSchedulerConfiguration",
        "Data": {
          "PriceSchedules": [
            {
              "Id": 1,
              "Enabled": true,
              "FuelGradeId": 1,
              "Price": 300.00,
              "DateTime": "2026-04-15T00:00:00"
            },
            {
              "Id": 2,
              "Enabled": false,
              "FuelGradeId": 2,
              "Price": 325.00,
              "DateTime": "2026-04-15T00:00:00"
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/prices-scheduler` — Actualizar programador de precios

**Request body:**
```json
{
  "PriceSchedules": [
    {
      "Id": 1,
      "Enabled": true,
      "FuelGradeId": 1,
      "Price": 300.00,
      "DateTime": "2026-04-15T00:00:00"
    },
    {
      "Id": 2,
      "Enabled": true,
      "FuelGradeId": 2,
      "Price": 325.00,
      "DateTime": "2026-04-15T00:00:00"
    }
  ]
}
```

**Campos de `PriceSchedule`:**

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `Id` | int | ID del schedule |
| `Enabled` | bool | Si esta activo |
| `FuelGradeId` | int | Grado de combustible |
| `Price` | number | Precio a aplicar |
| `DateTime` | string | Fecha y hora de aplicacion (ISO 8601) |

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetPricesSchedulerConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

## 8. Modulo 4 — Tanques y Sondas

**Ruta:** `/dashboard/dispensers/tanks`

---

### `GET /api/dispensers/probes/{probe}/measurements` — Mediciones de sonda

Obtiene las mediciones en tiempo real de una sonda de tanque especifica.

**Parametros de ruta:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `probe` | int | Numero de sonda (generalmente 1-4, uno por tanque) |

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "ProbeGetMeasurements",
        "Data": {
          "Probe": 1,
          "Status": "OK",
          "Alarms": [],
          "ProductHeight": 1852.4,
          "ProductVolume": 18524.3,
          "ProductTCVolume": 18491.2,
          "WaterHeight": 12.1,
          "WaterVolume": 45.3,
          "Temperature": 28.5,
          "DateTime": "2026-04-12T10:15:00"
        },
        "Message": null
      }
    ]
  }
}
```

**Campos de respuesta:**

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `Probe` | int | Numero de sonda |
| `Status` | string | Estado de la sonda (`"OK"`, `"Error"`, etc.) |
| `Alarms` | array | Lista de alarmas activas (strings) |
| `ProductHeight` | number | Altura del producto en mm |
| `ProductVolume` | number | Volumen del producto en litros |
| `ProductTCVolume` | number | Volumen compensado por temperatura en litros |
| `WaterHeight` | number | Altura del agua en mm |
| `WaterVolume` | number | Volumen de agua en litros |
| `Temperature` | number | Temperatura del producto en °C |
| `DateTime` | string | Fecha y hora de la medicion |

---

### `GET /api/dispensers/probes/{probe}/volume-table` — Tabla volumetrica

Obtiene la tabla de altura-volumen calibrada para el tanque.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "ProbeGetTankVolumeForHeight",
        "Data": {
          "Probe": 1,
          "VolumeTable": [
            { "Height": 0, "Volume": 0.0 },
            { "Height": 100, "Volume": 320.5 },
            { "Height": 200, "Volume": 685.2 },
            { "Height": 1000, "Volume": 5821.4 },
            { "Height": 2000, "Volume": 20000.0 }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/tanks` — Configuracion de tanques

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetTanksConfiguration",
        "Data": {
          "Tanks": [
            {
              "Id": 1,
              "FuelGradeId": 1,
              "Height": 2400,
              "CriticalHighProductAlarmHeight": 2350,
              "HighProductAlarmHeight": 2200,
              "LowProductAlarmHeight": 300,
              "CriticalLowProductAlarmHeight": 150,
              "HighWaterAlarmHeight": 50,
              "CriticalHighWaterAlarmHeight": 100,
              "HighTemperatureAlarm": 45.0,
              "LowTemperatureAlarm": 5.0,
              "Capacity": 20000,
              "Diameter": 2400,
              "Name": "Tanque 1 - Regular"
            },
            {
              "Id": 2,
              "FuelGradeId": 2,
              "Height": 2400,
              "CriticalHighProductAlarmHeight": 2350,
              "HighProductAlarmHeight": 2200,
              "LowProductAlarmHeight": 300,
              "CriticalLowProductAlarmHeight": 150,
              "HighWaterAlarmHeight": 50,
              "CriticalHighWaterAlarmHeight": 100,
              "HighTemperatureAlarm": 45.0,
              "LowTemperatureAlarm": 5.0,
              "Capacity": 20000,
              "Diameter": 2400,
              "Name": "Tanque 2 - V-Power"
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/tanks` — Actualizar configuracion de tanques

**Request body:**
```json
{
  "Tanks": [
    {
      "Id": 1,
      "FuelGradeId": 1,
      "Height": 2400,
      "CriticalHighProductAlarmHeight": 2350,
      "HighProductAlarmHeight": 2200,
      "LowProductAlarmHeight": 300,
      "CriticalLowProductAlarmHeight": 150,
      "HighWaterAlarmHeight": 50,
      "CriticalHighWaterAlarmHeight": 100,
      "HighTemperatureAlarm": 45.0,
      "LowTemperatureAlarm": 5.0,
      "Capacity": 20000,
      "Diameter": 2400,
      "Name": "Tanque 1 - Regular"
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetTanksConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

## 9. Modulo 5 — Configuracion del Sistema

**Ruta:** `/dashboard/dispensers/system`

---

### `GET /api/dispensers/system/info` — Informacion del sistema

Retorna multiples valores del sistema en un solo request (6 packets).

**Sin body.**

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "BatteryVoltage",
        "Data": {
          "Voltage": 12450
        },
        "Message": null
      },
      {
        "Id": 2,
        "Type": "CpuTemperature",
        "Data": {
          "Temperature": 52
        },
        "Message": null
      },
      {
        "Id": 3,
        "Type": "FirmwareInformation",
        "Data": {
          "DateTime": "2025-11-15T00:00:00",
          "PumpProtocols": ["Tokheim", "Bennett", "Gilbarco"],
          "ProbeProtocols": ["VEGA", "Veeder-Root"],
          "PriceBoardProtocols": ["RS485", "Modbus"],
          "ReaderProtocols": ["EM4100", "Mifare"]
        },
        "Message": null
      },
      {
        "Id": 4,
        "Type": "UniqueIdentifier",
        "Data": {
          "Id": "PTS2-2024-0042-ISLA"
        },
        "Message": null
      },
      {
        "Id": 5,
        "Type": "ConfigurationIdentifier",
        "Data": {
          "Id": "CFG-20260101-001"
        },
        "Message": null
      },
      {
        "Id": 6,
        "Type": "MeasurementUnits",
        "Data": {
          "Volume": "L",
          "Temperature": "C"
        },
        "Message": null
      }
    ]
  }
}
```

**Campos clave:**

| Packet | Campo | Descripcion |
|--------|-------|-------------|
| `BatteryVoltage` | `Voltage` | Voltage en milivolts (dividir entre 1000 para volts) |
| `CpuTemperature` | `Temperature` | Temperatura del CPU en °C |
| `FirmwareInformation` | `DateTime` | Fecha de compilacion del firmware |
| `UniqueIdentifier` | `Id` | ID unico del controlador PTS |
| `ConfigurationIdentifier` | `Id` | ID de la configuracion activa |
| `MeasurementUnits` | `Volume`, `Temperature` | Unidades de medida del sistema |

---

### `GET /api/dispensers/system/datetime` — Fecha y hora del sistema

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetDateTime",
        "Data": {
          "DateTime": "2026-04-12T10:30:00",
          "AutoSynchronize": true,
          "UTCOffset": -4
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/system/datetime` — Configurar fecha y hora

**Request body:**
```json
{
  "DateTime": "2026-04-12T10:30:00",
  "AutoSynchronize": true,
  "UTCOffset": -4
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `DateTime` | string | Fecha y hora en formato ISO 8601 |
| `AutoSynchronize` | bool | Sincronizacion automatica con NTP |
| `UTCOffset` | int | Offset UTC (ej. `-4` para Santo Domingo) |

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetDateTimeConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/system/restart` — Reiniciar controlador PTS

**Sin body.** Reinicia el controlador PTS-2. La conexion se perdera por ~60 segundos.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "RestartConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

> **Advertencia UI:** Mostrar dialogo de confirmacion antes de ejecutar. Informar al
> usuario que el sistema estara offline por ~60 segundos.

---

### `GET /api/dispensers/system/gps` — Datos GPS

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetGpsData",
        "Data": {
          "Status": "Active",
          "DateTime": "2026-04-12T14:30:00Z",
          "Latitude": 18.4861,
          "NorthSouthIndicator": "N",
          "Longitude": 69.9312,
          "EastWestIndicator": "W",
          "SpeedOverGround": 0.0,
          "CourseOverGround": 0.0,
          "Mode": "Autonomous"
        },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/users` — Usuarios del PTS

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetUsersConfiguration",
        "Data": {
          "Users": [
            {
              "Id": 1,
              "Login": "admin",
              "Permissions": {
                "Configuration": true,
                "Control": true,
                "Monitoring": true
              }
            },
            {
              "Id": 2,
              "Login": "operador",
              "Permissions": {
                "Configuration": false,
                "Control": true,
                "Monitoring": true
              }
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/users` — Actualizar usuarios del PTS

**Request body:**
```json
{
  "Users": [
    {
      "Id": 1,
      "Login": "admin",
      "Permissions": {
        "Configuration": true,
        "Control": true,
        "Monitoring": true
      }
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetUsersConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/network` — Configuracion de red del PTS

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetPtsNetworkSettings",
        "Data": {
          "IpAddress": "192.168.125.55",
          "NetMask": "255.255.255.0",
          "Gateway": "192.168.125.1",
          "HttpPort": 80,
          "HttpsPort": 443
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/network` — Actualizar configuracion de red

**Request body:**
```json
{
  "IpAddress": "192.168.125.55",
  "NetMask": "255.255.255.0",
  "Gateway": "192.168.125.1",
  "HttpPort": 80,
  "HttpsPort": 443
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetPtsNetworkSettingsConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/decimal-digits` — Digitos decimales del sistema

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetSystemDecimalDigits",
        "Data": {
          "Price": 2,
          "Amount": 2,
          "Volume": 3,
          "AmountTotal": 2,
          "VolumeTotal": 3
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/decimal-digits` — Actualizar digitos decimales

**Request body:**
```json
{
  "Price": 2,
  "Amount": 2,
  "Volume": 3,
  "AmountTotal": 2,
  "VolumeTotal": 3
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetSystemDecimalDigitsConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

## 10. Modulo 6 — Configuracion de Hardware

**Ruta:** `/dashboard/dispensers/hardware`

---

### `GET /api/dispensers/config/pumps` — Configuracion de bombas

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetPumpsConfiguration",
        "Data": {
          "Ports": [
            {
              "Id": 1,
              "Protocol": "Tokheim",
              "BaudRate": 9600
            },
            {
              "Id": 2,
              "Protocol": "Bennett",
              "BaudRate": 9600
            }
          ],
          "Pumps": [
            {
              "Id": 1,
              "Address": 1,
              "Port": 1,
              "FuelGradeIds": [1, 2],
              "LockByDefault": false,
              "SlowFlowRate": 5.0,
              "Tag": "",
              "AuthorizationRequired": true,
              "PriceControl": true
            },
            {
              "Id": 2,
              "Address": 2,
              "Port": 1,
              "FuelGradeIds": [1, 2],
              "LockByDefault": false,
              "SlowFlowRate": 5.0,
              "Tag": "",
              "AuthorizationRequired": true,
              "PriceControl": true
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

**Campos de `Pumps`:**

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `Id` | int | ID logico de la bomba (1-18) |
| `Address` | int | Direccion fisica en el bus RS-485 |
| `Port` | int | Puerto serie al que esta conectada |
| `FuelGradeIds` | int[] | Grados de combustible que puede dispensar |
| `LockByDefault` | bool | Si se bloquea automaticamente al iniciar |
| `SlowFlowRate` | number | Caudal de flujo lento en L/min |
| `Tag` | string | Tag RFID asignado a la bomba |
| `AuthorizationRequired` | bool | Si requiere autorizacion previa |
| `PriceControl` | bool | Si el sistema controla los precios |

---

### `PUT /api/dispensers/config/pumps` — Actualizar configuracion de bombas

**Request body:** Misma estructura que el response de GET.

```json
{
  "Ports": [
    { "Id": 1, "Protocol": "Tokheim", "BaudRate": 9600 }
  ],
  "Pumps": [
    {
      "Id": 1,
      "Address": 1,
      "Port": 1,
      "FuelGradeIds": [1, 2],
      "LockByDefault": false,
      "SlowFlowRate": 5.0,
      "Tag": "",
      "AuthorizationRequired": true,
      "PriceControl": true
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetPumpsConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/nozzles` — Configuracion de pistolas

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetPumpNozzlesConfiguration",
        "Data": {
          "PumpNozzles": [
            {
              "PumpId": 1,
              "FuelGradeIds": [1, 2],
              "TankIds": [1, 2]
            },
            {
              "PumpId": 2,
              "FuelGradeIds": [1, 2],
              "TankIds": [1, 2]
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/nozzles` — Actualizar configuracion de pistolas

**Request body:**
```json
{
  "PumpNozzles": [
    {
      "PumpId": 1,
      "FuelGradeIds": [1, 2],
      "TankIds": [1, 2]
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetPumpNozzlesConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/fuel-grades` — Configuracion de grados de combustible

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetFuelGradesConfiguration",
        "Data": {
          "FuelGrades": [
            {
              "Id": 1,
              "Name": "GASOLINA REGULAR",
              "Price": 295.00,
              "ExpansionCoefficient": 0.00099
            },
            {
              "Id": 2,
              "Name": "GASOLINA V-POWER",
              "Price": 320.00,
              "ExpansionCoefficient": 0.00099
            },
            {
              "Id": 3,
              "Name": "DIESEL REGULAR",
              "Price": 215.00,
              "ExpansionCoefficient": 0.00085
            },
            {
              "Id": 4,
              "Name": "DIESEL V-POWER",
              "Price": 240.00,
              "ExpansionCoefficient": 0.00085
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/fuel-grades` — Actualizar grados de combustible

**Request body:**
```json
{
  "FuelGrades": [
    {
      "Id": 1,
      "Name": "GASOLINA REGULAR",
      "Price": 298.00,
      "ExpansionCoefficient": 0.00099
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetFuelGradesConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/probes` — Configuracion de sondas

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetProbesConfiguration",
        "Data": {
          "Probes": [
            {
              "Id": 1,
              "TankId": 1,
              "Protocol": "VEGA",
              "Port": 1,
              "Address": 1,
              "Enabled": true
            },
            {
              "Id": 2,
              "TankId": 2,
              "Protocol": "VEGA",
              "Port": 1,
              "Address": 2,
              "Enabled": true
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/probes` — Actualizar configuracion de sondas

**Request body:**
```json
{
  "Probes": [
    {
      "Id": 1,
      "TankId": 1,
      "Protocol": "VEGA",
      "Port": 1,
      "Address": 1,
      "Enabled": true
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetProbesConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/readers` — Configuracion de lectores RFID

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetReadersConfiguration",
        "Data": {
          "Readers": [
            {
              "Id": 1,
              "Protocol": "EM4100",
              "Port": 2,
              "Address": 1,
              "PumpIds": [1, 2, 3],
              "Enabled": true
            },
            {
              "Id": 2,
              "Protocol": "Mifare",
              "Port": 2,
              "Address": 2,
              "PumpIds": [4, 5, 6],
              "Enabled": true
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/readers` — Actualizar configuracion de lectores

**Request body:**
```json
{
  "Readers": [
    {
      "Id": 1,
      "Protocol": "EM4100",
      "Port": 2,
      "Address": 1,
      "PumpIds": [1, 2, 3],
      "Enabled": true
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetReadersConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/config/price-boards` — Configuracion de paneles de precios

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetPriceBoardsConfiguration",
        "Data": {
          "PriceBoards": [
            {
              "Id": 1,
              "Protocol": "RS485",
              "Port": 3,
              "Address": 1,
              "FuelGradeId": 1,
              "Enabled": true
            },
            {
              "Id": 2,
              "Protocol": "RS485",
              "Port": 3,
              "Address": 2,
              "FuelGradeId": 2,
              "Enabled": true
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `PUT /api/dispensers/config/price-boards` — Actualizar paneles de precios

**Request body:**
```json
{
  "PriceBoards": [
    {
      "Id": 1,
      "Protocol": "RS485",
      "Port": 3,
      "Address": 1,
      "FuelGradeId": 1,
      "Enabled": true
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetPriceBoardsConfigurationConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

## 11. Modulo 7 — Tags RFID

**Ruta:** `/dashboard/dispensers/tags`

---

### `GET /api/dispensers/tags` — Lista de tags RFID

Retorna todos los tags RFID configurados en el sistema.

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetTagsList",
        "Data": {
          "Tags": [
            {
              "Tag": "A1B2C3D4",
              "Name": "Vehiculo Empresa 001",
              "Valid": true,
              "Present": false
            },
            {
              "Tag": "E5F6G7H8",
              "Name": "Vehiculo Empresa 002",
              "Valid": true,
              "Present": false
            },
            {
              "Tag": "I9J0K1L2",
              "Name": "Tag Bloqueado",
              "Valid": false,
              "Present": false
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

**Campos de `TagInformation`:**

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `Tag` | string | ID del tag RFID (hexadecimal) |
| `Name` | string | Nombre descriptivo del tag |
| `Valid` | bool | Si el tag esta autorizado |
| `Present` | bool | Si el tag esta actualmente en un lector |

---

### `GET /api/dispensers/tags/count` — Numero total de tags

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetTagsTotalNumber",
        "Data": {
          "TotalNumber": 247
        },
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/tags/{tagId}` — Informacion de un tag especifico

**Parametros de ruta:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tagId` | string | ID del tag RFID (ej. `A1B2C3D4`) |

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "GetTagInformation",
        "Data": {
          "Tag": "A1B2C3D4",
          "Name": "Vehiculo Empresa 001",
          "Valid": true,
          "Present": false
        },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/tags` — Reemplazar lista de tags

**Reemplaza completamente** la lista de tags con los tags provistos. Usar con precaucion.

**Request body:**
```json
{
  "Tags": [
    {
      "Tag": "A1B2C3D4",
      "Name": "Vehiculo Empresa 001",
      "Valid": true
    },
    {
      "Tag": "E5F6G7H8",
      "Name": "Vehiculo Empresa 002",
      "Valid": true
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "SetTagsListConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/tags/add` — Agregar tags a la lista

**Agrega** los tags provistos a la lista existente (no reemplaza).

**Request body:**
```json
{
  "Tags": [
    {
      "Tag": "M3N4O5P6",
      "Name": "Vehiculo Nuevo 003",
      "Valid": true
    }
  ]
}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "AddTagsToListConfirmation",
        "Data": null,
        "Message": null
      }
    ]
  }
}
```

---

### `GET /api/dispensers/readers/{reader}/tag` — Leer tag del lector RFID

Lee el tag que actualmente esta presente en el lector especificado.

**Parametros de ruta:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `reader` | int | Numero de lector RFID (1-N) |

**Response (tag presente):**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "ReaderGetTag",
        "Data": {
          "Reader": 1,
          "Tag": "A1B2C3D4"
        },
        "Message": null
      }
    ]
  }
}
```

**Response (sin tag):**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "ReaderGetTag",
        "Data": {
          "Reader": 1,
          "Tag": ""
        },
        "Message": null
      }
    ]
  }
}
```

---

## 12. Modulo 8 — Reportes

**Ruta:** `/dashboard/dispensers/reports`

Todos los reportes soportan `GET` (sin filtro de fechas) y `POST` (con filtro de fechas).

---

### `GET /api/dispensers/reports/pump-transactions` — Reporte de transacciones

Retorna todas las transacciones del PTS (sin filtro de fecha).

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "ReportGetPumpTransactions",
        "Data": {
          "Transactions": [
            {
              "Pump": 1,
              "Nozzle": 1,
              "FuelGradeId": 1,
              "FuelGradeName": "GASOLINA REGULAR",
              "Volume": 12.543,
              "Price": 295.00,
              "Amount": 3700.19,
              "Transaction": 4821,
              "DateTime": "2026-04-12T08:16:23",
              "DateTimeStart": "2026-04-12T08:15:00",
              "Tag": "A1B2C3D4",
              "User": 633,
              "TotalVolume": 98432.11,
              "TotalAmount": 29037452.00
            },
            {
              "Pump": 2,
              "Nozzle": 1,
              "FuelGradeId": 1,
              "FuelGradeName": "GASOLINA REGULAR",
              "Volume": 30.000,
              "Price": 295.00,
              "Amount": 8850.00,
              "Transaction": 4822,
              "DateTime": "2026-04-12T09:45:00",
              "DateTimeStart": "2026-04-12T09:30:00",
              "Tag": "",
              "User": 0,
              "TotalVolume": 55432.00,
              "TotalAmount": 16352340.00
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/reports/pump-transactions` — Reporte con filtro de fechas

**Request body:**
```json
{
  "StartDateTime": "2026-04-01T00:00:00",
  "EndDateTime": "2026-04-12T23:59:59"
}
```

**Response:** Misma estructura que el GET pero filtrada por rango de fechas.

---

### `GET /api/dispensers/reports/tank-measurements` — Reporte de mediciones de tanque

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "ReportGetTankMeasurements",
        "Data": {
          "Measurements": [
            {
              "Probe": 1,
              "DateTime": "2026-04-12T06:00:00",
              "ProductHeight": 1852.4,
              "ProductVolume": 18524.3,
              "WaterHeight": 12.1,
              "Temperature": 28.5
            },
            {
              "Probe": 1,
              "DateTime": "2026-04-12T07:00:00",
              "ProductHeight": 1840.2,
              "ProductVolume": 18250.1,
              "WaterHeight": 12.2,
              "Temperature": 29.1
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/reports/tank-measurements` — Con filtro de fechas

**Request body:**
```json
{
  "StartDateTime": "2026-04-12T00:00:00",
  "EndDateTime": "2026-04-12T23:59:59"
}
```

---

### `GET /api/dispensers/reports/in-tank-deliveries` — Reporte de entregas en tanque

**Response:**
```json
{
  "successful": true,
  "data": {
    "Protocol": "jsonPTS",
    "Packets": [
      {
        "Id": 1,
        "Type": "ReportGetInTankDeliveries",
        "Data": {
          "Deliveries": [
            {
              "Tank": 1,
              "DateTime": "2026-04-10T14:30:00",
              "StartVolume": 8500.0,
              "EndVolume": 18500.0,
              "DeliveredVolume": 10000.0,
              "FuelGradeId": 1,
              "FuelGradeName": "GASOLINA REGULAR"
            }
          ]
        },
        "Message": null
      }
    ]
  }
}
```

---

### `POST /api/dispensers/reports/in-tank-deliveries` — Con filtro de fechas

**Request body:**
```json
{
  "StartDateTime": "2026-04-01T00:00:00",
  "EndDateTime": "2026-04-12T23:59:59"
}
```

---

## 13. Modulo 9 — Historial de Transacciones

**Ruta:** `/dashboard/dispensers/transactions`

Este modulo usa el historial de la base de datos del backend (no el PTS directamente).
Las transacciones son guardadas automaticamente por el backend cuando el PTS reporta
un `PumpEndOfTransactionStatus`.

---

### `GET /api/fuel-transactions` — Historial paginado

**Query params:**

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `pump` | int | - | Filtrar por bomba |
| `nozzle` | int | - | Filtrar por pistola |
| `fuelGradeId` | int | - | Filtrar por grado de combustible |
| `startDate` | DateTime | - | Fecha inicio (ISO 8601) |
| `endDate` | DateTime | - | Fecha fin (ISO 8601) |
| `page` | int | `1` | Pagina actual |
| `limit` | int | `20` | Items por pagina (max 200) |
| `sortBy` | string | `"transaction_date"` | Campo de ordenamiento |
| `sortOrder` | string | `"desc"` | `"asc"` o `"desc"` |

**Ejemplo de uso:**
```
GET /api/fuel-transactions?pump=1&fuelGradeId=1&startDate=2026-04-01&endDate=2026-04-12&page=1&limit=50
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "data": [
      {
        "transactionId": 15421,
        "pump": 1,
        "nozzle": 1,
        "hardwareTransactionId": 4821,
        "volume": 12.543,
        "amount": 3700.19,
        "price": 295.00,
        "totalVolume": 98432.11,
        "totalAmount": 29037452.00,
        "transactionDate": "2026-04-12T08:16:23Z",
        "transactionDateStart": "2026-04-12T08:15:00Z",
        "tag": "A1B2C3D4",
        "ptsId": "PTS2-2024-0042-ISLA",
        "fuelGradeId": 1,
        "fuelGradeName": "GASOLINA REGULAR",
        "tank": 1,
        "userId": 633,
        "tcVolume": 12.530,
        "flowRate": 45.2,
        "isOffline": false,
        "pumpTransactionsUploaded": 4821,
        "pumpTransactionsTotal": 5000,
        "configurationId": "CFG-20260101-001",
        "createdAt": "2026-04-12T08:16:25Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 4821,
      "totalPages": 97,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Campos de la transaccion:**

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `transactionId` | int | ID interno del registro en BD |
| `pump` | int | Numero de bomba |
| `nozzle` | int | Numero de pistola |
| `hardwareTransactionId` | int | ID de transaccion del PTS hardware |
| `volume` | decimal | Volumen dispensado en litros |
| `amount` | decimal | Monto total en RD$ |
| `price` | decimal | Precio por litro |
| `totalVolume` | decimal | Acumulado total de volumen del pump |
| `totalAmount` | decimal | Acumulado total de monto del pump |
| `transactionDate` | DateTime | Fin de la transaccion (UTC) |
| `transactionDateStart` | DateTime | Inicio de la transaccion (UTC) |
| `tag` | string | Tag RFID usado (vacio si no hay) |
| `ptsId` | string | ID unico del controlador PTS |
| `fuelGradeId` | int | ID del grado de combustible |
| `fuelGradeName` | string | Nombre del grado de combustible |
| `tank` | int | ID del tanque fuente |
| `userId` | int | ID del usuario que autorizo |
| `tcVolume` | decimal | Volumen compensado por temperatura |
| `flowRate` | decimal | Caudal promedio en L/min |
| `isOffline` | bool | Si fue procesada en modo offline |
| `configurationId` | string | ID de configuracion del PTS al momento |
| `createdAt` | DateTime | Timestamp de creacion en BD |

---

### `GET /api/fuel-transactions/{id}` — Transaccion por ID

**Response:** Mismo objeto de transaccion que el array del listado.

```json
{
  "successful": true,
  "data": {
    "transactionId": 15421,
    "pump": 1,
    "nozzle": 1,
    "hardwareTransactionId": 4821,
    "volume": 12.543,
    "amount": 3700.19,
    "price": 295.00,
    "totalVolume": 98432.11,
    "totalAmount": 29037452.00,
    "transactionDate": "2026-04-12T08:16:23Z",
    "transactionDateStart": "2026-04-12T08:15:00Z",
    "tag": "A1B2C3D4",
    "ptsId": "PTS2-2024-0042-ISLA",
    "fuelGradeId": 1,
    "fuelGradeName": "GASOLINA REGULAR",
    "tank": 1,
    "userId": 633,
    "tcVolume": 12.530,
    "flowRate": 45.2,
    "isOffline": false,
    "pumpTransactionsUploaded": 4821,
    "pumpTransactionsTotal": 5000,
    "configurationId": "CFG-20260101-001",
    "createdAt": "2026-04-12T08:16:25Z"
  }
}
```

**Error 404:**
```json
{
  "successful": false,
  "error": "Fuel transaction 99999 no encontrado"
}
```

---

### `PUT /api/fuel-transactions/{id}` — Actualizar transaccion

Solo permite actualizar `Tag` y `PtsId` de una transaccion existente.

**Request body:**
```json
{
  "Tag": "NUEVO-TAG-001",
  "PtsId": "PTS2-2024-0042-ISLA"
}
```

**Response:** Objeto de transaccion actualizado.

---

### `DELETE /api/fuel-transactions/{id}` — Eliminar transaccion

**Response:**
```json
{
  "successful": true,
  "message": "Fuel transaction 15421 deleted"
}
```

---

## 14. Endpoint Raw (Avanzado)

### `POST /api/dispensers/raw` — Envio de paquetes raw al PTS

Permite enviar cualquier combinacion de paquetes jsonPTS directamente al controlador.
Usar solo para debugging o comandos no cubiertos por los endpoints dedicados.

**Request body:**
```json
{
  "Packets": [
    {
      "Id": 1,
      "Type": "PumpGetStatus",
      "Data": { "Pump": 1 }
    },
    {
      "Id": 2,
      "Type": "PumpGetPrices",
      "Data": { "Pump": 1 }
    }
  ]
}
```

**Response:** La respuesta raw del PTS con un packet por cada comando enviado.

---

## 15. Guia de Polling y Manejo de Errores

### Estrategia de Polling

```typescript
// Monitor de Dispensadoras — polling cada 2 segundos
const POLL_INTERVAL_MS = 2000;

const startPolling = () => {
  return setInterval(async () => {
    try {
      const response = await fetch('/api/dispensers/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.successful) {
        updatePumpGrid(result.data.Packets);
      }
    } catch (err) {
      console.error('Polling error:', err);
      // No detener el polling por errores transientes
    }
  }, POLL_INTERVAL_MS);
};

// Limpiar al desmontar el componente
const pollRef = startPolling();
onUnmount(() => clearInterval(pollRef));
```

### Logica de Color por Estado

```typescript
const getPumpColor = (packet: PtsPacket): string => {
  switch (packet.Type) {
    case 'PumpFillingStatus':
      return 'orange';   // Dispensando

    case 'PumpIdleStatus':
      if (packet.Data.Request === 'PumpLock') return 'red'; // Bloqueada
      return 'green';    // Libre

    case 'PumpOfflineStatus':
      return 'grey';     // Sin comunicacion

    case 'PumpEndOfTransactionStatus':
      return 'blue';     // Fin de transaccion (estado transiente)

    default:
      return 'grey';
  }
};
```

### Manejo de Errores

```typescript
interface ApiResponse<T> {
  successful: boolean;
  data?: T;
  error?: string;
}

const callDispenser = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.successful) {
    throw new Error(result.error ?? 'Error desconocido del controlador PTS');
  }

  return result.data!;
};
```

### Verificar Errores en Packets Individuales

Cuando se hacen operaciones bulk (lock-all, unlock-all, o status de todas las bombas),
verificar `Message` en cada packet individual:

```typescript
const checkPacketErrors = (packets: PtsPacket[]) => {
  const errors = packets
    .filter(p => p.Message && p.Type?.includes('Error'))
    .map(p => `Bomba ${p.Id}: ${p.Message}`);

  if (errors.length > 0) {
    console.warn('Errores en algunos pumps:', errors);
  }
};
```

### Valores de `configType` para `GET/PUT /api/dispensers/config/{configType}`

| `configType` | Descripcion |
|--------------|-------------|
| `pumps` | Configuracion de puertos y bombas |
| `nozzles` | Configuracion de pistolas por bomba |
| `fuel-grades` | Grados de combustible (nombre, precio, coeficiente) |
| `fuel-prices` | Precios globales por grado |
| `prices-scheduler` | Programador de cambios de precio |
| `tanks` | Configuracion de tanques |
| `probes` | Configuracion de sondas ATG |
| `readers` | Configuracion de lectores RFID |
| `price-boards` | Configuracion de paneles de precios digitales |
| `users` | Usuarios y permisos del PTS |
| `network` | Configuracion de red IP del PTS |
| `decimal-digits` | Decimales para precio, volumen y monto |

### Valores de `reportType` para `GET/POST /api/dispensers/reports/{reportType}`

| `reportType` | Descripcion |
|--------------|-------------|
| `pump-transactions` | Transacciones de bombas |
| `tank-measurements` | Mediciones de nivel en tanques |
| `in-tank-deliveries` | Entregas/recargas de combustible |

---

*Documento generado el 2026-04-12. Para actualizaciones contactar al equipo de backend.*
