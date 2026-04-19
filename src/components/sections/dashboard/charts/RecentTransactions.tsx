import React from 'react';
import { Clock, CreditCard, Store, Fuel, AlertTriangle, Receipt } from 'lucide-react';
import { formatCurrency } from '../../../../utils/dashboardUtils';
import { ITransactionResume } from '../../../../types/transaction';
import { StatusDot } from '../../../ui';

interface RecentTransactionsProps {
  transactions: ITransactionResume[];
  loading: boolean;
  error: string | null;
  onViewAll?: () => void;
}

const sectionHeaderClass = 'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  loading,
  error,
  onViewAll,
}) => {
  const getTransactionIcon = (cfType: string) => {
    switch (cfType) {
      case 'NCF':
        return <Fuel className="w-3.5 h-3.5 text-orange-500" />;
      case 'TIENDA':
        return <Store className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getStatusInfo = (status: number): { color: string; label: string } => {
    switch (status) {
      case 1:
        return { color: 'green', label: 'Aceptada' };
      case 2:
        return { color: 'yellow', label: 'Pendiente' };
      case 3:
        return { color: 'red', label: 'Rechazada' };
      default:
        return { color: 'gray', label: 'Desconocido' };
    }
  };

  const formatTime = (dateString: string) => {
    // Si no trae Z ni offset, asumir UTC y convertir a hora GMT-4 (Santo Domingo)
    const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(dateString);
    const date = new Date(hasTz ? dateString : dateString + 'Z');
    return date.toLocaleTimeString('es-DO', {
      timeZone: 'America/Santo_Domingo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const Shell: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <Receipt className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
          Transacciones Recientes
        </span>
        {right && <div className="ml-auto">{right}</div>}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="p-3 flex items-center justify-center h-[240px]">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="p-3">
          <div className="flex items-center gap-2 p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Error al cargar transacciones recientes: {error}</span>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      right={
        onViewAll ? (
          <button
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todas
          </button>
        ) : undefined
      }
    >
      <div className="p-2">
        {transactions && transactions.length > 0 ? (
          <ul className="space-y-1">
            {transactions.slice(0, 5).map((transaction) => {
              const status = getStatusInfo(transaction.status);
              return (
                <li
                  key={transaction.transNumber}
                  className="flex items-center justify-between gap-2 px-2 h-9 border border-table-border rounded-sm hover:bg-row-hover transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getTransactionIcon(transaction.cfType)}
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-text-primary truncate">
                        #{transaction.transNumber}
                      </div>
                      <div className="flex items-center gap-1 text-2xs text-text-muted">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(transaction.transDate)}</span>
                        <span>·</span>
                        <span>{transaction.cfType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium text-text-primary">
                      {formatCurrency(transaction.total)}
                    </span>
                    <StatusDot color={status.color} label={status.label} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-xs text-text-muted">
            <CreditCard className="w-5 h-5 mb-2" />
            <p>No hay transacciones recientes</p>
          </div>
        )}
      </div>
    </Shell>
  );
};

export default RecentTransactions;
