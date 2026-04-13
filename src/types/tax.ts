export interface ITax {
  taxId: string;
  name: string;
  taxTypeId: number;
  active: boolean;
}

export interface ITaxType {
  taxTypeId: number;
  name: string;
  active: boolean;
}

export interface ITaxLine {
  taxId: string;
  line: number;
  startTime: string | null;
  endTime: string | null;
  rate: number;
  status: boolean;
}

export interface ICreateTaxDto {
  taxId: string;
  name: string;
  taxTypeId: number;
  active: boolean;
}

export interface IUpdateTaxDto {
  name?: string;
  taxTypeId?: number;
  active?: boolean;
}

export interface ICreateTaxTypeDto {
  taxTypeId: number;
  name: string;
  active: boolean;
}

export interface IUpdateTaxTypeDto {
  name?: string;
  active?: boolean;
}

export interface ICreateTaxLineDto {
  taxId: string;
  line: number;
  startTime: string | null;
  endTime: string | null;
  rate: number;
  status: boolean;
}

export interface IUpdateTaxLineDto {
  startTime?: string | null;
  endTime?: string | null;
  rate?: number;
  status?: boolean;
}
