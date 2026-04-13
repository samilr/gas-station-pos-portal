import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Tag, Plus, RefreshCw, Search, AlertCircle, Radio, CheckCircle, XCircle,
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
    setSubtitle('Gestión de tags RFID del controlador PTS');
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
        toast.success(`Tag leído: ${tag}`);
      } else {
        toast.error('No se detectó ningún tag en el lector');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tags RFID</h1>
            <p className="text-gray-600 text-sm mt-1">
              {totalCount} tags registrados en el sistema
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadTags}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Agregar Tag
            </motion.button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lector RFID */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <Radio className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Leer Tag desde Lector</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((reader) => (
            <button
              key={reader}
              onClick={() => handleReadFromReader(reader)}
              disabled={readingReader !== null}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              {readingReader === reader ? (
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Radio className="w-4 h-4 text-purple-500" />
              )}
              Lector {reader}
            </button>
          ))}
        </div>
        {readTag && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
          >
            <Tag className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">Tag detectado: <strong>{readTag}</strong></span>
          </motion.div>
        )}
      </div>

      {/* Tabla de tags */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{searchTerm ? 'No se encontraron tags con ese criterio' : 'No hay tags registrados'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTags.map((raw: any, idx: number) => {
                  const tagId = prop(raw, 'Tag') || '';
                  const tagName = prop(raw, 'Name') || '';
                  const tagValid = prop(raw, 'Valid');
                  const tagPresent = prop(raw, 'Present');
                  return (
                    <tr key={tagId || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-mono text-gray-900">{tagId}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{tagName}</td>
                      <td className="px-6 py-3">
                        {tagValid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Válido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Bloqueado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {tagPresent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
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
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Tag RFID</h3>
            <form onSubmit={handleAddTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID del Tag</label>
                <input
                  type="text"
                  value={newTagId}
                  onChange={(e) => setNewTagId(e.target.value)}
                  placeholder="Ej: A1B2C3D4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ej: Vehículo Empresa 001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adding || !newTagId.trim()}
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg flex items-center gap-2"
                >
                  {adding && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Agregar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TagsSection;
