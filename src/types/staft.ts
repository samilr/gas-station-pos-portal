export interface IStaft {
  staftId: number;
  name: string;
  siteId: string;
  terminalId: number;
  shift: number;
  isManager: boolean;
  staftGroupId?: number;
  changePassword?: boolean;
  active?: boolean;
}

export interface ICreateStaftDto {
  staftId?: number;
  name: string;
  isManager: boolean;
  staftGroupId: number;
  changePassword: boolean;
  siteId: string;
  shift: number;
  active: boolean;
}

export interface IUpdateStaftDto {
  name?: string;
  shift?: number;
  active?: boolean;
  staftGroupId?: number;
  isManager?: boolean;
}
