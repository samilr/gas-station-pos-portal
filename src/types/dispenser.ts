// ============================================================
// Tipos para el módulo de Dispensadoras (PTS-2)
// ============================================================

// --- Envelope de respuesta PTS ---

export interface PtsPacket<T = any> {
  Id: number;
  Type: string;
  Data: T;
  Message: string | null;
}

export interface PtsResponse<T = any> {
  Protocol: string;
  Packets: PtsPacket<T>[];
}

export interface DispenserApiResponse<T = any> {
  successful: boolean;
  data: T;
  error?: string;
}

// --- Nozzle Prices ---

export interface NozzlePrice {
  Nozzle: number;
  FuelGradeId: number;
  FuelGradeName: string;
  Price: number;
}

// --- Estados de Bomba ---

export interface PumpIdleStatusData {
  Pump: number;
  NozzleUp: number;
  Nozzle: number;
  Request: string;
  // Array de precios por posición de pistola (índice 0 = pistola 1). Precio 0 = no configurada.
  NozzlePrices: number[];
  LastNozzle: number;
  LastVolume: number;
  LastPrice: number;
  LastAmount: number;
  LastTransaction: number;
  LastFuelGradeId: number;
  LastFuelGradeName: string;
  LastTotalVolume: number;
  LastTotalAmount: number;
  LastDateTimeStart: string | null;
  LastDateTime: string | null;
  LastFlowRate: number;
  LastUser: string;
  LastReceivedTotalNozzle: number;
  LastReceivedTotalVolume: number;
  LastReceivedTotalAmount: number;
  User: string;
}

export interface PumpFillingStatusData {
  Pump: number;
  Nozzle: number;
  FuelGradeId: number;
  FuelGradeName: string;
  Volume: number;
  Price: number;
  Amount: number;
  Transaction: number;
  DateTimeStart: string;
  FlowRate: number;
  IsSuspended: boolean;
  OrderedType: string;
  OrderedDose: number;
  User: number;
}

export interface PumpOfflineStatusData {
  Pump: number;
  State: string;
  NozzleUp: boolean;
  Nozzle: number;
  LastFlowRate: number;
  Request: string;
  LastNozzle: number;
  LastVolume: number;
  LastPrice: number;
  LastAmount: number;
  LastTransaction: number;
  LastFuelGradeId: number;
  LastFuelGradeName: string;
  LastTotalVolume: number;
  LastTotalAmount: number;
  LastDateTimeStart: string | null;
  LastDateTime: string | null;
  LastUser: number;
  User: number;
}

export interface PumpEndOfTransactionStatusData {
  Pump: number;
  Nozzle: number;
  FuelGradeId: number;
  FuelGradeName: string;
  Volume: number;
  Price: number;
  Amount: number;
  Transaction: number;
  DateTime: string;
  DateTimeStart: string;
  Tag: string;
  User: number;
  TotalVolume: number;
  TotalAmount: number;
  FlowRate: number;
}

export type PumpStatusData =
  | PumpIdleStatusData
  | PumpFillingStatusData
  | PumpOfflineStatusData
  | PumpEndOfTransactionStatusData;

export type PumpStatusType = 'PumpIdleStatus' | 'PumpFillingStatus' | 'PumpOfflineStatus' | 'PumpEndOfTransactionStatus';

export interface PumpStatusPacket {
  Id: number;
  Type: PumpStatusType;
  Data: PumpStatusData;
  Message: string | null;
}

// Estado visual para la UI
export type PumpVisualState = 'available' | 'dispensing' | 'locked' | 'offline' | 'end-of-transaction';

// --- Control de Bomba ---

export interface AuthorizeRequest {
  Type: 'FullTank' | 'Amount' | 'Volume';
  Dose: number;
  Nozzle?: number;
  Nozzles?: number[];
  FuelGradeId?: number;
  FuelGradeIds?: number[];
  Price?: number;
}

export interface LightsRequest {
  Lights: 'On' | 'Off';
}

export interface AutomaticOperationRequest {
  State: 'On' | 'Off';
}

// --- Precios ---

export interface NozzlePriceUpdate {
  Nozzle: number;
  FuelGradeId: number;
  Price: number;
}

export interface PumpPricesData {
  Pump: number;
  NozzlePrices: NozzlePrice[];
}

export interface FuelGradePrice {
  FuelGradeId: number;
  Price: number;
}

export interface PriceSchedule {
  Id: number;
  Enabled: boolean;
  FuelGradeId: number;
  Price: number;
  DateTime: string;
}

// --- Tanques y Sondas ---

export interface ProbeMeasurementsData {
  Probe: number;
  Status: string;
  Alarms: string[];
  ProductHeight: number;
  ProductVolume: number;
  ProductTCVolume: number;
  WaterHeight: number;
  WaterVolume: number;
  Temperature: number;
  DateTime: string;
}

export interface VolumeTableEntry {
  Height: number;
  Volume: number;
}

export interface TankConfig {
  Id: number;
  FuelGradeId: number;
  Height: number;
  CriticalHighProductAlarmHeight: number;
  HighProductAlarmHeight: number;
  LowProductAlarmHeight: number;
  CriticalLowProductAlarmHeight: number;
  HighWaterAlarmHeight: number;
  CriticalHighWaterAlarmHeight: number;
  HighTemperatureAlarm: number;
  LowTemperatureAlarm: number;
  Capacity: number;
  Diameter: number;
  Name: string;
}

// --- Sistema ---

export interface SystemInfoPackets {
  BatteryVoltage: { Voltage: number };
  CpuTemperature: { Temperature: number };
  FirmwareInformation: {
    DateTime: string;
    PumpProtocols: string[];
    ProbeProtocols: string[];
    PriceBoardProtocols: string[];
    ReaderProtocols: string[];
  };
  UniqueIdentifier: { Id: string };
  ConfigurationIdentifier: { Id: string };
  MeasurementUnits: { Volume: string; Temperature: string };
}

export interface DateTimeData {
  DateTime: string;
  AutoSynchronize: boolean;
  UTCOffset: number;
}

export interface GpsData {
  Status: string;
  DateTime: string;
  Latitude: number;
  NorthSouthIndicator: string;
  Longitude: number;
  EastWestIndicator: string;
  SpeedOverGround: number;
  CourseOverGround: number;
  Mode: string;
}

export interface DecimalDigitsData {
  Price: number;
  Amount: number;
  Volume: number;
  AmountTotal: number;
  VolumeTotal: number;
}

export interface NetworkSettingsData {
  IpAddress: string;
  NetMask: string;
  Gateway: string;
  HttpPort: number;
  HttpsPort: number;
}

export interface PtsUserConfig {
  Id: number;
  Login: string;
  Permissions: {
    Configuration: boolean;
    Control: boolean;
    Monitoring: boolean;
  };
}

// --- Hardware ---

export interface PumpPortConfig {
  Id: number;
  Protocol: string;
  BaudRate: number;
}

export interface PumpConfig {
  Id: number;
  Address: number;
  Port: number;
  FuelGradeIds: number[];
  LockByDefault: boolean;
  SlowFlowRate: number;
  Tag: string;
  AuthorizationRequired: boolean;
  PriceControl: boolean;
}

export interface PumpNozzleConfig {
  PumpId: number;
  FuelGradeIds: number[];
  TankIds: number[];
}

export interface FuelGradeConfig {
  Id: number;
  Name: string;
  Price: number;
  ExpansionCoefficient: number;
}

export interface ProbeConfig {
  Id: number;
  TankId: number;
  Protocol: string;
  Port: number;
  Address: number;
  Enabled: boolean;
}

export interface ReaderConfig {
  Id: number;
  Protocol: string;
  Port: number;
  Address: number;
  PumpIds: number[];
  Enabled: boolean;
}

export interface PriceBoardConfig {
  Id: number;
  Protocol: string;
  Port: number;
  Address: number;
  FuelGradeId: number;
  Enabled: boolean;
}

// --- Tags RFID ---

export interface TagInfo {
  Tag: string;
  Name: string;
  Valid: boolean;
  Present?: boolean;
}

// --- Reportes ---

export interface PumpTransactionReport {
  Pump: number;
  Nozzle: number;
  FuelGradeId: number;
  FuelGradeName: string;
  Volume: number;
  Price: number;
  Amount: number;
  Transaction: number;
  DateTime: string;
  DateTimeStart: string;
  Tag: string;
  User: number;
  TotalVolume: number;
  TotalAmount: number;
}

export interface TankMeasurementReport {
  Probe: number;
  DateTime: string;
  ProductHeight: number;
  ProductVolume: number;
  WaterHeight: number;
  Temperature: number;
}

export interface InTankDeliveryReport {
  Tank: number;
  DateTime: string;
  StartVolume: number;
  EndVolume: number;
  DeliveredVolume: number;
  FuelGradeId: number;
  FuelGradeName: string;
}

export interface ReportDateFilter {
  StartDateTime: string;
  EndDateTime: string;
}

// --- Transacciones de BD ---

export interface FuelTransaction {
  transactionId: number;
  pump: number;
  nozzle: number;
  hardwareTransactionId: number;
  volume: number;
  amount: number;
  price: number;
  totalVolume: number;
  totalAmount: number;
  transactionDate: string;
  transactionDateStart: string;
  tag: string;
  ptsId: string;
  fuelGradeId: number;
  fuelGradeName: string;
  tank: number;
  userId: number;
  tcVolume: number;
  flowRate: number;
  isOffline: boolean;
  pumpTransactionsUploaded: number;
  pumpTransactionsTotal: number;
  configurationId: string;
  createdAt: string;
}

export interface FuelTransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FuelTransactionsParams {
  pump?: number;
  nozzle?: number;
  fuelGradeId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FuelTransactionUpdateDto {
  Tag?: string;
  PtsId?: string;
}

// --- Pump Transaction Info & Totals ---

export interface PumpTransactionInfoData {
  Pump: number;
  Nozzle: number;
  FuelGradeId: number;
  FuelGradeName: string;
  Volume: number;
  Price: number;
  Amount: number;
  Transaction: number;
  DateTime: string;
  DateTimeStart: string;
  Tag: string;
  User: number;
  TotalVolume: number;
  TotalAmount: number;
  FlowRate: number;
}

export interface PumpTotalsData {
  Pump: number;
  Nozzle: number;
  FuelGradeId: number;
  FuelGradeName: string;
  Volume: number;
  Amount: number;
}

// --- Display Data ---

export interface PumpDisplayData {
  Pump: number;
  UnitPrice: number;
  Volume: number;
  Amount: number;
  FuelGradeName: string;
}
