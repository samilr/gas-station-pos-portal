import React from 'react';
import { Clock, CreditCard, Store, Fuel } from 'lucide-react';
import { formatCurrency } from '../../../../utils/dashboardUtils';
import { ITransactionResume } from '../../../../types/transaction';

interface RecentTransactionsProps {
  transactions: ITransactionResume[];
  loading: boolean;
  error: string | null;
  onViewAll?: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  loading,
  error,
  onViewAll
}) => {
  const getTransactionIcon = (cfType: string) => {
    switch (cfType) {
      case 'NCF':
        return <Fuel className="w-4 h-4 text-orange-500" />;
      case 'TIENDA':
        return <Store className="w-4 h-4 text-purple-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'text-green-600 bg-green-50';
      case 2:
        return 'text-yellow-600 bg-yellow-50';
      case 3:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Aceptada';
      case 2:
        return 'Pendiente';
      case 3:
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Error al cargar transacciones recientes</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todas
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map((transaction) => (
            <div 
              key={transaction.transNumber} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getTransactionIcon(transaction.cfType)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{transaction.transNumber}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(transaction.transDate)}</span>
                    <span>•</span>
                    <span>{transaction.cfType}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.total)}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay transacciones recientes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
