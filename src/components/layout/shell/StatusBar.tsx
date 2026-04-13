import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const StatusBar: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="h-6 bg-status-bg border-t border-status-border flex items-center justify-between px-3 flex-shrink-0">
      {/* Left: connection status */}
      <div className="flex items-center gap-2 text-xs text-status-text">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Conectado
        </span>
        <span className="text-text-muted">·</span>
        <span>Última sync: hace 2 min</span>
      </div>

      {/* Right: user info */}
      <div className="text-xs text-status-text">
        {user?.name} — {user?.role}
      </div>
    </div>
  );
};

export default StatusBar;
