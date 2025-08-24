# Sistema de Transacciones - Documentación

## Descripción

Este sistema ha sido adaptado para trabajar con transacciones que incluyen información de Comprobantes Fiscales (CF) y pagos móviles Zataca. El sistema maneja la estructura de datos completa de transacciones según las especificaciones proporcionadas.

## Estructura de Datos

### ITransactionResume
```typescript
interface ITransactionResume {
  transNumber: string;           // Número de transacción
  cfNumber: string;             // Número de Comprobante Fiscal
  cfValidity: string;           // Fecha de validez del CF
  cfType: string;               // Tipo de CF (01, 02, 03, 04)
  transDate: string;            // Fecha y hora de la transacción
  status: number;               // Estado de la transacción
  isReturn: boolean;            // Indica si es una devolución
  subtotal: number;             // Subtotal sin impuestos
  tax: number;                  // Monto de ITBIS
  total: number;                // Total de la transacción
  taxpayerName: string | null;  // Nombre del contribuyente
  taxpayerId: string;           // RNC/Cédula del contribuyente
  staftId: number;              // ID del vendedor
  staftName: string;            // Nombre del vendedor
  cfQr: string | null;          // Código QR del CF
  cfSecurityCode: string | null; // Código de seguridad del CF
  digitalSignatureDate: string | null; // Fecha de firma digital
  prods: IProductResume[];      // Lista de productos
  payms: IPaymentResume[];      // Lista de pagos
  zataca?: IZatacaData;         // Información de pago Zataca (opcional)
}
```

### Estados de Transacción
- `0`: Pendiente
- `1`: Completada
- `2`: Fallida
- `3`: Cancelada

### Tipos de Pago
- `1`: Efectivo
- `2`: Tarjeta
- `3`: Transferencia
- `4`: Zataca
- `5`: Otro

### Tipos de CF
- `01`: Factura Consumidor Final
- `02`: Factura de Crédito Fiscal
- `03`: Nota de Débito
- `04`: Nota de Crédito

## Archivos Creados

### 1. Tipos (`src/types/transaction.ts`)
Contiene todas las interfaces y enums necesarios para tipar las transacciones.

### 2. Servicio (`src/services/transactionService.ts`)
Servicio para manejar las operaciones con la API:
- `getTransactions()`: Obtiene todas las transacciones
- `getTransactionById()`: Obtiene una transacción específica
- `searchTransactions()`: Busca transacciones con filtros
- `getTransactionStats()`: Obtiene estadísticas
- `exportTransactions()`: Exporta transacciones

### 3. Hook Personalizado (`src/hooks/useTransactions.ts`)
Hook que maneja el estado y las operaciones de las transacciones:
- Estado de carga y errores
- Filtrado y búsqueda
- Estadísticas en tiempo real
- Exportación

### 4. Utilidades (`src/utils/transactionUtils.ts`)
Funciones de utilidad para:
- Formateo de fechas y moneda
- Obtención de colores y textos de estados
- Filtrado de transacciones
- Validaciones

### 5. Datos Mock (`src/data/mockTransactions.ts`)
Datos de ejemplo para probar la funcionalidad mientras no esté disponible la API.

## Configuración de la API

Para conectar con tu API real, modifica la variable `API_BASE_URL` en `src/services/transactionService.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

O configura la variable de entorno en tu archivo `.env`:
```
REACT_APP_API_URL=https://tu-api.com/api
```

## Endpoints Esperados

El servicio espera los siguientes endpoints en tu API:

### GET /transactions
Obtiene todas las transacciones.

### GET /transactions/:id
Obtiene una transacción específica por ID.

### GET /transactions/search
Busca transacciones con parámetros:
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin
- `status`: Estado de la transacción
- `taxpayerId`: RNC/Cédula del contribuyente
- `cfNumber`: Número de CF

### GET /transactions/stats
Obtiene estadísticas de transacciones.

### GET /transactions/export
Exporta transacciones en diferentes formatos:
- `format`: pdf, excel, csv
- Parámetros de filtro opcionales

## Características Implementadas

### ✅ Funcionalidades Principales
- [x] Listado de transacciones con filtros
- [x] Búsqueda por múltiples criterios
- [x] Vista detallada de transacciones
- [x] Estadísticas en tiempo real
- [x] Exportación de datos
- [x] Manejo de estados de carga y errores

### ✅ Información de CF
- [x] Número de CF y tipo
- [x] Código de seguridad
- [x] Firma digital
- [x] Código QR
- [x] Validez del comprobante

### ✅ Información de Contribuyente
- [x] RNC/Cédula
- [x] Nombre del contribuyente
- [x] Información del vendedor

### ✅ Productos y Pagos
- [x] Lista detallada de productos
- [x] Información de impuestos por producto
- [x] Múltiples métodos de pago
- [x] Soporte para devoluciones

### ✅ Integración Zataca
- [x] Información del operador
- [x] Número de referencia local
- [x] Número de teléfono
- [x] ID del producto Z

## Uso del Componente

El componente `TransactionsSection` está listo para usar y incluye:

1. **Estadísticas**: Muestra total de ventas, transacciones completadas, pendientes y fallidas
2. **Filtros**: Búsqueda por texto y filtro por estado
3. **Tabla**: Lista todas las transacciones con información relevante
4. **Modal de Detalles**: Vista completa de cada transacción
5. **Exportación**: Botón para exportar datos

## Personalización

### Cambiar Datos Mock por API Real
En `src/hooks/useTransactions.ts`, cambia:
```typescript
// Por ahora usamos datos mock, pero puedes cambiar esto por la llamada real a la API
// const data = await transactionService.getTransactions();
const data = mockTransactions;
```

Por:
```typescript
const data = await transactionService.getTransactions();
```

### Agregar Autenticación
En `src/services/transactionService.ts`, agrega headers de autenticación:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Agregar tu token aquí
}
```

## Próximos Pasos

1. **Conectar con tu API**: Reemplaza los datos mock con llamadas reales a tu API
2. **Configurar autenticación**: Agrega los headers necesarios para tu API
3. **Personalizar estilos**: Ajusta los colores y estilos según tu diseño
4. **Agregar funcionalidades**: Implementa características adicionales como paginación, ordenamiento, etc.

## Soporte

Si necesitas ayuda para implementar alguna funcionalidad específica o tienes preguntas sobre el código, no dudes en preguntar.
