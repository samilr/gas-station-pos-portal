// ============================================================
// Tipos para los parámetros de configuración PTS-2
// (preset de autorización 1.4 y arranque automático 2.1 / 2.2)
//
// Endpoints backend:
//   PUT /api/dispensers/{pump}/authorize-without-preset
//   PUT /api/dispensers/authorize-without-preset/bulk
//   PUT /api/dispensers/{pump}/automatic-operation
//   GET /api/dispensers/{pump}/automatic-operation
//   PUT /api/dispensers/automatic-operation/bulk
//   POST /api/dispensers/set-parameter
//   POST /api/dispensers/set-parameter/bulk
//   POST /api/dispensers/get-parameter
// ============================================================

import type { PtsPacket } from './dispenser';

// --- Flag usada en la UI ---
// En la capa de servicio se convierte a "On" | "Off" antes de enviar al backend;
// los componentes nunca ven los strings del firmware.
export type ToggleFlag = boolean;

// ============================================================
// Parámetro 2.1 / 2.2 — Automatic Operation
// ============================================================

export interface AutomaticOperationBody {
  /** Parámetro 2.1 — Automatically authorize pump on nozzle up */
  State: 'On' | 'Off';
  /** Parámetro 2.2 — Automatically close transaction. Si se omite, el PTS lo iguala a State. */
  AutoCloseTransaction?: 'On' | 'Off';
}

export interface AutomaticOperationStatus {
  /** Estado actual del 2.1 según el firmware */
  autoAuthorize: ToggleFlag;
  /** Estado actual del 2.2 según el firmware (null si el PTS no lo devuelve en el GET) */
  autoCloseTransaction: ToggleFlag | null;
}

// ============================================================
// Parámetro 1.4 — Authorize without preset
// ============================================================

export interface AuthorizeWithoutPresetBody {
  enabled: boolean;
  /** Address del parámetro en el diccionario del firmware. Default 4, override-able por instalación. */
  address?: number;
}

// ============================================================
// Bulk: /automatic-operation/bulk
// ============================================================

export interface AutomaticOperationBulkBody {
  /** Lista de bombas; null o vacío → todas las bombas 1..PumpCount */
  pumps?: number[];
  state: 'On' | 'Off';
  autoCloseTransaction?: 'On' | 'Off';
}

// ============================================================
// Bulk: /authorize-without-preset/bulk
// ============================================================

export interface AuthorizeWithoutPresetBulkBody {
  /** Lista de bombas; null o vacío → todas */
  pumps?: number[];
  enabled: boolean;
  address?: number;
}

// ============================================================
// Comando maestro: set-parameter / get-parameter
// ============================================================

export type ParameterDevice =
  | 'Pump'
  | 'Nozzle'
  | 'Probe'
  | 'Tank'
  | 'FuelGrade'
  | 'Reader'
  | 'PriceBoard'
  | 'System';

export interface SetParameterBody {
  device: ParameterDevice;
  number: number;
  address: number;
  /** Hex string de hasta 8 dígitos. "00000001" = on, "00000000" = off. */
  value: string;
}

export interface SetParameterBulkBody {
  device: ParameterDevice;
  /** Lista de números; null/vacío → todas (solo válido con device "Pump") */
  numbers?: number[];
  address: number;
  value: string;
}

export interface GetParameterBody {
  device: ParameterDevice;
  number: number;
  address: number;
}

// ============================================================
// Respuesta de bulk — un packet por bomba
// ============================================================

/** Mapeo resuelto del resultado de una operación bulk a la bomba correspondiente. */
export interface BulkPumpResult {
  /** Número correlativo (1, 2, 3…) con el que el backend despachó el packet */
  packetId: number;
  /** Número de bomba real al que se mapea (según el orden de `pumps` enviado) */
  pumpNumber: number;
  /** true si el firmware aprobó este packet individual */
  ok: boolean;
  /** Mensaje del PTS si vino — rechazo, error, etc. */
  message: string | null;
  /** Type crudo del packet (ej. "AcknowledgePacket", "NotAcknowledgePacket") */
  type: string;
}

export interface BulkResponse {
  packets: PtsPacket[];
  results: BulkPumpResult[];
}

// ============================================================
// Configuración del proxy PTS + descubrimiento de bombas reales
// ============================================================

export interface PtsDiscoveredPump {
  Id: number;
  Port: number;
  Address: number;
}

export interface PtsDiscoveredPort {
  Id: number;
  Protocol: string;
  BaudRate: number;
}

export interface PtsProxySettings {
  baseUrl: string;
  username: string;
  password: string;
  /** Valor persistido en disco (0 = auto, descubrir vía PTS). */
  pumpCount: number;
  /** Cantidad real descubierta vía `GetPumpsConfiguration`. Es `pumps.length`. */
  effectivePumpCount: number;
  /** Bombas reales tal como las devolvió el PTS (Id, Port, Address). */
  pumps: PtsDiscoveredPump[];
  /** Puertos de comunicación del PTS. */
  ports: PtsDiscoveredPort[];
  /** Mensaje si el descubrimiento falló (PTS no respondió). `null` si OK. */
  discoveryError: string | null;
}

// ============================================================
// Estado por bomba en la UI
// ============================================================

export interface PumpConfigRow {
  pumpNumber: number;
  autoAuthorize: ToggleFlag;            // 2.1
  autoCloseTransaction: ToggleFlag;     // 2.2
  authorizeWithoutPreset: ToggleFlag;   // 1.4
  /** true si el usuario modificó algo localmente y no ha pulsado "Aplicar" */
  dirty: boolean;
  /** Última respuesta (ok/fail) para mostrar indicador por fila */
  lastResult?: 'ok' | 'fail';
  lastMessage?: string | null;
}

// ============================================================
// Site-level pre-pago bulk
//   PUT /api/dispensers-config/sites/{siteId}/requires-authorization
//
// El handler ya NO usa los comandos bulk del PTS-2 (tienen un bug de
// firmware: responden OK por packet pero solo persisten en algunas
// bombas). En vez de eso, ejecuta SetParameter (1.4) + PumpSetAutomatic-
// Operation (2.1) UNA POR UNA por bomba activa del site. Trade-off:
// 2*N round-trips al PTS en vez de 2 (≈1.5s para 4 bombas) — aceptable
// para una operación administrativa poco frecuente.
//
// El response refleja la nueva estrategia: en vez de un único `ptsResponse`
// con `packets[]` agregado, devuelve dos envelopes (uno por parámetro) con
// `perPump[]` indexado por bomba — facilita el diagnóstico cuando una
// bomba específica falla en el lote.
// ============================================================

export interface SetSiteRequiresAuthorizationRequest {
  requireAuthorization: boolean;
  /** Address del parámetro 1.4 en el firmware. Default 4 server-side. */
  address?: number;
}

/** Resultado del PTS para una bomba específica dentro de un response perPump. */
export interface PtsPerPumpEntry {
  pump: number;
  /** Respuesta cruda jsonPTS para esa bomba (típicamente `{ protocol, packets[] }`). */
  response: unknown;
}

/** Envelope que agrupa los resultados del PTS bomba por bomba para un parámetro. */
export interface PtsPerPumpEnvelope {
  protocol: string;
  perPump: PtsPerPumpEntry[];
}

export interface SetSiteRequiresAuthorizationResponse {
  siteId: string;
  requireAuthorization: boolean;
  /** pumpNumber a los que se les envió el cambio al PTS (todas las activas del site) */
  affectedPumps: number[];
  /** Filas de BD modificadas (excluye no-ops) */
  dispensersUpdated: number;
  ptsSuccessful: boolean;
  /** Resultado del PTS `SetParameter` (param 1.4) por bomba. */
  ptsAuthorizeWithNoPresetResponse: PtsPerPumpEnvelope;
  /** Resultado del PTS `PumpSetAutomaticOperation` (param 2.1) por bomba. */
  ptsAutomaticOperationResponse: PtsPerPumpEnvelope;
}

// ============================================================
// Per-dispenser pre-pago (atómico PTS+BD)
//   PUT /api/dispensers-config/{id}/requires-authorization
//
// El handler aplica DOS parámetros al PTS (1.4 y 2.1) y luego BD.
// Si requireAuthorization=true → 1.4 fuerza preset, 2.1 apaga auto-auth.
// Si 1.4 falla → 409, BD intacta. Si 2.1 falla tras 1.4 OK → 409 con
// LogCritical (estado parcial reconciliable reintentando al mismo valor).
// ============================================================

export interface SetDispenserRequiresAuthorizationRequest {
  requireAuthorization: boolean;
  /** Address del parámetro 1.4 en el firmware. Default 4 server-side. */
  address?: number;
}

export interface SetDispenserRequiresAuthorizationResponse {
  dispenserId: number;
  siteId: string;
  pumpNumber: number;
  requireAuthorization: boolean;
  ptsSuccessful: boolean;
  /** Respuesta cruda del PTS para `SetParameter` 1.4 — para auditoría. */
  ptsAuthorizeWithNoPresetResponse: unknown;
  /** Respuesta cruda del PTS para `PumpSetAutomaticOperation` 2.1. */
  ptsAutomaticOperationResponse: unknown;
}

// ============================================================
// Envelope de los GETs cacheados del proxy PTS
//   GET /api/dispensers/status (y todos los read-only)
// ============================================================

export interface PumpStatusMeta {
  /** Fecha UTC en que el backend recibió la data del PTS por última vez */
  lastPtsUpdateAt: string | null;
  /** Edad del snapshot al momento de responder */
  ageSeconds: number;
  /** true si el snapshot excede StaleThresholdSeconds o el último poll falló */
  stale: boolean;
  /** true si vino del cache; false con ?fresh=true o cold start */
  fromCache: boolean;
  /** Cantidad de bombas reportadas por el PTS */
  pumpCount: number;
  /** Mensaje del último error del poller, null en condiciones normales */
  error: string | null;
}

export interface PumpStatusEnvelope<T = unknown> extends PumpStatusMeta {
  successful: boolean;
  data: T;
}
