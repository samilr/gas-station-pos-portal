import React, { useEffect, useMemo, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronDown, Check, X, Loader2 } from 'lucide-react';

export interface EntityAutocompleteProps<T, V extends string | number> {
  value: V | null | undefined;
  onChange: (value: V | null, item: T | null) => void;
  fetchOptions: () => Promise<T[]>;
  getValue: (item: T) => V;
  getLabel: (item: T) => string;
  getSecondary?: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  allowClear?: boolean;
  className?: string;
  cacheKey?: string;
  emptyText?: string;
  loadErrorText?: string;
  autoFocus?: boolean;
  name?: string;
  id?: string;
}

const cache = new Map<string, unknown[]>();

function EntityAutocomplete<T, V extends string | number>({
  value,
  onChange,
  fetchOptions,
  getValue,
  getLabel,
  getSecondary,
  placeholder = 'Buscar...',
  disabled = false,
  required = false,
  allowClear = true,
  className = '',
  cacheKey,
  emptyText = 'Sin resultados',
  loadErrorText = 'Error al cargar opciones',
  autoFocus = false,
  name,
  id,
}: EntityAutocompleteProps<T, V>) {
  const [options, setOptions] = useState<T[]>(() => {
    if (cacheKey && cache.has(cacheKey)) return cache.get(cacheKey) as T[];
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (cacheKey && cache.has(cacheKey)) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchOptions()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : [];
        setOptions(list);
        if (cacheKey) cache.set(cacheKey, list);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(loadErrorText);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  const selectedItem = useMemo(() => {
    if (value === null || value === undefined || value === '') return null;
    return options.find((o) => getValue(o) === value) ?? null;
  }, [options, value, getValue]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => {
      const l = getLabel(o).toLowerCase();
      const s = getSecondary?.(o).toLowerCase() ?? '';
      return l.includes(q) || s.includes(q) || String(getValue(o)).toLowerCase().includes(q);
    });
  }, [options, query, getLabel, getSecondary, getValue]);

  const handleChange = (item: T | null) => {
    if (item === null) {
      onChange(null, null);
    } else {
      onChange(getValue(item), item);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(null, null);
    setQuery('');
  };

  const showingUnresolvedLabel = !!value && !selectedItem && !loading;

  return (
    <Combobox value={selectedItem} onChange={handleChange} disabled={disabled} nullable>
      <div className={`relative ${className}`}>
        <div
          className={`relative flex items-center w-full h-7 border border-gray-300 rounded-sm bg-white focus-within:ring-1 focus-within:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        >
          <Combobox.Input
            id={id}
            name={name}
            autoFocus={autoFocus}
            required={required}
            disabled={disabled}
            placeholder={loading ? 'Cargando...' : placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => e.target.select()}
            displayValue={(item: T | null) => {
              if (item) return getLabel(item);
              if (showingUnresolvedLabel) return String(value);
              return '';
            }}
            className={`flex-1 h-full px-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 ${
              disabled ? 'cursor-not-allowed' : ''
            }`}
          />
          {allowClear && !disabled && value != null && value !== '' && (
            <button
              type="button"
              tabIndex={-1}
              onClick={handleClear}
              className="h-full px-1 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Limpiar"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <Combobox.Button className="h-full px-1.5 flex items-center text-gray-400 hover:text-gray-600">
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Combobox.Button>
        </div>

        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-sm bg-white py-1 text-sm shadow-lg ring-1 ring-black/10 focus:outline-none">
            {loadError ? (
              <div className="px-2 py-1.5 text-xs text-red-600">{loadError}</div>
            ) : loading && options.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-text-muted flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Cargando...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-text-muted">{emptyText}</div>
            ) : (
              filtered.map((item) => {
                const v = getValue(item);
                const label = getLabel(item);
                const secondary = getSecondary?.(item);
                return (
                  <Combobox.Option
                    key={String(v)}
                    value={item}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-1 pl-7 pr-2 ${
                        active ? 'bg-blue-50 text-blue-900' : 'text-text-primary'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className={`truncate text-xs ${selected ? 'font-semibold' : 'font-normal'}`}>
                            {label}
                          </span>
                          {secondary && (
                            <span className="truncate text-2xs text-text-muted">{secondary}</span>
                          )}
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-blue-600">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                );
              })
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}

export default EntityAutocomplete;
