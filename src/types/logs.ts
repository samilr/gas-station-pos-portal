export interface IActionLog {
  actionId: number;
  staftId?: number | null;
  siteId?: string | null;
  action?: string;
  description?: string;
  ipAddress?: string | null;
  deviceId?: string | null;
  terminalId?: number | null;
  latitude?: string | null;
  longitude?: string | null;
  createdAt: string;
}

export interface IErrorLog {
  errorId: number;
  staftId?: number | null;
  siteId?: string | null;
  errorCode?: string;
  message: string;
  stacktrace?: string;
  context?: string;
  deviceId?: string | null;
  terminalId?: number | null;
  latitude?: string | null;
  longitude?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}
