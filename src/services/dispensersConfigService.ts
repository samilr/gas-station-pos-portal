/**
 * Tipos para el dominio de dispenser config.
 * Los métodos CRUD viven ahora en `src/store/api/dispensersConfigApi.ts` (RTK Query).
 */

export type ConnectionType = 'TCP' | 'SERIAL' | 'RS485' | 'RS422';
export type Parity = 'None' | 'Even' | 'Odd';
export type StopBits = '1' | '1.5' | '2';

export interface Dispenser {
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
  dataBits: number | null;
  parity: Parity | null;
  stopBits: StopBits | null;

  protocol: string | null;
  protocolVersion: string | null;
  ptsPort: number | null;
  busAddress: number | null;
  timeoutMs: number;
  requiresAuthorization: boolean;

  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDispenserRequest {
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
  ptsPort?: number | null;
  busAddress?: number | null;
  timeoutMs: number;
  requiresAuthorization?: boolean;
}

export type UpdateDispenserRequest = Partial<Omit<CreateDispenserRequest, 'siteId' | 'pumpNumber'>> & {
  active?: boolean | null;
};
