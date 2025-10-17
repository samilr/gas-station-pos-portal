import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle, User, Eye, EyeOff } from 'lucide-react';
import ForgotPassword from './ForgotPassword';
import logoImage from '../../assets/isladominicana.png';
import shellImage from '../../assets/Shell.png';
import bgShell from '../../assets/shell_do.jpg';

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
      if (!success) {
        setError('Credenciales inválidas o error en la autenticación');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setError('');
  };

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background image layer (sutil debajo) */}
      <div
        className="absolute inset-0 bg-center bg-cover opacity-5 pointer-events-none"
        style={{ backgroundImage: `url(${bgShell})` }}
      />
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div 
            className="absolute top-20 right-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" 
            style={{ backgroundColor: '#d83c30' }}
          ></div>
          <div 
            className="absolute bottom-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" 
            style={{ backgroundColor: '#ffc736', animationDelay: '1s' }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" 
            style={{ backgroundColor: '#808184', animationDelay: '2s' }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo ISLA - Descomenta cuando tengas la imagen */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                 {logoImage ? (
                  <img 
                    src={logoImage}
                    alt="ISLA Logo" 
                    className="h-12 sm:h-14 w-auto object-contain"
                  />
                ) : ( 
                  <div 
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-lg" 
                    style={{ backgroundColor: '#d83c30' }}
                  > 
                    <span className="text-white font-bold text-sm sm:text-xl">ISLA</span>
                  </div>
                 )} 
              </div>

              {/* Shell Logo - Descomenta cuando tengas la imagen */}
              <div className="flex items-center space-x-2">
                {shellImage ? (
                  <img 
                    src={shellImage}
                    alt="Shell Logo" 
                    className="h-8 sm:h-12 w-auto object-contain"
                  />
                ) : ( 
                  <div 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: '#d83c30' }}
                  >
                    <span className="text-white font-bold text-xs sm:text-sm">S</span>
                  </div>
                )} 
                <div className="text-xs sm:text-sm font-medium" style={{ color: '#273691' }}>
                  Shell Licensee
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-md mx-auto">
            {/* Login Form Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" 
                    style={{ background: 'linear-gradient(135deg, #d83c30 0%, #c02820 100%)' }}
                  >
                    <User className="w-8 h-8 text-white" />
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                    PORTAL MAGIC CLOUD
                  </h1>
                  <p className="text-sm sm:text-base" style={{ color: '#808184' }}>
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                {/* Error Messages */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl border-l-4 border-red-500 bg-red-50">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Usuario
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5" style={{ color: '#808184' }} />
                      </div>
                      <input
                        id="username"
                        type="email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                        placeholder="admin@portal.com"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5" style={{ color: '#808184' }} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" style={{ color: '#808184' }} />
                        ) : (
                          <Eye className="w-5 h-5" style={{ color: '#808184' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      background: isLoading 
                        ? 'linear-gradient(135deg, #808184 0%, #6a6a6c 100%)' 
                        : 'linear-gradient(135deg, #d83c30 0%, #c02820 100%)'
                    }}
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </button>
                </form>

                {/* Additional Options */}
                <div className="mt-6 space-y-3 text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium hover:underline block w-full"
                    style={{ color: '#d83c30' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center text-xs sm:text-sm" style={{ color: '#808184' }}>
              <p>© 2025 ISLA Dominicana de Petróleo Corp. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;