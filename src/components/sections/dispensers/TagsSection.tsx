import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag, Plus, RefreshCw, Radio,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllTags,
  getTagsCount,
  addTags,
  readReaderTag,
  prop,
} from '../../../services/dispenserService';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

const TagsSection: React.FC = () => {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [readingReader, setReadingReader] = useState<number | null>(null);
  const [readTag, setReadTag] = useState<string>('');
  const { setSubtitle } = useHeader();

  // Add tag form
  const [newTagId, setNewTagId] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSubtitle('Gestion de tags RFID del controlador PTS');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  const loadTags = useCallback(async () => {
    setLoading(true);
    try {
      const [tagsData, count] = await Promise.all([getAllTags(), getTagsCount()]);
      setTags(tagsData);
      setTotalCount(count);
    } catch {
      toast.error('Error al cargar tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTags(); }, [loadTags]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagId.trim()) { toast.error('Ingrese un ID de tag'); return; }

    setAdding(true);
    try {
      await addTags([{ Tag: newTagId.trim(), Name: newTagName.trim(), Valid: true }]);
      toast.success('Tag agregado exitosamente');
      setNewTagId('');
      setNewTagName('');
      setShowAddModal(false);
      loadTags();
    } catch {
      toast.error('Error al agregar tag');
    } finally {
      setAdding(false);
    }
  };

  const handleReadFromReader = async (reader: number) => {
    setReadingReader(reader);
    setReadTag('');
    try {
      const tag = await readReaderTag(reader);
      if (tag) {
        setReadTag(tag);
        toast.success(`Tag leido: ${tag}`);
      } else {
        toast.error('No se detecto ningun tag en el lector');
      }
    } catch {
      toast.error('Error al leer del lector RFID');
    } finally {
      setReadingReader(null);
    }
  };

  const filteredTags = tags.filter((t: any) => {
    const tag = (prop(t, 'Tag') || '').toLowerCase();
    const name = (prop(t, 'Name') || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return tag.includes(term) || name.includes(term);
  });

  if (loading && tags.length === 0) {
    return (
      <div className="space-y-1">
        <div className="bg-white rounded-sm p-3">
          <div className="h-6 bg-gray-200 rounded w-48 mb-1 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-64 animate-pulse" />
        </div>
        <div className="bg-white rounded-sm p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Cargando tags RFID...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        chips={[{ label: 'Tags', value: totalCount, color: 'blue' }]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por ID o nombre..."
      >
        <CompactButton variant="icon" onClick={loadTags}>
          <RefreshCw className="w-3.5 h-3.5" />
        </CompactButton>
        <CompactButton variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-3.5 h-3.5" />
          Nuevo
        </CompactButton>
      </Toolbar>

      {/* Lector RFID */}
      <div className="bg-white rounded-sm border border-table-border">
        <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
          <Radio className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">Leer Tag desde Lector</span>
        </div>
        <div className="flex flex-wrap gap-1 p-2">
          {[1, 2, 3, 4].map((reader) => (
            <CompactButton
              key={reader}
              variant="ghost"
              onClick={() => handleReadFromReader(reader)}
              disabled={readingReader !== null}
            >
              {readingReader === reader ? (
                <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Radio className="w-3.5 h-3.5 text-purple-500" />
              )}
              Lector {reader}
            </CompactButton>
          ))}
        </div>
        {readTag && (
          <div className="mx-2 mb-2 bg-green-50 border border-green-200 rounded-sm p-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-700">Tag detectado: <strong>{readTag}</strong></span>
          </div>
        )}
      </div>

      {/* Tabla de tags */}
      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Tag className="w-6 h-6 mx-auto mb-1 opacity-30" />
            <p className="text-xs">{searchTerm ? 'No se encontraron tags con ese criterio' : 'No hay tags registrados'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header">
                  <th className="px-2 text-left font-medium text-gray-500">Tag ID</th>
                  <th className="px-2 text-left font-medium text-gray-500">Nombre</th>
                  <th className="px-2 text-left font-medium text-gray-500">Estado</th>
                  <th className="px-2 text-left font-medium text-gray-500">Presente</th>
                </tr>
              </thead>
              <tbody>
                {filteredTags.map((raw: any, idx: number) => {
                  const tagId = prop(raw, 'Tag') || '';
                  const tagName = prop(raw, 'Name') || '';
                  const tagValid = prop(raw, 'Valid');
                  const tagPresent = prop(raw, 'Present');
                  return (
                    <tr key={tagId || idx} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                      <td className="px-2 text-sm font-mono text-gray-900 whitespace-nowrap">{tagId}</td>
                      <td className="px-2 text-sm text-gray-700 whitespace-nowrap text-ellipsis overflow-hidden">{tagName}</td>
                      <td className="px-2 whitespace-nowrap">
                        {tagValid ? (
                          <StatusDot color="green" label="Valido" />
                        ) : (
                          <StatusDot color="red" label="Bloqueado" />
                        )}
                      </td>
                      <td className="px-2 whitespace-nowrap">
                        {tagPresent ? (
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Agregar Tag */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-white rounded-sm shadow-xl p-3 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Agregar Tag RFID</h3>
            <form onSubmit={handleAddTag} className="space-y-2">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID del Tag</label>
                <input
                  type="text"
                  value={newTagId}
                  onChange={(e) => setNewTagId(e.target.value)}
                  placeholder="Ej: A1B2C3D4"
                  className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 font-mono"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ej: Vehiculo Empresa 001"
                  className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-1 pt-1">
                <CompactButton variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </CompactButton>
                <CompactButton variant="primary" type="submit" disabled={adding || !newTagId.trim()}>
                  {adding && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Agregar
                </CompactButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsSection;
