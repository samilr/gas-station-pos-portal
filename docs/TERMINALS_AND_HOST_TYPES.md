# Terminals & Host Types — Guía de integración

Cambios implementados en la API para soporte de dispensadoras integradas,
identificación de dispositivos y tipo de host con capacidad de impresión.

---

## Terminales

### `GET /api/terminals/{site_id}/{terminal_id}`

Retorna la terminal con información del dispositivo conectado.

**Request**
```
GET /api/terminals/CO-0017/203
Authorization: Bearer <token>
```

**Response `200 OK`**
```json
{
  "successful": true,
  "data": {
    "siteId": "CO-0017",
    "terminalId": 203,
    "name": "TERMINAL 203 PISTA",
    "terminalType": 1,
    "sectorId": 2,
    "productList": 1,
    "useCustomerDisplay": false,
    "openCashDrawer": false,
    "printDevice": 1,
    "cashFund": 0.0,
    "connected": true,
    "lastConnectionTime": null,
    "lastConnectionHostname": null,
    "lastConnectionUsername": null,
    "connectedTime": "2026-02-24T13:22:42",
    "connectedHostname": "9749c3771db04a40",
    "connectedUsername": "Samir Gonzalez",
    "connectedStaftId": 633,
    "active": true,
    "productListType": 1,
    "hasIntegratedDispenser": true,
    "linkedDispenserId": null,
    "device": {
      "hostId": 1,
      "name": "POS Magic 02",
      "description": "Android Emulador",
      "deviceId": "9749c3771db04a40",
      "hostTypeId": 1,
      "hostTypeName": "POS Android",
      "hostTypeDescription": "Terminal POS con sistema Android",
      "hostTypeCode": "POS_ANDROID",
      "hasPrinter": true
    }
  }
}
```

> `device` es `null` si el `connectedHostname` de la terminal no coincide
> con ningún `device_id` registrado en la tabla de hosts.

**Lógica recomendada en el cliente**
```
data.device?.hostTypeCode === "POS_ANDROID"       → mostrar flujo POS
data.device?.hostTypeCode === "SMARTPHONE_ANDROID" → mostrar flujo mobile
data.device?.hasPrinter === true                  → habilitar opciones de impresión
data.hasIntegratedDispenser === true              → mostrar panel de dispensadora
```

**Response `404`**
```json
{ "successful": false, "error": "Terminal 203 no encontrado" }
```

---

### `GET /api/terminals`

Lista paginada de terminales.

**Query params**

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `search` | string | — | Filtra por nombre o siteId |
| `page` | int | 1 | Página actual |
| `limit` | int | 50 | Registros por página (máx 200) |

**Response `200 OK`**
```json
{
  "successful": true,
  "data": [ { ...terminal } ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### `POST /api/terminals`

Crea una nueva terminal. Retorna `409` si ya existe la combinación `siteId + terminalId`.

**Body**
```json
{
  "siteId": "CO-0017",
  "terminalId": 204,
  "name": "TERMINAL 204 PISTA",
  "sectorId": 2,
  "active": true,
  "hasIntegratedDispenser": true,
  "linkedDispenserId": null,

  "terminalType": 1,
  "productList": 1,
  "useCustomerDisplay": false,
  "openCashDrawer": false,
  "printDevice": 1,
  "cashFund": 0,
  "productListType": 1
}
```

| Campo | Tipo | Requerido | Default |
|-------|------|-----------|---------|
| `siteId` | string | ✓ | — |
| `terminalId` | short | ✓ | — |
| `name` | string | ✓ | — |
| `sectorId` | byte? | — | `null` |
| `active` | bool | — | `true` |
| `hasIntegratedDispenser` | bool | — | `false` |
| `linkedDispenserId` | int? | — | `null` |
| `terminalType` | byte | — | `1` |
| `productList` | short | — | `1` |
| `useCustomerDisplay` | bool | — | `false` |
| `openCashDrawer` | bool | — | `false` |
| `printDevice` | short | — | `1` |
| `cashFund` | double | — | `0` |
| `productListType` | byte | — | `1` |

**Response `200 OK`**
```json
{ "successful": true, "data": { ...terminal } }
```

**Response `409 Conflict`**
```json
{ "successful": false, "error": "Terminal 204 ya existe para el sitio CO-0017" }
```

---

### `PUT /api/terminals/{site_id}/{terminal_id}`

Actualiza una terminal existente.

**Body**
```json
{
  "name": "TERMINAL 203 PISTA",
  "sectorId": 2,
  "active": true,
  "hasIntegratedDispenser": true,
  "linkedDispenserId": null,

  "terminalType": 1,
  "productList": 1,
  "useCustomerDisplay": false,
  "openCashDrawer": false,
  "printDevice": 1,
  "cashFund": 0,
  "productListType": 1
}
```

> Mismos campos que `POST` excepto `siteId` y `terminalId` (van en la URL).
> `hasIntegratedDispenser` es `bool?` — si se omite, no se modifica.

**Response `200 OK`**
```json
{ "successful": true, "data": { ...terminal } }
```

**Response `404`**
```json
{ "successful": false, "error": "Terminal 203 no encontrado" }
```

---

### `DELETE /api/terminals/{site_id}/{terminal_id}`

**Response `200 OK`**
```json
{ "successful": true, "message": "Terminal eliminado correctamente" }
```

---

## Host Types

### Enum `HostTypeCode`

Identifica el tipo de dispositivo de forma estable (usar este valor, no el `id`).

| Valor | Descripción |
|-------|-------------|
| `POS_ANDROID` | Terminal POS con Android (tiene impresora) |
| `SMARTPHONE_ANDROID` | Teléfono Android |
| `SCANNER_ANDROID` | Escáner/lector de códigos Android |
| `POS_WINDOWS` | Terminal POS con Windows |
| `POS_LINUX` | Terminal POS con Linux |
| `KIOSK_ANDROID` | Kiosko con Android |
| `KIOSK_WINDOWS` | Kiosko con Windows |
| `DESKTOP_WINDOWS` | PC de escritorio Windows |
| `TABLET_ANDROID` | Tablet Android |
| `OTHER` | Otro tipo |

**Registros actuales en DB**

| id | code | hasPrinter |
|----|------|-----------|
| 1 | `POS_ANDROID` | `true` |
| 2 | `SMARTPHONE_ANDROID` | `false` |
| 3 | `SCANNER_ANDROID` | `false` |

---

### `GET /api/host-types`

**Response `200 OK`**
```json
{
  "successful": true,
  "data": [
    {
      "hostTypeId": 1,
      "name": "POS Android",
      "description": "Terminal POS con sistema Android",
      "active": true,
      "code": "POS_ANDROID",
      "hasPrinter": true
    }
  ]
}
```

---

### `GET /api/host-types/{id}`

**Response `200 OK`**
```json
{
  "successful": true,
  "data": {
    "hostTypeId": 1,
    "name": "POS Android",
    "description": "Terminal POS con sistema Android",
    "active": true,
    "code": "POS_ANDROID",
    "hasPrinter": true
  }
}
```

---

### `POST /api/host-types`

**Body**
```json
{
  "name": "POS Android",
  "description": "Terminal POS con sistema Android",
  "active": true,
  "code": "POS_ANDROID",
  "hasPrinter": true
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | ✓ | Nombre visible |
| `description` | string? | — | Descripción |
| `active` | bool | ✓ | — |
| `code` | string? | — | Valor del enum `HostTypeCode`. `null` si aún no definido |
| `hasPrinter` | bool? | — | `true` si el dispositivo tiene impresora integrada |

> El `code` se valida contra el enum. Si el valor no existe en `HostTypeCode`,
> se guarda como `null` sin error.

**Response `200 OK`**
```json
{ "successful": true, "data": { ...hostType } }
```

---

### `PUT /api/host-types/{id}`

Mismo body que `POST`.

**Response `200 OK`**
```json
{ "successful": true, "data": { ...hostType } }
```

**Response `404`**
```json
{ "successful": false, "error": "HostType with ID 99 not found" }
```

---

## Hosts — asignar tipo a un dispositivo

Para que `device.hostTypeCode` aparezca en la respuesta de terminal,
el host debe tener `hostTypeId` asignado.

### `PUT /api/hosts/{id}`

**Body**
```json
{
  "name": "POS Magic 02",
  "description": "Android Emulador",
  "ipAddress": "127.0.0.1",
  "siteId": "CL-0191",
  "active": true,
  "deviceId": "9749c3771db04a40",
  "hostTypeId": 1
}
```

> El `deviceId` es el identificador único del dispositivo físico.
> La terminal lo guarda en `connectedHostname` al momento del login.

---

## Flujo completo de identificación de dispositivo

```
1. Dispositivo hace login → API guarda device_id en terminal.connected_hostname
2. App consulta GET /api/terminals/{site_id}/{terminal_id}
3. API busca host donde host.device_id = terminal.connected_hostname
4. Si existe → incluye device.hostTypeCode, device.hasPrinter en la respuesta
5. App usa hostTypeCode para mostrar/ocultar secciones de UI
```
