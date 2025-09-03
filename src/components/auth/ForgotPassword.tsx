import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react';

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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg font-mono"
          placeholder="000000"
        />
        <p className="text-xs text-gray-500 mt-1">Código demo: 123456</p>
      </div>

      <button
        type="submit"
        disabled={isLoading || timeLeft === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        {isLoading ? 'Verificando...' : 'Verificar Código'}
      </button>

      {timeLeft === 0 && (
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isLoading}
          className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBackToLogin}
            className="absolute top-6 left-6 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'email' && 'Recuperar Contraseña'}
            {step === 'code' && 'Verificar Código'}
            {step === 'password' && 'Nueva Contraseña'}
          </h1>
          
          <p className="text-gray-600 mt-2">
            {step === 'email' && 'Ingresa tu correo electrónico para recibir un código de verificación'}
            {step === 'code' && 'Ingresa el código de 6 dígitos enviado a tu correo'}
            {step === 'password' && 'Crea una nueva contraseña segura'}
          </p>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Contenido del formulario */}
        {step === 'email' && renderEmailStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'password' && renderPasswordStep()}

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Recordaste tu contraseña?{' '}
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Volver al login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
