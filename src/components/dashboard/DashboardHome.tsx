import React from 'react';
import { Users, Database, BarChart3, Shield, TrendingUp, Activity } from 'lucide-react';

const stats = [
  { name: 'Usuarios Activos', value: '2,543', change: '+12%', icon: Users, color: 'bg-blue-500' },
  { name: 'APIs Conectadas', value: '12', change: '+3', icon: Database, color: 'bg-green-500' },
  { name: 'Peticiones Hoy', value: '45.2K', change: '+8.1%', icon: BarChart3, color: 'bg-yellow-500' },
  { name: 'Alertas de Seguridad', value: '3', change: '-2', icon: Shield, color: 'bg-red-500' },
];

const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {[
              { action: 'Usuario creado', user: 'Juan Pérez', time: 'Hace 5 min' },
              { action: 'API conectada', user: 'Sistema', time: 'Hace 12 min' },
              { action: 'Configuración actualizada', user: 'Admin', time: 'Hace 1 hora' },
              { action: 'Backup completado', user: 'Sistema', time: 'Hace 2 horas' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">por {activity.user}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
          <div className="space-y-4">
            {[
              { service: 'API Gateway', status: 'online', uptime: '99.9%' },
              { service: 'Base de Datos', status: 'online', uptime: '100%' },
              { service: 'Cache Server', status: 'online', uptime: '98.7%' },
              { service: 'CDN', status: 'warning', uptime: '95.2%' },
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'online' ? 'bg-green-500' : 
                    service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{service.service}</span>
                </div>
                <span className="text-sm text-gray-600">{service.uptime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Crear Usuario</h4>
            <p className="text-sm text-gray-600">Agregar nuevo usuario al sistema</p>
          </button>
          <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
            <Database className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Conectar API</h4>
            <p className="text-sm text-gray-600">Integrar nueva API externa</p>
          </button>
          <button className="p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors">
            <BarChart3 className="w-8 h-8 text-yellow-600 mb-2" />
            <h4 className="font-medium text-gray-900">Ver Reportes</h4>
            <p className="text-sm text-gray-600">Generar reportes detallados</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;