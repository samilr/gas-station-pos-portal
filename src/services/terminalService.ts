import { buildApiUrl } from "../config/api";
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from "./apiInterceptor";

interface TerminalResponse {
  successful: boolean;
  data: ITerminal[];
}

interface CreateTerminalRequest {
  siteId: string;
  terminalId: number;
  name: string;
  sectorId?: number;
  active?: boolean;
  hasIntegratedDispenser?: boolean;
  linkedDispenserId?: number | null;
  terminalType?: number;
  productList?: number;
  useCustomerDisplay?: boolean;
  openCashDrawer?: boolean;
  printDevice?: number;
  cashFund?: number;
  productListType?: number;
}

interface UpdateTerminalRequest {
  name?: string;
  sectorId?: number;
  active?: boolean;
  hasIntegratedDispenser?: boolean;
  linkedDispenserId?: number | null;
  terminalType?: number;
  productList?: number;
  useCustomerDisplay?: boolean;
  openCashDrawer?: boolean;
  printDevice?: number;
  cashFund?: number;
  productListType?: number;
}

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
  hasIntegratedDispenser: boolean;
  linkedDispenserId: number | null;
  device?: ITerminalDevice | null;
}

export const terminalService = {
  async getTerminals(params?: { search?: string; page?: number; limit?: number }): Promise<TerminalResponse> {
    const query = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    const response = await apiGet<ITerminal[]>(buildApiUrl('terminals') + query);
    return {
      successful: response.successful,
      data: response.data || []
    };
  },

  async getTerminal(siteId: string, terminalId: number): Promise<ApiResponse<ITerminal>> {
    return await apiGet<ITerminal>(buildApiUrl(`terminals/${siteId}/${terminalId}`));
  },

  async createTerminal(terminalData: CreateTerminalRequest): Promise<ApiResponse<ITerminal[]>> {
    return await apiPost<ITerminal[]>(buildApiUrl('terminals'), terminalData);
  },

  async updateTerminal(siteId: string, terminalId: number, terminalData: UpdateTerminalRequest): Promise<ApiResponse<ITerminal[]>> {
    return await apiPut<ITerminal[]>(buildApiUrl(`terminals/${siteId}/${terminalId}`), terminalData);
  },

  async deleteTerminal(siteId: string, terminalId: number): Promise<ApiResponse<ITerminal[]>> {
    return await apiDelete<ITerminal[]>(buildApiUrl(`terminals/${siteId}/${terminalId}`));
  }
};

