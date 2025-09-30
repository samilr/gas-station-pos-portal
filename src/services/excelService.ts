import * as XLSX from 'xlsx';
import { ITransactionResume, IProductResume, IPaymentResume, PaymentType } from '../types/transaction';
import { formatDate, formatCurrency, getPaymentTypeText, getStatusText, getCfTypeText } from '../utils/transactionUtils';

export interface ExcelExportOptions {
  filename?: string;
  includeFilters?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export class ExcelService {
  /**
   * Exporta las transacciones a un archivo Excel con 3 hojas
   */
  static exportTransactionsToExcel(
    transactions: ITransactionResume[], 
    options: ExcelExportOptions = {}
  ): void {
    try {
      // Crear un nuevo libro de trabajo
      const workbook = XLSX.utils.book_new();
      
      // Hoja 1: Transacciones
      const transactionsSheet = this.createTransactionsSheet(transactions, options);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transacciones');
      
      // Hoja 2: Productos
      const productsSheet = this.createProductsSheet(transactions, options);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Productos');
      
      // Hoja 3: Pagos
      const paymentsSheet = this.createPaymentsSheet(transactions, options);
      XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Pagos');
      
      // Generar el archivo
      const filename = options.filename || `transacciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('Error al generar el archivo Excel');
    }
  }

  /**
   * Crea la hoja de Transacciones
   */
  private static createTransactionsSheet(
    transactions: ITransactionResume[], 
    options: ExcelExportOptions
  ): XLSX.WorkSheet {
    // Definir los encabezados de las columnas
    const headers = [
      'Número de Transacción',
      'e-NCF',
      'Tipo e-NCF',
      'Fecha',
      'Codigo sucursal',
      'Nombre Sucursal',
      'Terminal',
      'Turno',
      'Estado e-NCF',
      'Fecha vencimiento de Secuencia',
      'Es Devolución',
      'Cliente',
      'RNC/Cédula',
      'Vendedor',
      'Codigo Vendedor',
      'Subtotal',
      'Impuestos',
      'Total',
      'Código de Seguridad',
      'Fecha Firma Digital',
      'URL DGII'
    ];

    // Preparar los datos para la hoja de transacciones
    const transactionsData = transactions.map(transaction => [
      transaction.transNumber,
      transaction.cfNumber,
      getCfTypeText(transaction.cfType),
      formatDate(transaction.transDate),
      transaction.siteId,
      transaction.siteName,
      transaction.terminalId,
      transaction.staftId,
      this.getCfStatusText(transaction.cfStatus),
      formatDate(transaction.cfValidity),
      transaction.isReturn ? 'Sí' : 'No',
      transaction.taxpayerName || '',
      transaction.taxpayerId,
      transaction.staftName,
      transaction.staftId,
      transaction.isReturn ? -transaction.subtotal : transaction.subtotal,
      transaction.isReturn ? -transaction.tax : transaction.tax,
      transaction.isReturn ? -transaction.total : transaction.total,
      transaction.cfSecurityCode || '',
      transaction.digitalSignatureDate,
      transaction.cfQr || ''
    ]);

    // Crear la hoja con encabezados en la primera fila
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...transactionsData]);
    
    // Aplicar formato a los encabezados (negrita)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "CCCCCC" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }

    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 20 }, // Número de Transacción
      { wch: 15 }, // Número CF
      { wch: 12 }, // Tipo CF
      { wch: 15 }, // Fecha
      { wch: 20 }, // Sucursal
      { wch: 10 }, // Terminal
      { wch: 8 },  // Turno
      { wch: 12 }, // Estado
      { wch: 12 }, // Estado CF
      { wch: 12 }, // Es Devolución
      { wch: 25 }, // Cliente
      { wch: 15 }, // RNC/Cédula
      { wch: 20 }, // Vendedor
      { wch: 12 }, // Subtotal
      { wch: 12 }, // Impuestos
      { wch: 12 }, // Total
      { wch: 15 }, // Código QR
      { wch: 18 }, // Código de Seguridad
      { wch: 18 }  // Fecha Firma Digital
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Congelar la primera fila (encabezados) para que permanezca visible al hacer scroll
    worksheet['!freeze'] = { r: 1, c: 0 };
    
    return worksheet;
  }

  /**
   * Crea la hoja de Productos
   */
  private static createProductsSheet(
    transactions: ITransactionResume[], 
    options: ExcelExportOptions
  ): XLSX.WorkSheet {
    // Definir los encabezados de las columnas
    const headers = [
      'Número de Transacción',
      'e-NCF',
      'Fecha',
      'Sucursal',
      'ID del Producto',
      'Nombre del Producto',
      'Es Devolución',
      'Cantidad',
      'Precio Unitario',
      'Impuestos',
      'Total',
      'Cliente',
      'Vendedor'
    ];

    // Preparar los datos para la hoja de productos
    const productsData: any[] = [];
    
    transactions.forEach(transaction => {
      transaction.prods.forEach(product => {
        productsData.push([
          transaction.transNumber,
          transaction.cfNumber,
          formatDate(transaction.transDate),
          transaction.siteName,
          product.productId,
          product.productName,
          product.isReturn ? 'Sí' : 'No',
          transaction.isReturn ? -product.quantity : product.quantity,
          transaction.isReturn ? -product.price : product.price,
          transaction.isReturn ? -product.tax : product.tax,
          transaction.isReturn ? -product.total : product.total,
          transaction.taxpayerName || '',
          transaction.staftName
        ]);
      });
    });

    // Crear la hoja con encabezados en la primera fila
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...productsData]);
    
    // Aplicar formato a los encabezados (negrita)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "CCCCCC" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }

    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 20 }, // Número de Transacción
      { wch: 15 }, // Número CF
      { wch: 15 }, // Fecha
      { wch: 20 }, // Sucursal
      { wch: 15 }, // ID del Producto
      { wch: 30 }, // Nombre del Producto
      { wch: 12 }, // Es Devolución
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Precio Unitario
      { wch: 12 }, // Impuestos
      { wch: 12 }, // Total
      { wch: 25 }, // Cliente
      { wch: 20 }  // Vendedor
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Congelar la primera fila (encabezados) para que permanezca visible al hacer scroll
    worksheet['!freeze'] = { r: 1, c: 0 };
    
    return worksheet;
  }

  /**
   * Crea la hoja de Pagos
   */
  private static createPaymentsSheet(
    transactions: ITransactionResume[], 
    options: ExcelExportOptions
  ): XLSX.WorkSheet {
    // Definir los encabezados de las columnas
    const headers = [
      'Número de Transacción',
      'e-NCF',
      'Fecha',
      'Sucursal',
      'ID del Pago',
      'Tipo de Pago',
      'Es Devolución',
      'Monto',
      'Cliente',
      'Vendedor',
      'Terminal',
      'Turno'
    ];

    // Preparar los datos para la hoja de pagos
    const paymentsData: any[] = [];
    
    transactions.forEach(transaction => {
      transaction.payms.forEach(payment => {
        paymentsData.push([
          transaction.transNumber,
          transaction.cfNumber,
          formatDate(transaction.transDate),
          transaction.siteName,
          payment.paymentId,
          getPaymentTypeText(payment.type),
          payment.isReturn ? 'Sí' : 'No',
          transaction.isReturn ? -payment.total : payment.total,
          transaction.taxpayerName || '',
          transaction.staftName,
          transaction.terminalId,
          transaction.staftId  
        ]);
      });
    });

    // Crear la hoja con encabezados en la primera fila
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...paymentsData]);
    
    // Aplicar formato a los encabezados (negrita)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "CCCCCC" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }


    
    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 20 }, // Número de Transacción
      { wch: 20 }, // Número CF
      { wch: 15 }, // Fecha
      { wch: 20 }, // Sucursal
      { wch: 20 }, // ID del Pago
      { wch: 20 }, // Tipo de Pago
      { wch: 12 }, // Es Devolución
      { wch: 12 }, // Monto
      { wch: 25 }, // Cliente
      { wch: 20 }, // Vendedor
      { wch: 10 }, // Terminal
      { wch: 8 }   // Turno
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Congelar la primera fila (encabezados) para que permanezca visible al hacer scroll
    worksheet['!freeze'] = { r: 1, c: 0 };
    
    return worksheet;
  }

  /**
   * Obtiene el texto del estado del CF
   */
  private static getCfStatusText(cfStatus: number): string {
    switch (cfStatus) {
      case 0: return 'Pendiente';
      case 2: return 'Aceptada';
      case 3: return 'Aceptada (Alt)';
      case 4: return 'Rechazada';
      default: return 'Desconocido';
    }
  }

  /**
   * Exporta solo las transacciones filtradas (para uso interno)
   */
  static exportFilteredTransactions(
    transactions: ITransactionResume[],
    filters: {
      startDate: string;
      endDate: string;
      status?: number;
      siteId?: string;
      taxpayerId?: string;
    }
  ): void {
    const options: ExcelExportOptions = {
      filename: `transacciones_filtradas_${filters.startDate}_${filters.endDate}.xlsx`,
      includeFilters: true,
      dateRange: {
        startDate: filters.startDate,
        endDate: filters.endDate
      }
    };

    this.exportTransactionsToExcel(transactions, options);
  }
}

export default ExcelService;
