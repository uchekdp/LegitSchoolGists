import React, { useState } from 'react';
import { School, Plus, Edit2, Trash2, ExternalLink, X, MapPin } from 'lucide-react';
import { Institution } from '../../types';

interface AdminInstitutionsProps {
  institutions: Institution[];
  onSaveInstitution: (inst: Institution) => Promise<void>;
  onDeleteInstitution: (id: string) => Promise<void>;
}

export const AdminInstitutions: React.FC<AdminInstitutionsProps> = ({
  institutions,
  onSaveInstitution,
  onDeleteInstitution,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Institution>({
    id: '',
    name: '',
    slug: '',
    type: 'federal_university',
    state: 'Lagos State',
    website: '',
    description: '',
  });

  const startEdit = (inst: Institution) => {
    setEditingId(inst.id);
    setFormData(inst);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      id: '',
      name: '',
      slug: '',
      type: 'federal_university',
      state: 'Lagos State',
      website: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const id = editingId || `inst-${Date.now()}`;
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await onSaveInstitution({
      ...formData,
      id,
      slug,
    });
    cancelForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tertiary Institutions Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage Nigerian Federal, State, and Private Universities, Polytechnics, and Colleges of Education.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tertiary Institution</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-sky-200 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              {editingId ? 'Edit Institution' : 'Add New Nigerian Institution'}
            </h3>
            <button type="button" onClick={cancelForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Federal University of Technology, Minna (FUTMINNA)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
              >
                <option value="federal_university">Federal University</option>
                <option value="state_university">State University</option>
                <option value="private_university">Private University</option>
                <option value="polytechnic">Polytechnic / Monotechnic</option>
                <option value="college_of_education">College of Education</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / Location *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Niger State"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website URL</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://futminna.edu.ng"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Premier technological institution..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm"
            >
              {editingId ? 'Update Institution' : 'Save Institution'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {institutions.map((inst) => (
          <div
            key={inst.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded uppercase">
                  {inst.type.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {inst.state}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{inst.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{inst.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {inst.website ? (
                <a
                  href={inst.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400">No website</span>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(inst)}
                  className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-50"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteInstitution(inst.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
