export interface IPayment {
  paymentId: string;
  name: string;
  sequence: number;
  paymentType: number;
  image: string | null;
  returnPaymentId: string | null;
  currencyId: string;
  accountId: string | null;
  posRequireApproval: boolean;
  posMinimum: number;
  posMaximum: number;
  posMultipleOf: number;
  paymentActive?: boolean;
  active?: boolean;
}

export interface ICreatePaymentDto {
  paymentId: string;
  name: string;
  sequence: number;
  paymentType: number;
  image?: string;
  currencyId: string;
  active: boolean;
}

export interface IUpdatePaymentDto {
  name?: string;
  sequence?: number;
  paymentType?: number;
  image?: string;
  currencyId?: string;
  active?: boolean;
}
