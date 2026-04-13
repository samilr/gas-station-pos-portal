export interface IZatacaConfig {
  companyId: number;
  urlRecharge: string;
  urlDataPackage: string;
  urlService: string | null;
  username: string;
  password: string;
  debug: boolean;
  dailyLimit: number;
  monthLimit: number;
  transMinLimit: number;
  transMaxLimit: number;
  siteLimit: number;
}

export interface IZatacaProduct {
  zProductId: number;
  zTypeId: string;
  description: string;
  price: number | null;
  status: boolean;
  national: boolean;
  createdAt: string;
  updatedAt: string | null;
  image: string | null;
}

export interface IZatacaType {
  zTypeId: number;
  description: string;
}

export interface IZatacaTransaction {
  transNumber: string;
  [key: string]: any;
}

export interface ICreateZatacaProductDto {
  zTypeId: string;
  description: string;
  price?: number | null;
  status: boolean;
  national: boolean;
  image?: string | null;
}

export interface IUpdateZatacaProductDto {
  zTypeId?: string;
  description?: string;
  price?: number | null;
  status?: boolean;
  national?: boolean;
  image?: string | null;
}

export interface ICreateZatacaTypeDto {
  description: string;
}

export interface IUpdateZatacaTypeDto {
  description: string;
}

export interface IUpdateZatacaConfigDto {
  urlRecharge?: string;
  urlDataPackage?: string;
  urlService?: string | null;
  username?: string;
  password?: string;
  debug?: boolean;
  dailyLimit?: number;
  monthLimit?: number;
  transMinLimit?: number;
  transMaxLimit?: number;
  siteLimit?: number;
}
