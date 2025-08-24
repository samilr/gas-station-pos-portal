import { ITransactionResume, TransactionStatus, PaymentType } from '../types/transaction';

export const mockTransactions: ITransactionResume[] = [
  {
    transNumber: 'TXN-2024-001',
    cfNumber: 'CF-001-001-00000001',
    cfValidity: '2024-12-31',
    cfType: '01',
    transDate: '2024-01-15T14:30:00',
    status: TransactionStatus.COMPLETED,
    isReturn: false,
    subtotal: 299.99,
    tax: 53.99,
    total: 353.98,
    taxpayerName: 'Juan Pérez',
    taxpayerId: '12345678-9',
    staftId: 1,
    staftName: 'Ana Martínez',
    cfQr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    cfSecurityCode: 'ABC123DEF456',
    digitalSignatureDate: '2024-01-15T14:30:00',
    prods: [
      {
        productId: 'PROD-001',
        isReturn: false,
        productName: 'Laptop HP Pavilion',
        quantity: 1,
        price: 249.99,
        tax: 44.99,
        total: 294.98
      },
      {
        productId: 'PROD-002',
        isReturn: false,
        productName: 'Mouse Inalámbrico',
        quantity: 2,
        price: 25.00,
        tax: 4.50,
        total: 59.00
      }
    ],
    payms: [
      {
        paymentId: 'PAY-001',
        isReturn: false,
        type: PaymentType.CARD,
        total: 353.98
      }
    ]
  },
  {
    transNumber: 'TXN-2024-002',
    cfNumber: 'CF-001-001-00000002',
    cfValidity: '2024-12-31',
    cfType: '01',
    transDate: '2024-01-15T12:15:00',
    status: TransactionStatus.COMPLETED,
    isReturn: false,
    subtotal: 89.50,
    tax: 16.11,
    total: 105.61,
    taxpayerName: 'María García',
    taxpayerId: '98765432-1',
    staftId: 2,
    staftName: 'Carlos López',
    cfQr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    cfSecurityCode: 'XYZ789ABC123',
    digitalSignatureDate: '2024-01-15T12:15:00',
    prods: [
      {
        productId: 'PROD-003',
        isReturn: false,
        productName: 'Teclado Mecánico',
        quantity: 1,
        price: 79.99,
        tax: 14.40,
        total: 94.39
      },
      {
        productId: 'PROD-004',
        isReturn: false,
        productName: 'Cable USB-C',
        quantity: 1,
        price: 9.51,
        tax: 1.71,
        total: 11.22
      }
    ],
    payms: [
      {
        paymentId: 'PAY-002',
        isReturn: false,
        type: PaymentType.ZATACA,
        total: 105.61
      }
    ],
    zataca: {
      operator: 'Claro',
      amount: 105.61,
      localReferenceNumber: 'ZAT-2024-001',
      phoneNumber: '809-123-4567',
      zProductId: 'ZAT-001'
    }
  },
  {
    transNumber: 'TXN-2024-003',
    cfNumber: 'CF-001-001-00000003',
    cfValidity: '2024-12-31',
    cfType: '01',
    transDate: '2024-01-14T16:45:00',
    status: TransactionStatus.PENDING,
    isReturn: false,
    subtotal: 159.99,
    tax: 28.80,
    total: 188.79,
    taxpayerName: 'Carlos López',
    taxpayerId: '45678912-3',
    staftId: 1,
    staftName: 'Ana Martínez',
    cfQr: null,
    cfSecurityCode: null,
    digitalSignatureDate: null,
    prods: [
      {
        productId: 'PROD-005',
        isReturn: false,
        productName: 'Monitor 24"',
        quantity: 1,
        price: 159.99,
        tax: 28.80,
        total: 188.79
      }
    ],
    payms: [
      {
        paymentId: 'PAY-003',
        isReturn: false,
        type: PaymentType.TRANSFER,
        total: 188.79
      }
    ]
  },
  {
    transNumber: 'TXN-2024-004',
    cfNumber: 'CF-001-001-00000004',
    cfValidity: '2024-12-31',
    cfType: '01',
    transDate: '2024-01-14T10:20:00',
    status: TransactionStatus.FAILED,
    isReturn: false,
    subtotal: 45.00,
    tax: 8.10,
    total: 53.10,
    taxpayerName: 'Ana Martín',
    taxpayerId: '78912345-6',
    staftId: 3,
    staftName: 'Roberto Sánchez',
    cfQr: null,
    cfSecurityCode: null,
    digitalSignatureDate: null,
    prods: [
      {
        productId: 'PROD-006',
        isReturn: false,
        productName: 'Auriculares Bluetooth',
        quantity: 1,
        price: 45.00,
        tax: 8.10,
        total: 53.10
      }
    ],
    payms: [
      {
        paymentId: 'PAY-004',
        isReturn: false,
        type: PaymentType.CARD,
        total: 53.10
      }
    ]
  },
  {
    transNumber: 'TXN-2024-005',
    cfNumber: 'CF-001-001-00000005',
    cfValidity: '2024-12-31',
    cfType: '02',
    transDate: '2024-01-13T15:30:00',
    status: TransactionStatus.COMPLETED,
    isReturn: true,
    subtotal: 79.99,
    tax: 14.40,
    total: 94.39,
    taxpayerName: 'Luis Rodríguez',
    taxpayerId: '32165498-7',
    staftId: 2,
    staftName: 'Carlos López',
    cfQr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    cfSecurityCode: 'RET123ABC456',
    digitalSignatureDate: '2024-01-13T15:30:00',
    prods: [
      {
        productId: 'PROD-003',
        isReturn: true,
        productName: 'Teclado Mecánico',
        quantity: 1,
        price: 79.99,
        tax: 14.40,
        total: 94.39
      }
    ],
    payms: [
      {
        paymentId: 'PAY-005',
        isReturn: true,
        type: PaymentType.CASH,
        total: 94.39
      }
    ]
  }
];
