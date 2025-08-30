import { buildApiUrl } from '../config/api';
import { ISite, ICreateSiteDto, IUpdateSiteDto } from '../types/site';

export interface ApiResponse<T> {
  successful: boolean;
  data: T;
  message?: string;
}

export const siteService = {
  async getAllSites(): Promise<ApiResponse<ISite[]>> {
    try {
      const response = await fetch(buildApiUrl('sites/all'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        successful: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching sites:', error);
      return {
        successful: false,
        data: []
      };
    }
  },

  async createSite(siteData: ICreateSiteDto): Promise<ApiResponse<ISite>> {
    try {
      const response = await fetch(buildApiUrl('sites'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(siteData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        successful: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error creating site:', error);
      return {
        successful: false,
        data: {} as ISite
      };
    }
  },

  async updateSite(siteId: string, siteData: IUpdateSiteDto): Promise<ApiResponse<ISite>> {
    try {
      const response = await fetch(buildApiUrl(`sites/${siteId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(siteData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        successful: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error updating site:', error);
      return {
        successful: false,
        data: {} as ISite
      };
    }
  },

  async deleteSite(siteId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(buildApiUrl(`sites/${siteId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        successful: true,
        data: true
      };
    } catch (error) {
      console.error('Error deleting site:', error);
      return {
        successful: false,
        data: false
      };
    }
  }
};
