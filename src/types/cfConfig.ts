export interface ICfConfig {
  companyId: number;
  serieSource: number;
  serieUrl: string;
  serieUsername: string;
  seriePassword: string;
  url: string;
  urlInterface: string;
  username: string;
  password: string;
  qrFolder: string;
  testMode: boolean;
  active: boolean;
  validationOnline: boolean;
  validationNote?: string;
  cfTypeConsumeLimit?: number;
  combTransLimit?: number;
}

export interface IUpdateCfConfigDto {
  serieSource?: number;
  serieUrl?: string;
  serieUsername?: string;
  seriePassword?: string;
  url?: string;
  urlInterface?: string;
  username?: string;
  password?: string;
  qrFolder?: string;
  testMode?: boolean;
  active?: boolean;
  validationOnline?: boolean;
  cfTypeConsumeLimit?: number;
  combTransLimit?: number;
}
