export interface ISite {
  siteId: string;
  name: string;
  siteNumber: number;
  countryId: string;
  currencyId?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  storeId?: string;
  managerId?: number;
  headOffice: boolean;
  pos: boolean;
  useSector: boolean;
  productListType: number;
  posLevelPrice: number;
  posDeliveryTypes?: string;
  posDeliveryType: boolean;
  posCashFund?: number;
  posIsRestaurant: boolean;
  posUseTip: boolean;
  active: boolean;
  status: number;
}

export interface ICreateSiteDto {
  siteId: string;
  name: string;
  siteNumber: number;
  countryId: string;
  currencyId?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  storeId?: string;
  managerId?: number;
  headOffice: boolean;
  pos: boolean;
  posLevelPrice: number;
  posDeliveryTypes?: string;
  posDeliveryType: boolean;
  posCashFund: number;
  posIsRestaurant: boolean;
  posUseTip: boolean;
  useSector: boolean;
  productListType: number;
  active: boolean;
  status: number;
}

export interface IUpdateSiteDto {
  siteId?: string;
  name?: string;
  siteNumber?: number;
  countryId?: string;
  currencyId?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  storeId?: string;
  managerId?: number;
  headOffice?: boolean;
  pos?: boolean;
  posLevelPrice?: number;
  posDeliveryTypes?: string;
  posDeliveryType?: boolean;
  posCashFund?: number;
  posIsRestaurant?: boolean;
  posUseTip?: boolean;
  useSector?: boolean;
  productListType?: number;
  active?: boolean;
  status?: number;
}
