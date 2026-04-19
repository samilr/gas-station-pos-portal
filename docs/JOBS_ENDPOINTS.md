# Scheduled Jobs Endpoints

Gestión de jobs programados del backend: listar, ver estado actual/historial, editar
frecuencia (cron), habilitar/deshabilitar y disparar ejecuciones manuales.

Base: `/api/jobs` · Auth: `Authorization: Bearer <JWT>` (todos los endpoints requieren token).

> **Contexto**: el scheduler corre dentro del API como un `BackgroundService`. Cada 30s
> consulta la tabla `isla$jobs#scheduled_job`, calcula jobs vencidos según su cron y los
> dispara. Cada ejecución queda registrada en `isla$jobs#job_execution`. Un lock
> distribuido a nivel de BD garantiza que nunca haya dos ejecuciones del mismo job en
> paralelo, ni siquiera entre réplicas.

---

## Modelo `ScheduledJob`

```json
{
  "jobId":             1,
  "name":              "dgii-status-polling",
  "displayName":       "Polling estatus DGII",
  "description":       "Reconcilia el estatus DGII de transacciones con eNCF pendiente.",
  "cronExpression":    "*/1 * * * *",
  "isEnabled":         true,
  "timeoutSeconds":    300,

  "lastRunAt":         "2026-04-18T14:32:00Z",
  "lastRunStatus":     2,
  "lastRunDurationMs": 842,
  "lastRunError":      null,
  "nextRunAt":         "2026-04-18T14:33:00Z",

  "lockedBy":          null,
  "lockedUntil":       null,

  "createdAt":         "2026-04-18T12:00:00Z",
  "updatedAt":         "2026-04-18T13:10:00Z"
}
```

### Campos

| Campo | Tipo | Notas |
|---|---|---|
| `jobId` | `int` | PK autoincremental |
| `name` | `string(80)` | Identificador único usado en todas las URLs. Snake-case (`dgii-status-polling`) |
| `displayName` | `string(120)` | Etiqueta legible para UI |
| `description` | `string(500)?` | Texto descriptivo opcional |
| `cronExpression` | `string(80)` | Expresión cron de 5 campos (minuto-hora-día-mes-díaSemana). Evaluada en **UTC** |
| `isEnabled` | `bool` | Si `false`, el scheduler lo salta (pero sigue siendo ejecutable manualmente) |
| `timeoutSeconds` | `int` | Límite de duración. Si lo excede → `Timeout` (status 4) |
| `lastRunAt` | `datetime?` | Inicio de la última ejecución (UTC) |
| `lastRunStatus` | `enum JobRunStatus?` | Ver tabla abajo |
| `lastRunDurationMs` | `long?` | Duración de la última corrida |
| `lastRunError` | `string(2000)?` | Mensaje de error (si falló) |
| `nextRunAt` | `datetime?` | Próxima ejecución programada (UTC) |
| `lockedBy` | `string(120)?` | Si `!= null`, un host está corriendo el job ahora mismo (formato `machine/pid`) |
| `lockedUntil` | `datetime?` | Expira el lease del lock. Después de esa hora otro host puede tomarlo |
| `createdAt` / `updatedAt` | `datetime` | Auditoría (UTC) |

### Enum `JobRunStatus`

| Valor | Nombre | Significado |
|---|---|---|
| 0 | `Idle` | Nunca corrió (solo aparece en jobs recién creados) |
| 1 | `Running` | En ejecución |
| 2 | `Success` | Terminó OK |
| 3 | `Failed` | Tiró excepción |
| 4 | `Timeout` | Excedió `timeoutSeconds` |
| 5 | `Cancelled` | Cancelado por shutdown del host o porque otro host tenía el lock |

### Enum `JobTriggerType`

| Valor | Nombre | Cuándo |
|---|---|---|
| 0 | `Scheduled` | Disparado por el scheduler según cron |
| 1 | `Manual` | Disparado vía `POST /api/jobs/{name}/run` |

---

## Modelo `JobExecution`

Cada corrida (scheduled o manual) crea una fila en el historial.

```json
{
  "executionId":       1284,
  "jobId":             1,
  "jobName":           "dgii-status-polling",
  "startedAt":         "2026-04-18T14:32:00Z",
  "finishedAt":        "2026-04-18T14:32:00.842Z",
  "status":            2,
  "triggerType":       0,
  "triggeredByUserId": null,
  "hostName":          "isla-pos-api-01/4812",
  "durationMs":        842,
  "errorMessage":      null,
  "outputSummary":     "inserted=38"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `executionId` | `long` | PK autoincremental — úsalo para consultar por `/executions/{id}` |
| `jobId` / `jobName` | `int` / `string` | Redundante pero útil para reporting sin join |
| `startedAt` / `finishedAt` | `datetime` | UTC. `finishedAt` es `null` mientras `status=Running` |
| `status` | `enum JobRunStatus` | Ver tabla arriba |
| `triggerType` | `enum JobTriggerType` | `0=Scheduled`, `1=Manual` |
| `triggeredByUserId` | `int?` | Actualmente siempre `null`; reservado para cuando el `POST /run` pase el userId del JWT |
| `hostName` | `string(120)?` | Formato `machine/pid` de la réplica que corrió el job |
| `durationMs` | `long?` | `null` mientras `Running` |
| `errorMessage` | `string(2000)?` | Stack trace truncado si falló |
| `outputSummary` | `string(500)?` | Resumen breve que devuelve el runner (ej: `"inserted=42"`). Puede ser `null` |

---

## Endpoints

Todos devuelven el wrapper estándar del proyecto:

```json
{ "successful": true, "data": ... }
```

o en error:

```json
{ "successful": false, "error": "mensaje" }
```

### 1. `GET /api/jobs`

Lista **todos** los jobs registrados, ordenados por `name`. Pensado para la pantalla
principal del módulo.

**Query params:** ninguno.

**Response:**

```json
{
  "successful": true,
  "data": [
    {
      "jobId": 1,
      "name": "dgii-status-polling",
      "displayName": "Polling estatus DGII",
      "description": "Reconcilia el estatus DGII de transacciones con eNCF pendiente.",
      "cronExpression": "*/1 * * * *",
      "isEnabled": true,
      "timeoutSeconds": 300,
      "lastRunAt": "2026-04-18T14:32:00Z",
      "lastRunStatus": 2,
      "lastRunDurationMs": 842,
      "lastRunError": null,
      "nextRunAt": "2026-04-18T14:33:00Z",
      "lockedBy": null,
      "lockedUntil": null,
      "createdAt": "2026-04-18T12:00:00Z",
      "updatedAt": "2026-04-18T13:10:00Z"
    },
    {
      "jobId": 2,
      "name": "taxpayer-import",
      "displayName": "Importación de contribuyentes DGII",
      "description": "Descarga el dataset DGII de contribuyentes (ejecución semanal).",
      "cronExpression": "0 3 * * 0",
      "isEnabled": true,
      "timeoutSeconds": 1800,
      "lastRunAt": null,
      "lastRunStatus": null,
      "lastRunDurationMs": null,
      "lastRunError": null,
      "nextRunAt": "2026-04-19T03:00:00Z",
      "lockedBy": null,
      "lockedUntil": null,
      "createdAt": "2026-04-18T12:00:00Z",
      "updatedAt": null
    }
  ]
}
```

**Tip UI**: para decidir el color del badge de estado, usa `lastRunStatus` + `lockedBy`:
- `lockedBy != null` → "Corriendo" (azul / spinner)
- `lastRunStatus == 2` → "OK" (verde)
- `lastRunStatus == 3 || 4` → "Falló" (rojo); mostrar `lastRunError` en tooltip
- `lastRunStatus == null` → "Nunca ejecutado" (gris)

---

### 2. `GET /api/jobs/{name}`

Detalle de un job por su `name` (el identificador canónico — NO el `jobId`).

**Path param**: `name` → ej. `dgii-status-polling`

**Response**: mismo shape que un item de `GET /api/jobs`, envuelto en `data`.

**Errores**:
- `404` si el name no existe.

---

### 3. `GET /api/jobs/{name}/executions`

Historial de ejecuciones de un job, más reciente primero.

**Path param**: `name`
**Query params**:

| Param | Tipo | Default | Notas |
|---|---|---|---|
| `take` | `int` | `50` | Cantidad máxima. Clamp entre `1` y `500` |

**Response:**

```json
{
  "successful": true,
  "data": [
    {
      "executionId": 1284,
      "jobId": 1,
      "jobName": "dgii-status-polling",
      "startedAt": "2026-04-18T14:32:00Z",
      "finishedAt": "2026-04-18T14:32:00.842Z",
      "status": 2,
      "triggerType": 0,
      "triggeredByUserId": null,
      "hostName": "isla-pos-api-01/4812",
      "durationMs": 842,
      "errorMessage": null,
      "outputSummary": null
    },
    {
      "executionId": 1283,
      "jobId": 1,
      "jobName": "dgii-status-polling",
      "startedAt": "2026-04-18T14:31:00Z",
      "finishedAt": "2026-04-18T14:31:00.654Z",
      "status": 3,
      "triggerType": 0,
      "triggeredByUserId": null,
      "hostName": "isla-pos-api-01/4812",
      "durationMs": 654,
      "errorMessage": "System.Net.Http.HttpRequestException: The request was canceled due to the configured HttpClient.Timeout...",
      "outputSummary": null
    }
  ]
}
```

**Errores**:
- `404` si el name no existe.

---

### 4. `GET /api/jobs/executions/{executionId}`

Detalle de una ejecución específica. Útil para el botón "Ejecutar ahora" — el backend
devuelve la `executionId` y el frontend puede hacer polling de este endpoint para
mostrar el resultado cuando `status` pasa de `Running` a `Success/Failed/Timeout`.

**Path param**: `executionId` (long)

**Response**: un `JobExecution` envuelto en `data`.

**Errores**:
- `404` si la `executionId` no existe.

---

### 5. `PATCH /api/jobs/{name}`

Edita la configuración de un job. Todos los campos son opcionales — solo envía lo que
quieras cambiar.

**Body:**

```json
{
  "displayName":    "Polling estatus DGII (cada 2 min)",
  "description":    null,
  "cronExpression": "*/2 * * * *",
  "isEnabled":      true,
  "timeoutSeconds": 600
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `displayName` | `string(120)?` | |
| `description` | `string(500)?` | Enviar `""` para dejar vacío. `null` **no** borra el valor, simplemente no lo cambia |
| `cronExpression` | `string(80)?` | Validado con la librería Cronos. Si es inválida → `400` |
| `isEnabled` | `bool?` | Al pasarlo de `false` a `true` el scheduler recalcula `nextRunAt` inmediatamente |
| `timeoutSeconds` | `int?` | `>= 1`. Se aplica a la **próxima** corrida (la actual no se interrumpe) |

**Response**: el `ScheduledJob` actualizado (incluye el nuevo `nextRunAt` si cambió `cron` o `isEnabled`).

**Errores**:
- `404` si el name no existe.
- `400` si `cronExpression` es inválida o `timeoutSeconds < 1`.

**Ejemplos de cron válidos:**

| Expresión | Frecuencia |
|---|---|
| `*/1 * * * *` | Cada minuto |
| `*/5 * * * *` | Cada 5 minutos |
| `0 * * * *` | Al inicio de cada hora |
| `0 3 * * *` | Todos los días a las 03:00 UTC |
| `0 3 * * 0` | Domingos a las 03:00 UTC |
| `0 0 1 * *` | Primer día de cada mes, 00:00 UTC |
| `30 2 * * 1-5` | Lun-Vie a las 02:30 UTC |

> ⚠️ El cron se evalúa **en UTC**. Para jobs que necesiten alinearse a un horario local
> (República Dominicana = UTC-4) hay que compensar en la expresión.

---

### 6. `POST /api/jobs/{name}/run`

Ejecuta un job **inmediatamente**. El endpoint es **síncrono** — bloquea hasta que el
job termina — pero cortocircuita si el lock está tomado (devolviendo status `Cancelled`
sin esperar).

**Body**: ninguno (`{}` o vacío).

**Response** (`202 Accepted`):

```json
{
  "successful": true,
  "data": {
    "executionId": 1285,
    "jobId": 1,
    "jobName": "dgii-status-polling",
    "startedAt": "2026-04-18T14:40:12Z",
    "finishedAt": "2026-04-18T14:40:13.124Z",
    "status": 2,
    "triggerType": 1,
    "triggeredByUserId": null,
    "hostName": "isla-pos-api-01/4812",
    "durationMs": 1124,
    "errorMessage": null,
    "outputSummary": "inserted=42"
  }
}
```

**Casos**:
- `status=2` (`Success`) → job ejecutado OK.
- `status=3` (`Failed`) → ver `errorMessage`.
- `status=4` (`Timeout`) → excedió `timeoutSeconds`.
- `status=5` (`Cancelled`) con `errorMessage="lock held by another instance"` → **otra
  instancia (o una corrida scheduled) lo está ejecutando ahora mismo**. La respuesta
  llega en milisegundos; la UI debería mostrar "Ya se está ejecutando, espera a que
  termine" y refrescar la lista.

**Errores**:
- `404` si el name no existe.

> **Importante para UX**: jobs como `taxpayer-import` pueden tardar **varios minutos**.
> Si el timeout HTTP del portal es menor que `timeoutSeconds`, la llamada se caerá
> antes. Dos opciones para el frontend:
>
> 1. **Subir el timeout del fetch** al mismo valor que `timeoutSeconds` (hoy: 1800s = 30min para taxpayer-import).
> 2. **Fire-and-forget + polling**: disparar el `POST /run`, ignorar el response si
>    timeoutea, y hacer polling cada 2-5s a `GET /api/jobs/{name}` mirando `lockedBy`
>    (cuando vuelve a `null` y cambia `lastRunAt`, la corrida terminó).
>
> Recomendamos la opción 2 para jobs largos.

---

### 7. Endpoints legacy (compat)

Se mantienen para no romper el portal viejo. Ambos delegan al flujo nuevo.

| Método | Ruta | Equivale a |
|---|---|---|
| `GET` | `/api/jobs/getEncfStatus` | `POST /api/jobs/dgii-status-polling/run` |
| `POST` | `/api/jobs/downloadTaxpayers` | `POST /api/jobs/taxpayer-import/run` |

**Migrar a los nuevos endpoints** en cuanto sea posible — los legacy se retirarán.

---

## Catálogo actual de jobs

Sembrado en la BD al correr la migración `2026-04-18-add-scheduled-jobs-tables.sql`:

| `name` | Frecuencia | Descripción |
|---|---|---|
| `dgii-status-polling` | `*/1 * * * *` (cada minuto) | Reconcilia estatus DGII de transacciones con eNCF pendiente |
| `taxpayer-import` | `0 3 * * 0` (Dom 03:00 UTC) | Descarga dataset DGII de contribuyentes |

> Para **agregar** un job nuevo: se requiere (a) implementar `IJobRunner` en backend,
> (b) registrarlo en el `JobRegistry`, y (c) insertar la fila en `scheduled_job`.
> **No se puede crear un job desde el portal** — la definición del código es la fuente de verdad,
> la tabla solo controla cuándo/si correrlo.

---

## Sugerencia de pantallas frontend

1. **Listado** (`/admin/jobs`):
   - Tabla con columnas: Display Name, Cron, Enabled (toggle), Última corrida (badge con color según `lastRunStatus`), Próxima corrida, botones `Editar` y `Ejecutar ahora`.
   - Refrescar cada 10-15s para ver cambios de estado.

2. **Detalle** (`/admin/jobs/:name`):
   - Header con el `ScheduledJob` completo.
   - Form de edición (`PATCH`) con validación de cron lado cliente (librería `cronstrue` convierte expresión a lenguaje natural — "At minute 0 past every hour").
   - Tabla de historial (`/executions`) con paginación simple (parámetro `take`).
   - Botón "Ejecutar ahora" → `POST /run` + polling del `nextRunAt`/`lockedBy` o del `executionId` retornado.

3. **Historial de una corrida específica** (modal desde la tabla anterior):
   - `GET /executions/{executionId}`.
   - Mostrar stack trace completo en `<pre>` si `errorMessage != null`.
