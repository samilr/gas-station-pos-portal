// Formatear números como moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2
  }).format(amount);
};

// Formatear números grandes
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Formatear fecha relativa. La API entrega fechas en hora local sin offset,
// por lo que `new Date(string)` las interpreta directamente como hora local.
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const targetDate = date instanceof Date ? date : new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Hace un momento';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  }
};

// Obtener color basado en el estado
export const getStatusColor = (status: string | number): string => {
  if (status === 'active' || status === 1 || status === 1) {
    return 'text-green-600 bg-green-100';
  } else if (status === 'warning' || status === 2) {
    return 'text-yellow-600 bg-yellow-100';
  } else {
    return 'text-red-600 bg-red-100';
  }
};

// Obtener icono basado en el tipo de acción
export const getActionIcon = (action: string): string => {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('login') || actionLower.includes('logout')) {
    return '🔐';
  } else if (actionLower.includes('create') || actionLower.includes('crear')) {
    return '➕';
  } else if (actionLower.includes('update') || actionLower.includes('editar')) {
    return '✏️';
  } else if (actionLower.includes('delete') || actionLower.includes('eliminar')) {
    return '🗑️';
  } else if (actionLower.includes('export') || actionLower.includes('exportar')) {
    return '📤';
  } else if (actionLower.includes('Consulta') || actionLower.includes('Consulta')) {
    return '🔍';
  } else if (actionLower.includes('import') || actionLower.includes('importar')) {
    return '📥';
  } else {
    return '📋';
  }
};

// Calcular porcentaje de cambio
export const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
  if (previous === 0) return { value: 0, isPositive: true };
  
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    isPositive: change >= 0
  };
};
