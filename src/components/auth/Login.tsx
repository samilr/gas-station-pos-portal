import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff, LogIn, RefreshCw } from 'lucide-react';
import ForgotPassword from './ForgotPassword';
import logoImage from '../../assets/isladominicana.png';
import shellImage from '../../assets/Shell.png';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await login(username, password);
      if (!success) setError('Credenciales inválidas o error en la autenticación');
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={() => { setShowForgotPassword(false); setError(''); }} />;
  }

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-white border-b border-table-border px-4 flex items-center justify-between flex-shrink-0">
        {logoImage ? (
          <img src={logoImage} alt="ISLA" className="h-7 w-auto object-contain" />
        ) : (
          <div className="w-7 h-7 rounded-sm flex items-center justify-center bg-blue-600">
            <span className="text-white font-bold text-2xs">ISLA</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {shellImage && <img src={shellImage} alt="Shell" className="h-6 w-auto object-contain" />}
          <span className="text-2xs text-text-muted uppercase tracking-wide">Shell Licensee</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* GasOps centrado sobre el card */}
          <div className="flex justify-center mb-3">
            <span className="text-2xl font-bold text-text-primary uppercase tracking-wide">
              GasOps
            </span>
          </div>

          <div className="bg-white rounded-sm border border-table-border overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="h-8 bg-table-header border-b border-table-border px-3 flex items-center gap-2">
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                Iniciar Sesión
              </span>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {error && (
                <div className="flex items-start gap-2 p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                  Usuario
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-text-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="username"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="username"
                    placeholder="admin@portal.com"
                    className="w-full h-7 pl-7 pr-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-text-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full h-7 pl-7 pr-7 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    tabIndex={-1}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100"
                  >
                    {showPassword
                      ? <EyeOff className="w-3.5 h-3.5 text-text-muted" />
                      : <Eye className="w-3.5 h-3.5 text-text-muted" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="mt-1 text-2xs text-blue-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><RefreshCw className="w-3 h-3 animate-spin" /> Iniciando sesión...</>
                ) : (
                  <><LogIn className="w-3 h-3" /> Iniciar Sesión</>
                )}
              </button>
            </form>
          </div>

          <p className="mt-2 text-2xs text-text-muted text-center">
            Acceso restringido a personal autorizado
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="h-8 border-t border-table-border px-4 flex items-center justify-center flex-shrink-0">
        <p className="text-2xs text-text-muted">
          © 2025 ISLA Dominicana de Petróleo Corp. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
