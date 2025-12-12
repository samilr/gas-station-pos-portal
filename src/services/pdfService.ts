import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import autoTable from 'jspdf-autotable';
import { ITransactionResume } from '../types/transaction';
import logoImage from '../assets/logo3.png';
import { formatCurrency, formatCurrencyInternational, getCfTypeText } from '../utils/transactionUtils';

class PDFService {
  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      
      img.src = url;
    });
  }

  async generateTransactionPDF(transactionData: ITransactionResume, forPrint: boolean = false): Promise<string> {
    const doc = new jsPDF();
    
    // Configuración
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let currentY = margin;

    // Cargar y agregar el logo
    try {
      const logoWidth = 56;
      const logoHeight = 28;
      
      const img = await this.loadImage(logoImage);
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL('image/png');
        
        doc.addImage(imgData, 'PNG', margin, margin, logoWidth, logoHeight);
        currentY = margin + logoHeight + 5;
      } else {
        console.error('No se pudo crear el contexto del canvas para el logo');
        currentY = margin;
      }
    } catch (error) {
      console.error('Error al cargar o agregar el logo:', error);
      currentY = margin;
    }

    // Información de la empresa
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ISLA DOMINICANA DE PETRÓLEO CORPORATION", margin, currentY);
    currentY += 4.5;
    doc.setFont("helvetica", "normal");
    doc.text(`RNC: 101008172`, margin, currentY);
    currentY += 4.5;
    doc.text(`Sucursal: ${ transactionData.siteId} ${ transactionData.siteName}`, margin, currentY);
    currentY += 4.5;
    doc.text(`Dirección: C/FRANCISCO PRATTS RAMIREZ, NO. 412`, margin, currentY);
    currentY += 4.5;
    doc.text(`Telefono: (809) 565-7756`, margin, currentY);
    currentY += 4.5;
    const d = new Date(transactionData.transDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    doc.text(`Fecha: ${day}/${month}/${year} ${hours}:${minutes}`, margin, currentY);


    // Información de la transacción (derecha)
    const rightColX = pageWidth - margin;
    let rightColY = margin + 5;
    
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    rightColY += 12;
    doc.text(getCfTypeText(transactionData.cfType), rightColX, rightColY, { align: 'right' });
    rightColY += 7;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`e-NCF: ${transactionData.cfNumber}`, rightColX, rightColY, { align: 'right' });
    doc.setFont("helvetica", "normal");
    rightColY += 5;
    doc.text(`Transacción: ${transactionData.transNumber}`, rightColX, rightColY, { align: 'right' });
    rightColY += 5;
    if(transactionData.cfType !== '32'){
      doc.text(`Fecha Vencimiento e-NCF: ${transactionData.cfValidity.split('T')[0]}`, rightColX, rightColY, { align: 'right' }); // Placeholder, ajustar si tienes este dato
    }
    rightColY += 5;
    rightColY += 5;


    currentY = Math.max(currentY, rightColY) + 10;

    // Información del cliente
    if (transactionData.taxpayerName && transactionData.taxpayerName !== 'Consumidor Final') {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Cliente / Empresa: ", margin, currentY);
      currentY += 3;
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;
      doc.text("Razón Social: ", margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(transactionData.taxpayerName, margin + 28, currentY);
      currentY += 5;
      doc.setFont("helvetica", "bold");
      doc.text("RNC: ", margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(transactionData.taxpayerId, margin + 28, currentY);
      currentY += 3;
      doc.line(margin, currentY, pageWidth - margin, currentY);
    } else {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Cliente: ", margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text("Consumidor Final", margin + 20, currentY);
      currentY += 3;
      doc.line(margin, currentY, pageWidth - margin, currentY);
    }

    currentY += 10;
    
    // Tabla de productos
    const tableHeaderColor: [number, number, number] = forPrint ? [255, 255, 255] : [220, 220, 220];
    const tableConfig = {
      startY: currentY,
      head: [['Cantidad', 'Descripción', 'Precio', 'ITBIS', 'Total']],
      headStyles: { fillColor: tableHeaderColor, textColor: 0, fontSize: 10, fontStyle: 'bold' as const, halign: 'center' as const },
      bodyStyles: { textColor: 0, fontSize: 9, halign: 'center' as const },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' as const },
        1: { cellWidth: 'auto' as 'auto' | 'wrap' | number, minCellWidth: 30, maxCellWidth: 60 },
        2: { cellWidth: 25, halign: 'right' as const },
        3: { cellWidth: 25, halign: 'right' as const },
        4: { cellWidth: 25, halign: 'right' as const }
      },
      styles: {
        cellPadding: 2,
        overflow: 'linebreak' as const,
        lineWidth: 0.1,
        lineColor: [0, 0, 0] as [number, number, number],
        fontSize: 9,
        cellHeight: 8
      },
      margin: { left: margin, right: margin }
    };

    // Preparar datos de la tabla
    const tableData = transactionData.prods.map(product => {
      return [
        product.quantity.toString(),
        product.productName,
        `$${formatCurrencyInternational(Number(product.price))}`,
        `$${formatCurrencyInternational(Number(product.tax))}`,
        `$${formatCurrencyInternational(Number(product.total))}`
      ];
    });

    // Dibujar la tabla
    autoTable(doc, {
      ...tableConfig,
      body: tableData,
    });

    // Determinar la posición Y después de la tabla
    const yAfterTable = (doc as any).lastAutoTable.finalY || (currentY + (tableData.length * 8) + 10);
    let totalsY = yAfterTable + 10;

    // Totales
    const totalsValueX = pageWidth - margin;
    const totalLabelOffset = 45;
    const totalRowHeight = 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Subtotal
    doc.text('Subtotal:', totalsValueX - totalLabelOffset, totalsY, { align: 'right' });
    doc.rect(totalsValueX - 40, totalsY - 5, 40, totalRowHeight);
    doc.text(`$${formatCurrencyInternational(Number(transactionData.subtotal))}`, totalsValueX - 2, totalsY, { align: 'right' });
    totalsY += totalRowHeight;

    // Total ITBIS
    doc.text('Total ITBIS:', totalsValueX - totalLabelOffset, totalsY, { align: 'right' });
    doc.rect(totalsValueX - 40, totalsY - 5, 40, totalRowHeight);
    doc.text(`$${formatCurrencyInternational(Number(transactionData.tax))}`, totalsValueX - 2, totalsY, { align: 'right' });
    totalsY += totalRowHeight;

    // Total General
    doc.text('Total:', totalsValueX - totalLabelOffset, totalsY, { align: 'right' });
    doc.rect(totalsValueX - 40, totalsY - 5, 40, totalRowHeight);
    doc.text(`$${formatCurrencyInternational(Number(transactionData.total))}`, totalsValueX - 2, totalsY, { align: 'right' });



    // Código QR y etiquetas (si existe)
       // Código QR y etiquetas (izquierda, alineado con los totales)
       const qrSize = 40;
       const qrAdjust = 1.9;
       const qrX = margin - qrAdjust;
       const qrY = yAfterTable + 2;
       
       try {
         // Usar datos de ejemplo del OCR para el QR y etiquetas
         const qrDataUrl = await QRCode.toDataURL(transactionData.cfQr ?? '');
         doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
         
         // Agregar etiquetas debajo del QR (alineadas con el margen)
         doc.setFontSize(11);
         doc.setFont("helvetica", "normal");
         doc.text(`Código de Seguridad: ${transactionData.cfSecurityCode}`, margin, qrY + qrSize + 3   );
         //separar con un espacio de 2
   
         doc.text(`Fecha de Firma Digital: ${transactionData.digitalSignatureDate}`, margin, qrY + qrSize + 6 + 3);
       } catch (error) {
         console.error('Error al generar o agregar el código QR y etiquetas:', error);
       }


    // Descargar el PDF o devolver la URL según el caso
    if (forPrint) {
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } else {
      const fileName = transactionData.taxpayerName && transactionData.taxpayerName !== 'Consumidor Final'
        ? `${transactionData.taxpayerName} - ${transactionData.cfNumber} - ${transactionData.transNumber}.pdf`
        : `transaccion-${transactionData.transNumber}.pdf`;
      doc.save(fileName);
      return '';
    }
  }
}

export default new PDFService();