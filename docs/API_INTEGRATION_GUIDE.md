# Guía de Integración API - Frontend & Mobile

Esta documentación describe la integración de los servicios de transacciones de combustible, terminales y dispositivos para el ecosistema del portal (Web y Mobile).

## Conceptos Clave

- **Formato de Datos:** Todas las propiedades utilizan **camelCase** (ej. `siteId`, `terminalId`).
- **Respuesta Estándar:** Las respuestas de la API vienen envueltas en un objeto de éxito/fallo (`successful`, `data`).
- **Paginación y Estadísticas:** Los listados incluyen metadatos de paginación y sumatorias globales (`pagination`, `statistics`).

---

## 1. Transacciones de Combustible (Fuel Transactions)

### Endpoint

`GET /api/fuel-transactions`

### Estructura de Respuesta

```json
{
  "successful": true,
  "data": [ ... ],
  "pagination": {
    "totalItems": 1500,
    "itemsPerPage": 50,
    "currentPage": 1,
    "totalPages": 30
  },
  "statistics": {
    "totalAmount": 125450.50,
    "totalVolume": 5420.25,
    "totalTransactions": 1500
  }
}
```

### Modelo de Datos

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `transactionId` | `int` | ID único de la transacción |
| `siteId` | `string` | Código de la estación |
| `pump` | `int` | Número de bomba |
| `fuelGradeId` | `int` | ID del producto (combustible) |
| `amount` | `decimal` | Monto total en moneda local |
| `volume` | `decimal` | Volumen surtido en galones/litros |
| `transactionDate` | `ISO Date` | Fecha y hora de la venta |

---

## 2. Terminales (POS Terminals)

### Endpoints

- `GET /api/terminals`: Listado de terminales.
- `POST /api/terminals`: Crear terminal.
- `PUT /api/terminals/{siteId}/{terminalId}`: Actualizar.
- `DELETE /api/terminals/{siteId}/{terminalId}`: Eliminar.

### Modelo de Datos (camelCase)

```typescript
interface ITerminal {
  siteId: string;
  terminalId: number;
  name: string;
  terminalType: number;
  sectorId?: number;
  connected: boolean;
  connectedTime?: string | Date;
  lastConnectionTime?: string | Date;
  active: boolean;
  hasIntegratedDispenser: boolean;  // NUEVO: Indica integración con bomba
  linkedDispenserId: number | null; // NUEVO: ID de la bomba vinculada
}
```

### Lógica de Integración Mobile (App de Pista)

Cuando la aplicación móvil obtiene el perfil de la terminal, debe verificar estos campos para decidir el flujo de venta:

1. **Selección Automática:** Si `hasIntegratedDispenser === true` y `linkedDispenserId` no es nulo, la App debe saltar la selección manual de bomba e iniciar el flujo para la bomba vinculada.
2. **Selección Manual:** De lo contrario, debe mostrar el listado de bombas disponibles.

---

## 3. Dispositivos / Hosts (Devices)

### Endpoints

- `GET /api/hosts`: Listado de dispositivos (Datáfonos, Scanners, etc).
- `POST /api/hosts`: Registrar nuevo host.
- `PUT /api/hosts/{hostId}`: Actualizar.
- `DELETE /api/hosts/{hostId}`: Eliminar.

### Modelo de Datos

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `hostId` | `int` | ID interno del host |
| `deviceId` | `string` | UUID o Serial del hardware |
| `name` | `string` | Nombre descriptivo |
| `ipAddress` | `string` | Dirección IP actual |
| `hostTypeId` | `int` | 1: Datáfono, 2: Scanner, 3: Smartphone |
| `connectedLastTime` | `string | Date` | Última vez visto en línea |

---

## Recomendaciones de Implementación

### Robustez en el Cliente (Javascript/Typescript/Mobile)

Dado que la API puede devolver los datos de forma directa o envuelta, se recomienda usar el siguiente patrón de extracción:

```javascript
// Ejemplo de extracción segura en React/React Native
const extractData = (response) => {
  if (!response) return [];
  
  // Si viene envuelto en .data
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Si la respuesta es el array directo
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
};
```

---

## Tipos de Dispositivos (Enums - HostTypeId)

- **Datáfono (Dataphone)**: 1
- **Escáner Android (Android Scanner)**: 2
- **Smartphone Android (Android Smartphone)**: 3
