import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Send,
  Info,
} from 'lucide-react';
import { authService } from '../../services/authService';
import logoImage from '../../assets/isladominicana.png';
import shellImage from '../../assets/Shell.png';

type Step = 'email' | 'code' | 'password' | 'done';

const OTP_DURATION_SECONDS = 15 * 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_REGEX = /^\d{6}$/;

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const codeExpired = step === 'code' && timeLeft === 0;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!EMAIL_REGEX.test(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    const result = await authService.forgotPassword(email);
    setIsLoading(false);

    if (!result.successful) {
      setError(result.error || 'No se pudo enviar el código. Intenta nuevamente.');
      return;
    }

    setInfo(
      result.message ||
        'Si el email existe en nuestro sistema, recibirás un código de verificación.'
    );
    setCode('');
    setTimeLeft(OTP_DURATION_SECONDS);
    setStep('code');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!CODE_REGEX.test(code)) {
      setError('El código debe tener exactamente 6 dígitos.');
      return;
    }

    setIsLoading(true);
    const result = await authService.validateOtp(email, code);
    setIsLoading(false);

    if (!result.successful) {
      setError(result.error || 'Código OTP inválido.');
      return;
    }

    setStep('password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    const result = await authService.resetPassword(email, code, newPassword);
    setIsLoading(false);

    if (!result.successful) {
      setError(result.error || 'No se pudo restablecer la contraseña.');
      return;
    }

    setStep('done');
  };

  const handleResendCode = async () => {
    setError('');
    setInfo('');
    setIsLoading(true);
    const result = await authService.forgotPassword(email);
    setIsLoading(false);

    if (!result.successful) {
      setError(result.error || 'No se pudo reenviar el código.');
      return;
    }

    setInfo('Hemos generado un nuevo código. El anterior queda invalidado.');
    setCode('');
    setTimeLeft(OTP_DURATION_SECONDS);
  };

  const requestNewCode = () => {
    setError('');
    setInfo('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeLeft(0);
    setStep('email');
  };

  const headerInfo: Record<
    Step,
    {
      title: string;
      icon: React.ComponentType<{ className?: string }>;
      stepLabel: string;
      subtitle: string;
    }
  > = {
    email: {
      title: 'Recuperar contraseña',
      icon: Mail,
      stepLabel: 'Paso 1 de 3',
      subtitle: 'Ingresa tu correo y te enviaremos un código de verificación.',
    },
    code: {
      title: 'Verificar código',
      icon: KeyRound,
      stepLabel: 'Paso 2 de 3',
      subtitle: `Ingresa el código de 6 dígitos enviado a ${email}.`,
    },
    password: {
      title: 'Nueva contraseña',
      icon: Lock,
      stepLabel: 'Paso 3 de 3',
      subtitle: 'Define una contraseña segura para tu cuenta.',
    },
    done: {
      title: 'Contraseña actualizada',
      icon: ShieldCheck,
      stepLabel: 'Listo',
      subtitle: 'Ya puedes iniciar sesión con tu nueva contraseña.',
    },
  };

  const head = headerInfo[step];
  const HeadIcon = head.icon;

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
          <div className="flex justify-center mb-3">
            <span className="text-2xl font-bold text-text-primary uppercase tracking-wide">
              GasOps
            </span>
          </div>

          <div className="bg-white rounded-sm border border-table-border overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="h-8 bg-table-header border-b border-table-border px-3 flex items-center gap-2">
              <HeadIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                {head.title}
              </span>
              <span className="ml-auto text-2xs text-text-muted">{head.stepLabel}</span>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <p className="text-xs text-text-muted leading-relaxed">{head.subtitle}</p>

              {error && (
                <div className="flex items-start gap-2 p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              {info && (
                <div className="flex items-start gap-2 p-2 border border-blue-200 bg-blue-50 rounded-sm text-xs text-blue-700">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{info}</span>
                </div>
              )}

              {step === 'email' && (
                <form onSubmit={handleSendCode} className="space-y-3">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5"
                    >
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-text-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        autoFocus
                        autoComplete="email"
                        placeholder="usuario@isladom.com.do"
                        className="w-full h-7 pl-7 pr-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> Enviando código...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" /> Enviar código
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === 'code' && (
                <form onSubmit={handleVerifyCode} className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label
                        htmlFor="code"
                        className="block text-2xs uppercase tracking-wide text-text-muted"
                      >
                        Código de 6 dígitos
                      </label>
                      <span
                        className={`flex items-center gap-1 text-2xs ${
                          codeExpired ? 'text-red-600' : 'text-text-muted'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {codeExpired ? 'Expirado' : formatTime(timeLeft)}
                      </span>
                    </div>
                    <input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      disabled={isLoading || codeExpired}
                      autoFocus
                      autoComplete="one-time-code"
                      placeholder="000000"
                      className="w-full h-9 px-2 text-base text-center font-mono tracking-[0.5em] border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || codeExpired || code.length !== 6}
                    className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> Verificando...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3" /> Verificar código
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="w-full h-7 flex items-center justify-center gap-1.5 text-2xs font-medium text-blue-600 hover:bg-blue-50 rounded-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reenviar código
                  </button>
                </form>
              )}

              {step === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5"
                    >
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-text-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={isLoading}
                        autoFocus
                        autoComplete="new-password"
                        placeholder="Mínimo 6 caracteres"
                        className="w-full h-7 pl-7 pr-7 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        tabIndex={-1}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5 text-text-muted" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-text-muted" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5"
                    >
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-text-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={isLoading}
                        autoComplete="new-password"
                        placeholder="Repite la contraseña"
                        className="w-full h-7 pl-7 pr-7 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        tabIndex={-1}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-3.5 h-3.5 text-text-muted" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-text-muted" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> Actualizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" /> Restablecer contraseña
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === 'done' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-2 border border-green-200 bg-green-50 rounded-sm text-xs text-green-700">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva
                      contraseña.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-all"
                  >
                    Ir a iniciar sesión
                  </button>
                </div>
              )}

              {step !== 'done' && (
                <div className="pt-2 border-t border-table-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="flex items-center gap-1 text-2xs text-text-muted hover:text-blue-600 hover:underline"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Volver al login
                  </button>
                  {(step === 'code' || step === 'password') && (
                    <button
                      type="button"
                      onClick={requestNewCode}
                      className="text-2xs text-blue-600 hover:underline"
                    >
                      Solicitar nuevo código
                    </button>
                  )}
                </div>
              )}
            </div>
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

export default ForgotPassword;
