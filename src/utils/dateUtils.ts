/**
 * Utilidades para el manejo de fechas UTC a hora local de Santo Domingo
 */

/**
 * Convierte una fecha UTC a hora local de Santo Domingo (UTC-4)
 * @param dateString - Fecha en formato string o Date
 * @returns Objeto con fecha y hora formateadas
 */
export const formatDateToSantoDomingo = (dateString: string | Date): { date: string; time: string } => {
  // Crear fecha UTC y convertir a hora local de Santo Domingo (UTC-4)
  const utcDate = new Date(dateString);
  const santoDomingoDate = new Date(utcDate.getTime() - (4 * 60 * 60 * 1000)); // Restar 4 horas

  const dateFormatted = santoDomingoDate.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const timeFormatted = santoDomingoDate.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // Formato 12 horas con AM/PM
  });

  return { date: dateFormatted, time: timeFormatted };
};

export const formatDateTimeToSantoDomingo = (dateString: string | Date): Date => {
  // Crear fecha UTC y convertir a hora local de Santo Domingo (UTC-4)
  const utcDate = new Date(dateString);
  const santoDomingoDate = new Date(utcDate.getTime() - (4 * 60 * 60 * 1000)); // Restar 4 horas
  return santoDomingoDate;
};

/**
 * Convierte una fecha UTC a hora local de Santo Domingo y retorna solo la fecha
 * @param dateString - Fecha en formato string o Date
 * @returns Fecha formateada
 */
export const formatDateOnly = (dateString: string | Date): string => {
  const utcDate = new Date(dateString);
  const santoDomingoDate = new Date(utcDate.getTime() - (4 * 60 * 60 * 1000));
  
  return santoDomingoDate.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Convierte una fecha UTC a hora local de Santo Domingo y retorna solo la hora
 * @param dateString - Fecha en formato string o Date
 * @returns Hora formateada
 */
export const formatTimeOnly = (dateString: string | Date): string => {
  const utcDate = new Date(dateString);
  const santoDomingoDate = new Date(utcDate.getTime() - (4 * 60 * 60 * 1000));

  return santoDomingoDate.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // Formato 12 horas con AM/PM
  });
};

/**
 * Convierte una fecha UTC a hora local de Santo Domingo con formato completo
 * @param dateString - Fecha en formato string o Date
 * @returns Fecha y hora completa formateada
 */
export const formatFullDateTime = (dateString: string | Date): string => {
  const utcDate = new Date(dateString);
  const santoDomingoDate = new Date(utcDate.getTime() - (4 * 60 * 60 * 1000));
  
  return santoDomingoDate.toLocaleString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
