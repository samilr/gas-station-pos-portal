export interface ITaxpayer {
  taxpayerId: string;
  name: string;
  type: number;
  validated: boolean;
  active: boolean;
}

export interface ITaxpayerListResponse {
  successful: boolean;
  data: ITaxpayer[];
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  page: number;
  limit: number;
}

export interface ICreateTaxpayerDto {
  taxpayerId: string;
  name: string;
  type: number;
  validated: boolean;
  active: boolean;
}

export interface IUpdateTaxpayerDto {
  name?: string;
  type?: number;
  validated?: boolean;
  active?: boolean;
}
