import React from 'react';

// ============================================================
// Panel de grado de combustible estilo Shell/Gilbarco
// Muestra marca Shell + nombre del combustible + mini-LCD con precio
// ============================================================

type FuelGradeVariant = {
  bg: string;
  splitY: number | null;
  splitBg: string;
  brand: string;
  name: string;
  nameText: string;
  categoryText: string;
  categoryColor: string;
  swooshColor: string;
  swooshOpacity: number;
};

const getVariant = (productName: string | null): FuelGradeVariant => {
  const n = (productName ?? '').toLowerCase();
  if (n.includes('premium') || n.includes('v-power') || n.includes('super')) {
    return {
      bg: '#e40728', splitY: null, splitBg: '#000',
      brand: '#fedd00', name: '#fff', nameText: 'V-Power',
      categoryText: 'Gasolina', categoryColor: '#fff',
      swooshColor: '#fff', swooshOpacity: 0.25,
    };
  }
  if (n.includes('diesel') || n.includes('gasoil')) {
    return {
      bg: '#fedd00', splitY: 52, splitBg: '#0a0a0a',
      brand: '#e40728', name: '#0a0a0a', nameText: 'Diesel',
      categoryText: 'Diesel', categoryColor: '#fff',
      swooshColor: '#fff', swooshOpacity: 0.45,
    };
  }
  if (n.includes('gas') || n.includes('glp') || n.includes('lpg')) {
    return {
      bg: '#0060a0', splitY: null, splitBg: '#000',
      brand: '#fedd00', name: '#fff', nameText: 'GLP',
      categoryText: 'Gas', categoryColor: '#fff',
      swooshColor: '#fff', swooshOpacity: 0.25,
    };
  }
  return {
    bg: '#fedd00', splitY: null, splitBg: '#000',
    brand: '#e40728', name: '#00a151',
    nameText: productName?.replace(/gasolina/i, '').trim() || 'Regular',
    categoryText: 'Gasolina', categoryColor: '#0a0a0a',
    swooshColor: '#fff', swooshOpacity: 0.6,
  };
};

export const FuelGradePanel: React.FC<{
  productName: string | null;
  price: number;
  nozzleNumber: number;
  dispensing?: boolean;
}> = ({ productName, price, nozzleNumber, dispensing = false }) => {
  const variant = getVariant(productName);
  const nameFontSize = variant.nameText.length > 8 ? 6 : variant.nameText.length > 6 ? 7 : 8.5;

  return (
    <svg viewBox="0 0 40 80" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      {/* Fondo del panel */}
      <rect width="40" height="80" fill={variant.bg} />
      {variant.splitY != null && (
        <rect x="0" y={variant.splitY} width="40" height={80 - variant.splitY} fill={variant.splitBg} />
      )}

      {/* Marco LCD */}
      <rect x="8" y="4" width="24" height="10" rx="0.8" fill="#c9cdd1" stroke="#3b3b3b" strokeWidth="0.5" />
      <rect x="9" y="5" width="22" height="8" rx="0.3" fill="#9aae8f" />
      <text
        x="29" y="11.5" textAnchor="end"
        fontSize="5.8" fontFamily="ui-monospace, monospace" fontWeight="bold"
        fill="#0d0d0d" letterSpacing="0.2"
      >
        {price.toFixed(1)}
      </text>

      {/* Captions del LCD */}
      <text x="9.5" y="17.2" fontSize="1.6" fontFamily="sans-serif" fill="#2b2b2b" fontWeight="bold">PRECIOS POR GALON</text>
      <text x="9.5" y="19" fontSize="1.5" fontFamily="sans-serif" fill="#2b2b2b">IMPUESTOS INCLUIDOS</text>

      {/* Badge numérico de la manguera */}
      <circle cx="35" cy="25" r="2.8" fill="#fff" stroke={variant.brand} strokeWidth="0.6" />
      <text x="35" y="26.5" textAnchor="middle" fontSize="3.5" fontFamily="sans-serif" fontWeight="900" fill={variant.brand}>
        {nozzleNumber}
      </text>

      {/* Brand Shell */}
      <text
        x="20" y="31" textAnchor="middle"
        fontSize="6" fontFamily="ui-sans-serif, system-ui" fontWeight="900"
        fill={variant.brand} letterSpacing="-0.3"
      >
        Shell
      </text>

      {/* Nombre del grade */}
      <text
        x="20" y="44" textAnchor="middle"
        fontSize={nameFontSize} fontFamily="ui-sans-serif, system-ui" fontWeight="900"
        fill={variant.name} letterSpacing="-0.4"
      >
        {variant.nameText}
      </text>

      {/* Swoosh decorativo */}
      <path
        d={`M -5 ${variant.splitY != null ? variant.splitY - 4 : 50} Q 20 ${variant.splitY != null ? variant.splitY - 10 : 45} 45 ${variant.splitY != null ? variant.splitY - 2 : 52} L 45 ${variant.splitY != null ? variant.splitY + 1 : 55} Q 20 ${variant.splitY != null ? variant.splitY - 6 : 48} -5 ${variant.splitY != null ? variant.splitY - 1 : 54} Z`}
        fill={variant.swooshColor}
        opacity={variant.swooshOpacity}
      />

      {/* Categoría */}
      <text
        x="20" y={variant.splitY != null ? variant.splitY + 12 : 65}
        textAnchor="middle" fontSize="4" fontFamily="ui-sans-serif, system-ui"
        fontStyle="italic" fontWeight="500" fill={variant.categoryColor}
      >
        {variant.categoryText}
      </text>

      <line x1="4" y1="74" x2="36" y2="74" stroke={variant.categoryColor} strokeWidth="0.3" opacity="0.5" />
      <rect x="13" y="76" width="14" height="2.5" rx="1" fill="#0a0a0a" opacity="0.9" />

      {/* === Dispensing (profesional: solo un indicador LED estable en el badge) === */}
      {dispensing && (
        <circle cx="32.2" cy="22.2" r="0.9" fill="#10b981">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
};

// ============================================================
// Ilustración SVG de una dispensadora Shell
// LCD principal puede mostrar datos en vivo de volumen y monto
// ============================================================

export const DispenserIllustration: React.FC<{
  active?: boolean;
  nozzleCount?: number;
  highlighted?: boolean;
  volume?: number | null;
  amount?: number | null;
  dispensing?: boolean;
  activeNozzle?: number | null;
  nozzleColors?: string[];
}> = ({
  highlighted = false,
  volume = null,
  amount = null,
  dispensing = false,
}) => {
  const frameStroke = dispensing ? '#f97316' : (highlighted ? '#3b82f6' : '#94a3b8');

  // Valores a mostrar en el LCD
  const volumeDisplay = volume != null ? volume.toFixed(2) : '00.00';
  const amountDisplay = amount != null ? amount.toFixed(2) : '0000.00';

  return (
    <svg viewBox="0 0 48 50" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      {/* HOUSING del LCD con marco redondeado */}
      <path
        d="M 2 10 Q 2 1.5 8 1.5 L 40 1.5 Q 46 1.5 46 10 L 46 23 L 2 23 Z"
        fill="#eef2f6"
        stroke={frameStroke}
        strokeWidth="0.6"
      />
      {/* Swoosh decorativo */}
      <path d="M 4 9 Q 24 5 44 9" stroke="#cbd5e1" strokeWidth="0.45" fill="none" opacity="0.7" />
      <text x="24" y="5" textAnchor="middle" fontSize="2" fontFamily="sans-serif" fontWeight="bold" fill="#64748b" letterSpacing="0.5">SHELL</text>

      {/* LCD — marco */}
      <rect x="5" y="7.5" width="38" height="13" rx="0.6" fill="#c9d0c3" stroke="#475569" strokeWidth="0.55" />
      <rect x="5.7" y="8.2" width="36.6" height="11.6" rx="0.3" fill={dispensing ? '#a8c49a' : '#bed4b2'} />

      {/* Fila 1: VOLUMEN */}
      <text x="6.5" y="13.8" fontSize="2.4" fontFamily="sans-serif" fill="#475569" fontWeight="bold">VOL</text>
      <text
        x="41.5" y="14.8" textAnchor="end"
        fontSize="6.6" fontFamily="ui-monospace, monospace" fontWeight="bold"
        fill="#0a0a0a" letterSpacing="0.4"
      >
        {volumeDisplay}
      </text>

      {/* Fila 2: MONTO */}
      <text x="6.5" y="19.5" fontSize="2.4" fontFamily="sans-serif" fill="#475569" fontWeight="bold">$</text>
      <text
        x="41.5" y="19.8" textAnchor="end"
        fontSize="4.8" fontFamily="ui-monospace, monospace" fontWeight="bold"
        fill={dispensing ? '#b45309' : '#0a0a0a'} letterSpacing="0.3"
      >
        {amountDisplay}
      </text>

      {/* Botón circular */}
      <circle cx="24" cy="27" r="2.4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.55" />
      <circle cx="24" cy="27" r="1" fill={dispensing ? '#22c55e' : '#cbd5e1'}>
        {dispensing && (
          <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
        )}
      </circle>

      {/* KEYPAD */}
      <rect x="5" y="31" width="38" height="18" rx="0.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.55" />
      {/* Slot de tarjeta arriba */}
      <rect x="7" y="32" width="34" height="1.6" rx="0.3" fill="#64748b" />
      <rect x="7.4" y="32.3" width="33.2" height="1" rx="0.2" fill="#1f2937" />
      {/* Grid 4x3 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <rect
            key={`key-${i}`}
            x={7 + col * 8.5}
            y={34.5 + row * 4.5}
            width="7"
            height="3.5"
            rx="0.3"
            fill="#475569"
            stroke="#334155"
            strokeWidth="0.2"
          />
        );
      })}
    </svg>
  );
};
