import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import GenericSection from '../GenericSection';

const SettingsGeneralSection: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRNC = async () => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      const response = await fetch(
        'https://isladominicana-pos-mobile-api.azurewebsites.net/api/taxpayer/updateTaxpayerFromDGII',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // Si no hay body JSON, seguimos con successful por status
      }

      const successful =
        response.ok && (data?.successful === undefined || data?.successful === true);

      if (successful) {
        toast.success('RNC actualizados exitosamente desde DGII', {
          duration: 4000,
          icon: '✅',
        });
      } else {
        toast.error('La API respondió con un error al actualizar los RNC.', {
          duration: 4000,
          icon: '❌',
        });
      }
    } catch (error) {
      console.error('Error al actualizar RNC desde DGII:', error);
      toast.error('Error de conexión al actualizar RNC desde DGII.', {
        duration: 4000,
        icon: '❌',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <GenericSection
      title="Configuración General"
      description="Configuración general del sistema"
      icon={RefreshCw}
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Actualizar RNC desde DGII
            </h3>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Este proceso consulta la DGII y actualiza la información de los contribuyentes
              (RNC) almacenada en el sistema.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Sincronizar información de contribuyentes
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Pulsa el botón para iniciar la actualización desde la DGII. El proceso puede
              tardar varios segundos.
            </p>
          </div>
          <button
            onClick={handleUpdateRNC}
            disabled={isUpdating}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>Actualizar RNC desde DGII</span>
              </>
            )}
          </button>
        </div>
      </div>
    </GenericSection>
  );
};

export default SettingsGeneralSection;

