export interface IAppConfig {
  id?: number;
  appVersion: string;
  description: string;
  urlApk: string;
  required: boolean;
  apiKey?: string;
}

export interface ICreateAppConfigDto {
  id?: number;
  appVersion: string;
  description: string;
  urlApk: string;
  required: boolean;
}

export interface IUpdateAppConfigDto {
  appVersion?: string;
  description?: string;
  urlApk?: string;
  required?: boolean;
}
