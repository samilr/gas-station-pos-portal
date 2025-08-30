export interface IProduct {
  product_id: string;
  name: string;
  description?: string;
  category_id: string;
  account_group_id?: string;
  miscellaneous: boolean;
  recipe: boolean;
  tax_id: string;
  price?: number;
  price_is_taxed: boolean;
  costing_method: number;
  input_unit_id: string;
  output_unit_id: string;
  allow_discount: boolean;
  expected_profit?: number;
  weight_net?: number;
  weight_gross?: number;
  image?: string;
  inventory: boolean;
  active: boolean;
}

export interface ICreateProductDto {
  productId: string;
  name: string;
  description?: string;
  categoryId: string;
  accountGroupId?: string;
  miscellaneous: boolean;
  recipe: boolean;
  taxId: string;
  price?: number;
  priceIsTaxed: boolean;
  costingMethod: number;
  inputUnitId: string;
  outputUnitId: string;
  allowDiscount: boolean;
  expectedProfit?: number;
  weightNet?: number;
  weightGross?: number;
  image?: string;
  inventory: boolean;
  active: boolean;
}

export interface IUpdateProductDto {
  productId?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  accountGroupId?: string;
  miscellaneous?: boolean;
  recipe?: boolean;
  taxId?: string;
  price?: number;
  priceIsTaxed?: boolean;
  costingMethod?: number;
  inputUnitId?: string;
  outputUnitId?: string;
  allowDiscount?: boolean;
  expectedProfit?: number;
  weightNet?: number;
  weightGross?: number;
  image?: string;
  inventory?: boolean;
  active?: boolean;
}
