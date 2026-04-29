/**
 * Tipos para el dominio de terminals.
 * Los métodos CRUD viven ahora en `src/store/api/terminalsApi.ts` (RTK Query).
 */

export interface ITerminalDevice {
  hostId: number;
  name: string;
  description?: string;
  deviceId: string;
  hostTypeId: number;
  hostTypeName: string;
  hostTypeDescription?: string;
  hostTypeCode: string;
  hasPrinter: boolean;
}

export interface ITerminal {
  siteId: string;
  terminalId: number;
  name: string;
  terminalType: number;
  sectorId?: number;
  productList: number;
  useCustomerDisplay: boolean;
  openCashDrawer: boolean;
  printDevice: number;
  cashFund: number;
  connected: boolean;
  lastConnectionTime?: string | Date;
  lastConnectionHostname?: string;
  lastConnectionUsername?: string;
  connectedTime?: string | Date;
  connectedHostname?: string | null;
  connectedUsername?: string | null;
  connectedStaftId?: number | null;
  active: boolean;
  productListType: number;
  fuelIslandId: number | null;
  fuelIslandEnabled: boolean;
  dataphoneEnabled: boolean;
  device?: ITerminalDevice | null;
}
