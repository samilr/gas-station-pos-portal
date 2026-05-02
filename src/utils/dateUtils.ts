/**
 * Utilidades para el formateo de fechas que ya vienen en hora local desde el backend.
 * No se aplica conversión UTC — los strings se interpretan como hora local del navegador.
 */

export const formatDateToSantoDomingo = (dateString: string | Date): { date: string; time: string } => {
  const date = new Date(dateString);

  const dateFormatted = date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const timeFormatted = date.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { date: dateFormatted, time: timeFormatted };
};

export const formatDateTimeToSantoDomingo = (dateString: string | Date): Date => {
  return new Date(dateString);
};

/**
 * Retorna la fecha en formato dd-MM-yyyy interpretando la entrada en hora local.
 */
export const formatDateOnly = (dateString: string | Date): string => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Formatea una fecha en formato dd/MM/yyyy (forzado, sin depender de locale).
 */
export const formatDateDMY = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Retorna solo la hora en formato local (12h con AM/PM).
 */
export const formatTimeOnly = (dateString: string | Date): string => {
  const date = new Date(dateString);

  return date.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formatea fecha y hora completa en formato local.
 */
export const formatFullDateTime = (dateString: string | Date): string => {
  const date = new Date(dateString);

  return date.toLocaleString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Devuelve YYYY-MM-DD en hora local (no UTC). Útil para inputs `<input type="date">`,
 * filtros de hoy, claves de agrupación por día, etc.
 */
export const toLocalIsoDate = (date?: Date): string => {
  const d = date ?? new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Devuelve YYYY-MM-DDTHH:MM en hora local. Útil para inputs `<input type="datetime-local">`.
 */
export const toLocalIsoDateTime = (date?: Date): string => {
  const d = date ?? new Date();
  const datePart = toLocalIsoDate(d);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${datePart}T${hh}:${mm}`;
};
