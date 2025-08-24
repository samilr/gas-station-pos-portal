import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface GenericSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

const GenericSection: React.FC<GenericSectionProps> = ({ title, description, icon: Icon, children }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Icon className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        {children || (
          <div className="text-center py-12">
            <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sección en Desarrollo</h3>
            <p className="text-gray-600 mb-6">
              Esta sección estará disponible próximamente. Aquí podrás gestionar {title.toLowerCase()}.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Próximamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericSection;