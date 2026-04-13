export interface IBarcode {
  barcodeId: string;
  productId: string;
  variantName: string | null;
  image: string | null;
}

export interface ICreateBarcodeDto {
  barcodeId: string;
  productId: string;
  variantName?: string | null;
}

export interface IUpdateBarcodeDto {
  productId?: string;
  variantName?: string | null;
}
