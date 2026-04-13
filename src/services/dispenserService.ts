import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';
import { buildApiUrl } from '../config/api';
import type {
  PumpStatusPacket,
  PumpStatusData,
  PumpIdleStatusData,
  PumpOfflineStatusData,
  PumpVisualState,
  AuthorizeRequest,
  PumpPricesData,
  NozzlePriceUpdate,
  FuelGradePrice,
  PriceSchedule,
  ProbeMeasurementsData,
  VolumeTableEntry,
  TankConfig,
  DateTimeData,
  GpsData,
  DecimalDigitsData,
  NetworkSettingsData,
  PtsUserConfig,
  PumpPortConfig,
  PumpConfig,
  PumpNozzleConfig,
  FuelGradeConfig,
  ProbeConfig,
  ReaderConfig,
  PriceBoardConfig,
  TagInfo,
  PumpTransactionReport,
  TankMeasurementReport,
  InTankDeliveryReport,
  ReportDateFilter,
  FuelTransaction,
  FuelTransactionPagination,
  FuelTransactionsParams,
  FuelTransactionUpdateDto,
  PtsPacket,
  PtsResponse,
  PumpTransactionInfoData,
  PumpTotalsData,
  PumpDisplayData,
} from '../types/dispenser';

// Re-exportar tipos para retrocompatibilidad
export type {
  PumpStatusPacket,
  PumpStatusData,
  PumpIdleStatusData,
  PumpOfflineStatusData,
  PumpVisualState,
  PtsPacket,
  PtsResponse,
  FuelTransaction,
  FuelTransactionPagination,
};

// Helper para extraer packets de la respuesta del API proxy.
// El backend devuelve propiedades en camelCase (packets, type, data, id, message)
// pero los tipos internos usan PascalCase. Esta función normaliza.
function extractRawPackets(response: any): any[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  // camelCase: { packets: [...] }
  if (Array.isArray(response.packets)) return response.packets;
  // PascalCase: { Packets: [...] }
  if (Array.isArray(response.Packets)) return response.Packets;
  // Nested: { data: { packets/Packets: [...] } }
  if (response.data) {
    if (Array.isArray(response.data.packets)) return response.data.packets;
    if (Array.isArray(response.data.Packets)) return response.data.Packets;
  }
  console.warn('[Dispensers] No se pudieron extraer packets de:', response);
  return [];
}

// Normaliza un packet de camelCase a PascalCase para compatibilidad con los tipos
function normalizePacket(raw: any): PtsPacket {
  return {
    Id: raw.Id ?? raw.id ?? 0,
    Type: raw.Type ?? raw.type ?? '',
    Data: raw.Data ?? raw.data ?? {},
    Message: raw.Message ?? raw.message ?? null,
  };
}

function extractPackets<T>(response: any): PtsPacket<T>[] {
  return extractRawPackets(response).map(normalizePacket);
}

function extractFirstPacketData<T>(response: any): T | null {
  const packets = extractPackets<T>(response);
  return packets.length > 0 ? packets[0].Data : null;
}

// Busca una propiedad en un objeto probando PascalCase y camelCase
export function prop(obj: any, pascalKey: string): any {
  if (!obj) return undefined;
  if (obj[pascalKey] !== undefined) return obj[pascalKey];
  // Convertir a camelCase: primera letra minúscula
  const camelKey = pascalKey.charAt(0).toLowerCase() + pascalKey.slice(1);
  return obj[camelKey];
}

// Acceso seguro a múltiples propiedades de un objeto PTS (PascalCase o camelCase)
export function p(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  return new Proxy(obj, {
    get(target, key: string) {
      if (key in target) return target[key];
      // Intentar la otra variante
      const alt = key.charAt(0) === key.charAt(0).toUpperCase()
        ? key.charAt(0).toLowerCase() + key.slice(1)   // PascalCase → camelCase
        : key.charAt(0).toUpperCase() + key.slice(1);   // camelCase → PascalCase
      return target[alt];
    }
  });
}

// ============================================================
// Módulo 1 — Monitor
// ============================================================

export async function getAllPumpStatuses(): Promise<PumpStatusPacket[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/status'));
  if (!res.successful) throw new Error(res.error || 'Error al obtener estado de bombas');
  return extractPackets<PumpStatusData>(res.data);
}

export async function getPumpStatus(pump: number): Promise<PumpStatusPacket> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/status/${pump}`));
  if (!res.successful) throw new Error(res.error || `Error al obtener estado de bomba ${pump}`);
  const packets = extractPackets<PumpStatusData>(res.data);
  if (packets.length === 0) throw new Error(`Sin datos para bomba ${pump}`);
  return packets[0] as PumpStatusPacket;
}

export async function getPumpDisplay(pump: number): Promise<PumpDisplayData | null> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/${pump}/display`));
  if (!res.successful) return null;
  return extractFirstPacketData<PumpDisplayData>(res.data);
}

// ============================================================
// Módulo 2 — Control
// ============================================================

export async function lockPump(pump: number): Promise<void> {
  const res = await apiPost(buildApiUrl(`dispensers/${pump}/lock`));
  if (!res.successful) throw new Error(res.error || `Error al bloquear bomba ${pump}`);
}

export async function unlockPump(pump: number): Promise<void> {
  const res = await apiPost(buildApiUrl(`dispensers/${pump}/unlock`));
  if (!res.successful) throw new Error(res.error || `Error al desbloquear bomba ${pump}`);
}

export async function lockAllPumps(): Promise<void> {
  const res = await apiPost(buildApiUrl('dispensers/lock-all'));
  if (!res.successful) throw new Error(res.error || 'Error al bloquear todas las bombas');
}

export async function unlockAllPumps(): Promise<void> {
  const res = await apiPost(buildApiUrl('dispensers/unlock-all'));
  if (!res.successful) throw new Error(res.error || 'Error al desbloquear todas las bombas');
}

export async function authorizePump(pump: number, request: AuthorizeRequest): Promise<void> {
  const res = await apiPost(buildApiUrl(`dispensers/${pump}/authorize`), request);
  if (!res.successful) throw new Error(res.error || `Error al autorizar bomba ${pump}`);
}

export async function stopPump(pump: number): Promise<void> {
  const res = await apiPost(buildApiUrl(`dispensers/${pump}/stop`));
  if (!res.successful) throw new Error(res.error || `Error al detener bomba ${pump}`);
}

export async function emergencyStopPump(pump: number): Promise<void> {
  const res = await apiPost(buildApiUrl(`dispensers/${pump}/emergency-stop`));
  if (!res.successful) throw new Error(res.error || `Error en parada de emergencia bomba ${pump}`);
}

export async function suspendPump(pump: number): Promise<void> {
  const res = await apiPost(buildApiUrl(`dispensers/${pump}/suspend`));
  if (!res.successful) throw new Error(res.error || `Error al suspender bomba ${pump}`);
}

export async function resumePump(pump: number): Promise<void> {
  const res = await apiPost(buildApiUrl(`dispensers/${pump}/resume`));
  if (!res.successful) throw new Error(res.error || `Error al reanudar bomba ${pump}`);
}

export async function closeTransaction(pump: number): Promise<void> {
  const res = await apiPost(buildApiUrl(`dispensers/${pump}/close-transaction`));
  if (!res.successful) throw new Error(res.error || `Error al cerrar transacción bomba ${pump}`);
}

export async function getPumpTransaction(pump: number): Promise<PumpTransactionInfoData | null> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/${pump}/transaction`));
  if (!res.successful) return null;
  return extractFirstPacketData<PumpTransactionInfoData>(res.data);
}

export async function getPumpTotals(pump: number): Promise<PumpTotalsData | null> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/${pump}/totals`));
  if (!res.successful) return null;
  return extractFirstPacketData<PumpTotalsData>(res.data);
}

export async function setPumpLights(pump: number, lights: 'On' | 'Off'): Promise<void> {
  const res = await apiPut(buildApiUrl(`dispensers/${pump}/lights`), { Lights: lights });
  if (!res.successful) throw new Error(res.error || 'Error al configurar luces');
}

export async function getPumpAutomaticOperation(pump: number): Promise<string> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/${pump}/automatic-operation`));
  if (!res.successful) return 'Off';
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'State') || 'Off';
}

export async function setPumpAutomaticOperation(pump: number, state: 'On' | 'Off'): Promise<void> {
  const res = await apiPut(buildApiUrl(`dispensers/${pump}/automatic-operation`), { State: state });
  if (!res.successful) throw new Error(res.error || 'Error al configurar operación automática');
}

export async function getPumpTag(pump: number): Promise<string> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/${pump}/tag`));
  if (!res.successful) return '';
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Tag') || '';
}

// ============================================================
// Módulo 3 — Precios
// ============================================================

export async function getPumpPrices(pump: number): Promise<PumpPricesData | null> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/${pump}/prices`));
  if (!res.successful) return null;
  return extractFirstPacketData<PumpPricesData>(res.data);
}

export async function updatePumpPrices(pump: number, prices: NozzlePriceUpdate[]): Promise<void> {
  const res = await apiPut(buildApiUrl(`dispensers/${pump}/prices`), { NozzlePrices: prices });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar precios');
}

export async function getGlobalFuelPrices(): Promise<FuelGradePrice[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/fuel-prices'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'FuelGradesPrices') || [];
}

export async function updateGlobalFuelPrices(prices: FuelGradePrice[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/fuel-prices'), { FuelGradesPrices: prices });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar precios globales');
}

export async function getPricesScheduler(): Promise<PriceSchedule[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/prices-scheduler'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'PriceSchedules') || [];
}

export async function updatePricesScheduler(schedules: PriceSchedule[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/prices-scheduler'), { PriceSchedules: schedules });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar programador de precios');
}

// ============================================================
// Módulo 4 — Tanques y Sondas
// ============================================================

export async function getProbeMeasurements(probe: number): Promise<ProbeMeasurementsData | null> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/probes/${probe}/measurements`));
  if (!res.successful) return null;
  return extractFirstPacketData<ProbeMeasurementsData>(res.data);
}

export async function getProbeVolumeTable(probe: number): Promise<VolumeTableEntry[]> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/probes/${probe}/volume-table`));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'VolumeTable') || [];
}

export async function getTanksConfig(): Promise<TankConfig[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/tanks'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Tanks') || [];
}

export async function updateTanksConfig(tanks: TankConfig[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/tanks'), { Tanks: tanks });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar tanques');
}

// ============================================================
// PTS Connection Settings
// ============================================================

export interface PtsSettings {
  baseUrl: string;
  username: string;
  password: string;
  pumpCount: number;
}

export async function getPtsSettings(): Promise<PtsSettings | null> {
  const res = await apiGet<any>(buildApiUrl('dispensers/settings'));
  if (!res.successful) return null;
  return res.data;
}

export async function updatePtsSettings(data: Partial<PtsSettings>): Promise<void> {
  const res = await apiPut<any>(buildApiUrl('dispensers/settings'), data);
  if (!res.successful) throw new Error(res.error || 'Error al actualizar configuración PTS');
}

// ============================================================
// Módulo 5 — Sistema
// ============================================================

export async function getSystemInfo(): Promise<PtsPacket[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/system/info'));
  if (!res.successful) return [];
  return extractPackets(res.data);
}

export async function getSystemDateTime(): Promise<DateTimeData | null> {
  const res = await apiGet<any>(buildApiUrl('dispensers/system/datetime'));
  if (!res.successful) return null;
  return extractFirstPacketData<DateTimeData>(res.data);
}

export async function updateSystemDateTime(data: DateTimeData): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/system/datetime'), data);
  if (!res.successful) throw new Error(res.error || 'Error al actualizar fecha/hora');
}

export async function restartSystem(): Promise<void> {
  const res = await apiPost(buildApiUrl('dispensers/system/restart'));
  if (!res.successful) throw new Error(res.error || 'Error al reiniciar sistema');
}

export async function getGpsData(): Promise<GpsData | null> {
  const res = await apiGet<any>(buildApiUrl('dispensers/system/gps'));
  if (!res.successful) return null;
  return extractFirstPacketData<GpsData>(res.data);
}

export async function getPtsUsers(): Promise<PtsUserConfig[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/users'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Users') || [];
}

export async function updatePtsUsers(users: PtsUserConfig[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/users'), { Users: users });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar usuarios');
}

export async function getNetworkSettings(): Promise<NetworkSettingsData | null> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/network'));
  if (!res.successful) return null;
  return extractFirstPacketData<NetworkSettingsData>(res.data);
}

export async function updateNetworkSettings(data: NetworkSettingsData): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/network'), data);
  if (!res.successful) throw new Error(res.error || 'Error al actualizar configuración de red');
}

export async function getDecimalDigits(): Promise<DecimalDigitsData | null> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/decimal-digits'));
  if (!res.successful) return null;
  return extractFirstPacketData<DecimalDigitsData>(res.data);
}

export async function updateDecimalDigits(data: DecimalDigitsData): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/decimal-digits'), data);
  if (!res.successful) throw new Error(res.error || 'Error al actualizar dígitos decimales');
}

// ============================================================
// Módulo 6 — Hardware
// ============================================================

export async function getPumpsConfig(): Promise<{ Ports: PumpPortConfig[]; Pumps: PumpConfig[] } | null> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/pumps'));
  if (!res.successful) return null;
  const data = extractFirstPacketData<any>(res.data);
  if (!data) return null;
  return { Ports: prop(data, 'Ports') || [], Pumps: prop(data, 'Pumps') || [] };
}

export async function updatePumpsConfig(data: { Ports: PumpPortConfig[]; Pumps: PumpConfig[] }): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/pumps'), data);
  if (!res.successful) throw new Error(res.error || 'Error al actualizar configuración de bombas');
}

export async function getNozzlesConfig(): Promise<PumpNozzleConfig[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/nozzles'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'PumpNozzles') || [];
}

export async function updateNozzlesConfig(nozzles: PumpNozzleConfig[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/nozzles'), { PumpNozzles: nozzles });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar configuración de pistolas');
}

export async function getFuelGradesConfig(): Promise<FuelGradeConfig[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/fuel-grades'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'FuelGrades') || [];
}

export async function updateFuelGradesConfig(grades: FuelGradeConfig[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/fuel-grades'), { FuelGrades: grades });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar grados de combustible');
}

export async function getProbesConfig(): Promise<ProbeConfig[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/probes'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Probes') || [];
}

export async function updateProbesConfig(probes: ProbeConfig[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/probes'), { Probes: probes });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar configuración de sondas');
}

export async function getReadersConfig(): Promise<ReaderConfig[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/readers'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Readers') || [];
}

export async function updateReadersConfig(readers: ReaderConfig[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/readers'), { Readers: readers });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar configuración de lectores');
}

export async function getPriceBoardsConfig(): Promise<PriceBoardConfig[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/config/price-boards'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'PriceBoards') || [];
}

export async function updatePriceBoardsConfig(boards: PriceBoardConfig[]): Promise<void> {
  const res = await apiPut(buildApiUrl('dispensers/config/price-boards'), { PriceBoards: boards });
  if (!res.successful) throw new Error(res.error || 'Error al actualizar paneles de precios');
}

// ============================================================
// Módulo 7 — Tags RFID
// ============================================================

export async function getAllTags(): Promise<TagInfo[]> {
  const res = await apiGet<any>(buildApiUrl('dispensers/tags'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Tags') || [];
}

export async function getTagsCount(): Promise<number> {
  const res = await apiGet<any>(buildApiUrl('dispensers/tags/count'));
  if (!res.successful) return 0;
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'TotalNumber') || 0;
}

export async function getTagById(tagId: string): Promise<TagInfo | null> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/tags/${tagId}`));
  if (!res.successful) return null;
  return extractFirstPacketData<TagInfo>(res.data);
}

export async function replaceTags(tags: Omit<TagInfo, 'Present'>[]): Promise<void> {
  const res = await apiPost(buildApiUrl('dispensers/tags'), { Tags: tags });
  if (!res.successful) throw new Error(res.error || 'Error al reemplazar tags');
}

export async function addTags(tags: Omit<TagInfo, 'Present'>[]): Promise<void> {
  const res = await apiPost(buildApiUrl('dispensers/tags/add'), { Tags: tags });
  if (!res.successful) throw new Error(res.error || 'Error al agregar tags');
}

export async function readReaderTag(reader: number): Promise<string> {
  const res = await apiGet<any>(buildApiUrl(`dispensers/readers/${reader}/tag`));
  if (!res.successful) return '';
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Tag') || '';
}

// ============================================================
// Módulo 8 — Reportes
// ============================================================

export async function getPumpTransactionsReport(filter?: ReportDateFilter): Promise<PumpTransactionReport[]> {
  const res = filter
    ? await apiPost<any>(buildApiUrl('dispensers/reports/pump-transactions'), filter)
    : await apiGet<any>(buildApiUrl('dispensers/reports/pump-transactions'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Transactions') || [];
}

export async function getTankMeasurementsReport(filter?: ReportDateFilter): Promise<TankMeasurementReport[]> {
  const res = filter
    ? await apiPost<any>(buildApiUrl('dispensers/reports/tank-measurements'), filter)
    : await apiGet<any>(buildApiUrl('dispensers/reports/tank-measurements'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Measurements') || [];
}

export async function getInTankDeliveriesReport(filter?: ReportDateFilter): Promise<InTankDeliveryReport[]> {
  const res = filter
    ? await apiPost<any>(buildApiUrl('dispensers/reports/in-tank-deliveries'), filter)
    : await apiGet<any>(buildApiUrl('dispensers/reports/in-tank-deliveries'));
  if (!res.successful) return [];
  const data = extractFirstPacketData<any>(res.data);
  return prop(data, 'Deliveries') || [];
}

// ============================================================
// Módulo 9 — Transacciones de BD
// ============================================================

export async function getFuelTransactions(params?: FuelTransactionsParams): Promise<{
  data: FuelTransaction[];
  pagination: FuelTransactionPagination | null;
}> {
  const searchParams = new URLSearchParams();
  if (params?.pump) searchParams.set('pump', String(params.pump));
  if (params?.nozzle) searchParams.set('nozzle', String(params.nozzle));
  if (params?.fuelGradeId) searchParams.set('fuelGradeId', String(params.fuelGradeId));
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = buildApiUrl(`fuel-transactions${query ? `?${query}` : ''}`);
  const res = await apiGet<any>(url);

  if (!res.successful) return { data: [], pagination: null };

  // El interceptor devuelve el body completo cuando detecta `pagination`
  // Estructura: { data: [...], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }
  const body = res.data;
  const data = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
  const pagination = body?.pagination || null;
  return { data, pagination };
}

export async function getFuelTransactionById(id: number): Promise<FuelTransaction | null> {
  const res = await apiGet<any>(buildApiUrl(`fuel-transactions/${id}`));
  if (!res.successful) return null;
  return res.data;
}

export async function updateFuelTransaction(id: number, data: FuelTransactionUpdateDto): Promise<FuelTransaction | null> {
  const res = await apiPut<any>(buildApiUrl(`fuel-transactions/${id}`), data);
  if (!res.successful) throw new Error(res.error || 'Error al actualizar transacción');
  return res.data;
}

export async function deleteFuelTransaction(id: number): Promise<void> {
  const res = await apiDelete(buildApiUrl(`fuel-transactions/${id}`));
  if (!res.successful) throw new Error(res.error || 'Error al eliminar transacción');
}

// ============================================================
// Helpers de estado de bomba
// ============================================================

export function getPumpVisualState(packet: PumpStatusPacket | null): PumpVisualState {
  if (!packet) return 'offline';
  switch (packet.Type) {
    case 'PumpFillingStatus':
      return 'dispensing';
    case 'PumpIdleStatus': {
      const req = prop(packet.Data, 'Request');
      return req === 'PumpLock' ? 'locked' : 'available';
    }
    case 'PumpOfflineStatus':
      return 'offline';
    case 'PumpEndOfTransactionStatus':
      return 'end-of-transaction';
    default:
      return 'offline';
  }
}

export function isPumpLocked(packet: PumpStatusPacket | null): boolean {
  if (!packet) return false;
  if (packet.Type === 'PumpIdleStatus' || packet.Type === 'PumpOfflineStatus') {
    return prop(packet.Data, 'Request') === 'PumpLock';
  }
  return false;
}

export function getPumpNumber(packet: PumpStatusPacket): number {
  return prop(packet.Data, 'Pump') || 0;
}
