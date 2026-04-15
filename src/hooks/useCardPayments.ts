import { useCallback, useEffect, useState } from 'react';
import cardPaymentService, { CardPayment, ListFilters } from '../services/cardPaymentService';

export function useCardPayments(initialFilters: ListFilters = { page: 1, limit: 20 }) {
  const [payments, setPayments] = useState<CardPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListFilters>(initialFilters);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages?: number } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cardPaymentService.list(filters);
      if (res.successful) {
        setPayments(res.data);
        setPagination(res.pagination || null);
      } else setError(res.error || 'Error al cargar pagos con tarjeta');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { refresh(); }, [refresh]);

  return { payments, loading, error, refresh, filters, setFilters, pagination };
}

export function useOrphanedCardPayments(siteId?: string) {
  const [orphans, setOrphans] = useState<CardPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await cardPaymentService.getOrphaned(siteId);
    if (res.successful) setOrphans(res.data);
    else setError(res.error || 'Error al cargar huérfanos');
    setLoading(false);
  }, [siteId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { orphans, loading, error, refresh };
}
