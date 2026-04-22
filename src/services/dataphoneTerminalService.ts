/**
 * Tipos para el dominio de dataphone-terminals.
 * Los métodos CRUD viven ahora en `src/store/api/dataphoneTerminalsApi.ts` (RTK Query).
 */

export interface DataphoneTerminal {
  dataphoneId: number;
  siteId: string;
  terminalId: number;
  dataphoneIp: string;
  terminalIp: string;
  closingManually: boolean;
  active: boolean;
}

export interface CreateDataphoneTerminalRequest {
  dataphoneId: number;
  siteId: string;
  terminalId: number;
  dataphoneIp: string;
  terminalIp: string;
  closingManually: boolean;
  active: boolean;
}

export type UpdateDataphoneTerminalRequest = Partial<Omit<CreateDataphoneTerminalRequest, 'dataphoneId' | 'siteId' | 'terminalId'>>;

export interface CompositeKey {
  dataphoneId: number;
  siteId: string;
  terminalId: number;
}
