const fs = require('fs');
const path = require('path');

// Función para crear un icono SVG simple para ISLADOM POS
function createIconSVG(size) {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo redondeado -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" ry="${size * 0.2}" fill="url(#grad1)"/>
  
  <!-- Icono de gasolinera -->
  <g transform="translate(${size * 0.2}, ${size * 0.15})">
    <!-- Base de la gasolinera -->
    <rect x="${size * 0.1}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.3}" fill="white" rx="${size * 0.02}"/>
    
    <!-- Techo -->
    <polygon points="${size * 0.1},${size * 0.4} ${size * 0.3},${size * 0.2} ${size * 0.5},${size * 0.4}" fill="white"/>
    
    <!-- Poste -->
    <rect x="${size * 0.28}" y="${size * 0.1}" width="${size * 0.04}" height="${size * 0.3}" fill="white"/>
    
    <!-- Bomba de gas -->
    <rect x="${size * 0.15}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.2}" fill="white" rx="${size * 0.01}"/>
    <rect x="${size * 0.35}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.2}" fill="white" rx="${size * 0.01}"/>
    
    <!-- Mangueras -->
    <line x1="${size * 0.2}" y1="${size * 0.5}" x2="${size * 0.2}" y2="${size * 0.6}" stroke="white" stroke-width="${size * 0.02}"/>
    <line x1="${size * 0.4}" y1="${size * 0.5}" x2="${size * 0.4}" y2="${size * 0.6}" stroke="white" stroke-width="${size * 0.02}"/>
  </g>
  
  <!-- Texto ISLADOM -->
  <text x="${size * 0.5}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold" text-anchor="middle" fill="white">ISLADOM</text>
</svg>`;
}

// Tamaños de iconos requeridos
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Crear directorio de iconos si no existe
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generar iconos SVG
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Generado: ${filename}`);
});

// Crear un archivo README con instrucciones para convertir a PNG
const readmeContent = `
# Iconos PWA para ISLADOM POS

Este directorio contiene los iconos SVG generados para la PWA.

## Conversión a PNG

Para convertir los iconos SVG a PNG, puedes usar:

### Opción 1: Usando ImageMagick
\`\`\`bash
# Instalar ImageMagick primero
# Luego ejecutar:
for size in 16 32 72 96 128 144 152 192 384 512; do
  magick icon-${size}x${size}.svg icon-${size}x${size}.png
done
\`\`\`

### Opción 2: Usando Inkscape
\`\`\`bash
for size in 16 32 72 96 128 144 152 192 384 512; do
  inkscape --export-type=png --export-filename=icon-${size}x${size}.png --export-width=${size} --export-height=${size} icon-${size}x${size}.svg
done
\`\`\`

### Opción 3: Usando herramientas online
- https://convertio.co/svg-png/
- https://cloudconvert.com/svg-to-png

## Tamaños requeridos

- 16x16: Favicon
- 32x32: Favicon
- 72x72: Android
- 96x96: Android
- 128x128: Android
- 144x144: Windows
- 152x152: iOS
- 192x192: Android (mínimo)
- 384x384: Android
- 512x512: Android (mínimo)

## Notas

- Los iconos deben tener esquinas redondeadas para mejor apariencia
- El color de fondo debe ser sólido
- Evitar texto pequeño en iconos pequeños
- Probar en diferentes dispositivos y navegadores
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent);
console.log('✅ README.md creado con instrucciones');

console.log('\n🎉 Iconos SVG generados exitosamente!');
console.log('📝 Sigue las instrucciones en README.md para convertir a PNG');
