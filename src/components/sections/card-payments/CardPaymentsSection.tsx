import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Eye, CreditCard, AlertTriangle, Lock, Ban, Search } from 'lucide-react';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton, Pagination } from '../../ui';
import Toolbar from '../../ui/Toolbar';
import { useCardPayments, useOrphanedCardPayments } from '../../../hooks/useCardPayments';
import { useSelectedSiteId } from '../../../hooks/useSelectedSite';
import { CardPayment } from '../../../services/cardPaymentService';
import CardPaymentDetailModal from './CardPaymentDetailModal';
import VoidCardPaymentDialog from './VoidCardPaymentDialog';
import BatchCloseDialog from './BatchCloseDialog';
import LastApprovedDialog from './LastApprovedDialog';

type Tab = 'all' | 'orphaned';

const statusColor = (status: string): string => {
  switch (status) {
    case 'Approved': return 'bg-green-100 text-green-700';
    case 'LinkedToTrans': return 'bg-blue-100 text-blue-700';
    case 'Pending': return 'bg-yellow-100 text-yellow-700';
    case 'Voided': return 'bg-gray-100 text-gray-700';
    case 'Refunded': return 'bg-purple-100 text-purple-700';
    case 'Declined': case 'Failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const CardPaymentsSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const globalSiteId = useSelectedSiteId();
  const [tab, setTab] = useState<Tab>('all');

  const [siteId, setSiteId] = useState<string>(globalSiteId ?? '');
  const [terminalId, setTerminalId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const cardPaymentsHook = useCardPayments({ page, limit: pageSize });
  const orphansHook = useOrphanedCardPayments(siteId || undefined);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [voidOpen, setVoidOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<CardPayment | null>(null);

  const [batchCloseOpen, setBatchCloseOpen] = useState(false);
  const [lastApprovedOpen, setLastApprovedOpen] = useState(false);

  useEffect(() => {
    setSubtitle('Pagos con tarjeta CardNet');
    return () => setSubtitle('');
  }, [setSubtitle]);

  useEffect(() => {
    cardPaymentsHook.setFilters({
      siteId: siteId || undefined,
      terminalId: terminalId ? parseInt(terminalId, 10) : undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, terminalId, from, to, page, pageSize]);

  const data: CardPayment[] = tab === 'all' ? cardPaymentsHook.payments : orphansHook.orphans;
  const loading = tab === 'all' ? cardPaymentsHook.loading : orphansHook.loading;
  const error = tab === 'all' ? cardPaymentsHook.error : orphansHook.error;

  const totals = useMemo(() => ({
    all: cardPaymentsHook.pagination?.total ?? cardPaymentsHook.payments.length,
    orphaned: orphansHook.orphans.length,
  }), [cardPaymentsHook.pagination, cardPaymentsHook.payments.length, orphansHook.orphans.length]);

  const openDetail = (id: string) => { setDetailId(id); setDetailOpen(true); };
  const openVoid = (p: CardPayment) => { setVoidTarget(p); setVoidOpen(true); };

  const refreshAll = () => {
    cardPaymentsHook.refresh();
    orphansHook.refresh();
  };

  const effectiveSiteId = siteId || globalSiteId || '';
  const numericTerminalId = terminalId ? parseInt(terminalId, 10) : null;

  const amountDop = (cents: number) => (cents / 100).toLocaleString('es-DO', { minimumFractionDigits: 2 });

  const totalPages = tab === 'all'
    ? (cardPaymentsHook.pagination?.totalPages ?? Math.max(1, Math.ceil((cardPaymentsHook.pagination?.total ?? cardPaymentsHook.payments.length) / pageSize)))
    : 1;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button onClick={() => setTab('all')}
          className={`px-3 h-8 text-xs font-medium border-b-2 ${tab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-text-secondary'}`}>
          Todos <span className="ml-1 text-2xs text-text-muted">({totals.all})</span>
        </button>
        <button onClick={() => setTab('orphaned')}
          className={`px-3 h-8 text-xs font-medium border-b-2 flex items-center gap-1 ${tab === 'orphaned' ? 'border-orange-600 text-orange-600' : 'border-transparent text-text-secondary'}`}>
          <AlertTriangle className="w-3 h-3" /> Huérfanos <span className="ml-1 text-2xs text-text-muted">({totals.orphaned})</span>
        </button>
      </div>

      <Toolbar
        chips={[
          { label: 'Pagos', value: totals.all, color: 'blue' },
          { label: 'Huérfanos', value: totals.orphaned, color: 'orange' },
        ]}
      >
        <input type="text" value={siteId} onChange={(e) => { setSiteId(e.target.value); setPage(1); }}
          placeholder="Site ID" className="h-7 w-24 px-2 text-xs border border-gray-300 rounded-sm" />
        <input type="number" value={terminalId} onChange={(e) => { setTerminalId(e.target.value); setPage(1); }}
          placeholder="Terminal" className="h-7 w-20 px-2 text-xs border border-gray-300 rounded-sm" />
        {tab === 'all' && (
          <>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
              className="h-7 px-2 text-xs border border-gray-300 rounded-sm" />
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
              className="h-7 px-2 text-xs border border-gray-300 rounded-sm" />
          </>
        )}
        <CompactButton variant="ghost" onClick={refreshAll} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </CompactButton>
        <CompactButton variant="ghost" onClick={() => setLastApprovedOpen(true)}>
          <Search className="w-3 h-3" /> Última aprobada
        </CompactButton>
        <CompactButton variant="primary" onClick={() => setBatchCloseOpen(true)}>
          <Lock className="w-3 h-3" /> Cerrar lote
        </CompactButton>
      </Toolbar>

      {error && <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">{error}</div>}

      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 font-medium text-gray-500">ID</th>
                <th className="text-left px-2 font-medium text-gray-500">Site / Term</th>
                <th className="text-left px-2 font-medium text-gray-500">Trans #</th>
                <th className="text-left px-2 font-medium text-gray-500">Tarjeta</th>
                <th className="text-right px-2 font-medium text-gray-500">Monto</th>
                <th className="text-left px-2 font-medium text-gray-500">Auth</th>
                <th className="text-left px-2 font-medium text-gray-500">Estado</th>
                <th className="text-left px-2 font-medium text-gray-500">Fecha</th>
                <th className="text-right px-2 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="px-2 py-6 text-center text-text-muted text-xs">
                <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...</td></tr>}
              {!loading && data.length === 0 && (
                <tr><td colSpan={9} className="px-2 py-6 text-center text-text-muted text-xs">
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                  {tab === 'orphaned' ? 'No hay pagos huérfanos' : 'No hay pagos con tarjeta'}
                </td></tr>
              )}
              {!loading && data.map((p) => (
                <tr key={p.cardPaymentId} className="h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2 text-2xs font-mono text-text-secondary truncate max-w-[140px]">{p.cardPaymentId.slice(0, 8)}...</td>
                  <td className="px-2 text-sm text-text-secondary">{p.siteId} · T{p.terminalId}</td>
                  <td className="px-2 text-sm font-mono text-text-secondary">{p.transNumber || '—'}</td>
                  <td className="px-2 text-sm text-text-secondary">
                    {p.cardProduct || '—'} <span className="text-2xs text-text-muted">{p.maskedPan || ''}</span>
                  </td>
                  <td className="px-2 text-sm text-right font-mono">RD$ {amountDop(p.amountCents)}</td>
                  <td className="px-2 text-sm font-mono text-text-secondary">{p.authorizationNumber || '—'}</td>
                  <td className="px-2 text-sm">
                    <div className="flex flex-col">
                      <span className={`inline-flex w-fit px-1.5 py-0.5 rounded text-2xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                      {p.providerStatus && (
                        <span className="text-2xs text-text-muted mt-0.5" title="Estado reportado por el datáfono">
                          {p.providerStatus}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 text-2xs text-text-secondary">{new Date(p.createdAt).toLocaleString('es-DO')}</td>
                  <td className="px-2 text-sm whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CompactButton variant="icon" onClick={() => openDetail(p.cardPaymentId)} title="Ver detalle">
                        <Eye className="w-3.5 h-3.5 text-text-secondary" />
                      </CompactButton>
                      {p.status === 'Approved' && (
                        <CompactButton variant="icon" onClick={() => openVoid(p)} title="Reversar (void)">
                          <Ban className="w-3.5 h-3.5 text-red-600" />
                        </CompactButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tab === 'all' && data.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={cardPaymentsHook.pagination?.total ?? data.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
            itemLabel="pagos"
          />
        )}
      </div>

      <CardPaymentDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)}
        cardPaymentId={detailId} onChanged={refreshAll} />

      <VoidCardPaymentDialog
        isOpen={voidOpen}
        onClose={() => setVoidOpen(false)}
        cardPayment={voidTarget}
        onSuccess={refreshAll}
      />

      <BatchCloseDialog
        isOpen={batchCloseOpen}
        onClose={() => setBatchCloseOpen(false)}
        defaultSiteId={effectiveSiteId || null}
        defaultTerminalId={numericTerminalId}
        onSuccess={refreshAll}
      />

      <LastApprovedDialog
        isOpen={lastApprovedOpen}
        onClose={() => setLastApprovedOpen(false)}
        defaultSiteId={effectiveSiteId || null}
        defaultTerminalId={numericTerminalId}
      />
    </div>
  );
};

export default CardPaymentsSection;
