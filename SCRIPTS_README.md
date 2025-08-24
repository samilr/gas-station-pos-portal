# 🚀 Scripts de NPM para Desarrollo y Producción

Este proyecto ahora incluye scripts específicos para ejecutar la aplicación en diferentes ambientes.

## 📋 Scripts Disponibles

### 🟢 **DESARROLLO**
```bash
# Ejecutar en modo desarrollo (localhost:3000/api)
npm run dev

# Build para desarrollo
npm run build:dev

# Preview del build de desarrollo
npm run preview:dev
```

### 🔴 **PRODUCCIÓN**
```bash
# Ejecutar en modo producción (isladominicana-pos-mobile-api.azurewebsites.net/api)
npm run prod

# Build para producción
npm run build:prod

# Preview del build de producción
npm run preview:prod
```

### 🔧 **GENERALES**
```bash
# Build por defecto (usa el ambiente actual)
npm run build

# Preview por defecto
npm run preview

# Linting del código
npm run lint
```

## 🛠️ Instalación de Dependencias

Antes de usar los scripts, instala `cross-env`:

```bash
npm install
```

## 📁 Archivos de Configuración

### **Desarrollo** (`.env`)
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Contenido:
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_MOCK_DATA=true
VITE_LOG_LEVEL=debug
```

### **Producción** (`.env.production`)
```bash
# Copiar archivo de ejemplo
cp env.production.example .env.production

# Contenido:
NODE_ENV=production
VITE_API_BASE_URL=https://isladominicana-pos-mobile-api.azurewebsites.net/api
VITE_ENABLE_MOCK_DATA=false
VITE_LOG_LEVEL=error
```

## 🎯 Flujos de Trabajo

### **Desarrollo Diario**
```bash
# 1. Iniciar en desarrollo
npm run dev

# 2. Hacer cambios en el código

# 3. Build de desarrollo para testing
npm run build:dev

# 4. Preview del build
npm run preview:dev
```

### **Despliegue a Producción**
```bash
# 1. Build de producción
npm run build:prod

# 2. Preview del build de producción
npm run preview:prod

# 3. Desplegar la carpeta dist/ a tu servidor
```

### **Testing de Producción Localmente**
```bash
# Ejecutar en modo producción (pero localmente)
npm run prod
```

## 🔍 Verificar el Ambiente

### **En la consola del navegador deberías ver:**

#### **Desarrollo** (`npm run dev`)
```
Ambiente: development
API URL: http://localhost:3000/api
Mock Data: habilitado
Log Level: debug
```

#### **Producción** (`npm run prod`)
```
Ambiente: production
API URL: https://isladominicana-pos-mobile-api.azurewebsites.net/api
Mock Data: deshabilitado
Log Level: error
```

## 🚨 Solución de Problemas

### **Error: "cross-env no se reconoce"**
```bash
# Reinstalar dependencias
npm install

# O instalar cross-env manualmente
npm install --save-dev cross-env
```

### **No cambia el ambiente**
```bash
# Verificar que el archivo .env existe
ls -la | grep .env

# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### **Verificar configuración actual**
```bash
# Agregar temporalmente en src/config/environment.ts:
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Ambiente actual:', ENV_CONFIG.NODE_ENV);
console.log('URL de la API:', getApiBaseUrl());
```

## 📱 Comandos Rápidos

```bash
# Desarrollo rápido
npm run dev

# Producción rápida
npm run prod

# Build rápido para producción
npm run build:prod

# Preview rápido de producción
npm run preview:prod
```

## 🎉 Beneficios

1. **Separación clara** entre desarrollo y producción
2. **Comandos simples** y fáciles de recordar
3. **Configuración automática** según el ambiente
4. **Testing local** de configuración de producción
5. **Builds específicos** para cada ambiente
6. **Compatibilidad** entre Windows, Mac y Linux

¡Ahora puedes usar `npm run dev` para desarrollo y `npm run prod` para producción!
