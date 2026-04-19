export interface IAppConfig {
  id?: number;
  appVersion: string;
  description: string;
  urlApk: string;
  required: boolean;
  apiKey?: string;
  recentTransactionWindowMinutes?: number;
}

export interface ICreateAppConfigDto {
  id?: number;
  appVersion: string;
  description: string;
  urlApk: string;
  required: boolean;
  apiKey?: string;
  recentTransactionWindowMinutes?: number;
}

export interface IUpdateAppConfigDto {
  appVersion?: string;
  description?: string;
  urlApk?: string;
  required?: boolean;
  apiKey?: string;
  recentTransactionWindowMinutes?: number;
}
