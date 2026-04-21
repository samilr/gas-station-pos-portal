# Fuel Islands — Guía de integración para Frontend

Documento de referencia para implementar las pantallas/componentes que consumen los endpoints de `/api/fuel-islands`. Todos los requests/responses están verificados contra la API corriendo localmente.

---

## Conceptos

- **Fuel island** (isleta): estación física de despacho. Agrupa 0..N `dispenser`s.
- **Dispenser**: cada cara/surtidora de una isleta (con sus nozzles).
- **Terminal**: POS que maneja el cobro. **La asociación terminal ↔ isleta vive en el terminal** (`terminal.fuel_island_id`), no en la isleta.

**Dirección de las relaciones:**

```
fuel_island (isleta)
   ├── dispensers[]     ← dispenser.fuel_island_id apunta acá
   └── terminals[]      ← terminal.fuel_island_id apunta acá (N terminales → 1 isleta)
```

**Reglas:**
- Un dispenser pertenece **a lo sumo a UNA** fuel island (o a ninguna → "unassigned").
- **1:1 terminal ↔ fuel island**: un terminal apunta a una isleta; una isleta es servida por **a lo sumo UN** terminal.
- Asignar una isleta ya ocupada por otro terminal → **error 409** con mensaje "La fuel island X ya está asignada al terminal Y (nombre). Libérala primero."
- Asignar un dispenser a una isleta B cuando ya estaba en A → se mueve automáticamente (A puede quedar vacía).
- Una isleta puede existir sin dispensers y sin terminal (válido).

---

## Autenticación

Todos los endpoints requieren `Authorization: Bearer <jwt>`. Obtener con `POST /api/auth/login`:

```http
POST /api/auth/login
Content-Type: application/json

{ "username": "633", "password": "0313" }
```

Respuesta: el campo `data.accessToken` es lo que va en header `Authorization` de requests siguientes.

---

## Pantalla "Gestión de Fuel Islands"

### 1. Listar fuel islands

```http
GET /api/fuel-islands?siteId=CO-0017
Authorization: Bearer <token>
```

**Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `siteId` | string? | Filtra por sitio |

#### Response 200

```json
{
  "successful": true,
  "data": [
    {
      "fuelIslandId": 1,
      "siteId": "CO-0017",
      "name": "ISLETA-A",
      "active": true,
      "dispensers": [
        {
          "dispenserId": 1, "pumpNumber": 1, "nozzlesCount": 4,
          "name": "Cara Norte", "active": true, "fuelIslandId": 1,
          "connectionType": "TCP", "timeoutMs": 5000
        }
      ],
      "terminals": [
        { "siteId": "CO-0017", "terminalId": 202, "name": "TERMINAL 202 PISTA", "active": true }
      ]
      // terminals[] tiene a lo sumo 1 elemento (relación 1:1)
    }
  ]
}
```

**UI:** Cards con nombre, badge "Inactiva" si `active=false`, sublista de dispensers como chips, sublista de terminales asignados, y botones editar/eliminar/agregar dispensers.

---

### 2. Obtener una fuel island por ID

```http
GET /api/fuel-islands/1
Authorization: Bearer <token>
```

Mismo shape que un elemento del listado.

#### Response 404
```json
{ "successful": false, "error": "Fuel island 1 no encontrada" }
```

---

### 3. Listar dispensers sin asignar (para multi-select)

```http
GET /api/fuel-islands/unassigned-dispensers?siteId=CO-0017
Authorization: Bearer <token>
```

#### Response 200
```json
{
  "successful": true,
  "data": [
    { "dispenserId": 1, "pumpNumber": 1, "name": "Cara Norte", "fuelIslandId": null, "...": "..." }
  ]
}
```

Usar al abrir el modal "Asignar dispensers".

---

### 4. Crear fuel island

```http
POST /api/fuel-islands
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": "CO-0017",
  "name": "ISLETA-A",
  "dispenserIds": [1, 2]
}
```

**Fields:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `siteId` | string | sí | ID del sitio |
| `name` | string (≤40) | sí | Nombre único por sitio |
| `dispenserIds` | int[]? | no | Dispensers a vincular al crear (si alguno ya estaba en otra isleta, se mueve) |

> **No hay `terminalId` acá.** Los terminales se asignan desde la pantalla de terminales, no desde acá.

#### Response 200
```json
{
  "successful": true,
  "data": {
    "fuelIslandId": 1, "siteId": "CO-0017", "name": "ISLETA-A",
    "active": true, "createdAt": "2026-04-21T00:33:41Z", "updatedAt": null
  }
}
```

#### Response 400 — Duplicado
```json
{ "successful": false, "error": "Ya existe una fuel island con site=CO-0017 name=ISLETA-A" }
```

---

### 5. Actualizar fuel island

```http
PUT /api/fuel-islands/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ISLETA-A-RENOMBRADA",
  "active": true
}
```

**Fields (todos opcionales):**

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string? | Nuevo nombre |
| `active` | bool? | Activar/desactivar |

---

### 6. Eliminar fuel island

```http
DELETE /api/fuel-islands/1
Authorization: Bearer <token>
```

- Desvincula dispensers (quedan sin asignar, NO se borran).
- Terminales que apuntaban se quedan con `fuelIslandId = null` (por `ON DELETE SET NULL`).

#### Response 200
```json
{ "successful": true, "data": "Fuel island eliminada correctamente" }
```

**UI:** Diálogo de confirmación:
> "¿Eliminar ISLETA-A? Sus 2 dispensers quedarán sin asignar y el terminal 202 quedará sin isleta. No se borra nada."

---

### 7. Asignar dispensers a una fuel island

```http
POST /api/fuel-islands/1/dispensers
Authorization: Bearer <token>
Content-Type: application/json

{ "dispenserIds": [1, 2] }
```

Si algún dispenser ya estaba en otra isleta se mueve automáticamente.

#### Response 200
```json
{ "successful": true, "data": "2 dispenser(s) asignado(s) a la fuel island 1" }
```

---

### 8. Desasignar un dispenser

```http
DELETE /api/fuel-islands/1/dispensers/2
Authorization: Bearer <token>
```

#### Response 200
```json
{ "successful": true, "data": "Dispenser 2 removido de la fuel island 1" }
```

---

## Pantalla "Gestión de Terminales" — asignar a una fuel island

Los terminales se asignan a una isleta **desde su propia pantalla de edición**, no desde la pantalla de isletas.

### Flag de integración `fuelIslandEnabled`

Independiente del vínculo. Cuando `fuelIslandEnabled = false`, el POS **ignora** la isleta asignada y cae a flujo manual — útil para hacer bypass si la integración falla sin tener que desvincular la isleta.

**Matriz de comportamiento para el POS:**

| `fuelIslandId` | `fuelIslandEnabled` | El POS debe… |
|---|---|---|
| `null` | cualquier | Flujo manual (nunca hubo isleta) |
| `1` | `false` | Flujo manual (bypass temporal) |
| `1` | `true` | Flujo automático con la isleta 1 |

### Asignar/cambiar isleta de un terminal

```http
PUT /api/terminals/{siteId}/{terminalId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "TERMINAL 202 PISTA",
  "fuelIslandId": 1,
  "fuelIslandEnabled": true
}
```

#### Response 409 — isleta ya ocupada

```json
{
  "successful": false,
  "error": "La fuel island 1 ya está asignada al terminal 202 (TERMINAL 202 PISTA). Libérala primero."
}
```

**UI:** Mostrar el mensaje tal cual al cajero. El frontend puede ofrecer un botón "Liberar del terminal 202" que llame `PUT /api/terminals/CO-0017/202` con `unassignFuelIsland: true` antes de reintentar.

### Desasignar la isleta del terminal

```http
PUT /api/terminals/{siteId}/{terminalId}
Content-Type: application/json

{
  "name": "TERMINAL 202 PISTA",
  "unassignFuelIsland": true
}
```

### Bypass temporal (desactivar integración sin desvincular)

```http
PUT /api/terminals/{siteId}/{terminalId}
Content-Type: application/json

{
  "name": "TERMINAL 202 PISTA",
  "fuelIslandEnabled": false
}
```

La isleta queda asignada (`fuelIslandId` no cambia), pero el POS trata al terminal como manual. Para reactivar, enviar `"fuelIslandEnabled": true`.

**Tri-estado del `fuelIslandId`:**

| Caso | `fuelIslandId` | `unassignFuelIsland` | Resultado |
|---|---|---|---|
| No cambiar | omitir o `null` | `false` (default) | No cambia |
| Asignar | `1` | `false` | Queda apuntando a isleta 1 |
| Desasignar | cualquier | `true` | Queda con `fuelIslandId = null` |

### Crear terminal con isleta asignada

```http
POST /api/terminals
Content-Type: application/json

{
  "siteId": "CO-0017",
  "terminalId": 205,
  "name": "TERMINAL 205",
  "fuelIslandId": 1
}
```

### Leer terminal (incluye `fuelIslandId`)

```http
GET /api/terminals/CO-0017/202
```

```json
{
  "successful": true,
  "data": {
    "siteId": "CO-0017", "terminalId": 202, "name": "TERMINAL 202 PISTA",
    "fuelIslandId": 1,
    "dataphoneEnabled": true,
    "...": "resto de campos"
  }
}
```

---

## Tipos TypeScript sugeridos

```ts
type FuelIsland = {
  fuelIslandId: number;
  siteId: string;
  name: string;
  active: boolean;
  dispensers?: Dispenser[];                  // presente en GET
  terminals?: FuelIslandTerminalSummary[];   // presente en GET
  createdAt?: string;
  updatedAt?: string | null;
};

type FuelIslandTerminalSummary = {
  siteId: string;
  terminalId: number;
  name: string;
  active: boolean;
};

type Dispenser = {
  dispenserId: number;
  siteId: string;
  pumpNumber: number;
  nozzlesCount: number;
  name: string | null;
  active: boolean;
  fuelIslandId: number | null;
  // ...
};

type Terminal = {
  siteId: string;
  terminalId: number;
  name: string;
  fuelIslandId: number | null;
  fuelIslandEnabled: boolean;   // flag de bypass — si false, el POS ignora la isleta
  dataphoneEnabled: boolean;
  // Nota: los campos hasIntegratedDispenser y linkedDispenserId fueron removidos.
  // Los dispensers del terminal se derivan ahora de su fuel_island.
  // ...
};

type CreateFuelIslandBody = {
  siteId: string;
  name: string;
  dispenserIds?: number[];
};

type UpdateFuelIslandBody = {
  name?: string;
  active?: boolean;
};

type AssignDispensersBody = {
  dispenserIds: number[];
};

type UpdateTerminalBody = {
  name: string;
  // ... otros campos de terminal
  fuelIslandId?: number | null;
  unassignFuelIsland?: boolean;
  fuelIslandEnabled?: boolean;
};
```

---

## Flujos de UI recomendados

### Pantalla "Fuel Islands"

1. Lista (`GET /api/fuel-islands?siteId=...`) con cards. Cada card muestra:
   - Nombre, badge activa/inactiva
   - Chips de dispensers (con botón X para desasignar)
   - Lista de terminales asignados (solo lectura — "Para cambiar, ir a pantalla de terminales")
   - Botones: Editar, Eliminar, + Agregar dispensers
2. Modal "+ Nueva isleta" → campos `siteId`, `name`, multi-select de dispensers sin asignar.
3. Modal "Editar" → campos `name`, `active`.
4. Modal "Agregar dispensers" → multi-select de `unassigned-dispensers` + opcional mostrar dispensers de otras isletas con indicador "(actualmente en ISLETA-B)".

### Pantalla "Terminales" (form de edición)

- Selector "Fuel Island" tipo dropdown con opciones:
  - "— Sin asignar —"
  - Cada isleta del sitio (obtenida de `GET /api/fuel-islands?siteId=...`)
- Si el usuario elige "— Sin asignar —", enviar `unassignFuelIsland: true` y omitir `fuelIslandId`.
- Si elige una isleta, enviar `fuelIslandId: <id>`.

### Refresco tras mutaciones

- Crear/editar/eliminar isleta → refrescar listado de isletas.
- Asignar dispensers → refrescar listado (pudieron cambiar otras isletas).
- Cambiar `fuelIslandId` de un terminal desde pantalla de terminales → si estás viendo la isleta afectada, refrescarla (la lista `terminals[]` cambió).
