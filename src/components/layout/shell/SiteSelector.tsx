import React, { useEffect, useMemo, useCallback } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Building2, ChevronDown, Check, Loader2, AlertCircle, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSites, setSelectedSite, ALL_SITES } from '../../../store/slices/siteSlice';
import { useAuth } from '../../../context/AuthContext';
import { Role } from '../../../config/permissions';

const EDITABLE_ROLES: Role[] = [Role.ADMIN, Role.SUPERVISOR, Role.AUDIT];

const SiteSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { sites, selectedSiteId, loading, error } = useAppSelector((s) => s.site);

  const canEdit = !!user && EDITABLE_ROLES.includes(user.role as Role);
  const isAllSites = selectedSiteId === ALL_SITES;

  useEffect(() => {
    if (sites.length === 0 && !loading && !error) {
      dispatch(fetchSites());
    }
  }, [dispatch, sites.length, loading, error]);

  // Auto-init: solo si NO hay selección previa (null). Respeta "TODAS" como elección explícita.
  useEffect(() => {
    if (selectedSiteId || sites.length === 0) return;
    const userSite = user?.site;
    const fallback =
      (userSite && sites.find((s) => s.siteId === userSite)?.siteId) ||
      sites.find((s) => s.headOffice)?.siteId ||
      sites[0]?.siteId ||
      null;
    if (fallback) dispatch(setSelectedSite(fallback));
  }, [dispatch, selectedSiteId, sites, user?.site]);

  const selectedSite = useMemo(
    () => sites.find((s) => s.siteId === selectedSiteId) ?? null,
    [sites, selectedSiteId]
  );

  const handleChange = useCallback(
    (nextSiteId: string | null) => {
      if (nextSiteId === selectedSiteId) return;
      dispatch(setSelectedSite(nextSiteId));
      if (nextSiteId === ALL_SITES) {
        toast.success('Mostrando todas las sucursales', { duration: 2500 });
      } else if (nextSiteId) {
        const next = sites.find((s) => s.siteId === nextSiteId);
        const label = next ? `${next.siteId} - ${next.name}` : nextSiteId;
        toast.success(`Sucursal activa: ${label}`, { duration: 2500 });
      }
    },
    [dispatch, selectedSiteId, sites]
  );

  const isInitialLoading = loading && sites.length === 0;
  // "Empty state" solo si no hay ni sitio ni TODAS elegida.
  const isEmptyState = !selectedSite && !isAllSites && !isInitialLoading;

  const buttonLabel = isInitialLoading
    ? 'Cargando...'
    : isAllSites
      ? 'Todas las sucursales'
      : selectedSite
        ? `${selectedSite.siteId} - ${selectedSite.name}`
        : sites.length === 0
          ? 'Sin sucursales'
          : 'Selecciona sucursal';

  const emptyTitle = sites.length === 0
    ? (error || 'No hay sucursales disponibles para tu usuario')
    : 'Debes seleccionar una sucursal';

  const renderIcon = () => {
    if (isEmptyState) return <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />;
    if (isAllSites) return <Globe className="w-3 h-3 text-indigo-500 flex-shrink-0" />;
    return <Building2 className="w-3 h-3 text-blue-500 flex-shrink-0" />;
  };

  if (!canEdit) {
    return (
      <div
        className={`flex items-center gap-1.5 text-xs px-2 h-7 rounded-sm border max-w-[220px] ${
          isEmptyState
            ? 'border-amber-300 bg-amber-50'
            : 'border-gray-200 text-text-secondary'
        }`}
        title={isEmptyState ? emptyTitle : (isAllSites ? 'Todas las sucursales' : selectedSite?.name || 'Sucursal')}
      >
        {renderIcon()}
        <span className={`truncate font-medium ${isEmptyState ? 'text-amber-800' : 'text-text-primary'}`}>
          {buttonLabel}
        </span>
      </div>
    );
  }

  return (
    <Listbox value={selectedSiteId} onChange={handleChange}>
      <div className="relative">
        <Listbox.Button
          className={`flex items-center gap-1.5 text-xs px-2 h-7 rounded-sm border transition-colors max-w-[240px] ${
            isEmptyState
              ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
          title={
            isEmptyState
              ? emptyTitle
              : isAllSites
                ? 'Mostrando todas las sucursales'
                : selectedSite
                  ? `Sucursal: ${selectedSite.name}`
                  : 'Seleccionar sucursal'
          }
        >
          {renderIcon()}
          <span className={`truncate font-medium ${isEmptyState ? 'text-amber-800' : 'text-text-primary'}`}>
            {buttonLabel}
          </span>
          {loading ? (
            <Loader2 className="w-3 h-3 text-text-muted animate-spin flex-shrink-0" />
          ) : (
            <ChevronDown className={`w-3 h-3 flex-shrink-0 ${isEmptyState ? 'text-amber-600' : 'text-text-muted'}`} />
          )}
        </Listbox.Button>

        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute right-0 mt-1 max-h-72 w-72 overflow-auto rounded-sm bg-white py-1 text-sm shadow-lg ring-1 ring-black/10 focus:outline-none z-50">
            {error && sites.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-red-600">{error}</div>
            ) : sites.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-text-muted">No hay sucursales disponibles</div>
            ) : (
              <>
                {/* Opción "Todas las sucursales" */}
                <Listbox.Option
                  value={ALL_SITES}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-1.5 pl-7 pr-2 border-b border-gray-100 ${
                      active ? 'bg-indigo-50 text-indigo-900' : 'text-text-primary'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`flex items-center gap-1.5 text-xs ${selected ? 'font-semibold' : 'font-normal'}`}>
                        <Globe className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                        Todas las sucursales
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>

                {sites.map((site) => (
                  <Listbox.Option
                    key={site.siteId}
                    value={site.siteId}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-1.5 pl-7 pr-2 ${
                        active ? 'bg-blue-50 text-blue-900' : 'text-text-primary'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate text-xs ${selected ? 'font-semibold' : 'font-normal'}`}>
                          {site.siteId} - {site.name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-blue-600">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </>
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default SiteSelector;
