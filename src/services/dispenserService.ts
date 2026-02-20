// Tipos para las respuestas de la API de dispensadoras
export interface PumpIdleStatus {
  Pump: number;
  NozzleUp: number;
  Nozzle: number;
  Request: string;
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
  LastDateTimeStart: string;
  LastDateTime: string;
  LastFlowRate: number;
  LastUser: string;
  LastReceivedTotalNozzle: number;
  LastReceivedTotalVolume: number;
  LastReceivedTotalAmount: number;
  User: string;
}

export interface PumpFillingStatus {
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
  User: string;
}

export interface PumpOfflineStatus {
  Pump: number;
  State: string;
  NozzleUp: number;
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
  LastDateTimeStart: string;
  LastDateTime: string;
  LastUser: string;
  User: string;
}

export interface PumpStatusPacket {
  Id: number;
  Type: 'PumpIdleStatus' | 'PumpFillingStatus' | 'PumpOfflineStatus';
  Data: PumpIdleStatus | PumpFillingStatus | PumpOfflineStatus;
}

export interface PumpStatusResponse {
  Protocol: string;
  Packets: PumpStatusPacket[];
}

export interface PumpLockResponse {
  Protocol: string;
  Packets: Array<{
    Id: number;
    Type: 'PumpLock' | 'PumpUnlock';
    Message?: string;
  }>;
}

export type PumpStatus = PumpIdleStatus | PumpFillingStatus | PumpOfflineStatus;
export type PumpStatusType = 'idle' | 'filling' | 'offline';

// Configuración de la API
const DISPENSER_API_URL = 'https://192.168.1.117/jsonPTS';
const DIGEST_AUTH_HEADER = 'Digest username="admin", realm="Pts2WebServer", nonce="251229095521388", uri="/jsonPTS", response="0d9b010285b1229b12a756a7edf094c9", qop=auth, nc=00004988, cnonce="0ea67bf67c3f7736"';

class DispenserService {
  /**
   * Obtiene el estado de todas las dispensadoras
   * @param pumpCount Número de dispensadoras a consultar (por defecto 4)
   */
  async getPumpStatus(pumpCount: number = 4): Promise<PumpStatusResponse> {
    try {
      // Construir el body de la petición
      const packets = Array.from({ length: pumpCount }, (_, i) => ({
        Id: i + 1,
        Type: 'PumpGetStatus' as const,
        Data: { Pump: i + 1 }
      }));

      const requestBody = {
        Protocol: 'jsonPTS',
        Packets: packets
      };

      // Realizar la petición POST
      const response = await fetch(DISPENSER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': DIGEST_AUTH_HEADER
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PumpStatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener estado de dispensadoras:', error);
      throw error;
    }
  }

  /**
   * Determina el tipo de estado de una dispensadora basado en el tipo de paquete
   */
  getPumpStatusType(packet: PumpStatusPacket): PumpStatusType {
    switch (packet.Type) {
      case 'PumpIdleStatus':
        return 'idle';
      case 'PumpFillingStatus':
        return 'filling';
      case 'PumpOfflineStatus':
        return 'offline';
      default:
        return 'offline';
    }
  }

  /**
   * Obtiene el número de dispensadora desde un paquete
   */
  getPumpNumber(packet: PumpStatusPacket): number {
    return packet.Data.Pump;
  }

  /**
   * Bloquea una dispensadora
   * @param pumpNumber Número de la dispensadora a bloquear
   */
  async lockPump(pumpNumber: number): Promise<PumpLockResponse> {
    try {
      const requestBody = {
        Protocol: 'jsonPTS',
        Packets: [{
          Id: 1,
          Type: 'PumpLock',
          Data: {
            Pump: pumpNumber
          }
        }]
      };

      const response = await fetch(DISPENSER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': DIGEST_AUTH_HEADER
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PumpLockResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al bloquear dispensadora:', error);
      throw error;
    }
  }

  /**
   * Desbloquea una dispensadora
   * @param pumpNumber Número de la dispensadora a desbloquear
   */
  async unlockPump(pumpNumber: number): Promise<PumpLockResponse> {
    try {
      const requestBody = {
        Protocol: 'jsonPTS',
        Packets: [{
          Id: 1,
          Type: 'PumpUnlock',
          Data: {
            Pump: pumpNumber
          }
        }]
      };

      const response = await fetch(DISPENSER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': DIGEST_AUTH_HEADER
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PumpLockResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al desbloquear dispensadora:', error);
      throw error;
    }
  }

  /**
   * Verifica si una dispensadora está bloqueada
   */
  isPumpLocked(packet: PumpStatusPacket | null): boolean {
    if (!packet) return false;
    if (packet.Type === 'PumpIdleStatus') {
      const data = packet.Data as PumpIdleStatus;
      return data.Request === 'PumpLock';
    }
    if (packet.Type === 'PumpOfflineStatus') {
      const data = packet.Data as PumpOfflineStatus;
      return data.Request === 'PumpLock';
    }
    return false;
  }

  /**
   * Bloquea todas las dispensadoras
   * @param pumpCount Número total de dispensadoras
   */
  async lockAllPumps(pumpCount: number): Promise<PumpLockResponse> {
    try {
      const packets = Array.from({ length: pumpCount }, (_, i) => ({
        Id: i + 1,
        Type: 'PumpLock' as const,
        Data: {
          Pump: i + 1
        }
      }));

      const requestBody = {
        Protocol: 'jsonPTS',
        Packets: packets
      };

      const response = await fetch(DISPENSER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': DIGEST_AUTH_HEADER
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PumpLockResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al bloquear todas las dispensadoras:', error);
      throw error;
    }
  }

  /**
   * Desbloquea todas las dispensadoras
   * @param pumpCount Número total de dispensadoras
   */
  async unlockAllPumps(pumpCount: number): Promise<PumpLockResponse> {
    try {
      const packets = Array.from({ length: pumpCount }, (_, i) => ({
        Id: i + 1,
        Type: 'PumpUnlock' as const,
        Data: {
          Pump: i + 1
        }
      }));

      const requestBody = {
        Protocol: 'jsonPTS',
        Packets: packets
      };

      const response = await fetch(DISPENSER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': DIGEST_AUTH_HEADER
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PumpLockResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al desbloquear todas las dispensadoras:', error);
      throw error;
    }
  }
}

const dispenserService = new DispenserService();
export default dispenserService;

