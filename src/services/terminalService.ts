import { buildApiUrl } from "../config/api";

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

const API_BASE_URL = buildApiUrl(''); 

export const terminalService = {
  async getTerminals(): Promise<TerminalResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}terminals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TerminalResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo terminales:', error);
      throw error;
    }
  },

  async createTerminal(terminalData: CreateTerminalRequest): Promise<TerminalResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}terminals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(terminalData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TerminalResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando terminal:', error);
      throw error;
    }
  },

  async updateTerminal(siteId: string, terminalId: number, terminalData: UpdateTerminalRequest): Promise<TerminalResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}terminals/${siteId}/${terminalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(terminalData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TerminalResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando terminal:', error);
      throw error;
    }
  },

  async deleteTerminal(siteId: string, terminalId: number): Promise<TerminalResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}terminals/${siteId}/${terminalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TerminalResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error eliminando terminal:', error);
      throw error;
    }
  }
};

