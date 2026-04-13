# Dispensadoras — Documentacion Tecnica

> Seccion del portal que permite monitorear en tiempo real las dispensadoras de combustible
> y consultar el historial de transacciones de combustible.

---

## Resumen de la Seccion

| Subseccion | Ruta | Permiso | Descripcion |
|---|---|---|---|
| Monitoreo | `/dashboard/dispensers/monitor` | `dispensers.view` | Vista en tiempo real del estado de las 18 dispensadoras |
| Transacciones | `/dashboard/dispensers/transactions` | `dispensers.view` | Historial de transacciones de combustible con filtros |

---

## 1. PTS Controller (Comunicacion Directa)

La comunicacion con las dispensadoras se hace **directamente** al PTS Controller via protocolo `jsonPTS`, sin pasar por el backend .NET.

| Campo | Valor |
|---|---|
| **IP** | `192.168.125.55` |
| **URL completa** | `https://192.168.125.55/jsonPTS` |
| **Protocolo** | `jsonPTS` (JSON sobre HTTPS) |
| **Metodo HTTP** | `POST` |
| **Autenticacion** | Digest Auth |
| **Username** | `admin` |
| **Realm** | `Pts2WebServer` |
| **Nonce** | `251229095521388` |
| **Response Digest** | `0d9b010285b1229b12a756a7edf094c9` |
| **QOP** | `auth` |
| **NC** | `00004988` |
| **CNonce** | `0ea67bf67c3f7736` |

### Header de Autorizacion

```
Authorization: Digest username="admin", realm="Pts2WebServer", nonce="251229095521388", uri="/jsonPTS", response="0d9b010285b1229b12a756a7edf094c9", qop=auth, nc=00004988, cnonce="0ea67bf67c3f7736"
```

### Estructura General de Request/Response

Todas las peticiones al PTS usan la misma estructura:

```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    {
      "Id": 1,
      "Type": "<TipoDeAccion>",
      "Data": { ... }
    }
  ]
}
```

---

## 2. Acciones Disponibles sobre Dispensadoras

### 2.1 Obtener Estado (`PumpGetStatus`)

Consulta el estado actual de las dispensadoras. El portal hace polling cada **2 segundos** para 18 dispensadoras.

**Request:**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    { "Id": 1, "Type": "PumpGetStatus", "Data": { "Pump": 1 } },
    { "Id": 2, "Type": "PumpGetStatus", "Data": { "Pump": 2 } },
    { "Id": 3, "Type": "PumpGetStatus", "Data": { "Pump": 3 } }
  ]
}
```

**Response — Dispensadora Idle (disponible):**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    {
      "Id": 1,
      "Type": "PumpIdleStatus",
      "Data": {
        "Pump": 1,
        "NozzleUp": 0,
        "Nozzle": 0,
        "Request": "",
        "NozzlePrices": [],
        "LastNozzle": 1,
        "LastVolume": 5.23,
        "LastPrice": 290.60,
        "LastAmount": 1519.84,
        "LastTransaction": 12345,
        "LastFuelGradeId": 1,
        "LastFuelGradeName": "1-001",
        "LastTotalVolume": 50000.00,
        "LastTotalAmount": 14530000.00,
        "LastDateTimeStart": "2026-04-12T10:00:00",
        "LastDateTime": "2026-04-12T10:02:30",
        "LastFlowRate": 0.0,
        "LastUser": "",
        "LastReceivedTotalNozzle": 1,
        "LastReceivedTotalVolume": 50000.00,
        "LastReceivedTotalAmount": 14530000.00,
        "User": ""
      }
    }
  ]
}
```

> Nota: Si `Request === "PumpLock"`, la dispensadora esta **bloqueada**.

**Response — Dispensadora Filling (despachando):**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    {
      "Id": 1,
      "Type": "PumpFillingStatus",
      "Data": {
        "Pump": 1,
        "Nozzle": 1,
        "FuelGradeId": 1,
        "FuelGradeName": "1-001",
        "Volume": 2.15,
        "Price": 290.60,
        "Amount": 624.79,
        "Transaction": 12346,
        "DateTimeStart": "2026-04-12T10:05:00",
        "FlowRate": 0.35,
        "IsSuspended": false,
        "OrderedType": "",
        "OrderedDose": 0,
        "User": ""
      }
    }
  ]
}
```

**Response — Dispensadora Offline:**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    {
      "Id": 1,
      "Type": "PumpOfflineStatus",
      "Data": {
        "Pump": 1,
        "State": "Offline",
        "NozzleUp": 0,
        "Nozzle": 0,
        "LastFlowRate": 0.0,
        "Request": "",
        "LastNozzle": 0,
        "LastVolume": 0,
        "LastPrice": 0,
        "LastAmount": 0,
        "LastTransaction": 0,
        "LastFuelGradeId": 0,
        "LastFuelGradeName": "",
        "LastTotalVolume": 0,
        "LastTotalAmount": 0,
        "LastDateTimeStart": "",
        "LastDateTime": "",
        "LastUser": "",
        "User": ""
      }
    }
  ]
}
```

---

### 2.2 Bloquear Dispensadora (`PumpLock`)

Bloquea una dispensadora individual para que no pueda despachar.

**Request:**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    { "Id": 1, "Type": "PumpLock", "Data": { "Pump": 3 } }
  ]
}
```

**Response:**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    { "Id": 1, "Type": "PumpLock" }
  ]
}
```

---

### 2.3 Desbloquear Dispensadora (`PumpUnlock`)

Desbloquea una dispensadora para que pueda despachar nuevamente.

**Request:**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    { "Id": 1, "Type": "PumpUnlock", "Data": { "Pump": 3 } }
  ]
}
```

**Response:**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    { "Id": 1, "Type": "PumpUnlock" }
  ]
}
```

---

### 2.4 Bloquear Todas (`PumpLock` x N)

Envia un paquete `PumpLock` por cada dispensadora (1..18) en una sola peticion.

**Request:**
```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    { "Id": 1, "Type": "PumpLock", "Data": { "Pump": 1 } },
    { "Id": 2, "Type": "PumpLock", "Data": { "Pump": 2 } },
    { "Id": 3, "Type": "PumpLock", "Data": { "Pump": 3 } },
    "... hasta Pump 18"
  ]
}
```

---

### 2.5 Desbloquear Todas (`PumpUnlock` x N)

Envia un paquete `PumpUnlock` por cada dispensadora (1..18) en una sola peticion.

---

## 3. Estados Visuales de la Dispensadora

| Estado | Tipo de Paquete | Color en UI | Condicion |
|---|---|---|---|
| **Disponible** | `PumpIdleStatus` | Verde | `Request !== "PumpLock"` |
| **Despachando** | `PumpFillingStatus` | Naranja (animado) | Siempre que el tipo sea Filling |
| **Bloqueada** | `PumpIdleStatus` | Rojo | `Request === "PumpLock"` |
| **Offline** | `PumpOfflineStatus` | Gris | Siempre que el tipo sea Offline |

---

## 4. Historial de Transacciones (Backend API)

Las transacciones de combustible se consultan al **backend .NET**, no al PTS directamente.

| Campo | Valor |
|---|---|
| **Base URL (Dev)** | `http://localhost:5274/api` |
| **Base URL (Prod)** | `https://isladominicana-pos-mobile-api.azurewebsites.net/api` |
| **Endpoint** | `GET /api/pts-controllers/pump-transactions` |
| **Autenticacion** | Bearer Token + Header `X-site-ID: PORTAL` |

### Query Parameters

| Parametro | Tipo | Descripcion |
|---|---|---|
| `pump` | number | Filtrar por numero de dispensadora |
| `nozzle` | number | Filtrar por manguera |
| `fuelGradeId` | number | Filtrar por tipo de combustible |
| `startDate` | string | Fecha inicio (ISO) |
| `endDate` | string | Fecha fin (ISO) |
| `page` | number | Pagina actual |
| `limit` | number | Items por pagina (10-50) |
| `sortBy` | string | Campo para ordenar (default: `transaction_date`) |
| `sortOrder` | `asc` \| `desc` | Orden (default: `desc`) |

### Ejemplo de Request

```
GET /api/pts-controllers/pump-transactions?pump=1&page=1&limit=20&sortBy=transaction_date&sortOrder=desc
Authorization: Bearer <token>
X-site-ID: PORTAL
```

### Response

```json
{
  "successful": true,
  "data": {
    "data": [
      {
        "transaction_id": 1001,
        "trans_number": null,
        "pump": 1,
        "nozzle": 1,
        "hardware_transaction_id": 12345,
        "volume": 5.23,
        "amount": 1519.84,
        "price": 290.60,
        "total_volume": 50000.00,
        "total_amount": 14530000.00,
        "transaction_date": "2026-04-12T10:02:30",
        "transaction_date_start": "2026-04-12T10:00:00",
        "tag": null,
        "pts_id": "PTS-001",
        "fuel_grade_id": 1,
        "fuel_grade_name": "1-001",
        "product_name": "GASOLINA REGULAR",
        "tank": 1,
        "user_id": 1,
        "tc_volume": 5.23,
        "flow_rate": 0.35,
        "is_offline": false,
        "pump_transactions_uploaded": 100,
        "pump_transactions_total": 100,
        "configuration_id": "config-001",
        "created_at": "2026-04-12T10:02:35"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "totalPages": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 5. Mapeo de Productos de Combustible

Los codigos de producto que vienen del PTS se mapean a nombres legibles:

| Codigo PTS | Nombre en Portal |
|---|---|
| `1-025` | GASOLINA V-POWER |
| `1-001` | GASOLINA REGULAR |
| `2-025` | DISEL V-POWER |
| `2-001` | DISEL REGULAR |

---

## 6. Configuracion del Portal

| Parametro | Valor |
|---|---|
| Total de dispensadoras | 18 (`PUMP_COUNT`) |
| Intervalo de polling | 2 segundos (`POLLING_INTERVAL`) |
| Servicio PTS | `src/services/dispenserService.ts` |
| Servicio Transacciones | `src/services/fuelTransactionService.ts` |
| Tipos PTS | Embebidos en `dispenserService.ts` |
| Tipos Transacciones | Embebidos en `fuelTransactionService.ts` |
| Mapeo de productos | `src/utils/fuelProductMapping.ts` |
| Componente Monitor | `src/components/sections/dispensers/DispensersSection.tsx` |
| Componente Tarjeta | `src/components/sections/dispensers/DispenserCard.tsx` |
| Componente Transacciones | `src/components/sections/dispensers/FuelTransactionsSection.tsx` |

---

## 7. Diagrama de Flujo de Comunicacion

```
Portal (Browser)
    |
    |--- HTTPS POST (jsonPTS) ---> PTS Controller (192.168.125.55)
    |    Digest Auth                   - Estado de dispensadoras
    |    Polling cada 2s               - Lock/Unlock
    |
    |--- HTTPS GET (REST API) ----> Backend .NET (Azure / localhost:5274)
         Bearer Token                  - Historial de transacciones
         X-site-ID: PORTAL            - CRUD transacciones
```
