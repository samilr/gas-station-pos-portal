/**
 * Tipos para el dominio de hosts/devices.
 * Los métodos CRUD viven ahora en `src/store/api/devicesApi.ts` (RTK Query).
 */

import { IHostType } from './hostTypeService';

export interface IHost {
  hostId: number;
  name: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  connected: boolean;
  connectedLastTime?: string | Date;
  connectedLastUserId?: number;
  active: boolean;
  hostTypeId?: number;
  hostType?: IHostType | null;
}

// Alias para compatibilidad
export type IDevice = IHost;
