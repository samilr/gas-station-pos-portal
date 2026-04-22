/**
 * Tipos para el dominio de fuel islands.
 * Los métodos CRUD viven ahora en `src/store/api/fuelIslandsApi.ts` (RTK Query).
 */

import { Dispenser } from './dispensersConfigService';

export interface FuelIslandTerminalSummary {
  siteId: string;
  terminalId: number;
  name: string;
  active: boolean;
}

export interface FuelIsland {
  fuelIslandId: number;
  siteId: string;
  name: string;
  active: boolean;
  dispensers?: Dispenser[];
  terminals?: FuelIslandTerminalSummary[];
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateFuelIslandRequest {
  siteId: string;
  name: string;
  dispenserIds?: number[];
}

export interface UpdateFuelIslandRequest {
  name?: string;
  active?: boolean;
}

export interface AssignDispensersRequest {
  dispenserIds: number[];
}
