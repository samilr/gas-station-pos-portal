export interface IProduct {
  productId: string;
  name: string;
  description?: string | null;
  categoryId: string;
  accountGroupId?: string | null;
  miscellaneous: boolean;
  recipe: boolean;
  taxId: string;
  price?: number | null;
  priceIsTaxed: boolean;
  costingMethod: number;
  inputUnitId: string;
  outputUnitId: string;
  allowDiscount: boolean;
  expectedProfit?: number | null;
  weightNet?: number | null;
  weightGross?: number | null;
  image?: string | null;
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
