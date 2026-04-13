import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { CompactButton } from '../../ui';

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
        toast.error('La API respondio con un error al actualizar los RNC.', {
          duration: 4000,
          icon: '❌',
        });
      }
    } catch (error) {
      console.error('Error al actualizar RNC desde DGII:', error);
      toast.error('Error de conexion al actualizar RNC desde DGII.', {
        duration: 4000,
        icon: '❌',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-1">
      <div className="bg-white rounded-sm border border-gray-200 p-3">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Configuracion General</h2>
        <p className="text-xs text-gray-500 mb-2">Configuracion general del sistema</p>

        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Actualizar RNC desde DGII</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Este proceso consulta la DGII y actualiza la informacion de los contribuyentes (RNC) almacenada en el sistema.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-sm p-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-900">Sincronizar informacion de contribuyentes</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Pulsa el boton para iniciar la actualizacion desde la DGII.
              </p>
            </div>
            <CompactButton
              variant="primary"
              onClick={handleUpdateRNC}
              disabled={isUpdating}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Actualizando...' : 'Actualizar RNC desde DGII'}
            </CompactButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsGeneralSection;
