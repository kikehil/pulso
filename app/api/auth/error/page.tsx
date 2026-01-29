'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PulseTecIcon } from '@/components/pulsetec-logo';
import { AlertCircle, ArrowLeft } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Email o contraseña incorrectos';
      case 'AccessDenied':
        return 'Acceso denegado';
      case 'Configuration':
        return 'Error de configuración del servidor';
      default:
        return 'Error al iniciar sesión. Por favor, intenta de nuevo.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-primary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl shadow-2xl shadow-primary/50 mb-6 p-4">
            <PulseTecIcon className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PulseTec Control</h1>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-dark mb-2">Error de Autenticación</h2>
              <p className="text-gray">{getErrorMessage(error)}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray">
                <span className="font-medium">Código de error:</span> {error}
              </p>
            </div>
          )}

          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg font-medium hover:bg-dark transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-primary/20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <p className="text-gray">Cargando...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}


