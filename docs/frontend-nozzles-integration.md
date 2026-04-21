# Nozzles (Mangueras) — Guía de integración para Frontend

Documento de referencia para implementar la pantalla/componentes de gestión de nozzles (mangueras). Todos los requests/responses están verificados contra la API local.

---

## Conceptos

- **Nozzle** (manguera): hose física de un dispenser. Cada dispenser tiene N nozzles (típicamente 2 a 4).
- Cada nozzle dispensa **un producto específico** (combustible).
- El **precio se lee del producto** (`product.price`), no se guarda en la nozzle.
- `tankNumber` es un entero flexible que apunta al número de tanque desde el que se surte — no hay entidad `Tank` aún, se deja como `int?` para evolucionar después.

### Jerarquía completa

```
fuel_island
  └── dispenser (1..N)
        └── nozzle (1..N)
              └── product (combustible — precio, nombre)
```

### Reglas

- `(dispenserId, nozzleNumber)` es único: no puede haber dos mangueras con el mismo número en el mismo dispenser.
- Al borrar un dispenser, sus nozzles se eliminan automáticamente (FK `ON DELETE CASCADE`).
- No se puede borrar un producto que tenga nozzles apuntándolo (FK sin cascade — el DELETE del producto fallará).

---

## Autenticación

Todos los endpoints requieren `Authorization: Bearer <jwt>`. Ver la guía de fuel-islands para el flujo de login.

---

## 1. Listar nozzles

```http
GET /api/nozzles?dispenserId=1&productId=1-001
Authorization: Bearer <token>
```

**Query params (todos opcionales):**

| Param | Tipo | Descripción |
|---|---|---|
| `dispenserId` | int? | Filtra por dispenser |
| `productId` | string? | Filtra por producto |

### Response 200

```json
{
  "successful": true,
  "data": [
    {
      "nozzleId": 1,
      "dispenserId": 1,
      "nozzleNumber": 1,
      "productId": "1-001",
      "productName": "GASOLINA REGULAR",
      "price": 294.5,
      "tankNumber": 1,
      "active": true,
      "createdAt": "2026-04-21T01:04:01.89",
      "updatedAt": null
    }
  ]
}
```

> `productName` y `price` se resuelven desde la tabla `product` en el backend. El frontend NO tiene que hacer un join manual.

---

## 2. Obtener nozzle por ID

```http
GET /api/nozzles/1
Authorization: Bearer <token>
```

Mismo shape que un elemento del array.

### Response 404

```json
{ "successful": false, "error": "Nozzle 1 no encontrada" }
```

---

## 3. Crear nozzle

```http
POST /api/nozzles
Authorization: Bearer <token>
Content-Type: application/json

{
  "dispenserId": 1,
  "nozzleNumber": 1,
  "productId": "1-001",
  "tankNumber": 1
}
```

**Fields:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `dispenserId` | int | sí | ID del dispenser al que pertenece |
| `nozzleNumber` | int | sí | Número de la manguera dentro del dispenser (1..N). Único por dispenser |
| `productId` | string | sí | ID del producto (combustible) que dispensa |
| `tankNumber` | int? | no | Número de tanque del que se surte |

### Response 200

```json
{
  "successful": true,
  "data": {
    "nozzleId": 1, "dispenserId": 1, "nozzleNumber": 1,
    "productId": "1-001", "tankNumber": 1, "active": true,
    "createdAt": "2026-04-21T01:04:01Z", "updatedAt": null
  }
}
```

### Response 400 — Número duplicado

```json
{ "successful": false, "error": "Ya existe una nozzle #1 en el dispenser 1" }
```

### Response 404 — Dispenser o producto inexistente

```json
{ "successful": false, "error": "Dispenser 99 no encontrado" }
```
```json
{ "successful": false, "error": "Product XYZ no encontrado" }
```

---

## 4. Actualizar nozzle

```http
PUT /api/nozzles/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "1-002",
  "tankNumber": 3,
  "unassignTank": false,
  "active": true
}
```

**Fields (todos opcionales):**

| Campo | Tipo | Descripción |
|---|---|---|
| `productId` | string? | Cambiar el producto dispensado |
| `tankNumber` | int? | Asignar número de tanque |
| `unassignTank` | bool | **`true` = desasignar tanque** (ignora `tankNumber`). Default `false` |
| `active` | bool? | Activar/desactivar la manguera |

**Tri-estado del tanque:**

| Caso | `tankNumber` | `unassignTank` | Resultado |
|---|---|---|---|
| No cambiar | omitir | `false` | No cambia |
| Asignar / cambiar | `3` | `false` | `tankNumber = 3` |
| Desasignar | cualquier | `true` | `tankNumber = null` |

---

## 5. Eliminar nozzle

```http
DELETE /api/nozzles/1
Authorization: Bearer <token>
```

### Response 200

```json
{ "successful": true, "data": "Nozzle eliminada correctamente" }
```

---

## Tipos TypeScript sugeridos

```ts
type Nozzle = {
  nozzleId: number;
  dispenserId: number;
  nozzleNumber: number;
  productId: string;
  productName: string | null;   // viene de product.name
  price: number;                // viene de product.price
  tankNumber: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
};

type CreateNozzleBody = {
  dispenserId: number;
  nozzleNumber: number;
  productId: string;
  tankNumber?: number | null;
};

type UpdateNozzleBody = {
  productId?: string;
  tankNumber?: number | null;
  unassignTank?: boolean;
  active?: boolean;
};
```

---

## UI sugerida

### Pantalla "Gestión de Nozzles"

Contexto: normalmente se ve **dentro de una pantalla de dispenser** (o sus detalles).

1. En el detalle de un dispenser, sección "Mangueras":
   - Tabla o cards con columnas: `#`, Producto, Precio, Tanque, Estado, Acciones
   - Botón **+ Agregar manguera** → modal con `nozzleNumber` (número libre), selector de `productId` (combo de productos) y `tankNumber` opcional
   - Por fila: editar (modal), eliminar (confirmación), toggle `active`
2. Precio mostrado como "294.50 DOP/L" (tomar de `price`, la unidad es fija DOP por ahora).

### Refresco tras mutaciones

- Cualquier POST/PUT/DELETE → refrescar el listado del dispenser afectado.
- Si cambia el precio de un producto desde otra pantalla, las nozzles automáticamente mostrarán el precio nuevo al refrescar.
