import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import logoImage from '../../assets/isladominicana.png';
import shellImage from '../../assets/Shell.png';
import bgShell from '../../assets/shell_do.jpg';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos
  const [codeSent, setCodeSent] = useState(false);

  // Timer para el código
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 'code' && timeLeft > 0 && codeSent) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setError('El código ha expirado. Solicita uno nuevo.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timeLeft, codeSent]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simular envío de código
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCodeSent(true);
      setTimeLeft(600); // Reiniciar timer
      setStep('code');
      setSuccess('Código enviado a tu correo electrónico');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al enviar el código. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simular verificación de código
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (code === '123456') { // Código demo
        setStep('password');
        setSuccess('Código verificado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Código incorrecto. Verifica e intenta nuevamente.');
      }
    } catch (error) {
      setError('Error al verificar el código. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      // Simular cambio de contraseña
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Contraseña cambiada exitosamente');
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (error) {
      setError('Error al cambiar la contraseña. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simular reenvío de código
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTimeLeft(600);
      setCodeSent(true);
      setSuccess('Nuevo código enviado a tu correo electrónico');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al reenviar el código. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendCode} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
        style={{ 
          background: isLoading 
            ? 'linear-gradient(135deg, #808184 0%, #6a6a6c 100%)' 
            : 'linear-gradient(135deg, #d83c30 0%, #c02820 100%)'
        }}
      >
        {isLoading ? 'Enviando código...' : 'Enviar Código de Verificación'}
      </button>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleVerifyCode} className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Hemos enviado un código de verificación a <strong>{email}</strong>
        </p>
        
        {/* Timer */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Tiempo restante: {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
          Código de Verificación
        </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-center text-lg font-mono"
          placeholder="000000"
        />
        <p className="text-xs text-gray-500 mt-1">Código demo: 123456</p>
      </div>

      <button
        type="submit"
        disabled={isLoading || timeLeft === 0}
        className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
        style={{ 
          background: isLoading 
            ? 'linear-gradient(135deg, #808184 0%, #6a6a6c 100%)' 
            : 'linear-gradient(135deg, #d83c30 0%, #c02820 100%)'
        }}
      >
        {isLoading ? 'Verificando...' : 'Verificar Código'}
      </button>

      {timeLeft === 0 && (
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isLoading}
          className="w-full text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #808184 0%, #6a6a6c 100%)' }}
        >
          <RefreshCw className="w-4 h-4" />
          <span>{isLoading ? 'Reenviando...' : 'Reenviar Código'}</span>
        </button>
      )}
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Nueva Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Nueva Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
        style={{ 
          background: isLoading 
            ? 'linear-gradient(135deg, #808184 0%, #6a6a6c 100%)' 
            : 'linear-gradient(135deg, #d83c30 0%, #c02820 100%)'
        }}
      >
        {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background image layer (sutil debajo) */}
      <div
        className="absolute inset-0 bg-center bg-cover opacity-5 pointer-events-none"
        style={{ backgroundImage: `url(${bgShell})` }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header con logos (igual a Login) */}
        <div className="w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo ISLA */}
              <div className="flex items中心 space-x-2 sm:space-x-3">
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

              {/* Shell Logo */}
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

        {/* Contenido principal */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-md mx-auto">
            {/* Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
              <button
                onClick={onBackToLogin}
                className="absolute top-4 left-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Volver al login"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" 
                    style={{ background: 'linear-gradient(135deg, #d83c30 0%, #c02820 100%)' }}
                  >
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                    {step === 'email' && 'Recuperar Contraseña'}
                    {step === 'code' && 'Verificar Código'}
                    {step === 'password' && 'Nueva Contraseña'}
                  </h1>
                  <p className="text-sm sm:text-base" style={{ color: '#808184' }}>
                    {step === 'email' && 'Ingresa tu correo electrónico para recibir un código de verificación'}
                    {step === 'code' && 'Ingresa el código de 6 dígitos enviado a tu correo'}
                    {step === 'password' && 'Crea una nueva contraseña segura'}
                  </p>
                </div>

                {/* Mensajes */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl border-l-4 border-red-500 bg-red-50">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 rounded-xl border-l-4 border-green-500 bg-green-50">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-sm text-green-700">{success}</span>
                    </div>
                  </div>
                )}

                {/* Formularios por paso */}
                {step === 'email' && renderEmailStep()}
                {step === 'code' && renderCodeStep()}
                {step === 'password' && renderPasswordStep()}

                {/* Enlace de volver */}
                <div className="mt-6 text-center">
                  <button
                    onClick={onBackToLogin}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#d83c30' }}
                  >
                    Volver al login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
