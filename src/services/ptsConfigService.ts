// ============================================================
// Servicio de parámetros de configuración PTS-2
//   1.4 — Authorize with no preset
//   2.1 — Automatically authorize pump on nozzle up
//   2.2 — Automatically close transaction
//
// Pass-through al proxy PTS. Los valores viven en el firmware de la bomba,
// no en la BD del portal. Todos los endpoints responden con el wrapper
// estándar `{ successful, data }` con HTTP 200 — el éxito real se decide
// por `successful` y por el packet por bomba en las variantes bulk.
// ============================================================

import { buildApiUrl } from '../config/api';
import { prop } from './dispenserService';
import type { PtsPacket } from '../types/dispenser';
import type {
  AuthorizeWithoutPresetBulkBody,
  AutomaticOperationBulkBody,
  AutomaticOperationStatus,
  BulkPumpResult,
  BulkResponse,
  GetParameterBody,
  PtsProxySettings,
  SetDispenserRequiresAuthorizationResponse,
  SetParameterBody,
  SetParameterBulkBody,
  SetSiteRequiresAuthorizationResponse,
  ToggleFlag,
} from '../types/ptsConfig';

const TIMEOUT_MS = 15_000;
const PARAM_14_ADDRESS_KEY = 'pts.param14.address';
const DEFAULT_PARAM_14_ADDRESS = 4;

// ============================================================
// Helpers internos
// ============================================================

interface ApiEnvelope<T = unknown> {
  successful: boolean;
  data: T;
  error?: string;
}

async function apiFetch<T = any>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  body?: unknown
): Promise<ApiEnvelope<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-site-ID': 'PORTAL',
    };
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(buildApiUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
      return { successful: false, data: null as T, error: 'Sesión expirada' };
    }

    const json = await res.json().catch(() => null);
    if (!json || typeof json !== 'object') {
      return { successful: false, data: null as T, error: `HTTP ${res.status}` };
    }
    const envelope = json as ApiEnvelope<T>;
    if (envelope.successful === false) {
      return { successful: false, data: null as T, error: envelope.error || 'Error del PTS' };
    }
    return { successful: true, data: envelope.data };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { successful: false, data: null as any, error: `Timeout (${TIMEOUT_MS / 1000}s) esperando al PTS` };
    }
    return { successful: false, data: null as any, error: err?.message || 'Error de red' };
  } finally {
    clearTimeout(timer);
  }
}

const flagToState = (v: ToggleFlag): 'On' | 'Off' => (v ? 'On' : 'Off');
const stateToFlag = (v: unknown): ToggleFlag => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'on';
  return false;
};

function extractFirstPacketData<T = any>(data: any): T | null {
  if (!data) return null;
  const packets = Array.isArray(data.Packets) ? data.Packets : Array.isArray(data.packets) ? data.packets : [];
  if (packets.length === 0) return null;
  const p0 = packets[0];
  return (p0.Data ?? p0.data ?? null) as T | null;
}

function extractPackets(data: any): PtsPacket[] {
  if (!data) return [];
  const raw = Array.isArray(data.Packets) ? data.Packets : Array.isArray(data.packets) ? data.packets : [];
  return raw.map((p: any) => ({
    Id: p.Id ?? p.id ?? 0,
    Type: p.Type ?? p.type ?? '',
    Data: p.Data ?? p.data ?? null,
    Message: p.Message ?? p.message ?? null,
  }));
}

/**
 * Mapea los packets de un response bulk contra la lista de bombas enviada.
 *
 * El backend asigna Id correlativos (1, 2, 3…) según el orden en que armó el arreglo:
 *   - si la petición trae `pumps: [1,2,5]` → packet Id=1 → pump 1, Id=2 → pump 2, Id=3 → pump 5
 *   - si la petición trae `pumps` null/vacío → Id=1..pumpCount → pump 1..pumpCount
 *
 * `Type === "AcknowledgePacket"` (o paquete sin Message) se considera aprobado.
 */
export function mapBulkResults(
  packets: PtsPacket[],
  dispatchedPumps: number[]
): BulkPumpResult[] {
  return packets.map((pkt) => {
    const idx = (pkt.Id ?? 0) - 1;
    const pumpNumber = dispatchedPumps[idx] ?? pkt.Id ?? 0;
    const type = pkt.Type ?? '';
    const message = pkt.Message ?? null;
    const ok = type === 'AcknowledgePacket' || (!message && type !== 'NotAcknowledgePacket');
    return { packetId: pkt.Id, pumpNumber, ok, message, type };
  });
}

// ============================================================
// Address override del parámetro 1.4 (persistido en localStorage)
// ============================================================

export function getParam14Address(): number {
  const raw = localStorage.getItem(PARAM_14_ADDRESS_KEY);
  if (!raw) return DEFAULT_PARAM_14_ADDRESS;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PARAM_14_ADDRESS;
}

export function setParam14Address(address: number | null): void {
  if (address == null || address === DEFAULT_PARAM_14_ADDRESS) {
    localStorage.removeItem(PARAM_14_ADDRESS_KEY);
  } else {
    localStorage.setItem(PARAM_14_ADDRESS_KEY, String(address));
  }
}

export const DEFAULT_PARAM_14_ADDRESS_CONST = DEFAULT_PARAM_14_ADDRESS;

// ============================================================
// PumpCount — cantidad de bombas configuradas en el PTS
// ============================================================

export async function getPtsProxySettings(): Promise<PtsProxySettings | null> {
  const res = await apiFetch<PtsProxySettings>('GET', 'dispensers/settings');
  return res.successful ? res.data : null;
}

// ============================================================
// 2.1 / 2.2 — Automatic Operation (individual)
// ============================================================

export async function getAutomaticOperation(pump: number): Promise<AutomaticOperationStatus> {
  const res = await apiFetch('GET', `dispensers/${pump}/automatic-operation`);
  if (!res.successful) return { autoAuthorize: false, autoCloseTransaction: null };
  const data = extractFirstPacketData<any>(res.data);
  return {
    autoAuthorize: stateToFlag(prop(data, 'State')),
    autoCloseTransaction:
      prop(data, 'AutoCloseTransaction') == null
        ? null
        : stateToFlag(prop(data, 'AutoCloseTransaction')),
  };
}

export async function setAutomaticOperation(
  pump: number,
  autoAuthorize: ToggleFlag,
  autoCloseTransaction?: ToggleFlag
): Promise<void> {
  const body: Record<string, string> = { State: flagToState(autoAuthorize) };
  if (autoCloseTransaction !== undefined) {
    body.AutoCloseTransaction = flagToState(autoCloseTransaction);
  }
  const res = await apiFetch('PUT', `dispensers/${pump}/automatic-operation`, body);
  if (!res.successful) throw new Error(res.error || 'Error al actualizar operación automática');
}

// ============================================================
// 1.4 — Authorize without preset (individual)
// ============================================================

export async function setAuthorizeWithoutPreset(
  pump: number,
  enabled: ToggleFlag,
  address?: number
): Promise<void> {
  const body: Record<string, unknown> = { enabled };
  if (address !== undefined) body.address = address;
  const res = await apiFetch('PUT', `dispensers/${pump}/authorize-without-preset`, body);
  if (!res.successful) throw new Error(res.error || 'Error al actualizar preset de autorización');
}

// ============================================================
// Bulk — /automatic-operation/bulk
// ============================================================

export async function bulkSetAutomaticOperation(
  pumps: number[] | null,
  autoAuthorize: ToggleFlag,
  autoCloseTransaction?: ToggleFlag,
  pumpCount?: number
): Promise<BulkResponse> {
  const body: AutomaticOperationBulkBody = { state: flagToState(autoAuthorize) };
  if (pumps && pumps.length > 0) body.pumps = pumps;
  if (autoCloseTransaction !== undefined) {
    body.autoCloseTransaction = flagToState(autoCloseTransaction);
  }

  const res = await apiFetch('PUT', 'dispensers/automatic-operation/bulk', body);
  if (!res.successful) throw new Error(res.error || 'Error en bulk de operación automática');

  const packets = extractPackets(res.data);
  const dispatched = body.pumps ?? defaultPumpList(pumpCount, packets.length);
  return { packets, results: mapBulkResults(packets, dispatched) };
}

// ============================================================
// Bulk — /authorize-without-preset/bulk
// ============================================================

export async function bulkSetAuthorizeWithoutPreset(
  pumps: number[] | null,
  enabled: ToggleFlag,
  address?: number,
  pumpCount?: number
): Promise<BulkResponse> {
  const body: AuthorizeWithoutPresetBulkBody = { enabled };
  if (pumps && pumps.length > 0) body.pumps = pumps;
  if (address !== undefined) body.address = address;

  const res = await apiFetch('PUT', 'dispensers/authorize-without-preset/bulk', body);
  if (!res.successful) throw new Error(res.error || 'Error en bulk de preset de autorización');

  const packets = extractPackets(res.data);
  const dispatched = body.pumps ?? defaultPumpList(pumpCount, packets.length);
  return { packets, results: mapBulkResults(packets, dispatched) };
}

// ============================================================
// Comando maestro — set-parameter / set-parameter/bulk / get-parameter
// ============================================================

export async function setParameter(body: SetParameterBody): Promise<PtsPacket[]> {
  const res = await apiFetch('POST', 'dispensers/set-parameter', body);
  if (!res.successful) throw new Error(res.error || 'Error en set-parameter');
  return extractPackets(res.data);
}

export async function setParameterBulk(
  body: SetParameterBulkBody,
  pumpCount?: number
): Promise<BulkResponse> {
  const res = await apiFetch('POST', 'dispensers/set-parameter/bulk', body);
  if (!res.successful) throw new Error(res.error || 'Error en set-parameter bulk');

  const packets = extractPackets(res.data);
  const dispatched = body.numbers ?? defaultPumpList(pumpCount, packets.length);
  return { packets, results: mapBulkResults(packets, dispatched) };
}

export async function getParameter(body: GetParameterBody): Promise<PtsPacket[]> {
  const res = await apiFetch('POST', 'dispensers/get-parameter', body);
  if (!res.successful) throw new Error(res.error || 'Error en get-parameter');
  return extractPackets(res.data);
}

// ============================================================
// Utilidad — cuando pumps no se envió, asume 1..N
// ============================================================

function defaultPumpList(pumpCount: number | undefined, fallbackLen: number): number[] {
  const n = pumpCount && pumpCount > 0 ? pumpCount : fallbackLen;
  return Array.from({ length: n }, (_, i) => i + 1);
}

// ============================================================
// Site-level pre-pago bulk
//   PUT /api/dispensers-config/sites/{siteId}/requires-authorization
//
// Aplica primero al PTS (param 1.4 bulk) y luego a la BD. Si el PTS
// rechaza, la BD no se toca (el backend devuelve 409 → res.successful=false).
// 404 si el site no tiene dispensadoras activas.
// ============================================================

export async function setSiteRequiresAuthorization(
  siteId: string,
  requireAuthorization: boolean,
  address?: number,
): Promise<SetSiteRequiresAuthorizationResponse> {
  const trimmed = siteId.trim();
  if (!trimmed) throw new Error('siteId es requerido');

  const body: { requireAuthorization: boolean; address?: number } = { requireAuthorization };
  if (address !== undefined) body.address = address;

  const res = await apiFetch<SetSiteRequiresAuthorizationResponse>(
    'PUT',
    `dispensers-config/sites/${encodeURIComponent(trimmed)}/requires-authorization`,
    body,
  );
  if (!res.successful) {
    throw new Error(res.error || 'Error al cambiar el modo de cobro del site');
  }
  return res.data;
}

// ============================================================
// Per-dispenser pre-pago (atómico PTS+BD para una sola bomba)
//   PUT /api/dispensers-config/{id}/requires-authorization
//
// El backend orquesta: PTS 1.4 → PTS 2.1 → BD. Mismo principio que el
// bulk de site pero scope a una bomba — pensado para la pantalla de
// detalle / edición individual.
// ============================================================

export async function setDispenserRequiresAuthorization(
  dispenserId: number,
  requireAuthorization: boolean,
  address?: number,
): Promise<SetDispenserRequiresAuthorizationResponse> {
  if (!Number.isFinite(dispenserId) || dispenserId <= 0) {
    throw new Error('dispenserId es requerido');
  }

  const body: { requireAuthorization: boolean; address?: number } = { requireAuthorization };
  if (address !== undefined) body.address = address;

  const res = await apiFetch<SetDispenserRequiresAuthorizationResponse>(
    'PUT',
    `dispensers-config/${dispenserId}/requires-authorization`,
    body,
  );
  if (!res.successful) {
    throw new Error(res.error || 'Error al cambiar el modo de cobro de la dispensadora');
  }
  return res.data;
}
