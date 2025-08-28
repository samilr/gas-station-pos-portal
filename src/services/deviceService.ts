import { buildApiUrl } from "../config/api";

interface DeviceResponse {
  successful: boolean;
  data: IDevice[];
}

interface CreateDeviceRequest {
  name: string;
  deviceId: string;
  siteId: string;
  status: boolean;
  deviceType: string;
  description?: string;
}

interface UpdateDeviceRequest {
  name?: string;
  deviceId?: string;
  siteId?: string;
  status?: boolean;
  deviceType?: string;
  description?: string;
}

export interface IDevice {
  id: string;
  name: string;
  deviceId: string;
  siteId: string;
  status: boolean;
  deviceType: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const API_BASE_URL = buildApiUrl(''); 

export const deviceService = {
  async getDevices(): Promise<DeviceResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}devices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DeviceResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo dispositivos:', error);
      throw error;
    }
  },

  async createDevice(deviceData: CreateDeviceRequest): Promise<DeviceResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(deviceData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DeviceResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando dispositivo:', error);
      throw error;
    }
  },

  async updateDevice(deviceId: string, deviceData: UpdateDeviceRequest): Promise<DeviceResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(deviceData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DeviceResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando dispositivo:', error);
      throw error;
    }
  },

  async deleteDevice(deviceId: string): Promise<DeviceResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DeviceResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error eliminando dispositivo:', error);
      throw error;
    }
  }
};

