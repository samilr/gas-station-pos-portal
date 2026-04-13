import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IRole, ICreateRoleDto, IUpdateRoleDto } from '../types/role';

export const roleService = {
  async getRoles(): Promise<ApiResponse<IRole[]>> {
    return apiGet<IRole[]>(buildApiUrl('roles'));
  },
  async getRoleById(roleId: number): Promise<ApiResponse<IRole>> {
    return apiGet<IRole>(buildApiUrl(`roles/${roleId}`));
  },
  async createRole(data: ICreateRoleDto): Promise<ApiResponse<IRole>> {
    return apiPost<IRole>(buildApiUrl('roles'), data);
  },
  async updateRole(roleId: number, data: IUpdateRoleDto): Promise<ApiResponse<IRole>> {
    return apiPut<IRole>(buildApiUrl(`roles/${roleId}`), data);
  },
  async deleteRole(roleId: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`roles/${roleId}`));
  },
};
