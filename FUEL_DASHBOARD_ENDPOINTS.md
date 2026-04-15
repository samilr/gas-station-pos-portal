# Fuel Dashboard Endpoints

Base: `/api/fuel-transactions/dashboard/*` · Auth: `Authorization: Bearer <JWT>`

## Query params compartidos

Todos los endpoints aceptan los mismos filtros:

| Param | Tipo | Default | Notas |
|---|---|---|---|
| `startDate` | `date` (YYYY-MM-DD) | Hoy (UTC) | Inicio del rango, inclusivo |
| `endDate` | `date` (YYYY-MM-DD) | Hoy (UTC) | Fin del rango, inclusivo |
| `siteId` | `string?` | `null` (todas) | Filtra por sucursal (ej. `CO-0017`) |
| `excludeOffline` | `bool` | `true` | Excluye transacciones con `IsOffline=true` (fantasmas del buffer offline del PTS) |

`top-transactions` además acepta `limit` (default `20`, rango `1..100`).

## Response shape común

Todos los endpoints envuelven la respuesta con los filtros aplicados:

```json
{
  "successful": true,
  "filters": {
    "startDate": "2026-04-14T00:00:00Z",
    "endDate":   "2026-04-14T00:00:00Z",
    "siteId":    null,
    "excludeOffline": true
  },
  "data": "..."
}
```

`data` cambia de forma por endpoint — ver cada sección.

---

# Dashboard principal (home)

## 1. `GET /dashboard/summary`

KPIs para tarjetas grandes del home.

**Response `data`:**

```json
{
  "txCount": 174,
  "totalVolume": 2350.125,
  "totalAmount": 625840.50,
  "avgTicket": 3596.78,
  "uniquePumps": 4,
  "uniqueSites": 1
}
```

Campos:

| Campo | Tipo | Notas |
|---|---|---|
| `txCount` | `int` | Total de transacciones en el rango |
| `totalVolume` | `decimal` | Suma de galones vendidos |
| `totalAmount` | `decimal` | Total facturado (RD$) |
| `avgTicket` | `decimal` | `totalAmount / txCount`, redondeado a 2 decimales |
| `uniquePumps` | `int` | Bombas que tuvieron al menos una venta |
| `uniqueSites` | `int` | Sucursales distintas que reportaron ventas |

## 2. `GET /dashboard/daily-trend`

Serie temporal por día para gráfico de barras/línea.

**Response `data`:**

```json
[
  { "date": "2026-04-08T00:00:00", "txCount": 22, "volume": 320.400, "amount": 84230.75 },
  { "date": "2026-04-09T00:00:00", "txCount": 31, "volume": 455.200, "amount": 119872.00 },
  { "date": "2026-04-10T00:00:00", "txCount": 28, "volume": 410.110, "amount": 107905.25 },
  { "date": "2026-04-11T00:00:00", "txCount": 25, "volume": 380.000, "amount":  99870.00 },
  { "date": "2026-04-12T00:00:00", "txCount": 19, "volume": 290.550, "amount":  76420.50 },
  { "date": "2026-04-13T00:00:00", "txCount": 27, "volume": 401.300, "amount": 105560.00 },
  { "date": "2026-04-14T00:00:00", "txCount": 22, "volume": 292.565, "amount":  31982.00 }
]
```

- Orden: ascendente por `date`.
- Se omiten días sin transacciones (si querés rellenar huecos con `0`, hacelo en el cliente).

## 3. `GET /dashboard/by-site`

Ranking de sucursales (ordenado por `amount` desc).

**Response `data`:**

```json
[
  { "siteId": "CO-0017", "txCount": 174, "volume": 2350.125, "amount": 625840.50 },
  { "siteId": "CL-0081", "txCount":  98, "volume": 1420.500, "amount": 388220.00 }
]
```

- Filas con `siteId = NULL` se excluyen (por si alguna transacción legacy no pudo taggearse).

---

# Dashboard sección Dispensadoras (operacional)

## 4. `GET /dashboard/by-pump`

Ventas agrupadas por bomba.

**Response `data`:**

```json
[
  { "pump": 1, "txCount": 52, "volume": 680.250, "amount": 185430.00 },
  { "pump": 2, "txCount": 48, "volume": 720.100, "amount": 198960.50 },
  { "pump": 3, "txCount": 41, "volume": 590.775, "amount": 158220.00 },
  { "pump": 4, "txCount": 33, "volume": 359.000, "amount":  83230.00 }
]
```

- Orden: ascendente por `pump`.

## 5. `GET /dashboard/by-fuel-grade`

Ventas por grado de combustible (ej. Regular, V-Power, Diesel).

**Response `data`:**

```json
[
  { "fuelGradeId": 3, "fuelGradeName": "2-025", "txCount": 78, "volume": 1120.400, "amount": 298150.50 },
  { "fuelGradeId": 4, "fuelGradeName": "2-001", "txCount": 54, "volume":  790.200, "amount": 195020.00 },
  { "fuelGradeId": 1, "fuelGradeName": "1-025", "txCount": 25, "volume":  310.775, "amount":  97610.00 },
  { "fuelGradeId": 2, "fuelGradeName": "1-001", "txCount": 17, "volume":  128.750, "amount":  35060.00 }
]
```

- Orden: descendente por `amount`.
- `fuelGradeName` es el código interno del producto — si necesitás un label amigable, resolvelo contra `/api/products/{id}`.

## 6. `GET /dashboard/hourly`

Horas pico del período: agrupado por hora del día (0..23).

**Response `data`:**

```json
[
  { "hour":  6, "txCount":  3, "volume":  42.100, "amount":  11205.00 },
  { "hour":  7, "txCount": 11, "volume": 178.250, "amount":  48310.50 },
  { "hour":  8, "txCount": 19, "volume": 310.700, "amount":  82425.00 },
  { "hour":  9, "txCount": 17, "volume": 245.900, "amount":  68910.25 },
  { "hour": 12, "txCount": 22, "volume": 340.500, "amount":  91740.00 },
  { "hour": 18, "txCount": 28, "volume": 410.775, "amount": 110260.50 },
  { "hour": 19, "txCount": 20, "volume": 295.000, "amount":  80800.00 }
]
```

- Orden: ascendente por `hour`.
- Se omiten horas sin transacciones (rellená con `0` en el cliente si el gráfico necesita las 24 barras).

## 7. `GET /dashboard/top-transactions`

Top N transacciones por monto, descendente. Útil para "ventas más grandes del período".

**Query param extra:** `limit` (default `20`, rango `1..100`).

**Response `data`:**

```json
[
  {
    "transactionId": 567,
    "pump": 2,
    "nozzle": 3,
    "fuelGradeName": "2-025",
    "volume": 15.500,
    "amount": 4870.55,
    "price": 314.10,
    "transactionDate": "2026-04-14T13:17:34",
    "siteId": "CO-0017",
    "ptsId": "004A00323233511638383435"
  },
  {
    "transactionId": 559,
    "pump": 1,
    "nozzle": 2,
    "fuelGradeName": "2-001",
    "volume": 12.300,
    "amount": 3035.04,
    "price": 246.80,
    "transactionDate": "2026-04-14T12:57:53",
    "siteId": "CO-0017",
    "ptsId": "004A00323233511638383435"
  }
]
```

---

# Ejemplos de uso (fetch)

```ts
// KPIs del día actual (sin params => defaults a hoy)
const res = await fetch("/api/fuel-transactions/dashboard/summary", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data: kpis } = await res.json();
// kpis.txCount, kpis.totalVolume, kpis.totalAmount, ...

// Tendencia últimos 7 días
const qs = new URLSearchParams({
  startDate: "2026-04-08",
  endDate:   "2026-04-14",
});
const res2 = await fetch(`/api/fuel-transactions/dashboard/daily-trend?${qs}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { data: series } = await res2.json();

// Top 10 ventas en una sucursal específica del mes
const qs3 = new URLSearchParams({
  startDate: "2026-04-01",
  endDate:   "2026-04-30",
  siteId:    "CO-0017",
  limit:     "10",
});
const res3 = await fetch(`/api/fuel-transactions/dashboard/top-transactions?${qs3}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { data: top } = await res3.json();
```

# TypeScript types

```ts
type FuelDashboardResponse<T> = {
  successful: true;
  filters: {
    startDate: string;   // ISO
    endDate: string;     // ISO
    siteId: string | null;
    excludeOffline: boolean;
  };
  data: T;
};

type FuelSummary = {
  txCount: number;
  totalVolume: number;
  totalAmount: number;
  avgTicket: number;
  uniquePumps: number;
  uniqueSites: number;
};

type FuelDailyTrendRow = {
  date: string;        // ISO (midnight UTC)
  txCount: number;
  volume: number;
  amount: number;
};

type FuelBySiteRow = {
  siteId: string;
  txCount: number;
  volume: number;
  amount: number;
};

type FuelByPumpRow = {
  pump: number;
  txCount: number;
  volume: number;
  amount: number;
};

type FuelByFuelGradeRow = {
  fuelGradeId: number;
  fuelGradeName: string;
  txCount: number;
  volume: number;
  amount: number;
};

type FuelHourlyRow = {
  hour: number;        // 0..23
  txCount: number;
  volume: number;
  amount: number;
};

type FuelTopTransactionRow = {
  transactionId: number;
  pump: number;
  nozzle: number;
  fuelGradeName: string;
  volume: number;
  amount: number;
  price: number;
  transactionDate: string;   // ISO
  siteId: string | null;
  ptsId: string | null;
};
```

# Notas operacionales

- **Timezone:** `startDate` y `endDate` se interpretan en UTC. El rango real cubre `[startDate 00:00 UTC, endDate+1d 00:00 UTC)`.
- **Offline noise:** por default `excludeOffline=true` oculta las transacciones con valores sentinel que el PTS genera en modo offline (`is_offline=1`). Si necesitás auditar esas filas, pasá `excludeOffline=false` explícitamente.
- **Empty buckets:** los endpoints `daily-trend` y `hourly` omiten días/horas sin datos. Si tu gráfico necesita la grilla completa, rellená `0` en el cliente.
- **Errores:** en caso de error el wrapper es `{ successful: false, error: "<mensaje>" }` con HTTP 4xx/5xx según corresponda (lo maneja el `GlobalExceptionFilter` común a todos los endpoints del API).
