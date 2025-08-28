import { buildApiUrl } from "../config/api";

interface HostResponse {
  successful: boolean;
  data: IHost[];
}

interface CreateHostRequest {
  hostId: number;
  name: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  connected: boolean;
  connectedLastTime?: Date;
  connectedLastUserId?: number;
  active: boolean;
}

interface UpdateHostRequest {
  hostId?: number;
  name?: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  connected?: boolean;
  connectedLastTime?: Date;
  connectedLastUserId?: number;
  active?: boolean;
}

export interface IHost {
  host_id: number;
  name: string;
  description?: string;
  ip_address?: string;
  site_id?: string;
  device_id?: string;
  connected: boolean;
  connected_last_time?: Date;
  connected_last_user_id?: number;
  active: boolean;
}

const API_BASE_URL = buildApiUrl(''); 

export const hostService = {
  async getHosts(): Promise<HostResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}hosts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HostResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo hosts:', error);
      throw error;
    }
  },

  async createHost(hostData: CreateHostRequest): Promise<HostResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}hosts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(hostData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HostResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando host:', error);
      throw error;
    }
  },

  async updateHost(hostId: number, hostData: UpdateHostRequest): Promise<HostResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}hosts/${hostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(hostData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HostResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando host:', error);
      throw error;
    }
  },

  async deleteHost(hostId: number): Promise<HostResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}hosts/${hostId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HostResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error eliminando host:', error);
      throw error;
    }
  }
};

// Mantener compatibilidad con el nombre anterior
export const deviceService = hostService;
export interface IDevice extends IHost {}

