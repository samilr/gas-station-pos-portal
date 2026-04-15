# Design System — Portal POS (referencia para Flutter)

> Documento-prompt para replicar en un POS Flutter el look & feel del portal web.
> Copiá este archivo completo como contexto cuando pidas a un agente que implemente pantallas en Flutter.

---

## Filosofía de diseño

Diseño **operacional denso pero limpio**, pensado para operadores que miran datos todo el día. Reglas núcleo:

- **Compacto**: alturas de fila 28–32 px, inputs 28 px, botones 24–28 px. Nunca componentes "inflados" tipo Material 3 default.
- **Plano, no skeuomórfico**: sombras casi nulas (solo en modales), bordes sutiles de 1 px, esquinas suaves (`rounded-sm` ≈ 2 px).
- **Tabular antes que cards**: el 70% de la info es tabla con filas hover-able, acciones en la última columna como íconos pequeños.
- **Jerarquía por tamaño y peso, no por color saturado**: base en grises, los colores se reservan para estado (verde activo, rojo peligro, naranja combustible, azul info, púrpura tienda).
- **Monoespacio/tabular-nums para cifras** para que no "salten" al actualizarse en vivo.
- **Transiciones cortas (150–300 ms)**, nunca largas. Animaciones solo cuando comunican estado (ej: bomba dispensando, spinner).

---

## Paleta (tokens)

```
Background
  app-bg           #faf9ff   Fondo general de la app
  surface          #ffffff   Cards, tablas, modales
  surface-alt      #f9fafb   Headers de tabla, section headers
  surface-muted    #f3f4f6   Chips, badges, inputs readonly
  row-hover        #f5f7ff   Hover de filas y botones ghost
  border           #f0f0f0   Borde de tablas, cards
  border-strong    #e5e7eb   Inputs, separadores

Text
  text-primary     #111827   Títulos, valores principales
  text-secondary   #374151   Labels, body
  text-muted       #9ca3af   Captions, placeholders, 2xs

Brand / rail
  rail-bg          #1a1d23   Rail izquierdo oscuro
  rail-accent      #3b82f6
  nav-active-bg    #dbeafe
  nav-active-text  #1d4ed8

Status
  success  #16a34a    verde — activo, disponible, volumen
  danger   #d83c30    rojo — bloqueado, error, delete
  warning  #ffc736    amarillo — atención
  info     #3b82f6    azul — tx count, info
  fuel     #f97316    naranja — dispensando, montos combustible
  store    #a855f7    púrpura — tienda / secundario
  offline  #808184    gris — offline, inactivo
```

---

## Tipografía

Base **13 px**. Escala custom:

```
2xs   10px / 14px    Labels uppercase, captions, chips
xs    11px / 16px    Body pequeño, celdas de tabla, botones
sm    12px / 18px    Body estándar, inputs
base  13px / 20px    Párrafos, default
md    14px / 22px    Valores destacados (KPI), headings
```

- Font family: system stack (`-apple-system, Segoe UI, Roboto`) o Inter. **No** usar fuentes decorativas.
- Labels de sección: `text-2xs uppercase tracking-wide text-text-muted`.
- Títulos de card: `text-xs font-semibold uppercase tracking-wide text-text-primary`.
- Valores KPI: `text-md font-bold` + color semántico (`text-green-600`, `text-orange-600`, etc.).

---

## Spacing / sizing

- Grid base: múltiplos de 2/4 px. Gaps típicos `gap-1` (4), `gap-2` (8), `gap-3` (12).
- Padding de card: `p-2` (8) para compactos, `p-3` (12) para contenido con respiro.
- Alturas fijas:
  - Row/table row: **32 px** (h-8)
  - Section header bar: **32 px** (h-8) — texto 2xs uppercase
  - Toolbar: **36–44 px**
  - Input/select/button: **28 px** (h-7)
  - Icon button: **24 px** (h-6 w-6)
- Iconos: **14 px** (w-3.5 h-3.5) dentro de botones, **12 px** en chips, **16 px** en estados grandes.

---

## Radios y bordes

- `rounded-sm` = **2 px** (default). Casi todo usa esto.
- `rounded-full` solo para status dots y avatares.
- Borde estándar: `1px solid #f0f0f0`. Para selección/activo: `border #3b82f6 + ring-1 ring-blue-500`.

---

## Sombras

- Tablas/cards: **ninguna**.
- Modales: `shadow-xl` → `0 20px 25px -5px rgba(0,0,0,0.1)`.
- Tooltip/popover: `0 4px 6px -1px rgba(0,0,0,0.1)`.
- Estado especial (dispensando): glow animado naranja pulsante.

---

## Componentes canónicos

### 1. Card / Shell

```
┌──────────────────────────────────────────┐
│ [icon 14px] TITULO UPPERCASE 2xs  [right]│  ← header: h-8, bg surface-alt, border-bottom
├──────────────────────────────────────────┤
│  contenido (p-2 o p-3)                   │
└──────────────────────────────────────────┘
```

- `bg-white rounded-sm border border-table-border`
- Header bar: `h-8 bg-table-header border-b border-table-border flex items-center gap-2 px-3`
- Icono de color según contexto (azul info, naranja combustible, verde success, púrpura pie).

### 2. Tabla

```
┌ Site ─── Bomba ── Nombre ─────── Estado ── Acciones ┐   ← h-8, bg surface-alt, uppercase 2xs
│ CO-0017   #1      Bomba Isla N.  ● Activa  👁 ✏ 🗑 │   ← h-8, hover row-hover
└─────────────────────────────────────────────────────┘
```

- Header: `h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border`.
- Celdas: `px-2 text-sm`, `whitespace-nowrap` para IDs / estados.
- Acciones: íconos Edit (azul), Trash (rojo), Eye (gris). Alineadas a la derecha con `gap-1`.
- Paginación propia abajo del tbody (no dentro de scroll).

### 3. KPI card

```
[icon] TÍTULO 2xs
$ 625,840.50        ← text-md font-bold + color semántico
subtítulo 2xs muted
```

Container: `bg-white rounded-sm p-2 border hover:bg-row-hover cursor-pointer`.

### 4. Toolbar

Layout horizontal: buscador a la izquierda + chips de métricas en el medio + botones a la derecha (`Filtros`, `Actualizar`, `Nuevo` primary).

### 5. Botones (`CompactButton`)

Variantes:

- `primary` — `bg-blue-600 text-white`
- `ghost` — transparente, hover `bg-gray-100`
- `danger` — `bg-red-600`
- `icon` — solo icono 14 px

Estructura: `h-7 px-2 text-xs font-medium rounded-sm flex items-center gap-1`.

En loading: reemplazar label por `<Spinner 12px /> Guardando...`. No bloquear el layout.

### 6. Inputs / selects

```
LABEL 2xs uppercase muted
[_________________]   ← h-7, border border-gray-300, rounded-sm, focus:ring-1 ring-blue-500
```

Disabled/readonly: `bg-gray-100 cursor-not-allowed`.

### 7. Status dot

`●` 6 px, color semántico + label a su derecha en `text-xs`. Se usa en tablas, monitor de bombas, listas de dispositivos. Verde/rojo/naranja/azul/gris.

### 8. Modales

- Overlay: `fixed inset-0 bg-black/50 flex center p-4`.
- Container: `bg-white rounded-sm shadow-xl max-w-lg max-h-[92vh] flex-col`.
- Header bar: `h-11 bg-gray-50 border-b px-4` con icono cuadrado color (create=blue, edit=green), título `text-sm font-semibold`, subtítulo `text-2xs text-muted`, botón close `X` 16 px.
- Body: `flex-1 overflow-y-auto p-4 space-y-3`. Secciones separadas con `<h4>` uppercase 2xs + border-bottom.
- Footer: `h-11 bg-gray-50 border-t px-4 flex justify-end gap-2`. Ghost cancelar + Primary guardar.
- Confirm delete: mismo container pero `max-w-sm`, icono circular rojo (`bg-red-100` + `AlertCircle`), texto centrado.

### 9. Chips / badges

Píldora `h-5 px-2 text-2xs rounded-sm border`. En toolbar: `Total 42 · Activos 18`. Colores tintados por estado (`bg-green-50 border-green-200 text-green-700`).

### 10. Charts (Recharts → `fl_chart` en Flutter)

- **Combo bar+line** para tendencias (barras = monto principal, línea = count secundario con eje derecho).
- **Bar vertical** para rankings por bomba / hora.
- **Pie donut** para categorías (combustible, tipos de comprobante), centro libre, labels `%` externos, leyenda abajo con dots 6 px.
- Tooltip blanco borde gris, `padding 8`, `fontSize 12`, `shadow sm`.
- Grid `strokeDasharray 3 3` color `#f0f0f0`.
- Ejes: `tick fontSize 11`, sin línea, sin dominio visible.

### 11. Estados de dispensadora (patrón de animación a replicar)

Caso más "vivo" de la app — buen ejemplo de cuándo **SÍ** animar:

- **Disponible** (verde): card blanca, borde sutil, dot verde.
- **Dispensando** (naranja): fondo gradiente `from-orange-50 via-amber-50 to-orange-100`, borde `orange-300`, **glow pulsante** (`box-shadow` que oscila cada 2.2 s), barra superior de 3 px con gradiente animado moviéndose (fuel flow). Valores con `tabular-nums`.
- **Bloqueada** (roja), **Fin Trans.** (azul), **Offline** (gris atenuado 75% opacity).

Las animaciones solo corren en el estado "Dispensando" — en reposo la UI es silenciosa.

---

## Layout general

- **App shell**: rail oscuro izquierdo (44 px colapsado / 200 px expandido) + NavPanel secundario (≈ 200 px) con sub-items filtrados por permiso + contenido.
- Contenido con `space-y-2` (8 px) entre bloques. Nunca scroll horizontal en desktop: todo encaja o se trunca con ellipsis.
- Mobile: rail se oculta, navegación por drawer; las grids cambian a 1–2 columnas.

---

## Mapping a Flutter

- `Container` + `BoxDecoration(color, borderRadius: 2, border)` en vez de `Card` (que trae elevación).
- **Gap** entre items: `Padding` / `SizedBox` explícito o `Wrap(spacing: 8)`. Evitá `ListTile` (muy alto).
- Tipografía: definí un `TextTheme` con los tamaños 10/11/12/13/14 anteriores. Nada de `headline*` de Material.
- Tabla: `DataTable` es pesada — mejor `Table` custom o `ListView` con `Row` por registro, `SizedBox(height: 32)`.
- Botones: `InkWell` + `Container` custom. `ElevatedButton` trae padding/elevación que rompen la densidad.
- Iconos: paquete `lucide_icons_flutter` (1:1 con los íconos del portal).
- Charts: `fl_chart` — replicá exactamente los paddings, colores y tooltip.
- Status dot: `Container` 6×6 con `shape: circle` + color.
- Modales: `showGeneralDialog` con `barrierColor: Colors.black.withOpacity(0.5)` y transición de 150 ms, **no** `showDialog` default (trae margen grande).
- Animación "dispensing glow": `AnimationController` 2200 ms en loop + `BoxShadow` interpolado; para la barra de flujo, `ShaderMask` con `LinearGradient` desplazándose.

### Ejemplo de theme base en Flutter

```dart
final appTheme = ThemeData(
  useMaterial3: false,
  scaffoldBackgroundColor: const Color(0xFFFAF9FF),
  colorScheme: const ColorScheme.light(
    primary: Color(0xFF3B82F6),
    surface: Colors.white,
    error: Color(0xFFD83C30),
  ),
  textTheme: const TextTheme(
    labelSmall: TextStyle(fontSize: 10, height: 14 / 10, letterSpacing: 0.5),
    bodySmall:  TextStyle(fontSize: 11, height: 16 / 11),
    bodyMedium: TextStyle(fontSize: 12, height: 18 / 12),
    bodyLarge:  TextStyle(fontSize: 13, height: 20 / 13),
    titleSmall: TextStyle(fontSize: 14, height: 22 / 14, fontWeight: FontWeight.w600),
  ),
  dividerColor: const Color(0xFFF0F0F0),
);
```

---

## Do / Don't

**Do**

- Tabla antes que card-list.
- Estados visibles: loading (spinner 16 px o skeleton gris), error (banner rojo `bg-red-50 border-red-200 text-red-700`), empty (icono 20 px + texto muted).
- Títulos de sección uppercase 2xs tracking-wide.
- Confirmar acciones destructivas con modal pequeño.
- Números financieros siempre con `Intl.NumberFormat` (es-DO, DOP) y `tabular-nums`.

**Don't**

- No usar Material 3 defaults ni `FilledButton` / `Card` elevado.
- No sombras en tablas / cards operativos.
- No padding > 16 px en casi nada.
- No animaciones de entrada por sección — solo `cardRise` 250 ms cuando aparecen dispensadoras.
- No emojis en la UI.
- No íconos de diferente set (solo Lucide).

---

## Cómo usar este documento

1. Incluilo completo como contexto fijo antes de cualquier pedido al agente.
2. Después hacé pedidos concretos, por ejemplo:

> "Con el design system de `DESIGN_SYSTEM.md`, implementá en Flutter una pantalla de 'Monitor de dispensadoras' idéntica al portal: grid responsive de cards de bomba, estado *dispensing* con glow naranja y barra animada de flujo, tooltip de valores con tabular-nums. Usá `fl_chart` para el mini sparkline."

Eso mantiene el POS Flutter y el portal web visualmente gemelos.
