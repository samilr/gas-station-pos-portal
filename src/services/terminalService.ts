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
}

interface UpdateTerminalRequest {
  siteId?: string;
  name?: string;
  terminalId?: number;
  connected?: boolean;
  sectorId?: number;
  active?: boolean;
}

export interface ITerminal {
  site_id: string;
  terminal_id: number;
  name: string;
  terminal_type: number;
  sector_id?: number;
  product_list: number;
  use_customer_display: boolean;
  open_cash_drawer: boolean;
  print_device: number;
  cash_fund: number;
  connected: boolean;
  last_connection_time?: Date;
  last_connection_hostname?: string;
  last_connection_username?: string;
  connected_time?: Date;
  connected_hostname?: string;
  connected_username?: string;
  connected_staft_id?: number;
  active: boolean;
  product_list_type: number;
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

