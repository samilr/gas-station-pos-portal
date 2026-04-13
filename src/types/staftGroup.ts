export interface IStaftGroup {
  staftGroupId: number;
  name: string;
  isManager: boolean;
  rights: string;
}

export interface ICreateStaftGroupDto {
  staftGroupId?: number;
  name: string;
  isManager: boolean;
  rights: string;
}

export interface IUpdateStaftGroupDto {
  name?: string;
  isManager?: boolean;
  rights?: string;
}
