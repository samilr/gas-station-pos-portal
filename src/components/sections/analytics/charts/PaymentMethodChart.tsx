import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';

interface PaymentMethodChartProps {
  data: any[];
  title: string;
}

const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data, title }) => {
  const processData = () => {
    if (!data || data.length === 0) return [];

    const paymentMap: { [key: string]: {
      method: string;
      name: string;
      sales: number;
      transactions: number;
      percentage: number;
    } } = {};

    data.forEach(transaction => {
      const paymentMethod = transaction.paymentMethod || transaction.payment_type || 'Efectivo';
      const methodName = getPaymentMethodName(paymentMethod);

      if (!paymentMap[paymentMethod]) {
        paymentMap[paymentMethod] = {
          method: paymentMethod,
          name: methodName,
          sales: 0,
          transactions: 0,
          percentage: 0
        };
      }

      paymentMap[paymentMethod].sales += transaction.total || 0;
      paymentMap[paymentMethod].transactions += 1;
    });

    const totalSales = Object.values(paymentMap).reduce((sum, method) => sum + method.sales, 0);

    Object.values(paymentMap).forEach(method => {
      method.percentage = totalSales > 0 ? (method.sales / totalSales) * 100 : 0;
    });

    return Object.values(paymentMap).sort((a, b) => b.sales - a.sales);
  };

  const getPaymentMethodName = (method: string) => {
    const methodNames: { [key: string]: string } = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'credit_card': 'Tarjeta de Crédito',
      'debit_card': 'Tarjeta de Débito',
      'transfer': 'Transferencia',
      'digital': 'Pago Digital',
      'mobile': 'Pago Móvil',
      'check': 'Cheque',
      'other': 'Otros'
    };
    return methodNames[method.toLowerCase()] || method;
  };

  const chartData = processData();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{d.name}</p>
          <p className="text-text-secondary">Ventas: <strong className="text-text-primary">{formatCurrency(d.sales)}</strong></p>
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{d.transactions}</strong></p>
          <p className="text-text-secondary"><strong className="text-text-primary">{d.percentage.toFixed(1)}%</strong> del total</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.value} <strong className="text-text-primary">({entry.payload.percentage.toFixed(1)}%)</strong>
          </div>
        ))}
      </div>
    );
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-text-muted">No hay datos de métodos de pago disponibles</p>
        </div>
      </Shell>
    );
  }

  const totalSales = chartData.reduce((sum, method) => sum + method.sales, 0);
  const totalTransactions = chartData.reduce((sum, method) => sum + method.transactions, 0);
  const topMethod = chartData[0];

  return (
    <Shell>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name} (${entry.percentage.toFixed(1)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="sales"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend content={renderLegend} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap gap-3">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Método Preferido <strong className="text-text-primary">{topMethod.name}</strong>
          <span className="text-text-muted">({topMethod.percentage.toFixed(1)}%)</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Total Ventas <strong className="text-text-primary">{formatCurrency(totalSales)}</strong>
          <span className="text-text-muted">({totalTransactions} trans.)</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Métodos Activos <strong className="text-text-primary">{chartData.length}</strong>
          <span className="text-text-muted">promedio {formatCurrency(totalSales / totalTransactions)}</span>
        </span>
      </div>
    </Shell>
  );
};

export default PaymentMethodChart;
