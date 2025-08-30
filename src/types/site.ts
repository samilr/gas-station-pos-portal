export interface ISite {
  site_id: string;
  name: string;
  site_number: number;
  country_id: string;
  currency_id?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  store_id?: string;
  manager_id?: number;
  head_office: boolean;
  pos: boolean;
  use_sector: boolean;
  product_list_type: boolean;
  pos_level_price: number;
  pos_delivery_types?: string;
  pos_delivery_type: boolean;
  pos_cash_fund?: number;
  pos_is_restaurant: boolean;
  pos_use_tip: boolean;
  active: boolean;
  status: boolean;
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
  productListType: boolean;
  active: boolean;
  status: boolean;
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
