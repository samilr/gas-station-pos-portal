# Dispensers Config Endpoints

CRUD del catálogo de dispensadoras con su configuración de hardware (marca, protocolo, conexión TCP/Serial, baud rate, etc.).

Base: `/api/dispensers-config` · Auth: `Authorization: Bearer <JWT>` (todos los endpoints requieren token).

> Importante: esta ruta **no** es el proxy al PTS-2. El proxy vive en `/api/dispensers/*` (status, authorize, settings, etc.). Este módulo (`/dispensers-config`) es el catálogo editable desde el portal.

## Modelo `Dispenser`

Todas las respuestas envuelven un objeto con esta forma:

```json
{
  "dispenserId":     1,
  "siteId":          "CO-0017",
  "ptsId":           "004A00323233511638383435",
  "pumpNumber":      1,
  "nozzlesCount":    4,
  "name":            "Bomba 1 Isla Norte",
  "active":          true,

  "brand":           "Gilbarco",
  "model":           "Encore 700S",
  "serialNumber":    "GB2024-1001",

  "connectionType":  "TCP",
  "ipAddress":       "192.168.1.50",
  "tcpPort":         10001,
  "serialPort":      null,
  "baudRate":        9600,
  "dataBits":        8,
  "parity":          "None",
  "stopBits":        "1",

  "protocol":        "GILBARCO_TWO_WIRE",
  "protocolVersion": "1.0",
  "busAddress":      1,
  "timeoutMs":       5000,

  "createdAt":       "2026-04-14T17:42:31Z",
  "updatedAt":       null
}
```

### Reglas de validación / dominio

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `siteId` | `string(10)` | ✅ | Sucursal a la que pertenece. FK lógica a `site.siteId` |
| `pumpNumber` | `int` | ✅ | Número físico de la bomba dentro del sitio. **Único** junto con `siteId` (`UQ_dispenser_site_pump`) |
| `ptsId` | `string(24)?` | — | PTS controller que la atiende (nullable — puede estar sin asignar) |
| `nozzlesCount` | `int` | ✅ | Default `1`. Valores `<1` se normalizan a `1` en el servidor |
| `name` | `string(100)?` | — | Label amigable |
| `active` | `bool` | — | Default `true` al crear |
| `connectionType` | `string(20)` | ✅ | Uno de: `TCP`, `SERIAL`, `RS485`, `RS422`. CHECK constraint en BD |
| `ipAddress` | `string(45)?` | — | Solo aplica para `TCP` |
| `tcpPort` | `int?` | — | Solo aplica para `TCP` |
| `serialPort` | `string(30)?` | — | Ej. `/dev/ttyUSB0`, `COM3`. Solo aplica para `SERIAL/RS485/RS422` |
| `baudRate` | `int?` | — | `9600`, `19200`, `38400`, ... |
| `dataBits` | `byte?` | — | `7`, `8` |
| `parity` | `string(10)?` | — | `None`, `Even`, `Odd` |
| `stopBits` | `string(5)?` | — | `1`, `1.5`, `2` |
| `protocol` | `string(30)?` | — | Ej. `GILBARCO_TWO_WIRE`, `IFSF_LON`, `WAYNE_DART` |
| `protocolVersion` | `string(20)?` | — | |
| `busAddress` | `int?` | — | Dirección dentro del bus RS-485 |
| `timeoutMs` | `int` | — | Default `5000`. Valores `<=0` se normalizan a `5000` |

El servidor no valida hoy que `ipAddress/tcpPort` vengan cuando `connectionType=TCP`, ni que `serialPort/baudRate` vengan cuando es serial. Si querés que validemos lado backend, pedime.

---

## Endpoints

### 1. `GET /api/dispensers-config`

Lista todas las dispensadoras, con filtros opcionales.

**Query params:**

| Param | Tipo | Notas |
|---|---|---|
| `siteId` | `string?` | Filtra por sucursal |
| `ptsId` | `string?` | Filtra por PTS asignado |

**Response:**

```json
{
  "successful": true,
  "data": [
    {
      "dispenserId": 1,
      "siteId": "CO-0017",
      "ptsId": "004A00323233511638383435",
      "pumpNumber": 1,
      "nozzlesCount": 4,
      "name": "Bomba 1 Isla Norte",
      "active": true,
      "brand": "Gilbarco",
      "model": "Encore 700S",
      "serialNumber": "GB2024-1001",
      "connectionType": "TCP",
      "ipAddress": "192.168.1.50",
      "tcpPort": 10001,
      "serialPort": null,
      "baudRate": 9600,
      "dataBits": 8,
      "parity": "None",
      "stopBits": "1",
      "protocol": "GILBARCO_TWO_WIRE",
      "protocolVersion": "1.0",
      "busAddress": 1,
      "timeoutMs": 5000,
      "createdAt": "2026-04-14T17:42:31Z",
      "updatedAt": null
    },
    {
      "dispenserId": 2,
      "siteId": "CO-0017",
      "ptsId": "004A00323233511638383435",
      "pumpNumber": 2,
      "nozzlesCount": 4,
      "name": "Bomba 2 Isla Sur",
      "active": true,
      "brand": "Wayne",
      "model": "Helix 6000",
      "serialNumber": "WY2024-2002",
      "connectionType": "RS485",
      "ipAddress": null,
      "tcpPort": null,
      "serialPort": "/dev/ttyUSB0",
      "baudRate": 9600,
      "dataBits": 8,
      "parity": "Even",
      "stopBits": "1",
      "protocol": "WAYNE_DART",
      "protocolVersion": "2.1",
      "busAddress": 2,
      "timeoutMs": 3000,
      "createdAt": "2026-04-14T17:45:10Z",
      "updatedAt": null
    }
  ]
}
```

- Orden: `siteId` asc, `pumpNumber` asc.
- Si no hay resultados → `"data": []`.

---

### 2. `GET /api/dispensers-config/{id}`

Trae una dispensadora por `dispenserId`.

**Response OK (200):**

```json
{
  "successful": true,
  "data": {
    "dispenserId": 1,
    "siteId": "CO-0017",
    "pumpNumber": 1,
    "...": "..."
  }
}
```

**Response no encontrada (404):**

```json
{
  "successful": false,
  "error": "Dispensadora con ID 99 no encontrada"
}
```

---

### 3. `POST /api/dispensers-config`

Crea una dispensadora.

**Request body:**

```json
{
  "siteId":          "CO-0017",
  "pumpNumber":      1,
  "ptsId":           "004A00323233511638383435",
  "nozzlesCount":    4,
  "name":            "Bomba 1 Isla Norte",
  "brand":           "Gilbarco",
  "model":           "Encore 700S",
  "serialNumber":    "GB2024-1001",
  "connectionType":  "TCP",
  "ipAddress":       "192.168.1.50",
  "tcpPort":         10001,
  "serialPort":      null,
  "baudRate":        9600,
  "dataBits":        8,
  "parity":          "None",
  "stopBits":        "1",
  "protocol":        "GILBARCO_TWO_WIRE",
  "protocolVersion": "1.0",
  "busAddress":      1,
  "timeoutMs":       5000
}
```

**Response OK (200):**

```json
{
  "successful": true,
  "data": {
    "dispenserId": 3,
    "siteId": "CO-0017",
    "pumpNumber": 1,
    "active": true,
    "createdAt": "2026-04-14T17:42:31Z",
    "updatedAt": null,
    "...": "..."
  }
}
```

**Errores comunes:**

- `400 / 409` `"Ya existe una dispensadora con site=CO-0017 pump=1"` — violación de `UQ_dispenser_site_pump`.
- `400` si `connectionType` no está en `{TCP, SERIAL, RS485, RS422}` — viene del CHECK de BD.

---

### 4. `PUT /api/dispensers-config/{id}`

Actualiza campos. **Todos los campos son opcionales**: solo se actualizan los que envíes con valor no-null (strings) / `.HasValue` (numéricos/bools).

No podés cambiar `siteId` ni `pumpNumber` desde update (son identidad operativa). Si hace falta, bórrala y crea una nueva.

**Request body (ejemplo de update parcial):**

```json
{
  "active": false,
  "ipAddress": "192.168.1.51",
  "baudRate": 19200,
  "name": "Bomba 1 (fuera de servicio)"
}
```

**Response OK (200):**

```json
{
  "successful": true,
  "data": {
    "dispenserId": 3,
    "active": false,
    "ipAddress": "192.168.1.51",
    "baudRate": 19200,
    "name": "Bomba 1 (fuera de servicio)",
    "updatedAt": "2026-04-14T18:10:05Z",
    "...": "..."
  }
}
```

**Errores:**

- `404` `"Dispensadora con ID {id} no encontrada"`.

---

### 5. `DELETE /api/dispensers-config/{id}`

Elimina físicamente la dispensadora del catálogo (no soft-delete).

**Response OK (200):**

```json
{
  "successful": true,
  "data": "Dispensadora eliminada correctamente"
}
```

**Errores:**

- `404` `"Dispensadora con ID {id} no encontrada"`.

---

## Ejemplos de uso (fetch)

```ts
const API = "/api/dispensers-config";
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

// Listar dispensadoras del sitio CO-0017
const list = await fetch(`${API}?siteId=CO-0017`, { headers }).then(r => r.json());

// Crear
const created = await fetch(API, {
  method: "POST",
  headers,
  body: JSON.stringify({
    siteId: "CO-0017",
    pumpNumber: 1,
    ptsId: "004A00323233511638383435",
    nozzlesCount: 4,
    name: "Bomba 1 Isla Norte",
    brand: "Gilbarco",
    model: "Encore 700S",
    serialNumber: "GB2024-1001",
    connectionType: "TCP",
    ipAddress: "192.168.1.50",
    tcpPort: 10001,
    baudRate: 9600,
    dataBits: 8,
    parity: "None",
    stopBits: "1",
    protocol: "GILBARCO_TWO_WIRE",
    protocolVersion: "1.0",
    busAddress: 1,
    timeoutMs: 5000,
  }),
}).then(r => r.json());

// Actualizar (solo los campos que cambien)
await fetch(`${API}/${created.data.dispenserId}`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ active: false, name: "Bomba 1 (mantenimiento)" }),
});

// Eliminar
await fetch(`${API}/${created.data.dispenserId}`, { method: "DELETE", headers });
```

---

## TypeScript types

```ts
type ConnectionType = "TCP" | "SERIAL" | "RS485" | "RS422";
type Parity = "None" | "Even" | "Odd";
type StopBits = "1" | "1.5" | "2";

interface Dispenser {
  dispenserId: number;
  siteId: string;
  ptsId: string | null;
  pumpNumber: number;
  nozzlesCount: number;
  name: string | null;
  active: boolean;

  brand: string | null;
  model: string | null;
  serialNumber: string | null;

  connectionType: ConnectionType;
  ipAddress: string | null;
  tcpPort: number | null;
  serialPort: string | null;
  baudRate: number | null;
  dataBits: number | null;    // 7 | 8
  parity: Parity | null;
  stopBits: StopBits | null;

  protocol: string | null;
  protocolVersion: string | null;
  busAddress: number | null;
  timeoutMs: number;

  createdAt: string;          // ISO
  updatedAt: string | null;
}

interface CreateDispenserRequest {
  siteId: string;
  pumpNumber: number;
  ptsId?: string | null;
  nozzlesCount: number;
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  connectionType: ConnectionType;
  ipAddress?: string | null;
  tcpPort?: number | null;
  serialPort?: string | null;
  baudRate?: number | null;
  dataBits?: number | null;
  parity?: Parity | null;
  stopBits?: StopBits | null;
  protocol?: string | null;
  protocolVersion?: string | null;
  busAddress?: number | null;
  timeoutMs: number;
}

interface UpdateDispenserRequest {
  // Todos opcionales. Solo se actualiza lo que no sea null/undefined.
  ptsId?: string | null;
  nozzlesCount?: number | null;
  name?: string | null;
  active?: boolean | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  connectionType?: ConnectionType | null;
  ipAddress?: string | null;
  tcpPort?: number | null;
  serialPort?: string | null;
  baudRate?: number | null;
  dataBits?: number | null;
  parity?: Parity | null;
  stopBits?: StopBits | null;
  protocol?: string | null;
  protocolVersion?: string | null;
  busAddress?: number | null;
  timeoutMs?: number | null;
}

// Response envelope estándar del API
type ApiResponse<T> =
  | { successful: true; data: T }
  | { successful: false; error: string };
```

---

## Sugerencias de UI

- **Formulario condicional por `connectionType`:**
  - `TCP` → mostrar `ipAddress`, `tcpPort`; ocultar serial fields.
  - `SERIAL / RS485 / RS422` → mostrar `serialPort`, `baudRate`, `dataBits`, `parity`, `stopBits`, `busAddress`; ocultar `ipAddress` / `tcpPort`.
- **Dropdowns con valores fijos:** `connectionType`, `parity`, `stopBits`, `dataBits`.
- **Lookup `ptsId`:** popular desde `GET /api/pts-controllers` para que el usuario elija de una lista en vez de tipear el ID.
- **Lookup `siteId`:** desde `GET /api/sites`.
- **`baudRate` típicos:** `[1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200]`.
- **Acciones en la tabla:** Editar / Activar-Desactivar (toggle `active` vía PUT) / Eliminar.
