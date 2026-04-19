// host_type.enum.ts

export enum HostTypeCode {
  POS_ANDROID = 'POS_ANDROID',
  SMARTPHONE_ANDROID = 'SMARTPHONE_ANDROID',
  SCANNER_ANDROID = 'SCANNER_ANDROID',
  POS_WINDOWS = 'POS_WINDOWS',
  POS_LINUX = 'POS_LINUX',
  KIOSK_ANDROID = 'KIOSK_ANDROID',
  KIOSK_WINDOWS = 'KIOSK_WINDOWS',
  DESKTOP_WINDOWS = 'DESKTOP_WINDOWS',
  TABLET_ANDROID = 'TABLET_ANDROID',
  OTHER = 'OTHER',
}

export const HOST_TYPE_LABELS: Record<string, string> = {
  [HostTypeCode.POS_ANDROID]: 'POS Android',
  [HostTypeCode.SMARTPHONE_ANDROID]: 'Smartphone Android',
  [HostTypeCode.SCANNER_ANDROID]: 'Escáner Android',
  [HostTypeCode.POS_WINDOWS]: 'POS Windows',
  [HostTypeCode.POS_LINUX]: 'POS Linux',
  [HostTypeCode.KIOSK_ANDROID]: 'Kiosko Android',
  [HostTypeCode.KIOSK_WINDOWS]: 'Kiosko Windows',
  [HostTypeCode.DESKTOP_WINDOWS]: 'PC Windows',
  [HostTypeCode.TABLET_ANDROID]: 'Tablet Android',
  [HostTypeCode.OTHER]: 'Otro',
};

export const getHostTypeLabel = (code?: string | null): string => {
  if (!code) return 'N/A';
  return HOST_TYPE_LABELS[code] ?? code;
};
