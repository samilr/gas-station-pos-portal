# Gas Station POS API — Endpoint Reference

> Generated from live responses against `isla_test` (Azure SQL).
> Base URL: `http://localhost:5274`

## Legend

- **EXISTING** = endpoint que existía en el NestJS legacy (misma ruta y respuesta)
- **🆕 NEW** = endpoint nuevo agregado en la migración .NET 9
- Los responses están truncados a las primeras entradas de cada array para brevedad

## Endpoints nuevos (resumen rápido)

| # | Method | Path | Descripción |
|---|--------|------|-------------|
| 1 | POST | `/api/auth/forgot-password` | Reset de contraseña por admin |
| 2 | GET | `/api/taxpayer?page=1&limit=50&search=ISLA` | Lista paginada de contribuyentes (con búsqueda por nombre o RNC) |
| 3 | POST | `/api/taxpayer` | Crear contribuyente |
| 4 | PUT | `/api/taxpayer/{taxpayerId}` | Actualizar contribuyente |
| 5 | DELETE | `/api/taxpayer/{taxpayerId}` | Eliminar contribuyente |
| 6 | GET | `/api/taxes` | Lista de impuestos |
| 7 | GET | `/api/taxes/{taxId}` | Impuesto por ID |
| 8 | POST | `/api/taxes` | Crear impuesto |
| 9 | PUT | `/api/taxes/{taxId}` | Actualizar impuesto |
| 10 | DELETE | `/api/taxes/{taxId}` | Eliminar impuesto |
| 11 | GET | `/api/tax-types` | Lista de tipos de impuesto |
| 12 | POST | `/api/tax-types` | Crear tipo de impuesto |
| 13 | PUT | `/api/tax-types/{taxTypeId}` | Actualizar tipo |
| 14 | DELETE | `/api/tax-types/{taxTypeId}` | Eliminar tipo |
| 15 | GET | `/api/tax-lines?taxId={taxId}` | Líneas de impuesto |
| 16 | POST | `/api/tax-lines` | Crear línea de impuesto |
| 17 | PUT | `/api/tax-lines/{taxId}/{line}` | Actualizar línea |
| 18 | DELETE | `/api/tax-lines/{taxId}/{line}` | Eliminar línea |
| 19 | GET | `/api/cf-config` | Configuración fiscal |
| 20 | POST | `/api/cf-config` | Crear config fiscal |
| 21 | PUT | `/api/cf-config` | Actualizar config fiscal |
| 22 | DELETE | `/api/cf-config/{companyId}` | Eliminar config fiscal |
| 23 | POST | `/api/products` | Crear producto |
| 24 | PUT | `/api/products/{productId}` | Actualizar producto |
| 25 | DELETE | `/api/products/{productId}` | Eliminar producto |
| 26 | GET | `/api/categories/{categoryId}` | Categoría por ID |
| 27 | POST | `/api/categories` | Crear categoría |
| 28 | PUT | `/api/categories/{categoryId}` | Actualizar categoría |
| 29 | DELETE | `/api/categories/{categoryId}` | Eliminar categoría |
| 30 | GET | `/api/barcodes` | Lista de barcodes |
| 31 | GET | `/api/barcodes/{barcodeId}` | Barcode por ID |
| 32 | POST | `/api/barcodes` | Crear barcode |
| 33 | PUT | `/api/barcodes/{barcodeId}` | Actualizar barcode |
| 34 | DELETE | `/api/barcodes/{barcodeId}` | Eliminar barcode |
| 35 | POST | `/api/users` | Crear usuario |
| 36 | PUT | `/api/users/{userId}` | Actualizar usuario |
| 37 | DELETE | `/api/users/{userId}` | Eliminar usuario |
| 38 | GET | `/api/roles/{roleId}` | Rol por ID |
| 39 | POST | `/api/roles` | Crear rol |
| 40 | PUT | `/api/roles/{roleId}` | Actualizar rol |
| 41 | DELETE | `/api/roles/{roleId}` | Eliminar rol |
| 42 | POST | `/api/sites` | Crear sucursal |
| 43 | PUT | `/api/sites/{siteId}` | Actualizar sucursal |
| 44 | DELETE | `/api/sites/{siteId}` | Eliminar sucursal |
| 45 | GET | `/api/hosts/{hostId}` | Host por ID |
| 46 | POST | `/api/hosts` | Crear host |
| 47 | PUT | `/api/hosts/{hostId}` | Actualizar host |
| 48 | DELETE | `/api/hosts/{hostId}` | Eliminar host |
| 49 | GET | `/api/host-types/{hostTypeId}` | Tipo de host por ID |
| 50 | POST | `/api/host-types` | Crear tipo de host |
| 51 | PUT | `/api/host-types/{hostTypeId}` | Actualizar tipo |
| 52 | DELETE | `/api/host-types/{hostTypeId}` | Eliminar tipo |
| 53 | POST | `/api/payments` | Crear método de pago |
| 54 | PUT | `/api/payments/{paymentId}` | Actualizar método |
| 55 | DELETE | `/api/payments/{paymentId}` | Eliminar método |
| 56 | POST | `/api/app-config` | Crear config app |
| 57 | PUT | `/api/app-config/{id}` | Actualizar config app |
| 58 | DELETE | `/api/app-config/{id}` | Eliminar config app |
| 59 | GET | `/api/staft-groups` | Lista de grupos de cajeros |
| 60 | GET | `/api/staft-groups/{id}` | Grupo por ID |
| 61 | POST | `/api/staft-groups` | Crear grupo |
| 62 | PUT | `/api/staft-groups/{id}` | Actualizar grupo |
| 63 | DELETE | `/api/staft-groups/{id}` | Eliminar grupo |
| 64 | POST | `/api/terminals` | Crear terminal |
| 65 | PUT | `/api/terminals/{siteId}/{terminalId}` | Actualizar terminal |
| 66 | DELETE | `/api/terminals/{siteId}/{terminalId}` | Eliminar terminal |
| 67 | POST | `/api/staft` | Crear cajero |
| 68 | PUT | `/api/staft/{staftId}` | Actualizar cajero |
| 69 | DELETE | `/api/staft/{staftId}` | Eliminar cajero |
| 70 | POST | `/api/cart/add` | Agregar al carrito |
| 71 | PUT | `/api/cart/{id}` | Actualizar item del carrito |
| 72 | DELETE | `/api/cart/{id}` | Eliminar item del carrito |
| 73 | GET | `/api/audit/actions?page=1&limit=50` | Action logs paginados |
| 74 | GET | `/api/audit/errors?page=1&limit=50` | Error logs paginados |
| 75 | DELETE | `/api/audit/actions/{id}` | Eliminar action log |
| 76 | DELETE | `/api/audit/errors/{id}` | Eliminar error log |
| 77 | GET | `/api/zataca/config` | Config de Zataca |
| 78 | POST | `/api/zataca/config` | Crear config Zataca |
| 79 | PUT | `/api/zataca/config/{companyId}` | Actualizar config |
| 80 | DELETE | `/api/zataca/config/{companyId}` | Eliminar config |
| 81 | GET | `/api/zataca/products` | Productos Zataca |
| 82 | GET | `/api/zataca/products/{zProductId}` | Producto Zataca por ID |
| 83 | POST | `/api/zataca/products` | Crear producto Zataca |
| 84 | PUT | `/api/zataca/products/{zProductId}` | Actualizar producto |
| 85 | DELETE | `/api/zataca/products/{zProductId}` | Eliminar producto |
| 86 | GET | `/api/zataca/types` | Tipos Zataca |
| 87 | GET | `/api/zataca/types/{zTypeId}` | Tipo Zataca por ID |
| 88 | POST | `/api/zataca/types` | Crear tipo Zataca |
| 89 | PUT | `/api/zataca/types/{zTypeId}` | Actualizar tipo |
| 90 | DELETE | `/api/zataca/types/{zTypeId}` | Eliminar tipo |
| 91 | GET | `/api/zataca/transactions?transNumber={x}` | Transacciones Zataca |
| 92 | GET | `/api/fuel-transactions` | Fuel transactions recientes |
| 93 | GET | `/api/fuel-transactions/{id}` | Fuel transaction por ID |
| 94 | PUT | `/api/fuel-transactions/{id}` | Actualizar fuel transaction |
| 95 | DELETE | `/api/fuel-transactions/{id}` | Eliminar fuel transaction |

---

## Auth

### `POST /api/auth/login` — EXISTING

> Login — emite JWT token

**Request body:**
```json
{"username":"string","password":"string"}
```

**Response:**
```json
{
  "successful": true,
  "data": {
    "user": "Samir Gonzalez",
    "staftId": 633,
    "shift": 4,
    "role": "ADMIN",
    "terminal": 201,
    "site": "CO-0017",
    "staftGroup": "Vendedor Pista",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxSEJWNFFYMkE1IiwidXNlcm5hbWUiOiI2MzMiLCJzdGFmdElkIjo2MzMsInNpdGVJZCI6IkNPLTAwMTciLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NzU5NTU3MDgsImV4cCI6MTc3NTk5ODkwOH0.4NpnFjfxxdm4d5W9GaNREQ7hYqTTYjrqaFSZpZBkUDQ",
    "expiresIn": "2026-04-12T13:01:48.376186Z"
  }
}
```

### `POST /api/auth/login` — EXISTING

> Login fallido

**Request body:**
```json
{"username":"string","password":"string"}
```

**Response:**
```json
{
  "successful": false,
  "error": "Usuario o contraseña incorrecto"
}
```

### `POST /api/auth/logout` — EXISTING

> Logout — marca user como desconectado

**Response:**
```json
{
  "successful": true,
  "data": null
}
```

### `POST /api/auth/change-password` — EXISTING

> Cambiar contraseña (ejemplo con pw incorrecta)

**Request body:**
```json
{"staftId":"int","actualPassword":"string","newPassword":"string"}
```

**Response:**
```json
{
  "successful": false,
  "error": "Contraseña actual incorrecta"
}
```

### `POST /api/auth/forgot-password` — 🆕 NEW

> Reset de contraseña por admin

**Request body:**
```json
{"adminUsername":"string","adminPassword":"string","sellerUsername":"string","sellerPassword":"string"}
```

**Response:**
```json
(empty)
```

---

## Gov — Taxpayer

### `GET /api/taxpayer?page=1&limit=50&search=ISLA` — 🆕 NEW

> Lista paginada de contribuyentes (~820,000 registros). Soporta búsqueda por nombre o RNC.

**Query params:**

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `page` | int | 1 | Página actual |
| `limit` | int | 50 | Items por página (max 200) |
| `search` | string | null | Filtra por nombre o RNC (LIKE %term%) |

**Response (sin search):** `GET /api/taxpayer?page=1&limit=3`
```json
{
  "successful": true,
  "data": [
    {
      "taxpayerId": "133068915",
      "name": " 5PI DOMINICANA SRL",
      "type": 0,
      "validated": true,
      "active": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 3,
    "total": 820906,
    "totalPages": 273636,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Response (con search):** `GET /api/taxpayer?search=ISLA+DOMINICANA&page=1&limit=5`
```json
{
  "successful": true,
  "data": [
    {
      "taxpayerId": "101008172",
      "name": "ISLA DOMINICANA DE PETROLEO SA",
      "type": 0,
      "validated": true,
      "active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### `GET /api/taxpayer/{taxpayerId}` — EXISTING

> Contribuyente por RNC

**Response:**
```json
{
  "successful": true,
  "data": {
    "rnc": "101703571",
    "name": "A & A ABOGADOS SRL"
  }
}
```

### `GET /api/taxpayer/razonSocial/{name}` — EXISTING

> Buscar por razón social

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "rnc": "111127807",
      "name": "ISLA 2000 S A"
    },
    {
      "rnc": "131633811",
      "name": "ISLA ADENTRO SRL"
    },
    {
      "rnc": "131582885",
      "name": "ISLA AG SRL"
    },
    {
      "rnc": "101144612",
      "name": "ISLA AGRICOLA SRL"
    },
    {
      "rnc": "124006139",
      "name": "ISLA ALTA S A"
    },
    {
      "rnc": "131917135",
      "name": "ISLA AQUATIC TOURS SRL"
    },
    {
      "rnc": "101733411",
      "name": "ISLA AUTOS S R L"
    },
    {
      "rnc": "130984964",
      "name": "ISLA AZUL EIRL"
    },
    {
      "rnc": "130249202",
      "name": "ISLA AZUL INMOBILIARIA C POR A"
    },
    {
      "rnc": "132965116",
      "name": "ISLA BEAUTY OASIS SRL"
    }
  ]
}
```

---

## Gov — Tax

### `GET /api/taxes` — 🆕 NEW

> Lista de impuestos activos

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "taxId": "101",
      "name": "ITBIS 1",
      "taxTypeId": 1,
      "active": true
    },
    {
      "taxId": "102",
      "name": "ITBIS 2",
      "taxTypeId": 1,
      "active": true
    }
  ]
}
```

### `GET /api/taxes/{taxId}` — 🆕 NEW

> Impuesto por ID

**Response:**
```json
{
  "successful": true,
  "data": {
    "taxId": "101",
    "name": "ITBIS 1",
    "taxTypeId": 1,
    "active": true
  }
}
```

---

## Gov — Tax Types

### `GET /api/tax-types` — 🆕 NEW

> Lista de tipos de impuesto

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "taxTypeId": 1,
      "name": "Impuesto a la Transferencia de Bienes Industrializados",
      "active": true
    }
  ]
}
```

---

## Gov — Tax Lines

### `GET /api/tax-lines?taxId={taxId}` — 🆕 NEW

> Líneas de impuesto por taxId

**Response:**
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "tax_id": [
      "The tax_id field is required."
    ]
  },
  "traceId": "00-e19371e50dcbdcb3ec0250878b3ef720-069866a25cdbb05b-00"
}
```

---

## Gov — CF Config

### `GET /api/cf-config` — 🆕 NEW

> Configuración fiscal

**Response:**
```json
{"successful":true,"data":{"companyId":1,"serieSource":3,"serieUrl":"https://isladominicana.azurewebsites.net/api","serieUsername":"magic","seriePassword":"m@g!c!sl@","url":"https://ecf.dgii.gov.do/ecf","urlInterface":"https://dynasoft.azurewebsites.net/api","username":"101008172","password":"cHwjM1i1","qrFolder":"c:\cf_qr\","testMode":false,"active":true,"validationOnline":true,"validationNote":"Nota:
```

---

## Fin-Inv — Products

### `GET /api/products` — EXISTING

> Todos los productos

**Response:**
```json
{
  "successful": true,
  "count": 4294,
  "data": [
    {
      "productId": "1-001",
      "name": "GASOLINA REGULAR",
      "description": null,
      "image": null,
      "categoryId": "COMB",
      "accountGroupId": null,
      "miscellaneous": false,
      "recipe": false,
      "taxId": "    ",
      "price": 272.5,
      "priceIsTaxed": true,
      "costingMethod": 0,
      "inputUnitId": "GL",
      "outputUnitId": "GL",
      "allowDiscount": false,
      "expectedProfit": 0,
      "weightNet": 0,
      "weightGross": 0,
      "inventory": true,
      "active": true
    },
    {
      "productId": "1-025",
      "name": "GASOLINA V-POWER",
      "description": null,
      "image": null,
      "categoryId": "COMB",
      "accountGroupId": null,
      "miscellaneous": false,
      "recipe": false,
      "taxId": "    ",
      "price": 290.1,
      "priceIsTaxed": true,
      "costingMethod": 0,
      "inputUnitId": "GL",
      "outputUnitId": "GL",
      "allowDiscount": false,
      "expectedProfit": 0,
      "weightNet": 0,
      "weightGross": 0,
      "inventory": true,
      "active": true
    }
  ]
}
```

### `GET /api/products/{id}` — EXISTING

> Producto por ID

**Response:**
```json
{
  "successful": true,
  "data": {
    "productId": "1-001",
    "name": "GASOLINA REGULAR",
    "description": null,
    "image": null,
    "categoryId": "COMB",
    "accountGroupId": null,
    "miscellaneous": false,
    "recipe": false,
    "taxId": "    ",
    "price": 272.5,
    "priceIsTaxed": true,
    "costingMethod": 0,
    "inputUnitId": "GL",
    "outputUnitId": "GL",
    "allowDiscount": false,
    "expectedProfit": 0,
    "weightNet": 0,
    "weightGross": 0,
    "inventory": true,
    "active": true
  }
}
```

### `GET /api/products/search?product={term}` — EXISTING

> Buscar productos

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "productId": "1-001",
      "product": "GASOLINA REGULAR",
      "price": 272.5,
      "priceIsTaxed": true,
      "barcodeId": "1-001",
      "productName": null,
      "categoryId": "COMB",
      "category": "COMBUSTIBLE",
      "taxId": "    ",
      "taxName": null,
      "taxTypeId": null,
      "taxTypeName": null,
      "taxRate": null
    },
    {
      "productId": "1-025",
      "product": "GASOLINA V-POWER",
      "price": 290.1,
      "priceIsTaxed": true,
      "barcodeId": "1-025",
      "productName": null,
      "categoryId": "COMB",
      "category": "COMBUSTIBLE",
      "taxId": "    ",
      "taxName": null,
      "taxTypeId": null,
      "taxTypeName": null,
      "taxRate": null
    }
  ]
}
```

### `GET /api/products/barcode/{barcodeId}` — EXISTING

> Producto por código de barras

**Response:**
```json
{
  "successful": true,
  "data": {
    "productId": "1-001",
    "product": "GASOLINA REGULAR",
    "price": 272.5,
    "priceIsTaxed": true,
    "barcodeId": "1-001",
    "productName": null,
    "categoryId": "COMB",
    "category": "COMBUSTIBLE",
    "taxId": "    ",
    "taxName": null,
    "taxTypeId": null,
    "taxTypeName": null,
    "taxRate": null
  }
}
```

### `GET /api/products/category/{categoryId}` — EXISTING

> Productos por categoría

**Response:**
```json
{
  "successful": true,
  "count": 4,
  "data": [
    {
      "productId": "1-001",
      "product": "GASOLINA REGULAR",
      "price": 272.5,
      "priceIsTaxed": true,
      "barcodeId": "1-001",
      "productName": null,
      "categoryId": "COMB",
      "category": "COMBUSTIBLE",
      "taxId": "    ",
      "taxName": null,
      "taxTypeId": null,
      "taxTypeName": null,
      "taxRate": null
    },
    {
      "productId": "1-025",
      "product": "GASOLINA V-POWER",
      "price": 290.1,
      "priceIsTaxed": true,
      "barcodeId": "1-025",
      "productName": null,
      "categoryId": "COMB",
      "category": "COMBUSTIBLE",
      "taxId": "    ",
      "taxName": null,
      "taxTypeId": null,
      "taxTypeName": null,
      "taxRate": null
    },
    {
      "productId": "2-001",
      "product": "DIESEL REGULAR",
      "price": 224.8,
      "priceIsTaxed": true,
      "barcodeId": "2-001",
      "productName": null,
      "categoryId": "COMB",
      "category": "COMBUSTIBLE",
      "taxId": "    ",
      "taxName": null,
      "taxTypeId": null,
      "taxTypeName": null,
      "taxRate": null
    },
    {
      "productId": "2-025",
      "product": "DIESEL V-POWER",
      "price": 242.1,
      "priceIsTaxed": true,
      "barcodeId": "2-025",
      "productName": null,
      "categoryId": "COMB",
      "category": "COMBUSTIBLE",
      "taxId": "    ",
      "taxName": null,
      "taxTypeId": null,
      "taxTypeName": null,
      "taxRate": null
    }
  // ... (truncated)
```

---

## Fin-Inv — Categories

### `GET /api/categories` — EXISTING

> Categorías activas

**Response:**
```json
{
  "successful": true,
  "count": 7,
  "data": [
    {
      "categoryId": "BEBI",
      "categoryName": "Bebidas Alcohólicas",
      "image": "https://firebasestorage.googleapis.com/v0/b/registro-de-facturas-isladom.appspot.com/o/POS%2Fimg%2Fcategorias%2Fbebidas.png?alt=media&token=30c9f8ad-e022-46ee-a9e4-761d89c74428",
      "unitId": "UND"
    },
    {
      "categoryId": "CIGAR",
      "categoryName": "CIGARILLOS",
      "image": "https://firebasestorage.googleapis.com/v0/b/registro-de-facturas-isladom.appspot.com/o/POS%2Fimg%2Fcategorias%2FCigarrillos.png?alt=media&token=fbecfa8f-bc82-4d1e-9b68-e3b683fb3495",
      "unitId": "UND"
    },
    {
      "categoryId": "COMB",
      "categoryName": "COMBUSTIBLE",
      "image": "https://firebasestorage.googleapis.com/v0/b/registro-de-facturas-isladom.appspot.com/o/POS%2Fimg%2Fcategorias%2Flubricantes.png?alt=media&token=141a2dab-763c-4ca4-a73c-ff087428bf7e",
      "unitId": "UND"
    },
    {
      "categoryId": "LUBR",
      "categoryName": "Lubricantes",
      "image": "https://firebasestorage.googleapis.com/v0/b/registro-de-facturas-isladom.appspot.com/o/POS%2Fimg%2Fcategorias%2Flubricantes.png?alt=media&token=141a2dab-763c-4ca4-a73c-ff087428bf7e",
      "unitId": "UND"
    },
    {
      "categoryId": "MISC",
      "categoryName": "MISCELANEO",
      "image": "https://firebasestorage.googleapis.com/v0/b/registro-de-facturas-isladom.appspot.com/o/POS%2Fimg%2Fcategorias%2FMiscelaneos.png?alt=media&token=2459197b-93ec-4412-9
  // ... (truncated)
```

---

## Fin-Inv — Barcodes

### `GET /api/barcodes` — 🆕 NEW

> Lista de barcodes

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "barcodeId": "0000000890564",
      "productId": "P09841",
      "variantName": "OMEPRAZOL 20 MG 100 TAB.",
      "image": null
    },
    {
      "barcodeId": "000974812159",
      "productId": "P14105",
      "variantName": "ACEITUNA LA PEDRIZA RELL.",
      "image": null
    },
    {
      "barcodeId": "000974818151",
      "productId": "P14104",
      "variantName": "ACEITUNA LA PEDRIZA GORDA",
      "image": null
    }
  ]
}
```

### `GET /api/barcodes/{barcodeId}` — 🆕 NEW

> Barcode por ID

**Response:**
```json
{
  "successful": true,
  "data": {
    "barcodeId": "1-001",
    "productId": "1-001",
    "variantName": null,
    "image": null
  }
}
```

---

## Core — Users

### `GET /api/users` — EXISTING

> Lista de usuarios (con join a roles + staft_group)

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "userId": "1HBV4QX2A5",
      "username": "633",
      "name": "Samir Gonzalez",
      "email": "samir.gonzalez@isladom.com.do",
      "staftGroupId": 1,
      "staftGroup": "Vendedor Pista",
      "staftId": 633,
      "createdBy": 1,
      "active": 1,
      "createdAt": "2025-08-09T18:03:15.497",
      "portalAccess": true,
      "role": "ADMIN",
      "siteId": "CO-0017",
      "shift": 4,
      "terminalId": 201
    },
    {
      "userId": "72BS7X9RKB",
      "username": "0040",
      "name": "Angela Andujar",
      "email": "angela.andujar@isladom.com.do",
      "staftGroupId": 4,
      "staftGroup": "Administracion ISLA",
      "staftId": 40,
      "createdBy": 633,
      "active": 1,
      "createdAt": "2025-09-30T18:43:56.44",
      "portalAccess": true,
      "role": "AUDIT",
      "siteId": "HO-0001",
      "shift": 4,
      "terminalId": 1
    }
  ]
}
```

### `GET /api/users/staft/{staftId}` — EXISTING

> Usuario por staftId

**Response:**
```json
{
  "successful": true,
  "data": {
    "userId": "1HBV4QX2A5",
    "username": "633",
    "name": "Samir Gonzalez",
    "email": "samir.gonzalez@isladom.com.do",
    "staftGroupId": 1,
    "staftGroup": "Vendedor Pista",
    "staftId": 633,
    "createdBy": 1,
    "active": 1,
    "createdAt": "2025-08-09T18:03:15.497",
    "portalAccess": true,
    "role": "ADMIN",
    "siteId": "CO-0017",
    "shift": 4,
    "terminalId": 201
  }
}
```

---

## Core — Roles

### `GET /api/roles` — EXISTING

> Lista de roles

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "roleId": 1,
      "name": "ADMIN"
    },
    {
      "roleId": 2,
      "name": "CONFIGURATION"
    },
    {
      "roleId": 3,
      "name": "SUPERVISOR"
    },
    {
      "roleId": 4,
      "name": "MANAGER"
    },
    {
      "roleId": 5,
      "name": "SELLER"
    },
    {
      "roleId": 6,
      "name": "AUDIT"
    },
    {
      "roleId": 7,
      "name": "ACCOUNTANT"
    }
  ]
}
```

---

## Core — Sites

### `GET /api/sites` — EXISTING

> Sucursales activas (projection)

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "siteId": "CL-0191",
      "name": "SHELL LAS AMERICAS",
      "phone": "809-549-2255",
      "address1": "Aut. Las Americas KM. 22",
      "address2": ""
    },
    {
      "siteId": "CO-0017",
      "name": "SHELL 30 DE MAYO",
      "phone": "809-549-2255",
      "address1": "Aut. 30 de Mayo Km 8, Santo Domingo",
      "address2": ""
    },
    {
      "siteId": "CO-0368",
      "name": "SHELL CIUDAD MODELO",
      "phone": "+18095492255",
      "address1": "Av Jacobo Majluta",
      "address2": ""
    }
  ]
}
```

### `GET /api/sites/all` — EXISTING

> Todas las sucursales (full data)

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "siteId": "CL-0081",
      "name": "SHELL MAIMON",
      "countryId": "DOM",
      "currencyId": "DOP",
      "phone": "809-549-2255",
      "email": "cl0081@isladom.com.do                   ",
      "address1": "",
      "address2": "",
      "storeId": "CL-0081",
      "managerId": null,
      "headOffice": false,
      "pos": false,
      "posLevelPrice": 0,
      "posDeliveryTypes": null,
      "posDeliveryType": true,
      "posCashFund": 0.0,
      "posIsRestaurant": false,
      "posUseTip": false,
      "useSector": false,
      "productListType": 0,
      "active": false,
      "status": 2
    }
  ]
}
```

### `GET /api/sites/{siteId}` — EXISTING

> Sucursal por ID

**Response:**
```json
{
  "successful": true,
  "data": {
    "siteId": "CO-0017",
    "name": "SHELL 30 DE MAYO",
    "phone": "809-549-2255",
    "address1": "Aut. 30 de Mayo Km 8, Santo Domingo",
    "address2": ""
  }
}
```

---

## Core — Hosts

### `GET /api/hosts` — EXISTING

> Lista de hosts

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "hostId": 1,
      "name": "POS Magic 02",
      "description": "Android Emulador",
      "ipAddress": "179.53.56.66",
      "siteId": "CL-0191",
      "connected": false,
      "connectedLastTime": "2025-12-28T05:07:10",
      "connectedLastUserId": 0,
      "active": true,
      "deviceId": "4bb95468f729e79e",
      "hostTypeId": 1
    },
    {
      "hostId": 2,
      "name": "POS Magic Dev",
      "description": "Sunmi V2",
      "ipAddress": "::ffff:10.10.11.201",
      "siteId": "CL-0191",
      "connected": false,
      "connectedLastTime": "2025-05-21T01:14:39",
      "connectedLastUserId": 404,
      "active": true,
      "deviceId": "sssssssssss1d5cd2f7",
      "hostTypeId": 1
    }
  ]
}
```

---

## Core — Host Types

### `GET /api/host-types` — EXISTING

> Lista de tipos de host

**Response:**
```json
{
  "successful": true,
  "data": []
}
```

---

## Core — Payments

### `GET /api/payments` — EXISTING

> Métodos de pago activos

**Response:**
```json
{
  "successful": true,
  "count": 4,
  "data": [
    {
      "paymentId": "EF  ",
      "name": "Efectivo",
      "sequence": 0,
      "paymentType": 1,
      "image": "payment_cash_dop.png",
      "returnPaymentId": null,
      "currencyId": "DOP",
      "accountId": null,
      "posRequireApproval": false,
      "posMinimum": 0,
      "posMaximum": 0,
      "posMultipleOf": 0,
      "paymentActive": true
    },
    {
      "paymentId": "SC",
      "name": "Shell Card",
      "sequence": 0,
      "paymentType": 8,
      "image": "payment",
      "returnPaymentId": null,
      "currencyId": "DOP",
      "accountId": null,
      "posRequireApproval": false,
      "posMinimum": 0,
      "posMaximum": 0,
      "posMultipleOf": 0,
      "paymentActive": true
    },
    {
      "paymentId": "TC  ",
      "name": "Tarjeta Credito",
      "sequence": 0,
      "paymentType": 2,
      "image": "payment_card.png",
      "returnPaymentId": null,
      "currencyId": "DOP",
      "accountId": null,
      "posRequireApproval": false,
      "posMinimum": 0,
      "posMaximum": 0,
      "posMultipleOf": 0,
      "paymentActive": true
    },
    {
      "paymentId": "TK  ",
      "name": "Tickets",
      "sequence": 0,
      "paymentType": 6,
      "image": "payment_ticket.png",
      "returnPaymentId": null,
      "currencyId": "DOP",
      "accountId": null,
      "posRequireApproval": false,
      "posMinimum": 0,
      "posMaximum": 0,
      "posMultipleOf": 0,
      "paymentActive": tru
  // ... (truncated)
```

### `GET /api/payments/{paymentId}` — EXISTING

> Método de pago por ID

**Response:**
```json
{
  "successful": true,
  "data": {
    "paymentId": "EF  ",
    "name": "Efectivo                                ",
    "sequence": 0,
    "paymentType": 1,
    "image": "payment_cash_dop.png",
    "returnPaymentId": null,
    "currencyId": "DOP",
    "accountId": null,
    "posRequireApproval": false,
    "posMinimum": 0,
    "posMaximum": 0,
    "posMultipleOf": 0,
    "active": true
  }
}
```

---

## Core — App Config

### `GET /api/app-config` — EXISTING

> Configuración de la app

**Response:**
```json
{
  "successful": true,
  "data": {
    "appVersion": "1.0.9",
    "description": "Mejoras de procesos operativos",
    "urlApk": "https://isladomposmobile.blob.core.windows.net/posmobile/apk/pos-mobile.apk",
    "required": false,
    "apiKey": "sv=2024-11-04&ss=bf&srt=sco&sp=rtfx&se=2027-05-21T03:10:36Z&st=2025-05-19T19:10:36Z&spr=https&sig=yHlgWPqd04fRT3B1oukRtXpDdsZJAU5sGxUmybedOIc%3D"
  }
}
```

---

## Core — Staft Groups

### `GET /api/staft-groups` — 🆕 NEW

> Lista de grupos de cajeros

**Response:**
```json
{
  "successful": true,
  "count": 4,
  "data": [
    {
      "staftGroupId": 1,
      "name": "Vendedor Pista",
      "isManager": false,
      "rights": "01111111"
    },
    {
      "staftGroupId": 2,
      "name": "Vendedor Tienda",
      "isManager": false,
      "rights": "01111111"
    },
    {
      "staftGroupId": 3,
      "name": "Administrador Estacion",
      "isManager": true,
      "rights": "11111111"
    },
    {
      "staftGroupId": 4,
      "name": "Administracion ISLA",
      "isManager": true,
      "rights": "11111111"
    }
  ]
}
```

---

## Core — PTS Controllers

### `GET /api/pts-controllers` — EXISTING

> Lista de controladores PTS

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "id": 2,
      "ptsId": "004A00323233511638383435",
      "siteId": "CO-0017",
      "name": "PTS-2 Controller C0-0017",
      "secretKey": "bZ1zHCDbnj7kvAtNsYeO",
      "configurationId": "685fd4d",
      "firmwareVersion": "2026-01-15T20:25:42",
      "ipAddress": null,
      "batteryVoltage": 3270,
      "cpuTemperature": 50,
      "lastSeenAt": "2026-04-10T14:29:07",
      "createdAt": "2026-04-10T13:33:10.228",
      "updatedAt": "2026-04-10T15:16:04.006"
    }
  ]
}
```

### `GET /api/pts-controllers/{id}` — EXISTING

> Controlador PTS por ID

**Response:**
```json
{
  "successful": true,
  "data": {
    "id": 2,
    "ptsId": "004A00323233511638383435",
    "siteId": "CO-0017",
    "name": "PTS-2 Controller C0-0017",
    "secretKey": "bZ1zHCDbnj7kvAtNsYeO",
    "configurationId": "685fd4d",
    "firmwareVersion": "2026-01-15T20:25:42",
    "ipAddress": null,
    "batteryVoltage": 3270,
    "cpuTemperature": 50,
    "lastSeenAt": "2026-04-10T14:29:07",
    "createdAt": "2026-04-10T13:33:10.228",
    "updatedAt": "2026-04-10T15:16:04.006"
  }
}
```

---

## Bus-Sale — Terminals

### `GET /api/terminals` — EXISTING

> Lista de terminales

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "siteId": "CL-0191",
      "terminalId": 201,
      "name": "TERMINAL 01 PISTA",
      "terminalType": 0,
      "sectorId": 2,
      "productList": 0,
      "useCustomerDisplay": false,
      "openCashDrawer": false,
      "printDevice": 2,
      "cashFund": 0,
      "connected": true,
      "lastConnectionTime": "2025-12-28T05:04:16",
      "lastConnectionHostname": "9749c3771db04a40",
      "lastConnectionUsername": "CONFIGURACION",
      "connectedTime": "2025-12-28T05:05:30",
      "connectedHostname": "9749c3771db04a40",
      "connectedUsername": "CONFIGURACION",
      "connectedStaftId": 0,
      "active": true,
      "productListType": 0
    },
    {
      "siteId": "CL-0191",
      "terminalId": 202,
      "name": "TERMINAL 02 PISTA",
      "terminalType": 0,
      "sectorId": 2,
      "productList": 0,
      "useCustomerDisplay": false,
      "openCashDrawer": false,
      "printDevice": 2,
      "cashFund": 0,
      "connected": false,
      "lastConnectionTime": "2025-12-11T22:45:12",
      "lastConnectionHostname": "1d6002bd08c3fe1a",
      "lastConnectionUsername": "JOSE MIGUEL LANDRIN",
      "connectedTime": "2025-12-11T22:45:12",
      "connectedHostname": null,
      "connectedUsername": null,
      "connectedStaftId": null,
      "active": true,
      "productListType": 0
    }
  ]
}
```

### `GET /api/terminals/{siteId}/{terminalId}` — EXISTING

> Terminal específica

**Response:**
```json
{
  "siteId": "CO-0017",
  "terminalId": 201,
  "name": "TERMINAL 201 PISTA",
  "terminalType": 0,
  "sectorId": 2,
  "productList": 0,
  "useCustomerDisplay": true,
  "openCashDrawer": false,
  "printDevice": 0,
  "cashFund": 0,
  "connected": true,
  "lastConnectionTime": "2025-12-27T14:18:15",
  "lastConnectionHostname": "bcae18125b74e780",
  "lastConnectionUsername": "RANDOLFH OMAR ARIAS PEREZ",
  "connectedTime": "2025-12-27T15:23:03",
  "connectedHostname": "bcae18125b74e780",
  "connectedUsername": "RANDOLFH OMAR ARIAS PEREZ",
  "connectedStaftId": 7164,
  "active": true,
  "productListType": 0
}
```

---

## Bus-Sale — Staft (Cajeros)

### `GET /api/staft/pista?siteId={siteId}` — EXISTING

> Vendedores de pista por sucursal

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "staftId": 7848,
      "name": "LENIN AMAURY ARISTY SUAREZ ",
      "siteId": "CO-0017",
      "terminalId": 1,
      "shift": 1,
      "isManager": false
    },
    {
      "staftId": 7471,
      "name": "EDILI HERNANDEZ ALCANTARA",
      "siteId": "CO-0017",
      "terminalId": 201,
      "shift": 1,
      "isManager": false
    },
    {
      "staftId": 7164,
      "name": "RANDOLFH OMAR ARIAS PEREZ",
      "siteId": "CO-0017",
      "terminalId": 201,
      "shift": 1,
      "isManager": false
    }
  ]
}
```

### `GET /api/staft/admin` — EXISTING

> Administradores

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "staftId": 0,
      "name": "CONFIGURACION",
      "siteId": "CO-0000",
      "terminalId": 201,
      "shift": 1,
      "isManager": false
    }
  ]
}
```

---

## Bus-Sale — Cart

### `GET /api/cart?staftId={id}&siteId={site}` — EXISTING

> Carrito por cajero y sucursal

**Response:**
```json
{
  "successful": true,
  "data": []
}
```

---

## Bus-Sale — Transactions

### `GET /api/trans?siteId=X&page=1&limit=50` — EXISTING

> Búsqueda paginada de transacciones

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "transNumber": "CO0017P0007830",
      "returnTransNumber": null,
      "cfNumber": "E325672090537",
      "returnCfNumber": null,
      "cfValidity": "2026-03-23T13:04:57",
      "cfQr": null,
      "cfType": "32",
      "terminalId": 201,
      "transDate": "2026-03-23T13:04:00",
      "cfStatus": 0,
      "shift": 4,
      "siteId": "CO-0017",
      "status": 1,
      "isReturn": false,
      "subtotal": 97.46,
      "tax": 17.54,
      "total": 115.0,
      "taxpayerName": null,
      "taxpayerId": "",
      "staftId": 633,
      "staftName": "SAMIR GONZALES",
      "siteName": "SHELL 30 DE MAYO",
      "prods": [],
      "payms": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 1,
    "total": 7818,
    "totalPages": 7818,
    "hasNext": true,
    "hasPrev": false
  },
  "statistics": {
    "totalTransactions": 7818,
    "totalSalesTransactions": 7789,
    "totalReturnTransactions": 29,
    "totalSales": 20422249.93,
    "totalReturn": 65655.0,
    "dgiiAcceptedTransactions": 7781,
    "dgiiRejectedTransactions": 13,
    "dgiiPendingTransactions": 24
  }
}
```

### `GET /api/trans/{transNumber}` — EXISTING

> Transacción completa por número

**Response:**
```json
{
  "successful": true,
  "data": {
    "transNumber": "CO0017P0007830",
    "transType": 1,
    "isReturn": false,
    "siteId": "CO-0017",
    "terminalId": 201,
    "storeId": "CO-0017",
    "date": "2026-03-23T13:04:00",
    "shift": 4,
    "staftId": 633,
    "managerId": 0,
    "startTime": "2026-03-23T13:04:50",
    "endTime": "2026-03-23T13:05:42",
    "customerId": "CONTADO",
    "fuelTransactionId": null,
    "taxpayerId": "",
    "deliveryType": 0,
    "linesProduct": 1,
    "linesPayment": 1,
    "subtotal": -97.46,
    "discount": 0.0,
    "tax": -17.54,
    "tip": 0.0,
    "other1": 0.0,
    "other2": 0.0,
    "other3": 0.0,
    "total": -115.0,
    "payment": 115.0,
    "returnTransNumber": null,
    "cost": 0.0,
    "source": 0,
    "cfTypeId": "32",
    "cfNumber": "E325672090537",
    "cfValidity": "2026-03-23T13:04:57",
    "cfStatus": 0,
    "status": 1,
    "xReportNumber": null,
    "zReportNumber": null,
    "statementNumber": null,
    "available01": null,
    "available02": null,
    "createdAt": "2026-03-23T17:04:57.093",
    "createdBy": "POS_MOBILE",
    "updatedAt": null,
    "updatedBy": null,
    "cfQr": null,
    "posVersion": "2.0.0",
    "products": [
      {
        "transNumber": "CO0017P0007830",
        "line": 1,
        "subline": 0,
        "isReturn": false,
        "barcodeId": "01223101",
        "productId": "P00606",
        "discountRate": 0.0,
        "taxId": "101 ",
        "taxRate": 0.18,
        "deliveryType": 1,
        "
  // ... (truncated)
```

### `GET /api/trans/bySiteId?siteId=X&terminal=Y&date=YYYY-MM-DD` — EXISTING

> Transacciones para facturación

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "transNumber": "CO0017P0007830",
      "cfNumber": "E325672090537",
      "cfValidity": "2026-03-23T13:04:57",
      "cfQr": "https://ecf.dgii.gov.do/eCF/ConsultaTimbreFC?RncEmisor=101008172&ENCF=E325672090537&MontoTotal=115.00&CodigoSeguridad=",
      "cfType": "32",
      "transDate": "2026-03-23T13:04:00",
      "status": 1,
      "isReturn": false,
      "subtotal": 97.46,
      "tax": 17.54,
      "total": 115.0,
      "taxpayerName": null,
      "taxpayerId": "",
      "staftId": 633,
      "staftName": "SAMIR GONZALES",
      "cfSecurityCode": null,
      "digitalSignatureDate": null,
      "prods": [
        {
          "productId": "P00606",
          "isReturn": false,
          "productName": "REFRESCO PEPSI 2 LITROS",
          "quantity": 1.0,
          "price": 115.0,
          "tax": 17.54,
          "total": 115.0
        }
      ],
      "payms": [
        {
          "paymentId": "EF  ",
          "isReturn": false,
          "type": "Efectivo                                ",
          "total": 115.0
        }
      ]
    }
  ]
}
```

---

## Dashboards

### `GET /api/trans/dashboard/sales-returns-summary?startDate=YYYY-MM-DD` — EXISTING

> Resumen ventas vs devoluciones

**Response:**
```json
{
  "successful": true,
  "data": {
    "totalSales": 9547.79,
    "totalReturn": 0.0,
    "countSales": 8,
    "countReturns": 0
  }
}
```

### `GET /api/trans/dashboard/daily-sales?startDate=YYYY-MM-DD` — EXISTING

> Ventas diarias

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "dayOfMonth": "2026-03-03T00:00:00",
      "totalSales": 8972.79
    },
    {
      "dayOfMonth": "2026-03-23T00:00:00",
      "totalSales": 575.0
    }
  ]
}
```

### `GET /api/trans/dashboard/top-transactions?startDate=X&limit=N` — EXISTING

> Top transacciones recientes

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "transNumber": "CO0017P0007830",
      "cfNumber": "E325672090537",
      "transType": 1,
      "total": 115.0,
      "taxpayerId": "",
      "taxpayerName": null,
      "siteId": "CO-0017",
      "siteName": "SHELL 30 DE MAYO",
      "date": "2026-03-23T13:04:00"
    },
    {
      "transNumber": "CO0017P0007829",
      "cfNumber": "E323914819139",
      "transType": 1,
      "total": 115.0,
      "taxpayerId": "",
      "taxpayerName": null,
      "siteId": "CO-0017",
      "siteName": "SHELL 30 DE MAYO",
      "date": "2026-03-23T13:04:00"
    },
    {
      "transNumber": "CO0017P0007828",
      "cfNumber": "E327691702188",
      "transType": 1,
      "total": 115.0,
      "taxpayerId": "",
      "taxpayerName": null,
      "siteId": "CO-0017",
      "siteName": "SHELL 30 DE MAYO",
      "date": "2026-03-23T12:53:00"
    }
  ]
}
```

### `GET /api/trans/dashboard/top-products?startDate=X&limit=N` — EXISTING

> Top productos vendidos

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "productName": "GASOLINA V-POWER",
      "total": 8972.79,
      "quantity": 30.93
    },
    {
      "productName": "REFRESCO PEPSI 2 LITROS",
      "total": 575.0,
      "quantity": 5
    }
  ]
}
```

### `GET /api/trans/dashboard/sales-by-site?startDate=YYYY-MM-DD` — EXISTING

> Ventas por sucursal

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "siteId": "CO-0017",
      "siteName": "SHELL 30 DE MAYO",
      "total": 9547.79
    }
  ]
}
```

---

## Audit

### `GET /api/audit/actions?page=1&limit=50` — 🆕 NEW

> Action logs paginados

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "actionId": 18521,
      "staftId": null,
      "siteId": null,
      "action": "LOGOUT",
      "description": "Sesión cerrada",
      "ipAddress": "::1",
      "createdAt": "2026-04-12T01:01:48.747",
      "deviceId": null,
      "terminalId": null,
      "latitude": null,
      "longitude": null
    },
    {
      "actionId": 18520,
      "staftId": null,
      "siteId": null,
      "action": "LOGIN",
      "description": "Intento de login: 633",
      "ipAddress": "::1",
      "createdAt": "2026-04-12T01:01:48.377",
      "deviceId": null,
      "terminalId": null,
      "latitude": null,
      "longitude": null
    },
    {
      "actionId": 18519,
      "staftId": null,
      "siteId": null,
      "action": "LOGIN",
      "description": "Intento de login: 633",
      "ipAddress": "::1",
      "createdAt": "2026-04-12T01:01:47.99",
      "deviceId": null,
      "terminalId": null,
      "latitude": null,
      "longitude": null
    }
  ],
  "total": 17497,
  "page": 1,
  "limit": 3
}
```

### `GET /api/audit/errors?page=1&limit=50` — 🆕 NEW

> Error logs paginados

**Response:**
```json
{"successful":true,"data":[{"errorId":693,"staftId":null,"siteId":null,"errorCode":"PASSWORD_CHANGED","message":"Contraseña actual incorrecta","stackTrace":"   at GasStationPos.Application.Auth.Commands.ChangePassword.ChangePasswordHandler.Handle(ChangePasswordCommand request, CancellationToken cancellationToken) in /Users/sgonzalez/Apps/gas-station-managment-api/src/GasStationPos.Application/Auth/Commands/ChangePassword/ChangePasswordCommand.cs:line 38
```

---

## External — Zataca

### `GET /api/zataca/config` — 🆕 NEW

> Configuración de Zataca

**Response:**
```json
{
  "successful": true,
  "data": {
    "companyId": 1,
    "urlRecharge": "http://h2h.zataca.com/service.php",
    "urlDataPackage": "http://h2h.zataca.com/getPaquetitos.php",
    "urlService": null,
    "username": "pruebash2h",
    "password": "A8coL6Qye6",
    "debug": true,
    "dailyLimit": 0.0,
    "monthLimit": 0.0,
    "transMinLimit": 50.0,
    "transMaxLimit": 1000.0,
    "siteLimit": 0.0
  }
}
```

### `GET /api/zataca/products` — 🆕 NEW

> Productos Zataca

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "zProductId": 0,
      "zTypeId": "1",
      "description": "Pruebas",
      "price": null,
      "status": true,
      "national": false,
      "createdAt": "2025-06-18T02:25:20.473",
      "updatedAt": null,
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThAflK8W2YKl2WryHXVExNc1T-tY8Q7KZOKw&s"
    },
    {
      "zProductId": 1,
      "zTypeId": "1",
      "description": "CLARO",
      "price": null,
      "status": true,
      "national": true,
      "createdAt": "2025-06-18T02:25:20.473",
      "updatedAt": null,
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR167qcxh8j-OrnGtV1SvXHMbZvxABmZ20lnQ&s"
    },
    {
      "zProductId": 2,
      "zTypeId": "1",
      "description": "ALTICE",
      "price": null,
      "status": true,
      "national": true,
      "createdAt": "2025-06-18T02:25:20.473",
      "updatedAt": null,
      "image": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Logo_altice.png"
    }
  ]
}
```

### `GET /api/zataca/types` — 🆕 NEW

> Tipos Zataca

**Response:**
```json
{
  "successful": true,
  "data": [
    {
      "zTypeId": 1,
      "description": "RECARGA"
    },
    {
      "zTypeId": 2,
      "description": "SERVICIO"
    }
  ]
}
```

---

## External — Fuel Transactions

### `GET /api/fuel-transactions` — 🆕 NEW

> Fuel transactions recientes (24h)

**Response:**
```json
{
  "successful": true,
  "data": []
}
```

---

## Health

### `GET /health` — EXISTING

> Health check

**Response:**
```json
{
  "successful": true,
  "status": "healthy"
}
```

---

## CRUD Endpoints — Request Bodies (POST / PUT / DELETE)

> Todos los endpoints de escritura requieren `Authorization: Bearer <token>` y `Content-Type: application/json`.
> Response shape: `{ "successful": true, "data": { ... } }` o `{ "successful": true, "message": "..." }`.

---

### Taxpayer CRUD — 🆕 NEW

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/taxpayer` | Crear contribuyente |
| PUT | `/api/taxpayer/{taxpayerId}` | Actualizar contribuyente |
| DELETE | `/api/taxpayer/{taxpayerId}` | Eliminar contribuyente |
| POST | `/api/taxpayer/updateTaxpayerFromDGII` | Importar RNC desde DGII (ZIP) |

```json
// POST /api/taxpayer
{ "taxpayerId": "123456789", "name": "EMPRESA EJEMPLO SRL", "type": 0, "validated": true, "active": true }

// PUT /api/taxpayer/{taxpayerId}
{ "name": "NUEVO NOMBRE SRL", "type": 0, "validated": true, "active": true }
```

---

### Tax CRUD — 🆕 NEW

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/taxes` | Crear impuesto |
| PUT | `/api/taxes/{taxId}` | Actualizar impuesto |
| DELETE | `/api/taxes/{taxId}` | Eliminar impuesto |

```json
// POST /api/taxes
{ "taxId": "105", "name": "ITBIS 18%", "taxTypeId": 1, "active": true }

// PUT /api/taxes/{taxId}
{ "name": "ITBIS 16%", "taxTypeId": 1, "active": true }
```

---

### Tax Type CRUD — 🆕 NEW

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tax-types` | Crear tipo de impuesto |
| PUT | `/api/tax-types/{taxTypeId}` | Actualizar |
| DELETE | `/api/tax-types/{taxTypeId}` | Eliminar |

```json
// POST /api/tax-types
{ "taxTypeId": 5, "name": "Propina Legal", "active": true }

// PUT /api/tax-types/{taxTypeId}
{ "name": "Propina Legal Actualizada", "active": true }
```

---

### Tax Line CRUD — 🆕 NEW

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tax-lines` | Crear línea de impuesto |
| PUT | `/api/tax-lines/{taxId}/{line}` | Actualizar |
| DELETE | `/api/tax-lines/{taxId}/{line}` | Eliminar |

```json
// POST /api/tax-lines
{ "taxId": "101", "line": 2, "startTime": "2026-01-01", "endTime": null, "rate": 0.18, "status": 1 }

// PUT /api/tax-lines/{taxId}/{line}
{ "startTime": "2026-01-01", "endTime": "2026-12-31", "rate": 0.16, "status": 1 }
```

---

### CF Config CRUD — 🆕 NEW

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cf-config` | Crear configuración fiscal |
| PUT | `/api/cf-config` | Actualizar configuración fiscal |
| DELETE | `/api/cf-config/{companyId}` | Eliminar |

```json
// PUT /api/cf-config
{
  "serieSource": 1, "serieUrl": "https://ncf-api.example.com",
  "serieUsername": "user", "seriePassword": "pass",
  "url": "https://dgii.example.com", "urlInterface": "https://interface.example.com",
  "username": "dgii_user", "password": "dgii_pass",
  "testMode": true, "active": true, "validationOnline": true,
  "cfTypeConsumeLimit": 250000, "combTransLimit": 50000
}
```

---

### Product CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/{productId}` | Actualizar |
| DELETE | `/api/products/{productId}` | Eliminar |

```json
// POST /api/products
{
  "productId": "P99999", "name": "Producto Test", "description": "Desc",
  "categoryId": "BEBI", "taxId": "101", "price": 150.00,
  "priceIsTaxed": true, "costingMethod": 0,
  "inputUnitId": "UND", "outputUnitId": "UND",
  "allowDiscount": true, "expectedProfit": 0.30,
  "inventory": true, "active": true
}

// PUT /api/products/{productId}
{ "name": "Producto Actualizado", "price": 175.00, "active": true }
```

---

### Category CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/{categoryId}` | Actualizar |
| DELETE | `/api/categories/{categoryId}` | Eliminar |

```json
// POST /api/categories
{
  "categoryId": "TEST", "name": "Categoría Test",
  "ctrlCategoryId": "TEST", "unitId": "UND",
  "inputUnitId": "UND", "outputUnitId": "UND",
  "priceIsTaxed": true, "costingMethod": 0,
  "allowDiscount": true, "active": true
}

// PUT /api/categories/{categoryId}
{ "name": "Categoría Actualizada", "active": true }
```

---

### Barcode CRUD — 🆕 GET list + POST

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/barcodes` | Lista todos los barcodes |
| POST | `/api/barcodes` | Crear barcode |
| PUT | `/api/barcodes/{barcodeId}` | Actualizar |
| DELETE | `/api/barcodes/{barcodeId}` | Eliminar |

```json
// POST /api/barcodes
{ "barcodeId": "7890000000001", "productId": "P99999", "variantName": "Variante A" }

// PUT /api/barcodes/{barcodeId}
{ "productId": "P99999", "variantName": "Variante B" }
```

---

### User CRUD — EXISTING + 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/{userId}` | Actualizar usuario |
| DELETE | `/api/users/{userId}` | Eliminar usuario |

```json
// POST /api/users
{
  "username": "new_user", "password": "securePass123",
  "name": "Juan Pérez", "roleId": 5, "staftId": 9999,
  "email": "juan@example.com", "siteId": "CO-0017",
  "terminalId": 201, "shift": 1, "staftGroupId": 1,
  "portalAccess": false
}

// PUT /api/users/{userId}
{ "name": "Juan Pérez Updated", "email": "new@example.com", "active": 1 }
```

---

### Role CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/roles` | Crear rol |
| PUT | `/api/roles/{roleId}` | Actualizar |
| DELETE | `/api/roles/{roleId}` | Eliminar |

```json
// POST /api/roles
{ "name": "SUPERVISOR_NUEVO" }

// PUT /api/roles/{roleId}
{ "name": "SUPERVISOR_RENAMED" }
```

---

### Site CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sites` | Crear sucursal |
| PUT | `/api/sites/{siteId}` | Actualizar |
| DELETE | `/api/sites/{siteId}` | Eliminar |

```json
// POST /api/sites
{
  "siteId": "TS-0001", "name": "Sucursal Test",
  "countryId": "DOM", "currencyId": "DOP",
  "phone": "809-555-0001", "address1": "Calle Test #1",
  "active": true, "status": 1
}

// PUT /api/sites/{siteId}
{ "name": "Sucursal Renamed", "phone": "809-555-0002" }
```

---

### Host CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/hosts` | Crear host |
| PUT | `/api/hosts/{hostId}` | Actualizar |
| DELETE | `/api/hosts/{hostId}` | Eliminar |

```json
// POST /api/hosts
{ "name": "POS Terminal 05", "description": "Android device", "siteId": "CO-0017", "hostTypeId": 1, "active": true }

// PUT /api/hosts/{hostId}
{ "name": "POS Terminal 05 Updated", "active": true }
```

---

### Host Type CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/host-types` | Crear tipo de host |
| PUT | `/api/host-types/{hostTypeId}` | Actualizar |
| DELETE | `/api/host-types/{hostTypeId}` | Eliminar |

```json
// POST /api/host-types
{ "name": "Tablet", "description": "Dispositivo tablet", "active": true }

// PUT /api/host-types/{hostTypeId}
{ "name": "Tablet Updated", "active": true }
```

---

### Payment CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/payments` | Crear método de pago |
| PUT | `/api/payments/{paymentId}` | Actualizar |
| DELETE | `/api/payments/{paymentId}` | Eliminar |

```json
// POST /api/payments
{
  "paymentId": "BTC", "name": "Bitcoin", "sequence": 10,
  "paymentType": 3, "image": "payment_btc.png",
  "currencyId": "BTC", "active": true
}

// PUT /api/payments/{paymentId}
{ "name": "Bitcoin Updated", "active": true }
```

---

### App Config CRUD — 🆕 POST/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/app-config` | Crear configuración |
| PUT | `/api/app-config/{id}` | Actualizar |
| DELETE | `/api/app-config/{id}` | Eliminar |

```json
// POST /api/app-config
{ "id": 2, "appVersion": "2.0.0", "description": "Nueva versión", "urlApk": "https://...", "required": true }

// PUT /api/app-config/{id}
{ "appVersion": "2.0.1", "description": "Hotfix", "required": false }
```

---

### Staft Group CRUD — 🆕 NEW

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/staft-groups` | Crear grupo de cajeros |
| PUT | `/api/staft-groups/{id}` | Actualizar |
| DELETE | `/api/staft-groups/{id}` | Eliminar |

```json
// POST /api/staft-groups
{ "staftGroupId": 5, "name": "Supervisor Nocturno", "isManager": true, "rights": "all" }

// PUT /api/staft-groups/{id}
{ "name": "Supervisor Nocturno Updated", "isManager": true }
```

---

### PTS Controller CRUD — EXISTING

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/pts-controllers` | Crear controlador PTS (auto-genera secret_key) |
| PUT | `/api/pts-controllers/{id}` | Actualizar |
| DELETE | `/api/pts-controllers/{id}` | Eliminar |

```json
// POST /api/pts-controllers
{ "ptsId": "004A00AABBCCDD112233", "siteId": "CO-0017", "name": "PTS-3 New" }

// PUT /api/pts-controllers/{id}
{ "name": "PTS-3 Renamed", "ipAddress": "192.168.1.100" }
```

---

### Terminal CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/terminals` | Crear terminal |
| PUT | `/api/terminals/{siteId}/{terminalId}` | Actualizar |
| DELETE | `/api/terminals/{siteId}/{terminalId}` | Eliminar |

```json
// POST /api/terminals
{
  "siteId": "CO-0017", "terminalId": 301, "name": "TERMINAL 03",
  "terminalType": 0, "productList": 0,
  "useCustomerDisplay": false, "openCashDrawer": false,
  "printDevice": 2, "cashFund": 0, "active": true, "productListType": 0
}

// PUT /api/terminals/{siteId}/{terminalId}
{ "name": "TERMINAL 03 UPDATED", "active": true }
```

---

### Staft (Cajeros) CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/staft` | Crear cajero |
| PUT | `/api/staft/{staftId}` | Actualizar |
| DELETE | `/api/staft/{staftId}` | Eliminar |

```json
// POST /api/staft
{
  "staftId": 9999, "name": "Test Cajero", "isManager": false,
  "staftGroupId": 1, "changePassword": false,
  "siteId": "CO-0017", "shift": 1, "active": true
}

// PUT /api/staft/{staftId}
{ "name": "Cajero Updated", "shift": 2, "active": true }
```

---

### Cart CRUD — 🆕 POST/PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cart/add` | Agregar producto al carrito |
| PUT | `/api/cart/{id}` | Actualizar item |
| DELETE | `/api/cart/{id}` | Eliminar item |

```json
// POST /api/cart/add
{
  "staftId": 633, "siteId": "CO-0017",
  "productId": "P00606", "product": "REFRESCO PEPSI",
  "price": 115.00, "quantity": 1, "priceIsTaxed": true,
  "categoryId": "BEBI", "barcodeId": "01223101",
  "category": "Bebidas", "taxId": "101", "taxRate": 0.18
}

// PUT /api/cart/{id}
{ "quantity": 2 }
```

---

### Transaction Create/Return — EXISTING

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/trans/create?cart=true&zataca=false` | Crear transacción |
| POST | `/api/trans/return/{transNumber}?zataca=false` | Crear nota de crédito (reversa) |

```json
// POST /api/trans/create — Body completo
{
  "transHead": {
    "transType": 1, "siteId": "CO-0017", "terminalId": 201,
    "storeId": "CO-0017", "shift": 1, "staftId": 633,
    "startTime": "2026-04-12T10:00:00", "endTime": "2026-04-12T10:05:00",
    "customerId": "CONTADO", "taxpayerId": "",
    "deliveryType": 0, "subtotal": 97.46, "tax": 17.54,
    "total": 115.00, "payment": 115.00, "source": 0,
    "cfTypeId": "32", "status": 1, "posVersion": "2.0.0"
  },
  "transProd": [{
    "productId": "P00606", "barcodeId": "01223101",
    "categoryId": "BEBI", "taxId": "101", "taxRate": 0.18,
    "unitId": "UND", "units": 1, "quantity": 1,
    "price": 115.00, "netPrice": 97.46,
    "subtotal": 97.46, "tax": 17.54, "total": 115.00
  }],
  "transPaym": [{
    "paymentId": "EF", "paymentType": 1, "currencyId": "DOP",
    "exchangeRate": 1, "quantity": 115.00, "total": 115.00
  }],
  "saleFromCart": false,
  "zatacaSale": false
}
```

---

### Zataca CRUD — 🆕 NEW

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/zataca/config` | Crear config Zataca |
| PUT | `/api/zataca/config/{companyId}` | Actualizar config |
| DELETE | `/api/zataca/config/{companyId}` | Eliminar config |
| POST | `/api/zataca/products` | Crear producto Zataca |
| PUT | `/api/zataca/products/{zProductId}` | Actualizar producto |
| DELETE | `/api/zataca/products/{zProductId}` | Eliminar producto |
| POST | `/api/zataca/types` | Crear tipo Zataca |
| PUT | `/api/zataca/types/{zTypeId}` | Actualizar tipo |
| DELETE | `/api/zataca/types/{zTypeId}` | Eliminar tipo |

```json
// POST /api/zataca/products
{ "zTypeId": "1", "description": "Recarga Claro", "price": 100.00, "status": true, "national": true }

// PUT /api/zataca/products/{zProductId}
{ "description": "Recarga Claro Updated", "price": 150.00 }
```

---

### Fuel Transaction — 🆕 PUT/DELETE

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/api/fuel-transactions/{id}` | Actualizar (tag, ptsId) |
| DELETE | `/api/fuel-transactions/{id}` | Eliminar |

```json
// PUT /api/fuel-transactions/{id}
{ "tag": "RFID-TAG-001", "ptsId": "004A00323233511638383435" }
```

---

### Audit — 🆕 DELETE

| Method | Path | Description |
|--------|------|-------------|
| DELETE | `/api/audit/actions/{id}` | Eliminar action log |
| DELETE | `/api/audit/errors/{id}` | Eliminar error log |

---

## Breaking Changes vs NestJS Legacy

> **No hay breaking changes en los endpoints existentes.** Todas las rutas, métodos HTTP, query params, y shapes de response son idénticos al NestJS original. Los endpoints nuevos (marcados 🆕) son adiciones puras.

### Diferencias menores a tener en cuenta

| Área | NestJS | .NET 9 | Impacto |
|------|--------|--------|---------|
| JSON casing | camelCase | camelCase | Ninguno — ASP.NET Core default es camelCase |
| JWT token | `jsonwebtoken` | Manual HMAC-SHA256 | Ninguno — tokens son byte-compatible e intercambiables |
| Auth header | `Authorization: Bearer <token>` | Igual | Ninguno |
| Error shape | `{ successful: false, error: "msg" }` | Igual | Ninguno |
| Pagination (trans) | `{ data, pagination, statistics }` | Igual | Ninguno |
| HMAC PTS | `X-Data-Signature` header | Igual + `FixedTimeEquals` | Ninguno (más seguro) |
| `GET /api/roles` | Retorna array directamente `[{...}]` | Igual | Ninguno |
| `GET /api/payments/:id` | Retorna entidad directamente `{...}` | Igual | Ninguno |

