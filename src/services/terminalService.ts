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
  connected: boolean;
  active: boolean;
  hasIntegratedDispenser: boolean;
  linkedDispenserId: number | null;
}

interface UpdateTerminalRequest {
  siteId?: string;
  name?: string;
  terminalId?: number;
  connected?: boolean;
  sectorId?: number;
  active?: boolean;
  hasIntegratedDispenser?: boolean;
  linkedDispenserId?: number | null;
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
}

export const terminalService = {
  async getTerminals(): Promise<TerminalResponse> {
    const response = await apiGet<ITerminal[]>(buildApiUrl('terminals'));
    return {
      successful: response.successful,
      data: response.data || []
    };
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

