import React, { useState } from "react";
import {
  Building2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useSites } from "../../../../hooks/useSites";
import { ISite } from "../../../../types/site";
import SiteModal from "./SiteModal";
import DeleteSiteDialog from "./DeleteSiteDialog";
import toast from "react-hot-toast";
import { usePermissions } from "../../../../hooks/usePermissions";
import { PermissionGate } from "../../../common";

const SitesSection: React.FC = () => {
  const {
    sites,
    loading,
    error,
    refreshSites,
    createSite,
    updateSite,
    deleteSite,
  } = useSites();
  usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState<ISite | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredSites = (Array.isArray(sites) ? sites : []).filter((site) => {
    const matchesSearch =
      (site.site_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.store_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.phone || "").includes(searchTerm) ||
      (site.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "active" && site.active) ||
      (statusFilter === "inactive" && !site.active);

    const matchesPos =
      posFilter === "" ||
      (posFilter === "pos" && site.pos) ||
      (posFilter === "no-pos" && !site.pos);

    return matchesSearch && matchesStatus && matchesPos;
  });

  // Paginación
  const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSites = filteredSites.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRefresh = () => {
    refreshSites();
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      // Aquí implementarías la lógica de exportación
      console.log("Exportando sucursales...");
      toast.success("Exportación iniciada");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar");
    }
  };

  const handleViewDetails = (site: ISite) => {
    setSelectedSite(site);
    setModalMode("view");
    setShowModal(true);
  };

  const handleCreateSite = () => {
    setSelectedSite(null);
    setModalMode("create");
    setShowModal(true);
  };

  const handleEditSite = (site: ISite) => {
    setSelectedSite(site);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDeleteSite = (site: ISite) => {
    setSelectedSite(site);
    setShowDeleteDialog(true);
  };

  const handleSaveSite = async (data: any) => {
    try {
      let result;

      if (modalMode === "edit" && selectedSite) {
        result = await updateSite(selectedSite.site_id, data);
        if (result.successful) {
          toast.success("Sucursal actualizada correctamente");
        } else {
          toast.error(result.message || "Error al actualizar sucursal");
        }
      } else if (modalMode === "create") {
        result = await createSite(data);
        if (result.successful) {
          toast.success("Sucursal creada correctamente");
        } else {
          toast.error(result.message || "Error al crear sucursal");
        }
      }

      return result?.successful || false;
    } catch (error) {
      console.error("Error saving site:", error);
      toast.error("Error al guardar sucursal");
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSite) return;

    setDeleteLoading(true);
    try {
      const result = await deleteSite(selectedSite.site_id);
      if (result.successful) {
        toast.success("Sucursal eliminada correctamente");
        setShowDeleteDialog(false);
        setSelectedSite(null);
      } else {
        toast.error(result.message || "Error al eliminar sucursal");
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("Error al eliminar sucursal");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusIcon = (active: boolean) => {
    return active ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusText = (active: boolean) => {
    return active ? "Activa" : "Inactiva";
  };

  // Calcular estadísticas
  const totalSites = sites.length;
  const activeSites = sites.filter((s) => s.active).length;
  const inactiveSites = sites.filter((s) => !s.active).length;
  const posSites = sites.filter((s) => s.pos).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header con búsqueda y botones */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar sucursales..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stats Cards */}
                <div className="flex items-center space-x-4">
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        {totalSites}
                      </span>
                      <Building2 className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Activas</span>
                      <span className="text-lg font-bold text-green-600">
                        {activeSites}
                      </span>
                      <Building2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Inactivas</span>
                      <span className="text-lg font-bold text-red-600">
                        {inactiveSites}
                      </span>
                      <Building2 className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Con POS</span>
                      <span className="text-lg font-bold text-blue-600">
                        {posSites}
                      </span>
                      <DollarSign className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>
                  {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Actualizar</span>
              </button>
              <PermissionGate permissions={['sites.create']}>
                <button
                  onClick={handleCreateSite}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Sucursal</span>
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>
              </div>

              {/* POS Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  POS
                </label>
                <select
                  value={posFilter}
                  onChange={(e) => setPosFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="pos">Con POS</option>
                  <option value="no-pos">Sin POS</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning Message */}
      {error && error.includes("datos de prueba") && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sites Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sucursal
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuración
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSites.map((site) => (
                <tr key={site.site_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {site.site_id} {site.name}
                        </div>
                        {site.address1 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {site.address1}
                        </div>
                      )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {site.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-3 h-3 mr-1" />
                          {site.phone}
                        </div>
                      )}
                      {site.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-3 h-3 mr-1" />
                          {site.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        <span className="text-sm text-gray-500">
                          {site.pos ? "POS Habilitado" : "Sin POS"}
                        </span>
                      </div>
                      {site.head_office && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Oficina Principal
                        </span>
                      )}
                      {site.pos_is_restaurant && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Restaurante
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(site.active)}
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          site.active
                        )}`}
                      >
                        {getStatusText(site.active)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(site)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <PermissionGate permissions={['sites.edit']}>
                        <button
                          onClick={() => handleEditSite(site)}
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </PermissionGate>
                      <PermissionGate permissions={['sites.delete']}>
                        <button
                          onClick={() => handleDeleteSite(site)}
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(endIndex, filteredSites.length)}
            </span>{" "}
            de <span className="font-medium">{filteredSites.length}</span>{" "}
            sucursales
            {filteredSites.length !== sites.length && (
              <span className="text-gray-500">
                {" "}
                (filtradas de {sites.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Anterior
            </button>

            {/* Números de página */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Mostrar solo algunas páginas para evitar demasiados botones
                  if (
                    totalPages <= 7 ||
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          page === currentPage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Site Modal */}
      <SiteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveSite}
        site={selectedSite}
        mode={modalMode}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteSiteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        site={selectedSite}
        loading={deleteLoading}
      />
    </div>
  );
};

export default SitesSection;
