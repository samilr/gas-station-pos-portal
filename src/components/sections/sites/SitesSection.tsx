import React, { useState } from "react";
import {
  Building2,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import SiteModal from "./SiteModal";
import DeleteSiteDialog from "./DeleteSiteDialog";
import toast from "react-hot-toast";
import { useSites } from "../../../hooks/useSites";
import { usePermissions } from "../../../hooks/usePermissions";
import { ISite } from "../../../types/site";
import { PermissionGate } from "../../common";
import { CompactButton, Pagination } from '../../ui';
import Toolbar from '../../ui/Toolbar';

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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState<ISite | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredSites = (Array.isArray(sites) ? sites : []).filter((site) => {
    const matchesSearch =
      (site.siteId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.storeId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Paginacion
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
        result = await updateSite(selectedSite.siteId, data);
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
      const result = await deleteSite(selectedSite.siteId);
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

  // Calcular estadisticas
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
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar sucursales..."
        chips={[
          { label: "Total", value: totalSites, color: "blue" },
          { label: "Activas", value: activeSites, color: "green" },
          { label: "Inactivas", value: inactiveSites, color: "red" },
          { label: "POS", value: posSites, color: "blue" },
        ]}
      >
        <CompactButton variant="ghost" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-3.5 h-3.5" />
          {showFilters ? "Ocultar" : "Filtros"}
        </CompactButton>
        <CompactButton variant="ghost" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </CompactButton>
        <PermissionGate permissions={['sites.create']}>
          <CompactButton variant="primary" onClick={handleCreateSite}>
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </CompactButton>
        </PermissionGate>
      </Toolbar>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">POS</label>
              <select
                value={posFilter}
                onChange={(e) => setPosFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="pos">Con POS</option>
                <option value="no-pos">Sin POS</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Warning Message */}
      {error && error.includes("datos de prueba") && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-2 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {/* Sites Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 text-xs font-medium text-gray-500">Site ID</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Nombre</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Dirección</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Teléfono</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Email</th>
                <th className="text-center px-2 text-xs font-medium text-gray-500">Estado</th>
                <th className="text-right px-2 text-xs font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentSites.map((site) => (
                <tr
                  key={site.siteId}
                  className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(site)}
                >
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{site.siteId}</span>
                    </div>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900 max-w-[200px] truncate" title={site.name || ''}>{site.name || '—'}</td>
                  <td className="px-2 text-xs text-gray-600 max-w-[180px] truncate" title={site.address1 || ''}>{site.address1 || '—'}</td>
                  <td className="px-2 text-xs text-gray-600 whitespace-nowrap">{site.phone || '—'}</td>
                  <td className="px-2 text-xs text-gray-600 max-w-[180px] truncate" title={site.email || ''}>{site.email || '—'}</td>
                  <td className="px-2 text-sm whitespace-nowrap text-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${site.active ? 'bg-green-500' : 'bg-red-500'}`}
                      title={site.active ? 'Activa' : 'Inactiva'}
                    />
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGate permissions={['sites.edit']}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSite(site);
                          }}
                          className="p-0.5 text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGate>
                      <PermissionGate permissions={['sites.delete']}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSite(site);
                          }}
                          className="p-0.5 text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSites.length}
          pageSize={itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
          itemLabel="sucursales"
          filteredTotal={sites.length}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2">
          <p className="text-sm text-red-800">{error}</p>
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

      {/* Modal de Confirmacion de Eliminacion */}
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
