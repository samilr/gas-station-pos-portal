export interface IActionLog {
  actionId: number;
  staft_id?: number;
  site_id?: string;
  action?: string;
  description?: string;
  ip_address?: string;
  device_id?: string;
  terminal_id?: number;
  latitude?: string;
  longitude?: string;
  created_at: Date;
}

export interface IErrorLog {
  error_id: number;
  staft_id?: number;
  site_id?: string;
  error_code?: string;
  message: string;
  stacktrace?: string;
  context?: string;
  device_id?: string;
  terminal_id?: number;
  latitude?: string;
  longitude?: string;
  created_at: Date;
  ip_address?: string;
}
